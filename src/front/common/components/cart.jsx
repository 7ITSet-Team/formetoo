import React from 'react';
import {Link} from 'react-router-dom';

import Modal from '@components/ui/modal';
import NumberInput from '@components/ui/number-input';
import Message from '@components/ui/message';
import Dropdown from '@components/ui/dropdown';
import CartModel from '@models/cart';

export default class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            count: undefined,
            sum: undefined,
            show: false
        };

        this.update = cart => this.setState({products: cart.products, count: cart.count, sum: cart.sum});
        this.show = e => this.setState({show: true});
        this.close = e => this.setState({show: false});
        this.buttons = [
            {
                name: 'Оформить заказ',
                types: 'primary',
                handler: e => {
                    this.close();
                    CartModel.orderPlacement();
                }
            },
            {
                name: 'закрыть',
                types: 'secondary',
                handler: this.close
            }
        ];
    };

    componentWillMount() {
        CartModel.listeners.add(this.update);
        CartModel.update();
    };

    componentWillUnmount() {
        CartModel.listeners.delete(this.update);
    };

    render() {
        const {products, count, sum, show} = this.state;
        return (
            <>
            <Dropdown className="c--cart" open='false' icon={false}>
                <div className='brief btn-group' role='toggle'>
                    <span className='icon cart'/>
                    <div>
                        {(products.length > 0) ? (
                            <>
                            <div>
                                <span className='icon gift-box'/>
                                <span>{count}</span>
                            </div>
                            <div>
                                <span className='icon money'/>
                                <span>{sum}</span>
                            </div>
                            </>
                        ) : (
                            <>
                            <div>
                                Корзина
                            </div>
                            <div>
                                пуста
                            </div>
                            </>
                        )}
                    </div>
                </div>
                <div className='about' role='content'>
                    {(products.length > 0) ? (
                        <>
                        <div className='c--link' onClick={this.show}>
                            Подробнее
                        </div>
                        {products.map((item, key) => (
                            <div key={key} className='item'>
                                <span>{item.count}</span>
                                <Link className='c--link' to={`/catalog/product/${item.slug}`}>{item.name}</Link>
                                <span>{`* ${item.price} р.`}</span>
                                <span>{`= ${item.count * item.price}`}</span>
                            </div>
                        ))}
                        <div className='summary'>
                            <span>Итого:</span>
                            <span>{count} товаров</span>
                            <span> на сумму {sum}</span>
                        </div>
                        </>
                    ) : (
                        <>
                        <div>
                            Корзина
                        </div>
                        <div>
                            пуста
                        </div>
                        </>
                    )}
                </div>
            </Dropdown>
            <Modal title='Корзина' show={show} buttons={this.buttons} onClose={this.close}>
                <div className='s--cart-modal'>
                    {products.map((item, key) => (
                        <div className='item' key={key}>
                            <Link to={`/catalog/product/${item.slug}`}>
                                <img alt={item.name} src={item.media[0]}/>
                            </Link>
                            <div>
                                <Link className='c--link' to={`/catalog/product/${item.slug}`}>{item.name}</Link>
                                <NumberInput value={item.count} onChange={value => CartModel.putInCart(item, value)}/>
                                <div>{`${item.price} р.`}</div>
                                <div>{`Всего по позиции: ${item.count * item.price}`}</div>
                            </div>
                        </div>
                    ))}
                    <div className='summary'>
                        <span>Итого:</span>
                        <span>{count} товаров</span>
                        <span> на сумму {sum}</span>
                    </div>
                </div>
            </Modal>
            </>
        );
    };
};