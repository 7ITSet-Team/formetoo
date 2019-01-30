import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Message from '@components/ui/message';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            usersList: undefined,
            currentUser: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentUser) => this.setState({show: page, currentUser: (currentUser || {})});
        this.close = () => this.setState({show: undefined, currentUser: undefined, changes: undefined});
        this.updateUsersList = async () => {
            this.setState({loading: true});
            const {error, data: usersList} = await API.request('users', 'list');
            if (!error)
                this.setState({loading: false, usersList});
            else
                Message.send('ошибка при обновлении списка пользователей, повторите попытку позже');
        };
        this.saveChanges = async () => {

        };
        this.deleteUser = async userID => {
            const {currentUser, show} = this.state;
            const {error} = await API.request('users', 'update', {_id: (userID || currentUser._id)});
            if (error)
                Message.send('ошибка при удалении пользователя, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage')
                    this.close();
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
        const {loading, usersList} = this.state;

        if (loading)
            return <Loading/>;

        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {usersList && usersList.map((user, key) => (
                    <div key={key}>
                        {user.name}
                        <span onClick={() => this.deleteUser(user._id)} className='icon remove-button'/>
                    </div>
                ))}
            </>
        );
    };
};