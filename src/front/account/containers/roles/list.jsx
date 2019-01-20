import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';
import Input from '@components/ui/input';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rolesList: [],
            currentRole: undefined,
            changes: undefined,
            show: {
                editPage: false,
                addPage: false
            }
        };
        this.show = (page, currentRole) => this.setState({
            show: {[page]: true},
            currentRole: (currentRole || {})
        });
        this.close = () => this.setState({
            show: {editPage: false, addPage: false},
            currentRole: undefined,
            changes: undefined
        });
        this.handleCheck = e => {
            let {currentRole, show} = this.state;
            const isChecked = e.target.checked;
            const permission = e.target.name;
            const permissions = (currentRole.permissions && [...currentRole.permissions]) || [];

            const index = permissions.indexOf(permission);
            if ((!isChecked && index === -1) || (isChecked && index !== -1))
                return;

            isChecked ? permissions.push(permission) : permissions.splice(index, 1);
            show.editPage && this.setState({changes: {permissions}});
            show.addPage && this.setState({currentRole: {...currentRole, permissions}});
        };
        this.isPermissionExist = permission => {
            const {currentRole, changes} = this.state;
            return (changes || currentRole).permissions.includes(permission);
        };
        this.updateRolesList = async () => {
            const {error, data: rolesList} = await API.request('roles', 'list');
            if (!error)
                this.setState({loading: false, rolesList});
            else
                Modal.send('ошибка при обновлении списка ролей, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes, currentRole, show} = this.state;

            let data;
            show.editPage && (data = {_id: currentRole._id, changes: changes || {}});
            show.addPage && (data = currentRole);

            const {error} = await API.request('roles', 'update', data);

            if (error) {
                Message.send(`ошибка при ${(show.editPage && 'редактировании') || (show.addPage && 'создании')} роли, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`роль успешно ${(show.editPage && 'изменена') || (show.addPage && 'создана')}`, Message.type.success);
                this.close();
                this.setState({loading: true});
                this.updateRolesList();
            }
        };
        this.deleteRole = async roleID => {
            const {currentRole, show} = this.state;
            roleID = roleID ? roleID : currentRole._id;
            const {error} = await API.request('roles', 'update', {_id: roleID});
            if (error) Message.send('ошибка при удалении роли, повторите попытку позже', Message.type.danger);
            else {
                show.editPage && this.setState({show: {editPage: false, createPage: false}});
                this.updateRolesList();
                Message.send('роль успешно удалена', Message.type.success);
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
        else
            Message.send('ошибка при получении списка ролей, повторите попытку позже', Message.type.danger);
    };

    renderPropList() {
        const {currentRole} = this.state;
        const props = ['alias', 'name'];

        return (
            <div>
                {props.map((prop, key) => (
                    <div key={key}>
                        {prop}
                        <Input onChange={value => this.setState({
                            currentRole: {
                                ...currentRole,
                                [prop]: value
                            }
                        })}/>
                    </div>
                ))}
            </div>
        )
    };

    render() {
        const {loading, show, rolesList, permissionList, currentRole} = this.state;

        if (loading)
            return (<Loading/>);

        let actions = this.buttons;
        show.editPage && (
            actions = ['root', 'client'].includes(currentRole.name)
                ? actions
                : [...this.buttons, {
                    name: 'удалить',
                    types: 'danger',
                    handler: this.deleteRole
                }]
        );

        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('addPage')}>add new</button>
                    <button className='c--btn c--btn--primary'>any task</button>
                </div>
                {rolesList.map((role, key) => (
                    <div className='a--list-item' key={key}>
                        <span>{role.name}</span>
                        <span onClick={() => this.show('editPage', role)} className='icon pencil'/>
                        {
                            !(['root', 'client'].includes(role.name))
                            &&
                            <span onClick={() => this.deleteRole(role._id)} className='icon remove-button'/>
                        }
                    </div>
                ))}
                <Modal title='Редактирование' show={show.editPage} buttons={actions} onClose={this.close}>
                    <div>
                        {show.editPage && permissionList.map((permission, key) => (
                                <div key={key}>
                                    {permission}
                                    <input type="checkbox" name={permission} onChange={this.handleCheck}
                                           disabled={['root', 'client'].includes(permission)}
                                           defaultChecked={this.isPermissionExist(permission)}/>
                                </div>
                            )
                        )}
                    </div>
                </Modal>
                <Modal title='Создание' show={show.addPage} buttons={actions} onClose={this.close}>
                    <div>
                        {this.renderPropList()}
                        {permissionList.map((permission, key) => (
                                <div key={key}>
                                    {permission}
                                    <input type="checkbox" name={permission} onChange={this.handleCheck}/>
                                </div>
                            )
                        )}
                    </div>
                </Modal>
            </>
        );
    };
};