import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';
import Input from '@components/ui/input';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            currentOrder: undefined,
            orders: undefined,
            products: undefined,
            productsHash: {},
            currentProduct: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (currentOrder) => {
            const {products} = this.state;
            this.setState({show: 'editPage', currentOrder, currentProduct: products[0]._id});
        };
        this.close = () => this.setState({show: undefined, currentOrder: undefined, changes: undefined});
        this.saveChanges = async () => {
            const {changes = {}, currentOrder} = this.state;
            if (!Object.keys(changes).length)
                return this.close();
            const data = {_id: currentOrder._id, changes};
            const {error} = await API.request('orders', 'update', data);
            if (error)
                Message.send(`ошибка при редактировании заказа, повторите попытку позже`, Message.type.danger);
            else {
                Message.send(`заказ успешно изменен`, Message.type.success);
                this.updateOrders();
            }
            this.close();
        };
        this.updateOrders = async () => {
            this.setState({loading: true});
            const {error, data: orders} = await API.request('orders', 'list');
            if (!error)
                this.setState({loading: false, orders});
            else
                Modal.send('ошибка при обновлении списка заказов, повторите попытку позже', Message.type.danger);
        };
        this.deleteOrder = async (orderID = this.state.currentOrder._id) => {
            const {error} = await API.request('orders', 'update', {_id: orderID});
            if (error)
                Message.send('ошибка при удалении заказа, повторите попытку позже', Message.type.danger);
            else {
                Message.send('заказ успешно удален', Message.type.success);
                this.updateOrders();
            }
            this.close();
        };
        this.buttons = [
            {
                name: 'сохранить',
                types: 'primary',
                handler: this.saveChanges
            },
            {
                name: 'закрыть',
                types: 'secondary',
                handler: this.close
            },
            {
                name: 'удалить',
                types: 'danger',
                handler: this.deleteOrder
            }
        ];
        this.fields = ['createDate', 'products', 'status', 'statusDate', 'deliveryAddress', 'comment'];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {errorO, data: orders} = await API.request('orders', 'list');
        const {errorP, data: {products, productsHash}} = await API.request('products', 'list', {hash: true});
        if (!errorO && !errorP)
            this.setState({loading: false, orders, products, productsHash});
        else
            Message.send('ошибка при получении списка заказов, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {orders = []} = this.state;
        return orders.map((order, key) => (
            <div className='a--list-item' key={key}>
                <span>{order.status}</span>
                <span onClick={() => this.show(order)} className='icon pencil'/>
                <span onClick={() => this.deleteOrder(order._id)} className='icon remove-button'/>
            </div>
        ))
    };

    renderProductsProp(prop, key) {
        const {changes = {}, currentOrder, products = [], productsHash} = this.state;
        return (
            <div key={key}>
                {(changes.products || currentOrder.products || []).map(({count, _id}, index) => (
                    <div key={index}>
                        <span>{productsHash[_id].name}</span>
                        <input
                            type='number'
                            value={count}
                            onChange={e => {
                                const newChanges = {...changes};
                                // меняем ссылки, чтобы изменились только те поля, которые должны меняться
                                newChanges.products = [
                                    ...(changes.products || (currentOrder && currentOrder.products) || [])
                                ];
                                newChanges.products[index] = {
                                    ...((changes.products && changes.products[index]) || (currentOrder && currentOrder.products[index]) || {}),
                                    count: e.target.value
                                };
                                this.setState({changes: newChanges});
                            }}/>
                        <span onClick={() => {
                            const newChanges = {
                                ...changes,
                                products: [...(changes.products || (currentOrder && currentOrder.products) || [])]
                            };
                            newChanges.products.splice(index, 1);
                            this.setState({changes: newChanges});
                        }} className='icon remove-button'/>
                    </div>
                ))}
                <select onChange={e => this.setState({currentProduct: e.target.value})}>
                    {products.map(product => <option value={product._id} key={product._id}>{product.name}</option>)}
                </select>
                <button onClick={() => {
                    const {currentProduct} = this.state;
                    const newChanges = {
                        ...changes,
                        products: [...(changes.products || (currentOrder && currentOrder.products) || [])]
                    };
                    newChanges.products.push({count: 1, _id: currentProduct});
                    this.setState({changes: newChanges});
                }}>
                    add product
                </button>
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'products')
            return this.renderProductsProp(prop, key);
        if (['statusDate', 'createDate'].includes(prop)) {
            const {currentOrder} = this.state;
            const date = new Date(currentOrder[prop]);
            return (
                <div key={key}>
                    <span>{prop}</span>
                    <div/>
                    <span>{date && date.toLocaleString()}</span>
                </div>
            )
        }
        const {changes = {}, currentOrder} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input
                    value={(changes[prop] || (currentOrder && currentOrder[prop])) || ''}
                    onChange={value => this.setState({changes: {...changes, [prop]: value}})}/>
            </div>
        )
    };

    renderProps() {
        return this.fields.map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show} = this.state;
        if (loading)
            return <Loading/>;
        return (
            <>
                {this.renderList()}
                {show && (
                    <Modal title='Редактирование' show={true} buttons={this.buttons} onClose={this.close}>
                        <div>{this.renderProps()}</div>
                    </Modal>
                )}
            </>
        );
    };
};