import React from 'react';
import {Link} from 'react-router-dom';

import API from '@shop/core/api';

export default class CategoryList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			categoryList: []
		};
		console.log('INIT-STATE=========',this.state.categoryList);
		//одноименный provider, который на сервере регистрирует и потом собирает состояния, а на клиенте раздает их.
		//а лучше пусть модели собирает и раздает
		this.getInitialDataFromSrv();
	};

	async getInitialDataFromSrv() {
		const {error, data: categoryList} = await API.request('catalog', 'get-categories');
		console.log('error,categoryList=====================',error,categoryList);
		if (!error) {
			this.setState({loading: false, categoryList});
		}
	};

	render() {
		const {categoryList, loading} = this.state;
		return (
			<div className='s--category-list'>
				{loading ? (
					<span>Loading...</span>
				) : (
					categoryList.map((category, key) => (
						<div key={key} className='item'>
							<div>
								<img alt={category.title} src={category.img}/>
							</div>
							<div>
								<Link to={`/catalog/${category.name}`}>{category.title}</Link>
							</div>
						</div>
					))
				)}
			</div>
		);
	};
};