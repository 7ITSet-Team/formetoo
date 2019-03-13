import React from 'react';

import Info from '@account/containers/client/info';
import Orders from '@account/containers/client/orders';
import Tabs from '@components/ui/tabs';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.rootPath = '/account/client';
        this.links = [
            {path: this.rootPath + '/info', title: 'Профиль', component: Info},
            {path: this.rootPath + '/orders', title: 'Заказы', component: Orders}
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