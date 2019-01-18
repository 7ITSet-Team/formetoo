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
            {(links.length > 0) ? (
                <div className='c--tabs-links'>
                    {links.map((link, key) => <Link key={key} to={link.path}>{link.title}</Link>)}
                </div>) : null
            }
            <div className='c--tabs-content'>
                <Switch>
                    {redirect ? (<Route exact path={redirect.from} render={props => <Redirect to={redirect.to}/>}/>) : null}
                    {links.map((link, key) => <Route exact key={key} path={link.path} component={link.component}/>)}
                </Switch>
            </div>
            </>
        );
    }
};