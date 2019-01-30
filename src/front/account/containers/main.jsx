import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';

import Sections from '@account/containers/sections';
import Client from '@account/containers/client/layout';
import Attributes from '@account/containers/attributes/layout';
import AttributeSets from '@account/containers/attribute-sets/layout';
import Categories from '@account/containers/categories/layout';
import Logs from '@account/containers/logs/layout';
import Media from '@account/containers/media/layout';
import Orders from '@account/containers/orders/layout';
import Pages from '@account/containers/pages/layout';
import Products from '@account/containers/products/layout';
import Roles from '@account/containers/roles/layout';
import Settings from '@account/containers/settings/layout';
import Users from '@account/containers/users/layout';
import UserModel from '@models/user';

export default class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            permissions: UserModel.permissions
        };

        this.update = user => this.setState({permissions: user.permissions});
    };

    componentWillMount() {
        UserModel.listeners.add(this.update);
    };

    componentWillUnmount() {
        UserModel.listeners.delete(this.update);
    };

    render() {
        const {permissions} = this.state;
        return (
            <main className='a--main'>
                {(permissions.length > 1) ? (<Sections/>) : null}
                <Switch>
                    <Route path="/account/client" component={Client}/>
                    <Route path="/account/attributes" component={Attributes}/>
                    <Route path="/account/attribute-sets" component={AttributeSets}/>
                    <Route path="/account/categories" component={Categories}/>
                    <Route path="/account/logs" component={Logs}/>
                    <Route path="/account/media" component={Media}/>
                    <Route path="/account/orders" component={Orders}/>
                    <Route path="/account/pages" component={Pages}/>
                    <Route path="/account/products" component={Products}/>
                    <Route path="/account/roles" component={Roles}/>
                    <Route path="/account/settings" component={Settings}/>
                    <Route path="/account/users" component={Users}/>
                    <Route exact path="/account" render={props => (<Redirect to={`/account/${permissions[0]}`}/>)}/>
                </Switch>
            </main>
        );
    };
};