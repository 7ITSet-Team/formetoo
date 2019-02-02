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
        this.show = (page, currentOrder) => {
            const {productsList} = this.state;
            this.setState({show: page, currentOrder, currentProduct: productsList[0]._id})
        };
        this.close = () => this.setState({show: undefined, currentOrder: undefined, changes: undefined});
        this.updateOrdersList = async () => {
            this.setState({loading: true});
            const {error, data: ordersList} = await API.request('orders', 'list');
            if (!error)
                this.setState({loading: false, ordersList});
            else
                Modal.send('ошибка при обновлении списка заказов, повторите попытку позже', Message.type.danger);
        };
        this.deleteOrder = async orderID => {
            const {currentOrder, show} = this.state;
            const {error} = await API.request('orders', 'update', {_id: (orderID || currentOrder._id)});
            if (error)
                Message.send('ошибка при удалении заказа, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage')
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
                <span onClick={() => this.show('editPage', order)} className='icon pencil'/>
                <span onClick={() => this.deleteAttribute(order._id)} className='icon remove-button'/>
            </div>
        ))
    };

    renderProductsProp(prop, key) {
        const {changes, currentOrder, show, productsList, productsHash} = this.state;
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
                                if (show === 'editPage')
                                    this.setState({changes: newChanges});
                                else if (show === 'createPage')
                                    this.setState({currentOrder: {...currentOrder, ...newChanges}})
                            }}/>
                        <span onClick={() => {
                            const newChanges = {...(changes || {})};
                            newChanges.products = [
                                ...((changes && changes.products) || (currentOrder && currentOrder.products) || [])
                            ];
                            newChanges.products.splice(index, 1);
                            if (show === 'editPage')
                                this.setState({changes: newChanges});
                            else if (show === 'createPage')
                                this.setState({currentOrder: {...currentOrder, ...newChanges}});
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
                    if (show === 'editPage')
                        this.setState({changes: newChanges});
                    else if (show === 'createPage')
                        this.setState({currentOrder: {...currentOrder, ...newChanges}});
                }}>add product</button>
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'products')
            return this.renderProductsProp(prop, key);
    };

    renderProps() {
        return ['createDate', 'products', 'status', 'statusDate'].map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show} = this.state;
        console.log(this.state)
        if (loading)
            return <Loading/>;
        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteOrder}];
        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {this.renderList()}
                <Modal title='Редактирование' show={(show === 'editPage')} buttons={actions} onClose={this.close}>
                    <div>{this.renderProps()}</div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={actions} onClose={this.close}>
                    <div>{this.renderProps()}</div>
                </Modal>
            </>
        );
    };
};