import React from 'react';

export default class Input extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        const {onChange, buttons = null, value, placeholder, type = 'text', className = ''} = this.props;
        return (
            <div className={`c--input ${className}`}>
                <input value={value} placeholder={placeholder}
                       onChange={e => onChange(e.target.value)}
                       type={type}/>
                {buttons ? (<div className='buttons'>{buttons}</div>) : null}
            </div>
        )
    };
};