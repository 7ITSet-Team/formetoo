import React from 'react';

export default class Input extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        const {onChange, buttons=[], value, placeholder, type = 'text', className = ''} = this.props;
            const buttonsList = Array.isArray(buttons) ? buttons : [buttons];

        return (
            <div className={`c--input ${className}`}>
                <input value={value} placeholder={placeholder}
                       onChange={e => onChange(e.target.value)}
                       type={type}/>
                {buttonsList ? (<div className='buttons'>{buttonsList}</div>) : null}
            </div>
        )
    };
};