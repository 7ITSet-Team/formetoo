import React from 'react';
import ReactDOM from 'react-dom';

export default class Modal extends React.Component {
    constructor(props) {
        super(props);
    };

    static registerRootID(id) {
        if (typeof window !== 'undefined')
            this.root = document.getElementById(id);
    };

    render() {
        const {title = '', children = '', buttons = [], show = false, onClose, className = ''} = this.props;
        if (!show || !Modal.root)
            return null;

        return ReactDOM.createPortal(
            (<div className={`c--modal ${className}`}>
                <div className='wrap'>
                    <div className='background' onClick={e => onClose && onClose()}/>
                    <div className='form'>
                        <div className='header'>
                            {title}
                        </div>
                        <div className='content'>
                            {children}
                        </div>
                        <div className='footer c--items-group'>
                            {buttons.map((item, key) => {
                                if (item instanceof React.Component)//TODO:key?
                                    return item;
                                else if (typeof item === 'function') {
                                    const Item = item;//React warning about small first letter )))
                                    return (<Item key={key}/>);
                                } else
                                    return (
                                        <button onClick={e => item.handler && item.handler()} key={key}
                                                className={`c--btn ${item.types}`}>
                                            {item.name.toUpperCase()}
                                        </button>
                                    )
                            })}
                        </div>
                    </div>
                </div>
            </div>),
            Modal.root
        );
    };
};