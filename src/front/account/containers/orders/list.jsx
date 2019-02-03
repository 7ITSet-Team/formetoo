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
            ordersList: undefined,
            productsList: undefined,
            productsHash: undefined,
            currentProduct: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (currentOrder) => {
            const {productsList} = this.state;
            this.setState({show: 'editPage', currentOrder, currentProduct: productsList[0]._id})
        };
        this.close = () => this.setState({show: undefined, currentOrder: undefined, changes: undefined});
        this.saveChanges = async () => {
            const {changes, currentOrder} = this.state;
            if (Object.keys(changes || {}).length === 0)
                return this.close();
            const data = {_id: currentOrder._id, changes};
            const {error} = await API.request('orders', 'update', data);
            if (error) {
                Message.send(`ошибка при редактировании заказа, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`заказ успешно изменен`, Message.type.success);
                this.close();
                this.updateOrdersList();
            }
        };
        this.updateOrdersList = async () => {
            this.setState({loading: true});
            const {error, data: ordersList} = await API.request('orders', 'list');
            if (!error)
                this.setState({loading: false, ordersList});
            else
                Modal.send('ошибка при обновлении списка заказов, повторите попытку позже', Message.type.danger);
        };
        this.deleteOrder = async orderID => {
            const {currentOrder} = this.state;
            const {error} = await API.request('orders', 'update', {_id: (orderID || currentOrder._id)});
            if (error)
                Message.send('ошибка при удалении заказа, повторите попытку позже', Message.type.danger);
            else {
                this.close();
                this.updateOrdersList();
                Message.send('заказ успешно удален', Message.type.success);
            }
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
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {errorO, data: ordersList} = await API.request('orders', 'list');
        const {errorP, data: productsList} = await API.request('products', 'list');
        const productsHash = {};
        productsList.forEach(product => productsHash[product._id] = product);
        if (!errorO && !errorP)
            this.setState({loading: false, ordersList, productsList, productsHash});
        else
            Message.send('ошибка при получении списка заказов, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {ordersList} = this.state;
        return (ordersList || []).map((order, key) => (
            <div className='a--list-item' key={key}>
                <span>{order.status}</span>
                <span onClick={() => this.show(order)} className='icon pencil'/>
                <span onClick={() => this.deleteOrder(order._id)} className='icon remove-button'/>
            </div>
        ))
    };

    renderProductsProp(prop, key) {
        const {changes, currentOrder, productsList, productsHash} = this.state;
        return (
            <div key={key}>
                {((changes && changes.products) || (currentOrder && currentOrder.products) || []).map(({count, _id}, index) => (
                    <div key={index}>
                        <span>{productsHash[_id].name}</span>
                        <input
                            type='number'
                            value={count}
                            onChange={e => {
                                const newChanges = {...(changes || {})};
                                // меняем ссылки, чтобы изменились только те поля, которые должны меняться
                                newChanges.products = [
                                    ...((changes && changes.products) || (currentOrder && currentOrder.products) || [])
                                ];
                                newChanges.products[index] = {
                                    ...((changes && changes.products[index]) || (currentOrder && currentOrder.products[index]) || {}),
                                    count: e.target.value
                                };
                                this.setState({changes: newChanges});
                            }}/>
                        <span onClick={() => {
                            const newChanges = {...(changes || {})};
                            newChanges.products = [
                                ...((changes && changes.products) || (currentOrder && currentOrder.products) || [])
                            ];
                            newChanges.products.splice(index, 1);
                            this.setState({changes: newChanges});
                        }} className='icon remove-button'/>
                    </div>
                ))}
                <select onChange={e => this.setState({currentProduct: e.target.value})}>
                    {(productsList || []).map((product, key) => (
                        <option value={product._id} key={key}>{product.name}</option>
                    ))}
                </select>
                <button onClick={() => {
                    const {currentProduct} = this.state;
                    const newChanges = {...(changes || {})};
                    newChanges.products = [
                        ...((changes && changes.products) || (currentOrder && currentOrder.products) || [])
                    ];
                    newChanges.products.push({count: 1, _id: currentProduct});
                    this.setState({changes: newChanges});
                }}>add product
                </button>
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'products')
            return this.renderProductsProp(prop, key);
        else if ((prop === 'createDate') || (prop === 'statusDate')) {
            const {currentOrder} = this.state;
            const date = (currentOrder && new Date(currentOrder[prop]));
            return (
                <div key={key}>
                    <span>{prop}</span>
                    <div/>
                    <span>{date && date.toLocaleString()}</span>
                </div>
            )
        } else {
            const {changes, currentOrder} = this.state;
            return (
                <div key={key}>
                    <span>{prop}</span>
                    <Input
                        value={(changes && changes[prop]) || (currentOrder && currentOrder[prop])}
                        onChange={value => {
                            const newChanges = {...(changes || {})};
                            newChanges[prop] = value;
                            this.setState({changes: newChanges});
                        }}/>
                </div>
            )
        }
    };

    renderProps() {
        return ['createDate', 'products', 'status', 'statusDate'].map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show} = this.state;
        console.log(this.state);
        if (loading)
            return <Loading/>;
        return (
            <>
                {this.renderList()}
                <Modal title='Редактирование' show={(show === 'editPage')} buttons={this.buttons} onClose={this.close}>
                    <div>{this.renderProps()}</div>
                </Modal>
            </>
        );
    };
};