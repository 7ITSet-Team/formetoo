import React from 'react';
import {Route, Switch} from 'react-router-dom';

import CategoryList from '@shop/containers/catalog/category-list';
import ProductsList from '@shop/containers/catalog/products-list';
import Product from '@shop/containers/catalog/product';

export default class CatalogLayout extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		return (
			<Switch>
				<Route exact path="/catalog" component={CategoryList}/>
				<Route exact path="/catalog/:slug" component={ProductsList}/>
				<Route exact path="/catalog/product/:slug" component={Product}/>
			</Switch>
		);
	};
};