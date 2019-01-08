import React from 'react';

export default class NumberInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value || 0
        };

        this.onChange = e => this.onChangeValue(e.target.value);
        this.decrease = e => this.onChangeValue(Math.max(this.state.value - 1, 0));
        this.increase = e => this.onChangeValue(this.state.value + 1);
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({value: nextProps.value});
        }
    };

    onChangeValue(value) {
        const {onChange} = this.props;
        const {value: oldValue} = this.state;
        if (typeof value === 'string') {
            value = +value.replace(/[^\d,]+/g, '');
            value = isNaN(value) ? 0 : value;
        }

        if (value === oldValue)
            return;

        this.setState({value});
        onChange && onChange(value);
    };

    render() {
        const {value} = this.state;
        return (
            <div className='c--number-input c--items-group'>
                <button className='c--btn c--btn--success' onClick={this.decrease}>-</button>
                <input value={value} onChange={this.onChange}/>
                <button className='c--btn c--btn--success' onClick={this.increase}>+</button>
            </div>
        )
    };
};