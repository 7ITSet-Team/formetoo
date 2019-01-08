import React from 'react';
import {Link} from 'react-router-dom';

import CartModel from '@models/cart';

export default class ProductItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inCart: CartModel.isItemInCart(props.item)
        };
        this.update = cart => this.setState({inCart: cart.isItemInCart(this.props.item)});
    };

    componentWillMount() {
        CartModel.listeners.add(this.update);
    };

    componentWillUnmount() {
        CartModel.listeners.delete(this.update);
    };

    render() {
        const {item} = this.props;
        const {inCart} = this.state;
        return (
            <div className='s--product-item'>
                <div>
                    <Link to={`/catalog/product/${item.slug}`}>
                        <img alt={item.name} src={item.media[0]}/>
                    </Link>
                    <div className='code' title={`Артикул:${item.code}`}>{item.code}</div>
                    <div className='price' title={`Цена:${item.price}`}>{`${item.price} р.`}</div>
                    <div className='in-cart' onClick={e => CartModel.putInCart(item, (inCart || 0) + 1)}>
                        <span>{inCart || ''}</span>
                        <span className='icon cart'/>
                    </div>
                </div>
                <div>
                    <Link to={`/catalog/product/${item.slug}`}>{item.name}</Link>
                    {
                        item.props.slice(0, 2).map((item, key) => (
                            <div key={key}>{`${item.name}:${item.value}`}</div>
                        ))
                    }
                </div>
            </div>
        );
    };
};