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
            attributes: undefined,
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
        this.updateAttributes = async () => {
            this.setState({loading: true});
            const {error, data: attributes} = await API.request('attributes', 'list');
            if (!error)
                this.setState({loading: false, attributes});
            else
                Modal.send('ошибка при обновлении списка атрибутов, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes = {}, currentAttribute, show} = this.state;
            const isEdit = (show === 'editPage');

            let data = currentAttribute;
            if (isEdit) {
                if (!Object.keys(changes).length)
                    return this.close();
                data = {_id: currentAttribute._id, changes};
            }

            const isNotValid = this.requiredFields
                .some(field => ((currentAttribute[field] == null) || (currentAttribute[field] === '')));

            if (!isEdit && isNotValid)
                return Message.send('Введены не все обязательные поля', Message.type.danger);

            const {error} = await API.request('attributes', 'update', data);
            this.close();

            if (error)
                Message.send(`ошибка при ${isEdit ? 'редактировании' : 'создании'} атрибута, повторите попытку позже`, Message.type.danger);
            else {
                Message.send(`атрибут успешно ${isEdit ? 'изменен' : 'создан'}`, Message.type.success);
                this.updateAttributes();
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
                this.updateAttributes();
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
        this.attributeTypes = [
            {
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
            }
        ];
        this.requiredFields = ['type', 'name', 'title', 'isTab'];
        this.fields = this.requiredFields;
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: attributes} = await API.request('attributes', 'list');

        if (!error)
            this.setState({loading: false, attributes});
        else
            Message.send('ошибка при получении списка атрибутов, повторите попытку позже', Message.type.danger);
    };

    renderTypeDropDown(prop, key) {
        const {currentAttribute, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <select
                    value={!(changes[prop] == null) ? changes[prop] : (currentAttribute[prop] || this.attributeTypes[0].name)}
                    onChange={e => {
                        const newChanges = {
                            ...changes,
                            [prop]: e.target.value
                        };
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else
                            this.setState({currentAttribute: {...currentAttribute, ...newChanges}});
                    }}>
                    {this.attributeTypes.map(({name, title}) => <option value={name} key={name}>{title}</option>)}
                </select>
            </div>
        )
    };

    renderTabCheckBox(prop, key) {
        const {currentAttribute, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <input type='checkbox'
                       defaultChecked={!(changes[prop] == null) ? changes[prop] : (currentAttribute[prop] || false)}
                       onChange={e => {
                           const newChanges = {
                               ...changes,
                               [prop]: e.target.checked
                           };
                           if (show === 'editPage')
                               this.setState({changes: newChanges});
                           else
                               this.setState({currentAttribute: {...currentAttribute, ...newChanges}});
                       }}/>
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'type')
            return this.renderTypeDropDown(prop, key);
        if (prop === 'isTab')
            return this.renderTabCheckBox(prop, key);
        const {currentAttribute, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input
                    value={!(changes[prop] == null) ? changes[prop] : (currentAttribute[prop] || '')}
                    onChange={value => {
                        const newChanges = {
                            ...changes,
                            [prop]: value
                        };
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else
                            this.setState({currentAttribute: {...currentAttribute, ...newChanges}});
                    }}/>
            </div>
        )
    };

    renderProps() {
        return this.fields.map((prop, key) => this.renderProp(prop, key));
    };

    renderList() {
        const {attributes = []} = this.state;
        return attributes.map(attribute => (
            <div className='a--list-item' key={attribute._id}>
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