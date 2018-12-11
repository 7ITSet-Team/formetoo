import React from 'react';
import {Link} from 'react-router-dom';

import API from '@shop/core/api';
import Loading from '@components/ui/loading';

export default class ProductsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            productList: []
        };
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.match.params.slug !== prevProps.match.params.slug) {
            this.getInitialDataFromSrv();
        }
    };

    async getInitialDataFromSrv() {
        this.setState({loading: true, productList: []});
        const {slug = ''} = this.props.match.params;
        const {error, data: productList} = await API.request('catalog', 'category', {slug});
        if (!error) {
            this.setState({loading: false, productList});
        }
    };

    render() {
        const {productList, loading} = this.state;

        return (
            <div className='s--products-list'>
                {loading ? (
                    <Loading/>
                ) : (
                    (productList && productList.length > 0) ? productList.map((item, key) => (
                        <div key={key} className='item'>
                            <div>
                                <img alt={item.name} src={item.media[0]}/>
                            </div>
                            <div>
                                <Link to={`/catalog/product/${item.slug}`}>{item.name}</Link>
                                <div>Артикул:{item.code}</div>
                                <div>Цена:{item.price}</div>
                                {
                                    item.props.slice(0, 2).map((item, key) => <div>{`${item.name}:${item.value}`}</div>)
                                }
                            </div>
                        </div>
                    )) : 'nothing to show'
                )}
            </div>
        );
    };
};