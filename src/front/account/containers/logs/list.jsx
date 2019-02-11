import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            logsList: undefined,
            currentLog: undefined,
            show: false
        };
        this.show = currentLog => this.setState({show: true, currentLog});
        this.close = () => this.setState({show: false, currentLog: undefined});
        this.updateLogsList = async () => {
            this.setState({loading: true});
            const {error, data: logsList} = await API.request('logs', 'list');
            if (!error)
                this.setState({loading: false, logsList});
            else
                Message.send('ошибка при обновлении списка логов, повторите попытку позже');
        };
        this.deleteLogs = async () => {
            const {error} = await API.request('logs', 'delete-all');
            if (!error) {
                this.updateLogsList();
                Message.send('логи успешно удалены', Message.type.success);
            } else
                Message.send('ошибка при удалении логов, повторите попытку позже', Message.type.danger);
        };
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: logsList} = await API.request('logs', 'list');
        if (!error)
            this.setState({loading: false, logsList});
        else
            Message.send('ошибка при получении списка логов, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {logsList = []} = this.state;
        return logsList.map((log, key) => (
            <div key={key}>
                <span style={{color: 'green'}}>{log.user.email}</span> <span
                style={{color: 'red'}}>{log.method.action} {log.method.controller}</span> {(new Date(log.time)).toLocaleString()}
                <span onClick={() => this.show(log)} className='icon pencil'/>
            </div>
        ))
    };

    renderProp(prop, key) {
        const {currentLog} = this.state;
        return (
            <div key={key}>
                {(prop === 'time') && <div>Time: {(new Date(currentLog.time)).toLocaleString()}</div>}
                {(prop === 'user') && <div>User: {currentLog.user.email}</div>}
                {(prop === 'method') && (
                    <>
                        <div>Controller: {currentLog.method.controller}</div>
                        <div>Action: {currentLog.method.action}</div>
                    </>
                )}
            </div>
        )
    };

    renderProps() {
        return ['time', 'user', 'method'].map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show} = this.state;
        if (loading)
            return <Loading/>;
        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--danger' onClick={this.deleteLogs}>delete all logs</button>
                </div>
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