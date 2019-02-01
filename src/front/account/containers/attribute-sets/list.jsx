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
            setsList: undefined,
            attributesList: undefined,
            attributes: undefined,
            currentSet: undefined,
            currentAttribute: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentSet) => {
            const {attributesList} = this.state;
            let newState = {
                show: page,
                currentAttribute: {
                    _id: attributesList[0]._id,
                    name: attributesList[0].name
                }
            };
            if (page === 'editPage') {
                const attributesNames = [];
                const setAttributes = [...currentSet.attributes];
                setAttributes.forEach((attribute, index, _setAttributes) => {
                    attributesNames.push(attribute.name);
                    _setAttributes[index] = attribute._id;
                });
                newState.currentSet = {...currentSet, attributes: setAttributes};
                newState.attributes = attributesNames;
            } else
                newState.currentSet = {};
            this.setState(newState);
        };
        this.close = () => this.setState({
            show: undefined,
            currentSet: undefined,
            changes: undefined,
            attributes: undefined
        });
        this.updateSetsList = async () => {
            this.setState({loading: true});
            const {error, data: setsList} = await API.request('attribute-sets', 'list');
            if (!error)
                this.setState({loading: false, setsList});
            else
                Modal.send('ошибка при обновлении списка ннаборов атрибутов, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes, currentSet, show} = this.state;
            let data = currentSet;
            if (show === 'editPage')
                data = {_id: currentSet._id, changes};
            const {error} = await API.request('attribute-sets', 'update', data);
            if (error) {
                Message.send(`ошибка при ${(show === 'editPage') ? 'редактировании' : 'создании'} набора атрибутов, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`набор атрибутов успешно ${(show === 'editPage' ? 'изменен' : 'создан')}`, Message.type.success);
                this.close();
                this.updateSetsList();
            }
        };
        this.deleteSet = async setID => {
            const {currentSet, show} = this.state;
            const {error} = await API.request('attribute-sets', 'update', {_id: (setID || currentSet._id)});
            if (error)
                Message.send('ошибка при удалении набора атрибутов, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage')
                    this.close();
                this.updateSetsList();
                Message.send('набор атрибутов успешно удален', Message.type.success);
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
        const {errorS, data: setsList} = await API.request('attribute-sets', 'list');
        const {errorA, data: attributesList} = await API.request('attributes', 'list');
        if (!errorS && !errorA)
            this.setState({loading: false, setsList, attributesList});
        else
            Message.send('ошибка при получении списка наборов атрибутов, повторите попытку позже', Message.type.danger);
    };

    renderAttributes(prop, key) {
        const {attributesList, currentAttribute, currentSet, show} = this.state;
        let {changes, attributes} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <select onChange={e => {
                    this.setState({
                        currentAttribute: {
                            _id: e.target.value,
                            name: e.target.options[e.target.selectedIndex].text
                        }
                    })
                }}>
                    {attributesList.map((attribute, index) => (
                        <option value={attribute._id} key={index}>{attribute.name}</option>
                    ))}
                </select>
                <button onClick={() => {
                    changes = changes || {};
                    changes[prop] = [...(changes[prop] || currentSet[prop] || []), currentAttribute._id];
                    attributes = [...(attributes || []), currentAttribute.name];
                    if (show === 'editPage')
                        this.setState({attributes, changes});
                    else if (show === 'createPage')
                        this.setState({attributes, currentSet: {...currentSet, ...changes}});
                }}>add
                </button>
                {(attributes || []).map((attribute, index) => (
                    <div key={index}>
                        <span>{attribute}</span>
                        <span onClick={() => {
                            attributes.splice(index, 1);
                            currentSet.attributes.splice(index, 1);
                            changes = changes || {};
                            changes[prop] = currentSet.attributes;
                            if (show === 'editPage')
                                this.setState({attributes, changes});
                            else if (show === 'createPage')
                                this.setState({attributes, currentSet});
                        }} className='icon remove-button'/>
                    </div>
                ))}
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'attributes')
            return this.renderAttributes(prop, key);
        const {currentSet, show} = this.state;
        let {changes} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input value={(show === 'editPage') ? ((changes && changes[prop]) || currentSet[prop]) : undefined}
                       onChange={value => {
                           changes = changes || {};
                           changes[prop] = value;
                           if (show === 'editPage')
                               this.setState({changes});
                           else if (show === 'createPage')
                               this.setState({currentSet: {...currentSet, ...changes}});
                       }}/>
            </div>
        )
    };

    renderProps() {
        return ['name', 'title', 'attributes'].map((prop, key) => this.renderProp(prop, key));
    };

    renderList() {
        const {setsList} = this.state;
        return (setsList || []).map((set, key) => (
            <div className='a--list-item' key={key}>
                <span>{set.name}</span>
                <span onClick={() => this.show('editPage', set)} className='icon pencil'/>
                <span onClick={() => this.deleteSet(set._id)} className='icon remove-button'/>
            </div>
        ))
    };

    render() {
        const {loading, show} = this.state;
        if (loading)
            return <Loading/>;
        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteSet}];
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