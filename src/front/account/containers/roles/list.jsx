import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rolesList: [],
            currentRole: undefined,
            changes: undefined
        };
        this.show = async role => this.setState({show: true, currentRole: role});
        this.close = () => this.setState({show: false, currentRole: undefined});
        this.handleCheck = e => {
            const isChecked = e.target.checked;
            const permission = e.target.name;
            const {currentRole, changes} = this.state;
            const {permissions} = currentRole;

            const index = permissions.indexOf(permission);
            if (!isChecked && index !== -1) {
                const newPermissions = [...permissions.slice(0, index), ...permissions.slice(index + 1)];
                this.setState({
                    currentRole: {
                        ...currentRole,
                        permissions: newPermissions
                    },
                    changes: {
                        ...changes,
                        permissions: newPermissions
                    }
                });
            }
            if (isChecked && index === -1) {
                const newPermissions = [...permissions, permission];
                this.setState({
                    currentRole: {
                        ...currentRole,
                        permissions: newPermissions
                    },
                    changes: {
                        ...changes,
                        permissions: newPermissions
                    }
                });
            }
        };
        this.isPermissionExist = permission => {
            //  СМОТРИМ, ЕСТЬ ЛИ У ТЕКУЩЕЙ РОЛИ ДАННОЕ РАЗРЕШЕНИЕ, ЧТОБЫ ПОТОМ УСТАНОВИТЬ ЗНАЧЕНИЯ
            //  ЧЕКБОКСОВ В МОДАЛЬНОМ ОКНЕ НА TRUE
            let result = false;
            this.state.currentRole.permissions.forEach(rolePermission =>
                permission === rolePermission
                    ? result = true
                    : null
            );
            return result;
        };
        this.updateRolesList = async () => {
            const rolesList = await API.request('roles', 'list');
            if (!rolesList.error)
                this.setState({
                    loading: false,
                    rolesList: rolesList.data
                });
        };
        this.saveChanges = async () => {
            const {changes, currentRole} = this.state;
            const {error} = await API.request('roles', 'update', {_id: currentRole._id, changes});
            if (error) {
                Message.send('ошибка при редактировании роли, повторите попытку позже', Message.type.danger);
                this.close();
            } else {
                Message.send('роль успешно изменена', Message.type.success);
                this.close();
                this.setState({loading: true});
                this.updateRolesList();
            }
        };
        this.buttons = [
            {
                name: 'сохранить',
                types: 'primary',
                handler: () => this.saveChanges()
            }
        ];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const rolesList = await API.request('roles', 'list');
        const permissions = await API.request('permissions', 'list');
        if (!rolesList.error)
            this.setState({
                loading: false,
                rolesList: rolesList.data,
                permissionList: permissions.data
            });
    };

    render() {
        const {loading, show, rolesList, permissionList, currentRole} = this.state;
        if (loading)
            return (<Loading/>);

        return (
            <>
                {rolesList.map((role, key) => (
                    <div className='a--list-item' key={key}>
                        <span>{role.name}</span>
                        <span onClick={() => this.show(role)} className='icon pencil'/>
                    </div>
                ))}
                <Modal title='Редактирование' show={show} buttons={this.buttons} onClose={this.close}>
                    <div>
                        {currentRole && permissionList.map((permission, key) => {
                            const isPermissionExist = this.isPermissionExist(permission);
                            return (
                                <div key={key}>
                                    {permission}
                                    <input type="checkbox" disabled={permission === "client"} name={permission}
                                           defaultChecked={isPermissionExist} onChange={this.handleCheck}/>
                                </div>
                            )
                        })}
                    </div>
                </Modal>
            </>
        )
    };
};