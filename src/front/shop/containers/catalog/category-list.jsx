import React from 'react';
import {Link} from 'react-router-dom';

import API from '@common/core/api';
import Loading from '@components/ui/loading';

export default class CategoryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            categoryList: []
        };
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
                                <img alt={item.name} src={item.img ? item.img.url : undefined}/>
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