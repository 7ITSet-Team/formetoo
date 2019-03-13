import React from 'react';

import API from '@common/core/api';
import MainMenu from '@components/main-menu';

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pages: undefined,
            categories: undefined
        };
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error: errorM, data: dataM} = await API.request('content', 'main-menu');
        if (!errorM) {
            const pages = dataM.map(item => ({to: `/${item.slug}`, title: item.name}))
            this.setState({pages});
        }
        const {error: errorC, data: dataC} = await API.request('catalog', 'categories');
        if (!errorC) {
            const categories = dataC.map(item => ({to: `/catalog/${item.slug}`, title: item.name, label: 13}));
            this.setState({categories});
        }
    };

    render() {
        const {pages, categories} = this.state;
        return (
            <menu className='s--menu'>
                <MainMenu title='Информация' menu={pages}/>
                <MainMenu title='Каталог' menu={categories}/>
            </menu>
        );
    };
};