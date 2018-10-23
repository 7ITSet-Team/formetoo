import React from 'react';

export default class Product extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		const {productName} = this.props.match.params;
		return (
			<div className='s--product'>
				{`product with name: ${productName}`}
			</div>
		);
	};
};