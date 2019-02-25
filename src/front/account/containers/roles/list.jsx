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
            roles: undefined,
            currentRole: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentRole = {}) => this.setState({show: page, currentRole});
        this.close = () => this.setState({show: undefined, currentRole: undefined, changes: undefined});
        this.handleCheck = e => {
            const {currentRole, show, changes = {}} = this.state;
            const isChecked = e.target.checked;
            const permission = e.target.name;
            const permissions = (changes.permissions || (currentRole.permissions && [...currentRole.permissions])) || [];
            const index = permissions.indexOf(permission);
            if ((!isChecked && index === -1) || (isChecked && index !== -1))
                return;
            if (isChecked)
                permissions.push(permission);
            else
                permissions.splice(index, 1);
            if (show === 'editPage')
                this.setState({changes: {permissions}});
            else
                this.setState({currentRole: {...currentRole, permissions}});
        };
        this.isPermissionExist = permission => {
            const {currentRole, changes = {}} = this.state;
            return (changes.permissions || currentRole.permissions).includes(permission);
        };
        this.updateRoles = async () => {
            this.setState({loading: true});
            const {error, data: roles} = await API.request('roles', 'list');
            if (!error)
                this.setState({loading: false, roles});
            else
                Modal.send('ошибка при обновлении списка ролей, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes = {}, currentRole, show} = this.state;
            const isEdit = (show === 'editPage');
            if (isEdit && (Object.keys(changes).length === 0)) return this.close();
            let data = currentRole;
            if (isEdit) data = {_id: currentRole._id, changes};
            const isNotValid = this.requiredFields
                .map(prop => ((currentRole[prop] == null) || (currentRole[prop] === '') || (Array.isArray(currentRole[prop]) && currentRole[prop].length === 0)))
                .includes(true);
            if (!isEdit && isNotValid)
                return Message.send('Введены не все обязательные поля', Message.type.danger);
            const {error} = await API.request('roles', 'update', data);
            if (error) {
                Message.send(`ошибка при ${isEdit ? 'редактировании' : 'создании'} роли, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`роль успешно ${isEdit ? 'изменена' : 'создана'}`, Message.type.success);
                this.close();
                this.updateRoles();
            }
        };
        this.deleteRole = async (roleID = this.state.currentRole._id) => {
            const {show} = this.state;
            const {error} = await API.request('roles', 'update', {_id: roleID});
            if (error)
                Message.send('ошибка при удалении роли, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage') this.close();
                this.updateRoles();
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
        this.requiredFields = ['name', 'alias', 'permissions'];
        this.fields = this.requiredFields;
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error: errorR, data: roles} = await API.request('roles', 'list');
        const {error: errorP, data: permissionList} = await API.request('permissions', 'list');
        if (!errorR && !errorP)
            this.setState({loading: false, roles, permissionList});
        else
            Message.send('ошибка при получении списка ролей, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {roles = []} = this.state;
        return (
            <>
                {roles.map((role, key) => (
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
            const {currentRole, show, changes = {}} = this.state;
            return (
                <div key={key}>
                    {prop}
                    <Input value={!(changes[prop] == null) ? changes[prop] : (currentRole[prop] || '')}
                           onChange={value => {
                               const newChanges = {...changes, [prop]: value};
                               if (show === 'editPage')
                                   this.setState({changes: newChanges});
                               else
                                   this.setState({currentRole: {...currentRole, ...newChanges}});
                           }}/>
                </div>
            )
        }
    };

    renderProps() {
        return this.fields.map((prop, key) => this.renderProp(prop, key));
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
                </div>
                {this.renderList()}
                {show && (
                    <Modal title={(show === 'editPage') ? 'Редактирование' : 'Создание'} show={true} buttons={actions}
                           onClose={this.close}>
                        <div>{this.renderProps()}</div>
                    </Modal>
                )}
            </>
        );
    };
};