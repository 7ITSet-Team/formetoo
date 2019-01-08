import React from 'react';
import {NavLink} from 'react-router-dom';

import UserModel from '@models/user';

export default class Sections extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            permissions: UserModel.permissions
        };

        this.update = user => this.setState({permissions: user.permissions});
        this.translate = {
            client: 'Текущий пользователь',
            media: 'Медиа',
            tabs: 'Табы',
            attributes: 'Атрибуты',
            orders: 'Заказы',
            users: 'Пользователи',
            roles: 'Роли',
            categories: 'Категории',
            products: 'Продукты',
            pages: 'Страницы',
            settings: 'Настройки',
            logs: 'Логи'
        };
    };

    componentWillMount() {
        UserModel.listeners.add(this.update);
    };

    componentWillUnmount() {
        UserModel.listeners.delete(this.update);
    };

    render() {
        const {permissions} = this.state;
        return (
            <div className='a--sections'>
                {permissions.map((permission, key) => (
                    <NavLink to={`/account/${permission}`} key={key}>
                        {this.translate[permission] || permission}
                    </NavLink>
                ))}
            </div>
        );
    };
};