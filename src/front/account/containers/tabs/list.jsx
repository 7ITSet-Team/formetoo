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
            tabsList: [],
            currentTab: undefined,
            changes: undefined,
            show: {
                editPage: false,
                createPage: false
            }
        };
        this.show = (page, currentRole) => this.setState({
            show: {[page]: true},
            currentTab: (currentRole || {})
        });
        this.close = () => this.setState({
            show: {editPage: false, createPage: false},
            currentTab: undefined,
            changes: undefined
        });
        this.updateTabsList = async () => {
            const {error, data: tabsList} = await API.request('tabs', 'list');
            if (!error)
                this.setState({loading: false, tabsList});
            else
                Modal.send('ошибка при обновлении списка табов, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes, currentTab, show} = this.state;

            let data;
            if (show.editPage)
                data = {_id: currentTab._id, changes: changes || {}};
            else if (show.createPage)
                data = {...currentTab, type: (currentTab.type || 'textField')};

            const {error} = await API.request('tabs', 'update', data);

            if (error) {
                Message.send(`ошибка при ${(show.editPage && 'редактировании') || (show.createPage && 'создании')} таба, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`таб успешно ${(show.editPage && 'изменен') || (show.createPage && 'создан')}`, Message.type.success);
                this.close();
                this.setState({loading: true});
                this.updateTabsList();
            }
        };
        this.deleteTab = async roleID => {
            const {currentTab, show} = this.state;
            const {error} = await API.request('tabs', 'update', {_id: (roleID || currentTab._id)});
            if (error)
                Message.send('ошибка при удалении таба, повторите попытку позже', Message.type.danger);
            else {
                if (show.editPage)
                    this.setState({show: {editPage: false, createPage: false}});
                this.updateTabsList();
                Message.send('таб успешно удален', Message.type.success);
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
        const {error, data: tabsList} = await API.request('tabs', 'list');
        if (!error)
            this.setState({loading: false, tabsList});
        else
            Message.send('ошибка при получении списка табов, повторите попытку позже', Message.type.danger);
    };

    render() {
        const {loading, show, tabsList, currentTab, changes} = this.state;

        if (loading)
            return (<Loading/>);

        let actions = this.buttons;
        actions = !show.editPage
            ? actions
            : [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteTab}];

        const tabTypes = [{
            name: 'textField',
            alias: 'Текстовое поле'
        }, {
            name: 'textArea',
            alias: 'Текстовый блок'
        }, {
            name: 'numberField',
            alias: 'Численное поле'
        }];

        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {tabsList.map((tab, key) => (
                    <div className='a--list-item' key={key}>
                        <span>{tab.alias}</span>
                        <span onClick={() => this.show('editPage', tab)} className='icon pencil'/>
                        <span onClick={() => this.deleteTab(tab._id)} className='icon remove-button'/>
                    </div>
                ))}
                <Modal title='Редактирование' show={show.editPage} buttons={actions} onClose={this.close}>
                    <div>
                        {currentTab && (
                            <>
                                {Object.keys(currentTab).map((prop, key) => (
                                    <div key={key}>
                                        {prop !== '_id' && (
                                            <>
                                                <span>{prop}</span>
                                                {prop === 'type'
                                                    ? (
                                                        <select value={currentTab[prop]}
                                                                onChange={e => this.setState({
                                                                    currentTab: {...currentTab, [prop]: e.target.value},
                                                                    changes: {...changes, [prop]: e.target.value}
                                                                })}>
                                                            {tabTypes.map((type, key) => (
                                                                <option value={type.name}
                                                                        key={key}>
                                                                    {type.alias}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )
                                                    : (
                                                        <Input value={currentTab[prop]}
                                                               onChange={value => this.setState({
                                                                   currentUser: {...currentTab, [prop]: value},
                                                                   changes: {...currentTab, [prop]: value}
                                                               })}/>
                                                    )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </Modal>
                <Modal title='Создание' show={show.createPage} buttons={actions} onClose={this.close}>
                    <div>
                        {['type', 'name', 'alias'].map((prop, key) => (
                            <div key={key}>
                                <span>{prop}</span>
                                {prop === 'type'
                                    ? (
                                        <select onChange={e => this.setState({
                                            currentTab: {
                                                ...currentTab,
                                                [prop]: e.target.value
                                            }
                                        })}>
                                            {tabTypes.map((type, key) => (
                                                <option value={type.name} key={key}>{type.alias}</option>
                                            ))}
                                        </select>
                                    )
                                    : (
                                        <Input onChange={value => this.setState({
                                            currentTab: {...currentTab, [prop]: value}
                                        })}/>
                                    )}
                            </div>
                        ))}
                    </div>
                </Modal>
            </>
        );
    };
};