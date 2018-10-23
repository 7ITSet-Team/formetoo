import React from 'react';

export default class Cart extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		const {count, cost} = this.props;
		return (
			<div className="c--cart">
				<span className='icon cart'/>
				<div>
					<div>
						<span className='icon gift-box'/>
						{count}
					</div>
					<div>
						<span className='icon money'/>
						{cost}
					</div>
				</div>
			</div>
		);
	};
};