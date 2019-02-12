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
        this.show = (page, currentAttribute = {type: this.attributeTypes[0].name, isTab: false}) =>
            this.setState({
                show: page,
                currentAttribute
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
            const {changes = {}, currentAttribute, show} = this.state;
            if ((show === 'editPage') && (Object.keys(changes).length === 0))
                return this.close();
            let data = currentAttribute;
            if (show === 'editPage')
                data = {_id: currentAttribute._id, changes};
            const isNotValid = ['type', 'name', 'title', 'isTab']
                .map(prop => ((currentAttribute[prop] == null) || (currentAttribute[prop] === '')))
                .includes(true);
            if ((show === 'createPage') && isNotValid)
                return Message.send('Введены не все обязательные поля', Message.type.danger);
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
        this.deleteAttribute = async (attributeID = this.state.currentAttribute._id) => {
            const {show} = this.state;
            const {error} = await API.request('attributes', 'update', {_id: attributeID});
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
            title: 'Числовое поле'
        }, {
            name: 'rangeField',
            title: 'Диапазон'
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
        const {currentAttribute, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <select
                    value={(show === 'editPage') ? (changes[prop] || currentAttribute[prop]) : undefined}
                    onChange={e => {
                        const newChanges = {...changes, [prop]: e.target.value};
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else if (show === 'createPage')
                            this.setState({currentAttribute: {...currentAttribute, ...newChanges}});
                    }}>
                    {this.attributeTypes.map((type, key) => (
                        <option value={type.name} key={key}>{type.title}</option>
                    ))}
                </select>
            </div>
        )
    };

    renderIsTabCheckBox(prop, key) {
        const {currentAttribute, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <input type='checkbox'
                       defaultChecked={(show === 'editPage') ? (changes[prop] || currentAttribute[prop]) : false}
                       onChange={e => {
                           const newChanges = {...changes, [prop]: e.target.checked};
                           if (show === 'editPage')
                               this.setState({changes: newChanges});
                           else if (show === 'createPage')
                               this.setState({currentAttribute: {...currentAttribute, ...newChanges}});
                       }}/>
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'type')
            return this.renderTypeDropDown(prop, key);
        if (prop === 'isTab')
            return this.renderIsTabCheckBox(prop, key);
        const {currentAttribute, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input
                    value={(show === 'editPage') ? (changes[prop] || currentAttribute[prop]) : undefined}
                    onChange={value => {
                        const newChanges = {...changes, [prop]: value};
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else if (show === 'createPage')
                            this.setState({currentAttribute: {...currentAttribute, ...newChanges}});
                    }}/>
            </div>
        )
    };

    renderProps() {
        return ['type', 'name', 'title', 'isTab'].map((prop, key) => this.renderProp(prop, key));
    };

    renderList() {
        const {attributesList = []} = this.state;
        return attributesList.map((attribute, key) => (
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
                {show && (
                    <Modal title={(show === 'editPage') ? 'Редактирование' : 'Создание'} show={true} buttons={actions}
                           onClose={this.close}>
                        <div>{this.renderProps()}</div>
                    </Modal>
                )}
            </>
        );
    };
};