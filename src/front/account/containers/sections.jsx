import React from 'react';

import UserModel from '@models/user';
import MainMenu from '@components/main-menu';

export default class Sections extends React.Component {
    constructor(props) {
        super(props);

        this.translate = {
            client: 'Текущий пользователь',
            media: 'Медиа',
            attributes: 'Атрибуты',
            'attribute-sets': 'Наборы атрибутов',
            orders: 'Заказы',
            users: 'Пользователи',
            roles: 'Роли',
            categories: 'Категории',
            products: 'Продукты',
            pages: 'Страницы',
            settings: 'Настройки',
            logs: 'Логи',
            tree: 'Дерево'
        };

        this.permissionsToMenu = permissions => (permissions || []).map(permission => ({
            to: `/account/${permission}`,
            title: this.translate[permission] || permission
        }));

        this.state = {
            permissions: this.permissionsToMenu(UserModel.permissions)
        };

        this.update = user => this.setState({permissions: this.permissionsToMenu(user.permissions)});
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
                <MainMenu title='Разделы' menu={permissions}/>
            </div>
        );
    };
};