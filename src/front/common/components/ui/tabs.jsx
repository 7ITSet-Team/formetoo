import React from 'react';
import {Switch, Route, Link, Redirect} from 'react-router-dom';

export default class Tabs extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        const {links = [], redirect} = this.props;
        return (
            <>
                <div className='c--tabs-links c--items-group'>
                    {links.map((link, key) => <Link className='c--btn success' key={key}
                                                    to={link.path}>{link.title}</Link>)}
                    <div className='c--btn pusher'/>
                </div>
                <div className='c--tabs-content'>
                    <Switch>
                        {redirect ? (
                            <Route exact path={redirect.from} render={props => <Redirect to={redirect.to}/>}/>) : null}
                        {links.map((link, key) => <Route exact key={key} path={link.path} component={link.component}/>)}
                    </Switch>
                </div>
            </>
        );
    }
};