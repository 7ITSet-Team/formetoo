import React from 'react';

import Header from '@shop/containers/header';
import Main from '@shop/containers/main';
import Footer from '@shop/containers/footer';

export default class Layout extends React.Component {
	constructor(props) {
		super(props);
	};

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			window.scrollTo(0, 0)
		}
	};

	render() {
		return (
			<>
			<Header/>
			<Main/>
			<Footer/>
			</>
		);
	};
};