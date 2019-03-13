import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Message from '@components/ui/message';

export default class Info extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            clientInfo: undefined
        };
    }

    componentWillMount() {
        this.getInitialDataFromSrv();
    }

    async getInitialDataFromSrv() {
        const {error, data: clientInfo} = await API.request('client', 'info');
        if (!error)
            this.setState({loading: false, clientInfo});
        else
            Message.send('ошибка при получении данных пользователя, повторите попытку позже', Message.type.danger);
    };

    render() {
        const {loading, clientInfo} = this.state;
        if (loading) return <Loading/>;
        return (
            <div>
                <div>Почта: {clientInfo.email}</div>
                <div>Имя: {clientInfo.name}</div>
                <div>Фамилия: {clientInfo.lastname}</div>
                <div>Телефон: {clientInfo.phone}</div>
            </div>
        );
    };
};