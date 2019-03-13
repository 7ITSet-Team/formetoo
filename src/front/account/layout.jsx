import React from 'react';
import {Link, Redirect} from 'react-router-dom';

import Sections from '@account/containers/sections';
import Loading from '@components/ui/loading';
import Header from '@account/containers/header';
import Main from '@account/containers/main';
import UserModel from '@models/user';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            authorised: false,
            permissions: [],
            redirectByTimeout: false
        };

        const timeoutID = setTimeout(() => this.setState({redirectByTimeout: true}), 5000);
        this.update = user => {
            clearTimeout(timeoutID);
            this.setState({checked: true, authorised: user.authorised, permissions: user.permissions || []});
        };
        this.redirect = (<Redirect to={{pathname: '/'}}/>);
    };

    componentWillMount() {
        UserModel.listeners.add(this.update);
        UserModel.check();

    };

    componentWillUnmount() {
        UserModel.listeners.delete(this.update);
    };

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0)
        }
    };

    render() {
        const {checked, authorised, permissions, redirectByTimeout} = this.state;


        if (redirectByTimeout)
            return this.redirect;

        if (!checked)
            return (<Loading/>);

        if (!authorised)
            return this.redirect;

        if (permissions.length === 0)
            return this.redirect;

        return (
            <>
                <Header/>
                <div className='a--layout-container'>
                    {(permissions.length > 1) ? (<Sections/>) : null}
                    <Main defaultURI={`/account/${permissions[0]}`}/>
                </div>
            </>
        );
    };
};