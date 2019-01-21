import React from 'react';

import List from '@account/containers/users/list';
import Tabs from '@components/ui/tabs';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.rootPath='/account/users';
        this.links = [
            {path: this.rootPath+'/list', title: 'Список пользователей', component: List}
        ];
    };

    render() {
        return (
            <div>
                <Tabs links={this.links} redirect={{from: this.rootPath, to: this.links[0].path}}/>
            </div>
        );
    };
};