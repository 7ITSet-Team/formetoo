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
            attributesList: [],
            currentAttribute: undefined,
            changes: undefined,
            show: {
                editPage: false,
                createPage: false
            }
        };
        this.show = (page, currentAttribute) => this.setState({
            show: {[page]: true},
            currentAttribute: (currentAttribute || {})
        });
        this.close = () => this.setState({
            show: {editPage: false, createPage: false},
            currentAttribute: undefined,
            changes: undefined
        });
        this.updateAttributesList = async () => {
            const {error, data: attributesList} = await API.request('attributes', 'list');
            if (!error)
                this.setState({loading: false, attributesList});
            else
                Modal.send('ошибка при обновлении списка атрибутов, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes, currentAttribute, show} = this.state;

            let data;
            if (show.editPage)
                data = {_id: currentAttribute._id, changes: changes || {}};
            else if (show.createPage) // выставляем дефолтное значение у поля type
                data = {...currentAttribute, type: (currentAttribute.type || 'textField')};

            const {error} = await API.request('attributes', 'update', data);

            if (error) {
                Message.send(`ошибка при ${(show.editPage && 'редактировании') || (show.createPage && 'создании')} атрибута, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`атрибут успешно ${(show.editPage && 'изменен') || (show.createPage && 'создан')}`, Message.type.success);
                this.close();
                this.setState({loading: true});
                this.updateAttributesList();
            }
        };
        this.deleteAttribute = async attributeID => {
            const {currentAttribute, show} = this.state;
            const {error} = await API.request('attributes', 'update', {_id: (attributeID || currentAttribute._id)});
            if (error)
                Message.send('ошибка при удалении атрибута, повторите попытку позже', Message.type.danger);
            else {
                if (show.editPage)
                    this.setState({show: {editPage: false, createPage: false}});
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

    render() {
        const {loading, show, attributesList, currentAttribute, changes} = this.state;

        if (loading)
            return (<Loading/>);

        let actions = this.buttons;
        actions = !show.editPage
            ? actions
            : [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteAttribute}];

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
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {attributesList.map((attribute, key) => (
                    <div className='a--list-item' key={key}>
                        <span>{attribute.alias}</span>
                        <span onClick={() => this.show('editPage', attribute)} className='icon pencil'/>
                        <span onClick={() => this.deleteAttribute(attribute._id)} className='icon remove-button'/>
                    </div>
                ))}
                <Modal title='Редактирование' show={show.editPage} buttons={actions} onClose={this.close}>
                    <div>
                        {currentAttribute && (
                            <>
                                {Object.keys(currentAttribute).map((prop, key) => (
                                    <div key={key}>
                                        {prop !== '_id' && (
                                            <>
                                                <span>{prop}</span>
                                                {prop === 'type'
                                                    ? (
                                                        <select value={currentAttribute[prop]}
                                                                onChange={e => this.setState({
                                                                    currentAttribute: {...currentAttribute, [prop]: e.target.value},
                                                                    changes: {...changes, [prop]: e.target.value}
                                                                })}>
                                                            {attributeTypes.map((type, key) => (
                                                                <option value={type.name}
                                                                        key={key}>
                                                                    {type.alias}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )
                                                    : (
                                                        <Input value={currentAttribute[prop]}
                                                               onChange={value => this.setState({
                                                                   currentAttribute: {...currentAttribute, [prop]: value},
                                                                   changes: {...currentAttribute, [prop]: value}
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
                                            currentAttribute: {
                                                ...currentAttribute,
                                                [prop]: e.target.value
                                            }
                                        })}>
                                            {attributeTypes.map((type, key) => (
                                                <option value={type.name} key={key}>{type.alias}</option>
                                            ))}
                                        </select>
                                    )
                                    : (
                                        <Input onChange={value => this.setState({
                                            currentAttribute: {...currentAttribute, [prop]: value}
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