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
            tabList: undefined,
            currentTab: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentTab = {}) => this.setState({show: page, currentTab});
        this.close = () => this.setState({show: undefined, currentTab: undefined, changes: undefined});
        this.updateTabList = async () => {
            this.setState({loading: true});
            const {error, data: tabList} = await API.request('tabs', 'list');
            if (!error)
                this.setState({loading: false, tabList});
            else
                Modal.send('ошибка при обновлении списка табов, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes = {}, currentTab, show} = this.state;

            let data;
            if (show === 'editPage')
                data = {_id: currentTab._id, changes};
            else if (show === 'createPage')
                data = {...currentTab, type: (currentTab.type || 'textField')};

            const {error} = await API.request('tabs', 'update', data);

            if (error) {
                Message.send(`ошибка при ${((show === 'editPage') && 'редактировании') || ((show === 'createPage') && 'создании')} таба, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`таб успешно ${((show === 'editPage') && 'изменен') || ((show === 'createPage') && 'создан')}`, Message.type.success);
                this.close();
                this.updateTabList();
            }
        };
        this.deleteTab = async tabID => {
            const {currentTab, show} = this.state;
            const {error} = await API.request('tabs', 'update', {_id: (tabID || currentTab._id)});
            if (error)
                Message.send('ошибка при удалении таба, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage')
                    this.setState({show: undefined});
                this.updateTabList();
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
        const {error, data: tabList} = await API.request('tabs', 'list');
        if (!error)
            this.setState({loading: false, tabList});
        else
            Message.send('ошибка при получении списка табов, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {tabList = []} = this.state;

        return (
            <>
                {tabList.map((tab, key) => (
                    <div className='a--list-item' key={key}>
                        <span>{tab.alias}</span>
                        <span onClick={() => this.show('editPage', tab)} className='icon pencil'/>
                        <span onClick={() => this.deleteTab(tab._id)} className='icon remove-button'/>
                    </div>
                ))}
            </>
        )
    };

    renderProp(prop, key) {
        const {currentTab, changes, show} = this.state;

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
            <div key={key}>
                <>
                    <span>{prop}</span>
                    {prop === 'type'
                        ? (
                            <select value={((show === 'editPage') ? currentTab[prop] : undefined)}
                                    onChange={e => this.setState({
                                        currentTab: {...currentTab, [prop]: e.target.value},
                                        changes: show === 'editPage' ? {...changes, [prop]: e.target.value} : undefined
                                    })}>
                                {tabTypes.map((type, key) => (
                                    <option value={type.name} key={key}>{type.alias}</option>
                                ))}
                            </select>
                        )
                        : (
                            <Input value={((show === 'editPage') ? currentTab[prop] : undefined)}
                                   onChange={value => this.setState({
                                       currentTab: {...currentTab, [prop]: value},
                                       changes: show === 'editPage' ? {...currentTab, [prop]: value} : undefined
                                   })}/>
                        )}
                </>
            </div>
        )
    };

    render() {
        const {loading, show, currentTab} = this.state;

        if (loading)
            return <Loading/>;

        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteTab}];

        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {this.renderList()}
                <Modal title='Редактирование' show={(show === 'editPage')} buttons={actions} onClose={this.close}>
                    <div>
                        {Object.keys(currentTab || {}).map((prop, key) => (prop !== '_id') && this.renderProp(prop, key))}
                    </div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={actions} onClose={this.close}>
                    <div>
                        {['name', 'alias', 'type'].map((prop, key) => this.renderProp(prop, key))}
                    </div>
                </Modal>
            </>
        );
    };
};