import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';
import Input from '@components/ui/input';
import Pagination from '@components/ui/pagination';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            logs: undefined,
            currentLog: undefined,
            show: false,
            filter: undefined,
            checkedLogs: undefined,
            showJSON: false,
            page: 1,
            totalPages: 1
        };
        this.show = currentLog => this.setState({show: true, currentLog});
        this.close = () => this.setState({show: false, currentLog: undefined});
        this.updateLogs = async (page = this.state.page) => {
            const {filter} = this.state;
            this.setState({loading: true, page});
            const {error, data: {logs, pages: totalPages}} = await API.request('logs', 'list', {filter, page});
            if (totalPages && (page > totalPages))
                return this.updateLogs(1);
            if (!error)
                this.setState({loading: false, logs, totalPages});
            else
                Message.send('ошибка при обновлении списка логов, повторите попытку позже');
        };
        this.deleteLogs = async () => {
            const {error} = await API.request('logs', 'delete-all');
            if (!error) {
                this.updateLogs();
                Message.send('логи успешно удалены', Message.type.success);
            } else
                Message.send('ошибка при удалении логов, повторите попытку позже', Message.type.danger);
        };
        this.deleteCheckedLogs = async () => {
            const {checkedLogs} = this.state;
            const {error} = await API.request('logs', 'update', {ids: checkedLogs});
            if (!error) {
                this.updateLogs();
                Message.send('логи успешно удалены', Message.type.success);
            } else
                Message.send('ошибка при удалении логов, повторите попытку позже', Message.type.danger);
        };
        this.acceptFilter = async (filterBy, value) => {
            const {filter} = this.state;
            let newFilter = {...filter};
            newFilter[filterBy] = value;
            if (!(newFilter['time.after'] == null)) {
                if (newFilter['time.after'])
                    newFilter.time = {...(newFilter.time || {}), $gte: newFilter['time.after']};
                else
                    delete newFilter.time.$gte;
                delete newFilter['time.after'];
            }
            if (!(newFilter['time.before'] == null)) {
                if (newFilter['time.before'])
                    newFilter.time = {...(newFilter.time || {}), $lte: newFilter['time.before']};
                else
                    delete newFilter.time.$lte;
                delete newFilter['time.before'];
            }
            if (!Object.keys(newFilter.time || {}).length)
                delete newFilter.time;
            for (const filter in newFilter)
                if (((typeof newFilter[filter] === 'object') && !Object.keys(newFilter[filter])) || !newFilter[filter])
                    delete newFilter[filter];
            if (!Object.keys(newFilter).length)
                newFilter = undefined;
            this.setState({filter: newFilter, page: 1}, this.updateLogs);
        };
        this.checkAll = () => {
            const {logs} = this.state;
            const checkedLogs = logs.map(log => log._id);
            this.setState({checkedLogs});
        };
        this.filters = ['user.email', 'method.action', 'method.controller', 'time'];
        this.fields = ['time', 'user', 'method'];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: {logs, pages: totalPages}} = await API.request('logs', 'list', {page: this.state.page});
        if (!error)
            this.setState({loading: false, logs, totalPages});
        else
            Message.send('ошибка при получении списка логов, повторите попытку позже', Message.type.danger);
    };

    renderToolbar() {
        const {filter = {}} = this.state;
        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--danger' onClick={this.deleteLogs}>delete all logs</button>
                    <button className='c--btn c--btn--info' onClick={this.checkAll}>check all checkboxes</button>
                    <button className='c--btn c--btn--danger' onClick={this.deleteCheckedLogs}>delete checked logs
                    </button>
                </div>
                {this.filters.map((filterBy, key) => {
                    if (filterBy === 'time')
                        return (
                            <div key={key}>
                                от:
                                <input type='date' onChange={e => this.acceptFilter('time.after', e.target.value)}
                                       value={(filter.time && filter.time.$gte) || ''}/>
                                до:
                                <input type='date' onChange={e => this.acceptFilter('time.before', e.target.value)}
                                       value={(filter.time && filter.time.$lte) || ''}/>
                            </div>
                        );
                    return (
                        <Input key={key} placeholder={filterBy} onChange={value => this.acceptFilter(filterBy, value)}
                               value={filter[filterBy] || ''}/>
                    );
                })}
            </>
        )
    };

    renderList() {
        const {logs = [], checkedLogs = [], loading} = this.state;
        if (loading)
            return <Loading/>;
        return logs.map((log, key) => (
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
        ))
    };

    renderProp(prop, key) {
        const {currentLog} = this.state;
        switch (prop) {
            case 'time':
                return (
                    <div key={key}>
                        <div>Time: {(new Date(currentLog.time)).toLocaleString()}</div>
                    </div>
                );
            case 'user':
                return (
                    <div key={key}>
                        <div>User: {currentLog.user.email}</div>
                    </div>
                );
            case 'method':
                const {showJSON} = this.state;
                return (
                    <div key={key}>
                        <div>Controller: {currentLog.method.controller}</div>
                        <div>Action: {currentLog.method.action}</div>
                        <div>
                            View:
                            {currentLog.view && <div dangerouslySetInnerHTML={{__html: currentLog.view}}/>}
                        </div>
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
        return this.fields.map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {show, page, totalPages} = this.state;
        return (
            <>
                {this.renderToolbar()}
                {this.renderList()}
                {show && (
                    <Modal title='Редактирование' show={true} buttons={this.buttons} onClose={this.close}>
                        <div>{this.renderProps()}</div>
                    </Modal>
                )}
                <Pagination page={page} totalPages={totalPages} goToPage={goTo => this.updateLogs(goTo)}/>
            </>
        );
    };
};