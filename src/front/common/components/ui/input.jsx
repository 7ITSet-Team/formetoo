import React from 'react';

export default class Input extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false
		};
		this.onFocus = e => this.setState({focused: true});
		this.onBlur = e => this.setState({focused: false});
	};

	render() {
		const {onChange, button, value, placeholder} = this.props;
		const {focused} = this.state;
		return (
			<div className='c--input'>
				<input value={value} placeholder={placeholder}
				       onChange={e => onChange(e.target.value)}
				       onFocus={this.onFocus}
				       onBlur={this.onBlur}/>
				{button ? (
					<button>{button}</button>
				) : null}
				<div className={`line ${focused ? 'focused' : ''}`}/>
				<div className="static-line"/>
			</div>
		)
	};
};