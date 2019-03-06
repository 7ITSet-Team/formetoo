import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import MultiplePhoto from '@components/multiple-photo';

export default class Product extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            product: undefined
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
        this.setState({loading: true, product: undefined});
        const {slug = ''} = this.props.match.params;
        const {error, data: product} = await API.request('catalog', 'product', {slug});
        if (!error) {
            this.setState({loading: false, product});
        }
    };

    componentWillUnmount() {
        const meta = [...document.getElementsByTagName('meta')];
        for (const tag of meta)
            if (['description', 'keywords'].includes(tag.name))
                tag.parentNode.removeChild(tag);
        document.title = document.previousTitle;
        document.previousTitle = undefined;
    }

    render() {
        const {product, loading} = this.state;
        if (process.browser && product) {
            document.previousTitle = document.title;
            document.title = product.name;
            const description = document.createElement('meta');
            description.name = 'description';
            description.content = product.description;
            const keywords = document.createElement('meta');
            keywords.name = 'keywords';
            keywords.content = product.keywords;
            document.getElementsByTagName('head')[0].appendChild(description);
            document.getElementsByTagName('head')[0].appendChild(keywords);
        }
        return (
            <div className='s--product'>
                {loading ? (
                    <Loading/>
                ) : (
                    product ? (
                        <div className='item'>
                            <div>
                                {product.media.map(media => (
                                    <div key={media._id}>
                                        {Array.isArray(media.url)
                                            ? <MultiplePhoto frames={media.url}/>
                                            : <img alt={product.name} src={media.url} width='200' height='200'/>}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h1 to={`/catalog/product/${product.slug}`}>{product.name}</h1>
                                <div>Артикул:{product.code}</div>
                                <div>Цена:{product.price}</div>
                                {product.props.map((item, key) => (
                                    <div key={key}>{`${item.name}:${item.value}`}</div>
                                ))}
                            </div>
                        </div>
                    ) : 'nothing to show'
                )}
            </div>
        );
    };
};