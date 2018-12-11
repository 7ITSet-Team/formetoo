import React from 'react';
import {Link} from 'react-router-dom';

import API from '@shop/core/api';
import Loading from '@components/ui/loading';

export default class CategoryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            categoryList: []
        };
        //одноименный provider, который на сервере регистрирует и потом собирает состояния, а на клиенте раздает их.
        //а лучше пусть модели собирает и раздает
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: categoryList} = await API.request('catalog', 'categories');
        if (!error) {
            this.setState({loading: false, categoryList});
        }
    };

    render() {
        const {categoryList, loading} = this.state;

        return (
            <div className='s--category-list'>
                {loading ? (
                    <Loading/>
                ) : (
                    categoryList.map((item, key) => (
                        <div key={key} className='item'>
                            <div>
                                <img alt={item.name} src={item.img}/>
                            </div>
                            <div>
                                <Link to={`/catalog/${item.slug}`}>{item.name}</Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };
};