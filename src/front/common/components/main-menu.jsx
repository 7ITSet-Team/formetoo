import React from 'react';

import API from '@shop/core/api';
import {NavLink} from 'react-router-dom';

export default class MainMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menu: undefined
        };
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: menu} = await API.request('content', 'main-menu');
        if (!error) {
            this.setState({menu});
        }
    };

    data = {
        menu: [
            {title: 'Главная', to: '/', exact: true},
            {title: 'Каталог', to: '/catalog'},
            {title: 'Акции', to: '/promotion'},
            {title: 'Доставка и оплата', to: '/delivery'},
            {title: 'О компании', to: '/about'},
            {title: 'Контакты', to: '/contacts'},
        ]
    };

    render() {
        const {menu} = this.state;
        return (
            <nav className='c--main-menu'>
                {menu ? menu.map((item, key) => (
                    <NavLink key={key} to={`/${item.slug}`} exact={item.slug === ''} activeClassName='active'>
                        {item.name}
                    </NavLink>
                )) : null}
            </nav>
        );
    };
};