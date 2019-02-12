import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Message from '@components/ui/message';
import Modal from '@components/ui/modal';
import Input from '@components/ui/input';

export default class Info extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            clientInfo: undefined,
            show: 'info',
            currentOrder: undefined
        };
        this.buttons = [
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
    }

    componentWillMount() {
        this.getInitialDataFromSrv();
    }

    async getInitialDataFromSrv() {
        const {error, data: clientInfo} = await API.request('client', 'info');
        if (!error)
            this.setState({loading: false, clientInfo});
        else
            Message.send('ошибка при получении списка пользователей, повторите попытку позже', Message.type.danger);
    };

    renderProductsProp(prop, key) {
        const {currentOrder} = this.state;
        return (
            <div key={key}>
                {(currentOrder.products || []).map((info, index) => (
                    <div key={index}>
                        <span>{info.product.name}</span>
                        <input type='number' value={info.count} onChange={() => {
                        }}/>
                    </div>
                ))}
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'products')
            return this.renderProductsProp(prop, key);
        else if ((prop === 'createDate') || (prop === 'statusDate')) {
            const {currentOrder} = this.state;
            const date = new Date(currentOrder[prop]);
            return (
                <div key={key}>
                    <span>{prop}</span>
                    <div/>
                    <span>{date.toLocaleString()}</span>
                </div>
            )
        } else {
            const {currentOrder} = this.state;
            return (
                <div key={key}>
                    <span>{prop}</span>
                    <Input value={currentOrder[prop]} onChange={() => {
                    }}/>
                </div>
            )
        }
    };

    renderProps() {
        return ['createDate', 'products', 'status', 'statusDate', 'deliveryAddress', 'comment'].map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, clientInfo, show, currentOrder} = this.state;
        if (loading)
            return <Loading/>;
        return (
            <>
                <button onClick={() => this.setState({show: 'info'})}>
                    info
                </button>
                <button onClick={() => this.setState({show: 'orders'})}>
                    orders
                </button>
                {clientInfo && (show === 'info') && (
                    <div>
                        <div>Почта: {clientInfo.email}</div>
                        <div>Имя: {clientInfo.name}</div>
                        <div>Фамилия: {clientInfo.lastname}</div>
                        <div>Телефон: {clientInfo.phone}</div>
                    </div>
                )}
                {clientInfo && clientInfo.orders && (show === 'orders') && (
                    clientInfo.orders.map((order, key) => (
                        <div key={key}>
                            {(new Date(order.createDate)).toLocaleString()} {order.status}
                            <button onClick={() => this.setState({currentOrder: order})}>more...</button>
                        </div>
                    ))
                )}
                {clientInfo && !clientInfo.orders && <div>Заказов нет.</div>}
                {currentOrder && (
                    <Modal title='Просмотр заказа' show={true} buttons={this.buttons}
                           onClose={() => this.setState({currentOrder: undefined})}>
                        <div>{this.renderProps()}</div>
                    </Modal>
                )}
            </>
        )
    }
}