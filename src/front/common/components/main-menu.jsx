import React from 'react';
import {NavLink} from 'react-router-dom';

export default class MainMenu extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        const {title = '', menu = []} = this.props;
        return (
            <nav className='c--main-menu'>
                <div className='title'>
                    <span>{title}</span>
                    <span className='icon menu'/>
                </div>
                {menu ? menu.map((item, key) => (
                    <NavLink key={key} to={item.to} exact={item.to === '/'} activeClassName='active'>
                        <div>{item.title}</div>
                        <div>{item.label || ''}</div>
                    </NavLink>
                )) : null}
            </nav>
        );
    };
};