import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import ProductItem from '@shop/containers/catalog/product-item';

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
        const {productList = [], loading} = this.state;

        if (loading)
            return (<Loading/>);

        return (
            <div className='s--products-list'>
                {(productList.length > 0) ?
                    productList.map((item, key) => (<ProductItem key={key} item={item}/>))
                    : 'nothing to show'
                }
            </div>
        );
    };
};