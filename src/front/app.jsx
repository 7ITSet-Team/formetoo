import React from 'react';
import {Route, Switch} from 'react-router-dom';

import ShopLayout from '@shop/layout';
import AccountLayout from '@account/layout';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';
import Verify from '@shop/containers/account/verify';
import Recovery from '@shop/containers/account/recovery';
import UserModel from '@models/user';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    };

    componentWillMount() {
        Modal.registerRootID('modal-root');
        Message.registerRootID('message-root');
        UserModel.check();
    };

    componentDidMount() {

    };

    render() {
        return (
            <>
            <Switch>
                <Route exact path="/account/verify/:id" component={Verify}/>
                <Route exact path="/account/recovery/:email/:id" component={Recovery}/>
                <Route path="/account" component={AccountLayout}/>
                <Route path="/" component={ShopLayout}/>
                {/*404 needed*/}
            </Switch>
            <Message/>
            </>
        );
    };
};