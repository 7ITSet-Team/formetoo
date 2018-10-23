import React from 'react';
import {Link} from 'react-router-dom';

export default class Footer extends React.Component {
	constructor(props) {
		super(props);
	};

	data = {
		footerContacts: {
			title: 'Контакты',
			address: '127000, Москва, ул.Ленинградская, д.157, этаж 3, оф.378',
			phone: '+7 (495)378-92-96'
		},
		footerLinks: [
			{
				title: 'Компания',
				links: [
					{title: 'О компании', url: '/about'},
					{title: 'Новости', url: '/news'},
					{title: 'Вакансии', url: '/jobs'}
				]
			}
			,
			{
				title: 'Информация',
				links: [
					{title: 'Помощь', url: '/help'},
					{title: 'Оплата и доставка', url: '/info'},
					{title: 'Гарантия на товар', url: '/warrantly'}
				]
			},
			{
				title: 'Помощь',
				links: [
					{title: 'Блог', url: '/blog'},
					{title: 'Вопрос-ответ', url: '/faq'},
					{title: 'Бренды', url: '/brends'}
				]
			}
		]
	}

	render() {
		const {footerLinks, footerContacts} = this.data;
		return (
			<footer className='s--footer'>
				<div className='links'>
					{footerLinks.map((block, key) => (
						<div key={key}>
							<h5>{block.title}</h5>
							<div>
								{block.links.map((link, key) => (<Link key={key} to={link.url}>{link.title}</Link>))}
							</div>
						</div>
					))}
					<div>
						<h5>{footerContacts.title}</h5>
						<div>
							<span>{footerContacts.address}</span>
							<span>{footerContacts.phone}</span>
						</div>
					</div>
				</div>
				<div className='rights'>
					<span>2017 © ForMeToo. Все права защищены.</span>
				</div>
			</footer>
		);
	};
};