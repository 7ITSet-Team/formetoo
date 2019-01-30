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
        this.show = (page, currentAttribute = {}) => this.setState({show: page, currentAttribute});
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
            const {changes = {}, currentAttribute, show} = this.state;

            let data;
            if (show === 'editPage')
                data = {_id: currentAttribute._id, changes};
            else if (show === 'createPage') // выставляем дефолтное значение у поля type и isTab
                data = {
                    ...currentAttribute,
                    type: (currentAttribute.type || 'textField'),
                    isTab: (currentAttribute.isTab || false)
                };

            const {error} = await API.request('attributes', 'update', data);

            if (error) {
                Message.send(`ошибка при ${((show === 'editPage') && 'редактировании') || ((show === 'createPage') && 'создании')} атрибута, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`атрибут успешно ${((show === 'editPage') && 'изменен') || ((show === 'createPage') && 'создан')}`, Message.type.success);
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
                    this.setState({show: undefined});
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

    renderList() {
        const {attributesList = []} = this.state;
        return (
            <>
                {attributesList.map((attribute, key) => (
                    <div className='a--list-item' key={key}>
                        <span>{attribute.alias}</span>
                        <span onClick={() => this.show('editPage', attribute)} className='icon pencil'/>
                        <span onClick={() => this.deleteAttribute(attribute._id)} className='icon remove-button'/>
                    </div>
                ))}
            </>
        )
    };

    renderProp(prop, key) {
        const {currentAttribute, changes, show} = this.state;

        const attributeTypes = [{
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
                <span>{prop}</span>
                {(prop === 'type')
                    ? (
                        <select value={(show === 'editPage') ? currentAttribute[prop] : undefined}
                                onChange={e => this.setState({
                                    currentAttribute: {...currentAttribute, [prop]: e.target.value},
                                    changes: (show === 'editPage') ? {
                                        ...changes,
                                        [prop]: e.target.value
                                    } : undefined
                                })}>
                            {attributeTypes.map((type, key) => (
                                <option value={type.name} key={key}>
                                    {type.alias}
                                </option>
                            ))}
                        </select>
                    )
                    : (prop === 'isTab')
                        ? (
                            <input type='checkbox'
                                   defaultChecked={(show === 'editPage') ? currentAttribute[prop] : false}
                                   onChange={e => this.setState({
                                       currentAttribute: {...currentAttribute, [prop]: e.target.checked},
                                       changes: (show === 'editPage') ? {
                                           ...changes,
                                           [prop]: e.target.checked
                                       } : undefined
                                   })}/>
                        )
                        : (
                            <Input value={(show === 'editPage') ? currentAttribute[prop] : undefined}
                                   onChange={value => this.setState({
                                       currentAttribute: {...currentAttribute, [prop]: value},
                                       changes: (show === 'editPage') ? {
                                           ...changes,
                                           [prop]: value
                                       } : undefined
                                   })}/>
                        )}
            </div>
        )
    };

    render() {
        const {loading, show, currentAttribute = {}} = this.state;

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
                    <div>
                        {Object.keys(currentAttribute).map((prop, key) => (prop !== '_id') && this.renderProp(prop, key))}
                    </div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={actions} onClose={this.close}>
                    <div>
                        {['type', 'name', 'alias', 'isTab'].map((prop, key) => this.renderProp(prop, key))}
                    </div>
                </Modal>
            </>
        );
    };
};