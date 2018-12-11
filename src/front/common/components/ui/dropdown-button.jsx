import React from 'react';

import Dropdown from '@components/ui/dropdown';

export default class DropdownButton extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        const {children, types = '', className, label, split = false, onClick} = this.props;
        const classes = `c--btn ${className} ${types.split(' ').map(type => 'c--btn--' + type).join(' ')}`;

        const labels = React.Children.map(label, child => {
            if (!child)
                return null;
            if (child.props)
                child.props.role = 'toggle';
            else
                child = (<span role='toggle'>{child}</span>);

            return child;
        });

        return split ? (
            <div className='c--items-group'>
                <button className={classes} onClick={onClick}>{labels}</button>
                <Dropdown className={classes}>
                    {children}
                </Dropdown>
            </div>
        ) : (
            <Dropdown className={classes} onClick={onClick}>
                {labels || null}
                {children}
            </Dropdown>
        );
    };
};