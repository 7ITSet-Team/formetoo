import React from 'react';
import {Link} from 'react-router-dom';

import Logo from '@components/ui/logo';
import UserModel from '@models/user';

export default class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            about: UserModel.about || {}
        };

        this.update = user => this.setState({about: user.about});
        this.logout = e => UserModel.logout();
    };

    componentWillMount() {
        UserModel.listeners.add(this.update);
    };

    componentWillUnmount() {
        UserModel.listeners.delete(this.update);
    };

    render() {
        const {about} = this.state;
        return (
            <header className='a--header'>
                <div className='info'>
                    <Logo/>
                    <div className='about'>{`${about.name} ${about.lastname}`}</div>
                </div>
                <div className='actions'>
                    <Link to='/'>на главную</Link>
                    <button className='c--btn c--btn--danger' onClick={this.logout}>Выход</button>
                </div>
            </header>
        );
    };
};