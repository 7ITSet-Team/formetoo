import React from 'react';
import {Link} from 'react-router-dom';

export default class Logo extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		return (
			<Link to='/' className='c--logo'>
				<div>
					<span>For</span>
					<span>Me</span>
					<span>Too</span>
				</div>
				<div>
					интернет-магазин
				</div>
			</Link>
		);
	}
};