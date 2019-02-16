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
            logsList: undefined,
            currentLog: undefined,
            show: false,
            filter: {},
            checkedLogs: [],
            showJSON: false
        };
        this.show = currentLog => this.setState({show: true, currentLog});
        this.close = () => this.setState({show: false, currentLog: undefined});
        this.updateLogsList = async () => {
            const {filter} = this.state;
            this.setState({loading: true});
            const {error, data: logsList} = filter ? await API.request('logs', 'list', {filter}) : await API.request('logs', 'list');
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
        this.deleteCheckedLogs = async () => {
            const {checkedLogs} = this.state;
            const {error} = await API.request('logs', 'update', {ids: checkedLogs});
            if (!error) {
                this.updateLogsList();
                Message.send('логи успешно удалены', Message.type.success);
            } else
                Message.send('ошибка при удалении логов, повторите попытку позже', Message.type.danger);
        };
        this.acceptFilter = async (filterBy, value) => {
            const {filter} = this.state;
            const newFilter = {...filter};
            newFilter[filterBy] = (value || undefined);
            for (const key in newFilter) (newFilter[key] === undefined) && (delete newFilter[key]);
            this.setState({filter: newFilter});
            const {error, data: logsList} = await API.request('logs', 'list', {filter: newFilter});
            if (!error)
                this.setState({logsList});
            else
                Message.send('ошибка при обновлении списка логов, повторите попытку позже');
        };
        this.checkAll = () => {
            const {logsList} = this.state;
            const checkedLogs = logsList.map(log => log._id);
            this.setState({checkedLogs});
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
        const {logsList = [], checkedLogs, filter} = this.state;
        return (
            <>
                {['user.email', 'method.action', 'method.controller', 'time'].map((filterBy, key) => {
                    if (filterBy === 'time')
                        return (
                            <div key={key}>
                                от:
                                <input type='date' onChange={e => this.acceptFilter('time.after', e.target.value)}
                                       value={filter['time.after'] || ''}/>
                                до:
                                <input type='date' onChange={e => this.acceptFilter('time.before', e.target.value)}
                                       value={filter['time.before'] || ''}/>
                            </div>
                        );
                    return (
                        <Input key={key} placeholder={filterBy} onChange={value => this.acceptFilter(filterBy, value)}
                               value={filter[filterBy] || ''}/>
                    );
                })}
                {logsList.map((log, key) => (
                    <div key={key}>
                        <input type='checkbox' onChange={e => {
                            if (e.target.checked)
                                this.setState({checkedLogs: [...checkedLogs, log._id]});
                            else {
                                const newCheckedLogs = [...checkedLogs];
                                newCheckedLogs.splice(newCheckedLogs.indexOf(log._id), 1);
                                this.setState({checkedLogs: newCheckedLogs});
                            }
                        }} checked={checkedLogs.includes(log._id)}/>
                        <span style={{color: 'green'}}>{log.user.email}</span> <span
                        style={{color: 'red'}}>{log.method.action} {log.method.controller}</span> {(new Date(log.time)).toLocaleString()}
                        <span onClick={() => this.show(log)} className='icon pencil'/>
                    </div>
                ))}
            </>
        )
    };

    renderProp(prop, key) {
        const {currentLog} = this.state;
        if (prop === 'time')
            return (
                <div key={key}>
                    <div>Time: {(new Date(currentLog.time)).toLocaleString()}</div>
                </div>
            );
        else if (prop === 'user')
            return (
                <div key={key}>
                    <div>User: {currentLog.user.email}</div>
                </div>
            );
        else if (prop === 'method') {
            const {showJSON} = this.state;
            return (
                <div key={key}>
                    <div>Controller: {currentLog.method.controller}</div>
                    <div>Action: {currentLog.method.action}</div>
                    {currentLog.method.data && (
                        <>
                            <button onClick={() => this.setState({showJSON: true})}>see json</button>
                            <button onClick={() => this.setState({showJSON: false})}>hide json</button>
                            {showJSON && <pre
                                style={{backgroundColor: 'tomato'}}>{JSON.stringify(currentLog.method.data, null, 2)}</pre>}
                        </>
                    )}
                </div>
            );
        }
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
                    <button className='c--btn c--btn--info' onClick={this.checkAll}>check all checkboxes</button>
                    <button className='c--btn c--btn--danger' onClick={this.deleteCheckedLogs}>delete ONLY CHECKED BY
                        FUCKING BOOLEAN CHECKBOXES logs
                    </button>
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