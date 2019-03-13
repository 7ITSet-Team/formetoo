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
            orders: [],
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
        const {error, data: orders} = await API.request('client', 'orders');
        if (!error)
            this.setState({loading: false, orders});
        else
            Message.send('ошибка при получении списка заказов, повторите попытку позже', Message.type.danger);
    };

    render() {
        const {loading, orders = [], currentOrder} = this.state;
        if (loading) return <Loading/>;
        return (
            <>
                {(orders).map((order, key) => (
                    <div key={key} onClick={() => this.setState({currentOrder: order})}>
                        <div>{order.createDate}</div>
                        <div>{order.status}</div>
                    </div>
                ))}
                <Modal title='Просмотр заказа' show={currentOrder} buttons={this.buttons}
                       onClose={() => this.setState({currentOrder: undefined})}>
                    <div>
                        <label>
                            Дата создания
                            <input disabled='true' value={currentOrder.createDate}/>
                        </label>
                        <label>
                            Дата изменения статуса
                            <input disabled='true' value={currentOrder.statusDate}/>
                        </label>
                        <label>
                            Статус
                            <input disabled='true' value={currentOrder.status}/>
                        </label>
                        <label>
                            Адрес доставки
                            <input disabled='true' value={currentOrder.deliveryAddress}/>
                        </label>
                        <h4>Товары</h4>
                        {(currentOrder.products || []).map((item, key) => (
                            <div key={key}>
                                <span>{item.product.name}</span>
                                <input disabled='true' value={item.count}/>
                            </div>
                        ))}
                    </div>
                </Modal>
            </>
        );
    };
};