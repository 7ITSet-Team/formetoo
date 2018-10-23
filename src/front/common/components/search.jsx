import React from 'react';
import {Link} from 'react-router-dom';

import Input from '@components/ui/input';

export default class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			query: ''
		};
		this.onChange = value => this.setState({query: value});
	};

	render() {
		const {query} = this.state;
		const button = (<Link to={`/catalog?query=${query}`} className='icon search c--search-btn'/>)
		return (
			<>
			<Input value={query} placeholder='Поиск' onChange={this.onChange} button={button}/>
			</>
		);
	};
};