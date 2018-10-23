import React from 'react';

export default class Page extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		const {pageName='root'}=this.props.match.params;
		const content = `<div><h1>ololo!!!</h1><p>${pageName}</p></div>`;
		return (
			<div className='s--page'>
				<div dangerouslySetInnerHTML={{__html: content}}/>
			</div>
		);
	};
};