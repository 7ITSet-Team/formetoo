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
        this.show = currentRole => this.setState({show: true, currentRole});
        this.close = () => this.setState({show: false, currentRole: undefined, changes: undefined});
        this.handleCheck = e => {
            const {currentRole, changes} = this.state;
            const isChecked = e.target.checked;
            const permission = e.target.name;
            const permissions = [...currentRole.permissions];

            const index = permissions.indexOf(permission);
            if ((!isChecked && index === -1) || (isChecked && index !== -1))
                return;

            isChecked ? permissions.push(permission) : permissions.splice(index, 1);
            changes = {permissions};
            this.setState({changes});
        };
        this.isPermissionExist = permission => {
            const {currentRole, changes} = this.state;
            (changes || currentRole).permissions.includes(permission);
        }
        this.updateRolesList = async () => {
            const {error, data: rolesList} = await API.request('roles', 'list');
            if (!error)
                this.setState({loading: false, rolesList});
        };
        this.saveChanges = async () => {
            const {changes, currentRole} = this.state;
            const {error} = await API.request('roles', 'update', {_id: currentRole._id, changes: changes || {}});
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
                handler: this.saveChanges
            },
            {
                name: 'закрыть',
                types: 'secondary',
                handler: this.close
            }
        ];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error: errorR, data: rolesList} = await API.request('roles', 'list');
        const {error: errorP, data: permissionList} = await API.request('permissions', 'list');
        if (!errorR && !errorP)
            this.setState({loading: false, rolesList, permissionList});
    };

    render() {
        const {loading, show, rolesList, permissionList, currentRole} = this.state;

        if (loading)
            return (<Loading/>);

        return (
            <>
            <div className='c--items-group'>
                <button className='c--btn c--btn--primary'>add new</button>
                <button className='c--btn c--btn--primary'>any task</button>
            </div>
            {rolesList.map((role, key) => (
                <div className='a--list-item' key={key}>
                    <span>{role.name}</span>
                    <span onClick={() => this.show(role)} className='icon pencil'/>
                </div>
            ))}
            <Modal title='Редактирование' show={show} buttons={this.buttons} onClose={this.close}>
                <div>
                    {currentRole && permissionList.map((permission, key) => (
                        <div key={key}>
                            {permission}
                            <input type="checkbox" name={permission} onChange={this.handleCheck}
                                   disabled={['root', 'client'].includes(currentRole.name)}
                                   defaultChecked={this.isPermissionExist(permission)}/>
                        </div>
                    ))}
                </div>
            </Modal>
            </>
        );
    };
};