import React from 'react';
import ReactDOM from 'react-dom';

export default class Dropdown extends React.Component {
    constructor(props) {
        super(props);

        this.inverseHorisontal = {
            'right': 'left',
            'left': 'right'
        };
        this.inverseVertical = {
            'top': 'bottom',
            'bottom': 'top'
        };

        this.state = {
            open: false,
            horisontal: 'left',
            vertical: 'top'
        };

        if (typeof props.position === 'string') {
            const positions = props.position.split(' ');
            positions.forEach(position => {
                if (this.inverseHorisontal[position])
                    this.state.horisontal = this.inverseHorisontal[position];
                else if (this.inverseVertical[position])
                    this.state.vertical = this.inverseVertical[position];
            });
        }

        this.closeAtOutclick = e => !this.thisDOMel.contains(e.target) && this.setState({open: false});
    };

    componentDidMount() {
        this.thisDOMel = ReactDOM.findDOMNode(this);
        window.addEventListener('click', this.closeAtOutclick);
    };

    componentWillReceiveProps(nextProps) {
        const newState = {};
        if (typeof nextProps.position === 'string') {
            const positions = nextProps.position.split(' ');
            positions.forEach(position => {
                if (this.inverseHorisontal[position])
                    newState.horisontal = this.inverseHorisontal[position];
                else if (this.inverseVertical[position])
                    newState.vertical = this.inverseVertical[position];
            });
        } else {
            newState.horisontal = 'left'
            newState.vertical = 'top'
        }
        this.setState(newState);
    };

    componentWillUnmount() {
        window.removeEventListener('click', this.closeAtOutclick);
    };

    toggleOpen() {
        const newState = {open: !this.props.disabled && !this.state.open};

        if (!this.props.position) {
            const {x: thisDOMelX, y: thisDOMelY} = this.thisDOMel.getBoundingClientRect();
            const {height: windowY, width: windowX} = document.body.getBoundingClientRect();
            const windowMiddleX = windowX / 2;
            const windowMiddleY = windowY / 2;

            if (windowMiddleX && thisDOMelX)
                newState.horisontal = (thisDOMelX < windowMiddleX) ? 'left' : 'right';
            else
                newState.horisontal = 'right';
            if (windowMiddleY && thisDOMelY)
                newState.vertical = (thisDOMelY < windowMiddleY) ? 'top' : 'bottom';
            else
                newState.vertical = 'top';
        }
        this.setState(newState);
    };

    render() {
        const {className = '', style, children, icon = true} = this.props;
        const {open, horisontal, vertical} = this.state;

        const toggle = [], content = [];
        React.Children.forEach(children, child => (((child && child.props && (child.props.role === 'toggle')) ? toggle : content).push(child)));

        const contentStyles = {};
        contentStyles[horisontal] = 0;
        contentStyles[vertical] = '100%';

        return (
            <div className={`c--dropdown ${className}`} style={style}>
                <div className='toggle' onClick={e => this.toggleOpen()}>
                    <div>
                        {toggle}
                    </div>
                    {icon ? (<div className={`icon angle_down ${open ? 'open' : ''}`}/>) : null}
                </div>
                {open ? (<div className='content' style={contentStyles}>{content}</div>) : null}
            </div>
        );
    };
};