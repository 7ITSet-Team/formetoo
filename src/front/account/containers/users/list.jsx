import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';
import Input from '@components/ui/input';
import UserModel from '@models/user';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            usersList: [],
            currentUser: undefined,
            changes: undefined,
            show: {
                editPage: false,
                createPage: false
            }
        };
        this.show = (page, user) => this.setState({
            show: {[page]: true},
            currentUser: (user || {})
        });
        this.close = () => this.setState({
            show: {editPage: false, createPage: false},
            currentUser: undefined,
            changes: undefined
        });
        this.updateUsersList = async () => {
            const {error, data: usersList} = await API.request('users', 'list');
            if (!error)
                this.setState({loading: false, usersList});
            else
                Message.send('ошибка при обновлении списка пользователей, повторите попытку позже');
        };
        this.saveChanges = async () => {
            const {currentUser, changes, show} = this.state;

            let data;
            if (show.editPage)
                data = {
                    _id: currentUser._id,
                    changes: {...changes, password: UserModel.getHash(changes.email, changes.password)} || {}
                };
            else if (show.createPage)
                data = {
                    ...currentUser,
                    isActive: (currentUser.isActive || false),
                    password: UserModel.getHash(currentUser.email, currentUser.password)
                };

            const {error} = await API.request('users', 'update', data);

            if (error) {
                Message.send(`ошибка при ${(show.editPage && 'редактировании') || (show.createPage && 'создании')} пользователя, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`пользователь успешно ${(show.editPage && 'изменен') || (show.createPage && 'создан')}`, Message.type.success);
                this.close();
                this.setState({loading: true});
                this.updateUsersList();
            }
        };
        this.deleteProduct = async userID => {
            const {currentUser, show} = this.state;
            const {error} = await API.request('users', 'update', {_id: (userID || currentUser._id)});
            if (error)
                Message.send('ошибка при удалении пользователя, повторите попытку позже', Message.type.danger);
            else {
                if (show.editPage)
                    this.setState({show: {editPage: false, createPage: false}});
                this.updateUsersList();
                Message.send('пользователь успешно удален', Message.type.success);
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
        const {error, data: usersList} = await API.request('users', 'list');
        if (!error)
            this.setState({loading: false, usersList});
        else
            Message.send('ошибка при получении списка пользователей, повторите попытку позже', Message.type.danger);
    };

    render() {
        const {loading, usersList, show, currentUser, changes} = this.state;
        if (loading)
            return (<Loading/>);

        let actions = this.buttons;
        actions = !show.editPage
            ? actions
            : [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteProduct}];

        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {usersList.map((user, key) => (
                    <div key={key}>
                        {user.name}
                        <span onClick={() => this.show('editPage', user)} className='icon pencil'/>
                        <span onClick={() => this.deleteProduct(user._id)} className='icon remove-button'/>
                    </div>
                ))}
                <Modal title='Редактирование' show={show.editPage} buttons={actions} onClose={this.close}>
                    <div>
                        {currentUser && (
                            <>
                                {Object.keys(currentUser).map((prop, key) => (
                                    <div key={key}>
                                        {prop !== '_id' && prop !== 'password' && (
                                            <>
                                                <span>{prop}</span>
                                                {prop !== 'isActive'
                                                    ? (
                                                        <Input value={currentUser[prop]}
                                                               onChange={value => this.setState({
                                                                   currentUser: {...currentUser, [prop]: value},
                                                                   changes: {...changes, [prop]: value}
                                                               })}/>
                                                    )
                                                    : (
                                                        <input type='checkbox' defaultChecked={currentUser[prop]}
                                                               onChange={e => this.setState({
                                                                   currentUser: {
                                                                       ...currentUser,
                                                                       isActive: e.target.checked
                                                                   },
                                                                   changes: {...changes, isActive: e.target.checked}
                                                               })}/>
                                                    )}
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/*сервер не отправляет пароли пользователей клиенту, поэтому отдельно*/}
                                <span>password</span>
                                <Input onChange={value => this.setState({
                                    currentUser: {...currentUser, password: value},
                                    changes: {...changes, password: value}
                                })}/>
                            </>
                        )}
                    </div>
                </Modal>
                <Modal title='Создание' show={show.createPage} buttons={this.buttons} onClose={this.close}>
                    <div>
                        {['email', 'phone', 'name', 'lastname', 'isActive', 'password'].map((prop, key) => (
                            <div key={key}>
                                <span>{prop}</span>
                                {prop === 'isActive'
                                    ? (
                                        <input type='checkbox'
                                               onChange={e => this.setState({
                                                   currentUser: {...currentUser, isActive: e.target.checked}
                                               })}/>
                                    )
                                    : (
                                        <Input type={prop === 'password' && 'password'}
                                               onChange={value => this.setState({
                                                   currentUser: {
                                                       ...currentUser,
                                                       [prop]: value
                                                   }
                                               })}/>
                                    )}
                            </div>
                        ))}
                        <div>!some dropdown for choosing role!</div>
                    </div>
                </Modal>
            </>
        );
    };
};