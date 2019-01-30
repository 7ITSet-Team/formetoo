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
            if (page === 'editPage') {
                const attributes = [];
                const newSet = {...currentSet, attributes: [...currentSet.attributes]};
                for (let i = 0; i < newSet.attributes.length; i++) {
                    attributes.push(newSet.attributes[i].name);
                    newSet.attributes[i] = newSet.attributes[i]._id;
                }
                this.setState({show: page, currentSet: newSet, attributes});
            } else
                this.setState({show: page, currentSet: {}});
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

            let data;
            if (show === 'editPage')
                data = {_id: currentSet._id, changes};
            else if (show === 'createPage')
                data = currentSet;

            const {error} = await API.request('attribute-sets', 'update', data);

            if (error) {
                Message.send(`ошибка при ${((show === 'editPage') && 'редактировании') || ((show === 'createPage') && 'создании')} набора атрибутов, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`набор атрибутов успешно ${((show === 'editPage') && 'изменен') || ((show === 'createPage') && 'создан')}`, Message.type.success);
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

    renderList() {
        const {setsList} = this.state;
        return (
            <>
                {setsList && setsList.map((set, key) => (
                    <div className='a--list-item' key={key}>
                        <span>{set.name}</span>
                        <span onClick={() => this.show('editPage', set)} className='icon pencil'/>
                        <span onClick={() => this.deleteSet(set._id)} className='icon remove-button'/>
                    </div>
                ))}
            </>
        )
    };

    renderDropDown(prop, key) {
        const {attributes, attributesList, currentAttribute, currentSet, changes, show} = this.state;

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
                    this.setState({
                        attributes: [...(attributes || []), (currentAttribute && currentAttribute.name) || attributesList[0].name],
                        currentSet: {
                            ...currentSet,
                            attributes: [...(currentSet.attributes || []), (currentAttribute && currentAttribute._id) || attributesList[0]._id]
                        },
                        changes: (show === 'editPage') ? {
                            ...changes,
                            attributes: [...(currentSet.attributes || []), (currentAttribute && currentAttribute._id) || attributesList[0]._id]
                        } : undefined
                    })
                }}>
                    add
                </button>
                {attributes && attributes.map((attribute, index) => (
                    <div key={index}>
                        <span>{attribute}</span>
                        <span onClick={() => {
                            const newAttributes = [...attributes];
                            newAttributes.splice(index, 1);
                            const newSetAttributes = [...currentSet.attributes];
                            newSetAttributes.splice(index, 1);
                            this.setState({
                                attributes: newAttributes,
                                currentSet: {...currentSet, attributes: newSetAttributes},
                                changes: (show === 'editPage') ? {...changes, attributes: newSetAttributes} : undefined
                            })
                        }} className='icon remove-button'/>
                    </div>
                ))}
            </div>
        )
    };

    renderProp(prop, key) {
        const {currentSet, changes, show} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input value={(show === 'editPage') ? currentSet[prop] : undefined}
                       onChange={value => this.setState({
                           currentSet: {...currentSet, [prop]: value},
                           changes: (show === 'editPage') ? {
                               ...changes,
                               [prop]: value
                           } : undefined
                       })}/>
            </div>
        )
    };

    render() {
        const {loading, show, currentSet} = this.state;
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
                    <div>
                        {Object.keys(currentSet || {}).map((prop, key) => (prop !== '_id') && ((prop === 'attributes')
                            ? this.renderDropDown(prop, key)
                            : this.renderProp(prop, key)))}
                    </div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={actions} onClose={this.close}>
                    <div>
                        {['name', 'title', 'attributes'].map((prop, key) => (prop === 'attributes')
                            ? this.renderDropDown(prop, key)
                            : this.renderProp(prop, key))}
                    </div>
                </Modal>
            </>
        );
    };
};