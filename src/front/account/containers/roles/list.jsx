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
            rolesList: undefined,
            currentRole: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentRole) => this.setState({show: page, currentRole: (currentRole || {})});
        this.close = () => this.setState({show: undefined, currentRole: undefined, changes: undefined});
        this.handleCheck = e => {
            let {currentRole, show} = this.state;
            const isChecked = e.target.checked;
            const permission = e.target.name;
            const permissions = (currentRole.permissions && [...currentRole.permissions]) || [];
            const index = permissions.indexOf(permission);
            if ((!isChecked && index === -1) || (isChecked && index !== -1))
                return;
            isChecked ? permissions.push(permission) : permissions.splice(index, 1);
            if (show === 'editPage')
                this.setState({changes: {permissions}});
            else if (show === 'createPage')
                this.setState({currentRole: {...currentRole, permissions}});
        };
        this.isPermissionExist = permission => {
            const {currentRole, changes} = this.state;
            return ((changes && changes.permissions) || currentRole.permissions).includes(permission);
        };
        this.updateRolesList = async () => {
            this.setState({loading: true});
            const {error, data: rolesList} = await API.request('roles', 'list');
            if (!error)
                this.setState({loading: false, rolesList});
            else
                Modal.send('ошибка при обновлении списка ролей, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes, currentRole, show} = this.state;
            let data = currentRole;
            if (show === 'editPage')
                data = {_id: currentRole._id, changes};
            const {error} = await API.request('roles', 'update', data);
            if (error) {
                Message.send(`ошибка при ${(show === 'editPage') ? 'редактировании' : 'создании'} роли, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`роль успешно ${(show === 'editPage') ? 'изменена' : 'создана'}`, Message.type.success);
                this.close();
                this.updateRolesList();
            }
        };
        this.deleteRole = async roleID => {
            const {currentRole, show} = this.state;
            const {error} = await API.request('roles', 'update', {_id: (roleID || currentRole._id)});
            if (error)
                Message.send('ошибка при удалении роли, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage')
                    this.close();
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

    renderList() {
        const {rolesList} = this.state;
        return (
            <>
                {(rolesList || []).map((role, key) => (
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
            </>
        )
    };

    renderPermissionList() {
        const {permissionList, show} = this.state;
        return permissionList.map((permission, key) => (
                <div key={key}>
                    {permission}
                    <input type="checkbox" name={permission} onChange={this.handleCheck}
                           disabled={show === 'editPage' ? ['root', 'client'].includes(permission) : false}
                           defaultChecked={show === 'editPage' ? this.isPermissionExist(permission) : false}/>
                </div>
            )
        )
    };

    renderProp(prop, key) {
        if (prop === 'permissions')
            return this.renderPermissionList();
        else {
            const {currentRole, show} = this.state;
            let {changes} = this.state;
            return (
                <div key={key}>
                    {prop}
                    <Input value={(show === 'editPage') ? ((changes && changes[prop]) || currentRole[prop]) : undefined}
                           onChange={value => {
                               changes = changes || {};
                               changes[prop] = value;
                               if (show === 'editPage')
                                   this.setState({changes});
                               else if (show === 'createPage')
                                   this.setState({currentRole: {...currentRole, ...changes}});
                           }}/>
                </div>
            )
        }
    };

    renderProps() {
        return ['alias', 'name', 'permissions'].map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show, currentRole} = this.state;
        if (loading)
            return <Loading/>;
        let actions = this.buttons;
        if ((show === 'editPage') && !(['root', 'client'].includes(currentRole.name)))
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteRole}];
        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                    <button className='c--btn c--btn--primary'>any task</button>
                </div>
                {this.renderList()}
                <Modal title='Редактирование' show={(show === 'editPage')} buttons={actions} onClose={this.close}>
                    <div>{this.renderProps()}</div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={actions} onClose={this.close}>
                    <div>{this.renderProps()}</div>
                </Modal>
            </>
        );
    };
};