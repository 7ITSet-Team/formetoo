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
					Жироуловители
				</div>
				<div>
					Альта Регион
				</div>
			</Link>
		);
	}
};