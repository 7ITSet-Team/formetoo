import React from 'react';

export default class ProductsList extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		const {categoryName}=this.props.match.params;
		return (
			<div className='s--products-list'>
				{`products list of ${categoryName}`}
			</div>
		);
	};
};