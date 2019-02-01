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
            attributesList: undefined,
            currentAttribute: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentAttribute) => this.setState({
            show: page,
            currentAttribute: (currentAttribute || {type: this.attributeTypes[0].name, isTab: false})
        });
        this.close = () => this.setState({show: undefined, currentAttribute: undefined, changes: undefined});
        this.updateAttributesList = async () => {
            this.setState({loading: true});
            const {error, data: attributesList} = await API.request('attributes', 'list');
            if (!error)
                this.setState({loading: false, attributesList});
            else
                Modal.send('ошибка при обновлении списка атрибутов, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes, currentAttribute, show} = this.state;
            let data = currentAttribute;
            if (show === 'editPage')
                data = {_id: currentAttribute._id, changes};
            const {error} = await API.request('attributes', 'update', data);
            if (error) {
                Message.send(`ошибка при ${(show === 'editPage') ? 'редактировании' : 'создании'} атрибута, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`атрибут успешно ${(show === 'editPage' ? 'изменен' : 'создан')}`, Message.type.success);
                this.close();
                this.updateAttributesList();
            }
        };
        this.deleteAttribute = async attributeID => {
            const {currentAttribute, show} = this.state;
            const {error} = await API.request('attributes', 'update', {_id: (attributeID || currentAttribute._id)});
            if (error)
                Message.send('ошибка при удалении атрибута, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage')
                    this.close();
                this.updateAttributesList();
                Message.send('атрибут успешно удален', Message.type.success);
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
        this.attributeTypes = [{
            name: 'textField',
            title: 'Текстовое поле'
        }, {
            name: 'textArea',
            title: 'Текстовый блок'
        }, {
            name: 'numberField',
            title: 'Численное поле'
        }];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: attributesList} = await API.request('attributes', 'list');
        if (!error)
            this.setState({loading: false, attributesList});
        else
            Message.send('ошибка при получении списка атрибутов, повторите попытку позже', Message.type.danger);
    };

    renderTypeDropDown(prop, key) {
        const {currentAttribute, show} = this.state;
        let {changes} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <select
                    value={(show === 'editPage') ? ((changes && changes[prop]) || currentAttribute[prop]) : undefined}
                    onChange={e => {
                        changes = changes || {};
                        changes[prop] = e.target.value;
                        if (show === 'editPage')
                            this.setState({changes});
                        else if (show === 'createPage')
                            this.setState({currentAttribute: {...currentAttribute, ...changes}});
                    }}>
                    {this.attributeTypes.map((type, key) => (
                        <option value={type.name} key={key}>{type.title}</option>
                    ))}
                </select>
            </div>
        )
    };

    renderIsTabCheckBox(prop, key) {
        const {currentAttribute, show} = this.state;
        let {changes} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <input type='checkbox'
                       defaultChecked={(show === 'editPage') ? ((changes && changes[prop]) || currentAttribute[prop]) : false}
                       onChange={e => {
                           changes = changes || {};
                           changes[prop] = e.target.checked;
                           if (show === 'editPage')
                               this.setState({changes});
                           else if (show === 'createPage')
                               this.setState({currentAttribute: {...currentAttribute, ...changes}});
                       }}/>
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'type')
            return this.renderTypeDropDown(prop, key);
        else if (prop === 'isTab')
            return this.renderIsTabCheckBox(prop, key);
        else {
            const {currentAttribute, show} = this.state;
            let {changes} = this.state;
            return (
                <div key={key}>
                    <span>{prop}</span>
                    <Input
                        value={(show === 'editPage') ? ((changes && changes[prop]) || currentAttribute[prop]) : undefined}
                        onChange={value => {
                            changes = changes || {};
                            changes[prop] = value;
                            if (show === 'editPage')
                                this.setState({changes});
                            else if (show === 'createPage')
                                this.setState({currentAttribute: {...currentAttribute, ...changes}});
                        }}/>
                </div>
            )
        }
    };

    renderProps() {
        return ['type', 'name', 'title', 'isTab'].map((prop, key) => this.renderProp(prop, key));
    };

    renderList() {
        const {attributesList} = this.state;
        return (attributesList || []).map((attribute, key) => (
            <div className='a--list-item' key={key}>
                <span>{attribute.title}</span>
                <span onClick={() => this.show('editPage', attribute)} className='icon pencil'/>
                <span onClick={() => this.deleteAttribute(attribute._id)} className='icon remove-button'/>
            </div>
        ))
    };

    render() {
        const {loading, show} = this.state;
        if (loading)
            return <Loading/>;
        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteAttribute}];
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