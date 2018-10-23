import React from 'react';
import {withRouter} from "react-router";
import {NavLink} from 'react-router-dom';

export default class MainMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			currentActive: undefined
		};
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
		const {menu} = this.data;
		return (
			<nav className='c--main-menu'>
				{menu.map((item, key) => (
					<NavLink key={key} to={item.to} exact={item.exact} activeClassName='active'>{item.title}</NavLink>
				))}
			</nav>
		);
	};
};