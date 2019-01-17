import React from 'react';

import List from '@account/containers/products/list';
import Tabs from '@components/ui/tabs';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.rootPath='/account/products';
        this.links = [
            {path: this.rootPath+'/list', title: 'Список продуктов', component: List}
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