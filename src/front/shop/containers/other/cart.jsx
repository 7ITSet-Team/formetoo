import React from 'react';
import {Link} from 'react-router-dom';

import Modal from '@components/ui/modal';
import NumberInput from '@components/ui/number-input';
import Message from '@components/ui/message';
import CartModel from '@models/cart';
import UserModel from '@models/user';
import Login from '@shop/containers/account/login';
import Input from "../../../common/components/ui/input";

export default class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            count: undefined,
            sum: undefined,
            show: false,
            orderReplacement: false,
            deliveryAddress: undefined,
            comment: undefined,
            userInfo: {
                email: undefined,
                name: undefined,
                lastname: undefined,
                phone: undefined
            }
        };

        this.update = cart => this.setState({products: cart.products, count: cart.count, sum: cart.sum});
        this.show = e => this.setState({show: true});
        this.close = e => this.setState({show: false, orderReplacement: false});
        this.buttons = [
            {
                name: 'Оформить заказ',
                types: 'success',
                handler: e => {
                    this.close();
                    this.setState({orderReplacement: true});
                }
            },
            {
                name: 'закрыть',
                types: 'danger',
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

    renderUserForm() {
        const {userInfo} = this.state;
        return (
            <>
                <Input placeholder='почта *' type='email'
                       onChange={email => this.setState({userInfo: {...userInfo, email}})}/>
                <Input placeholder='имя *' type='name'
                       onChange={name => this.setState({userInfo: {...userInfo, name}})}/>
                <Input placeholder='фамилия *' type='lastname'
                       onChange={lastname => this.setState({userInfo: {...userInfo, lastname}})}/>
                <Input placeholder='телефон *' type='phone'
                       onChange={phone => this.setState({userInfo: {...userInfo, phone}})}/>
            </>
        )
    };

    renderOrderForm(isAuthorized) {
        return (
            <>
                <Input
                    placeholder='Адрес доставки'
                    onChange={value => this.setState({deliveryAddress: value})}/>
                <Input
                    placeholder='Комметарий'
                    onChange={value => this.setState({comment: value})}/>
                <button onClick={async () => {
                    const {deliveryAddress, comment, userInfo} = this.state;
                    const data = isAuthorized
                        ? {deliveryAddress, comment}
                        : {deliveryAddress, comment, userInfo};
                    const error = await CartModel.orderPlacement(data);
                    Message.send(
                        `ваш заказ ${!error ? `успешно оформлен` : `не обработан, повторите попытку позже`}`,
                        !error ? Message.type.success : Message.type.danger
                    );
                    this.close();
                }}>Оформить
                </button>
            </>
        )
    };

    render() {
        const {products, count, sum, show, orderReplacement} = this.state;
        return (
            <>
                <div className={`s--cart ${(products.length > 0) ? 'active' : ''}`} onClick={this.show}>
                    <div>
                        <span className='icon cart'/>
                        {(products.length > 0) ? (<span className='c--badge'>{count}</span>) : null}
                    </div>
                    <div>
                        <div>
                            Корзина
                        </div>
                        <div>
                            {(products.length > 0) ? sum : 'пуста'}
                        </div>
                    </div>
                </div>
                <Modal title='Корзина' show={show} buttons={this.buttons} onClose={this.close}>
                    <div className='s--cart-modal'>
                        {products.map((item, key) => (
                            <div className='item' key={key}>
                                <Link to={`/catalog/product/${item.slug}`}>
                                    <img alt={item.name} src={item.media[0]}/>
                                </Link>
                                <div>
                                    <Link className='c--link' to={`/catalog/product/${item.slug}`}>{item.name}</Link>
                                    <NumberInput value={item.count}
                                                 onChange={value => CartModel.putInCart(item, value)}/>
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
                <Modal title='Оформление заказа' show={orderReplacement} onClose={this.close}>
                    {!UserModel.authorised
                        ? (
                            <div>
                                {/*свойство authorized меняется, поэтому вставляем force update*/}
                                <Login update={() => this.forceUpdate()} isInOrder={true}/>
                                <div>или заполните следующую форму:</div>
                                <div>{this.renderUserForm()}</div>
                                <div>{this.renderOrderForm(false)}</div>
                            </div>
                        )
                        : this.renderOrderForm(true)}
                </Modal>
            </>
        );
    };
};