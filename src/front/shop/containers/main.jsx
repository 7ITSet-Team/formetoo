import React from 'react';
import {Route, Switch} from 'react-router-dom';

import Page from '@shop/containers/content/page';
import CatalogLayout from '@shop/containers/catalog/catalog-layout';

export default class Main extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		return (
			<main className='s--main'>
				<Switch>
					<Route path="/catalog" component={CatalogLayout}/>
					<Route exact path="/:pageName" component={Page}/>
					<Route exact path="/" component={Page}/>
				</Switch>
			</main>
		);
	};
};