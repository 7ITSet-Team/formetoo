import React from 'react';
import ReactDOM from 'react-dom';

export default class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
        this.refresh = messages => this.setState({messages});
    };

    componentWillMount() {
        Message.refresh = this.refresh;
    };

    componentWillUnmount() {
        Message.refresh = undefined;
    };

    static get type() {
        return {
            success: 'success',
            danger: 'danger',
            info: 'info'
        };
    };

    static send(message = '', type = 'info') {
        if (typeof message !== 'string')
            return;
        this.list = this.list || new Set();
        const item = {message, type, timestamp: (new Date()).getTime()};
        this.list.add(item);

        setTimeout(() => {
            this.list.delete(item);
            this.refresh && this.refresh(Array.from(this.list).reverse().slice(0, 3));
        }, 8000);

        this.refresh && this.refresh(Array.from(this.list).reverse().slice(0, 3));
    };

    static registerRootID(id) {
        if(typeof window !== 'undefined')
        this.root = document.getElementById(id);
    };

    render() {
        const {messages} = this.state;
        if (!messages || messages.length === 0)
            return null;

        return ReactDOM.createPortal(
            (<div className='c--message'>
                {messages.map(item => (
                    <div key={item.timestamp} className={item.type}>
                        {item.message}
                    </div>
                ))}
            </div>),
            Message.root
        );
    };
};