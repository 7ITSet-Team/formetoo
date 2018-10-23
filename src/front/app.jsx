import React from 'react';
import { Route} from 'react-router-dom';

import ShopLayout from '@shop/layout';

export default class App extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		return (
				<Route path="/" component={ShopLayout}/>
		);
	};
};