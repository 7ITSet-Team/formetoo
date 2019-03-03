import React from 'react';
import {Redirect} from 'react-router-dom';

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
            sets: undefined,
            attributes: undefined,
            attributesHash: {},
            currentSet: undefined,
            changes: undefined,
            currentAttribute: undefined,
            show: undefined,
            redirectTo: undefined
        };
        this.show = (page, currentSet = {}) => this.setState({show: page, currentSet});
        this.close = () => this.setState({show: undefined, currentSet: undefined, changes: undefined});
        this.updateSets = async () => {
            this.setState({loading: true});
            const {error, data: sets} = await API.request('attribute-sets', 'list');
            if (!error)
                this.setState({loading: false, sets});
            else
                Modal.send('ошибка при обновлении списка наборов атрибутов, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes = {}, currentSet, show} = this.state;
            const isChangesExist = !!(Object.keys(changes).length);
            const isEditPage = (show === 'editPage');

            if (isEditPage && !isChangesExist)
                return this.close();

            const data = (isEditPage)
                ? {_id: currentSet._id, changes}
                : currentSet;

            const dataIsNotValid = this.requiredFields
                .some(field => {
                    let isNotValid;
                    if (Array.isArray(currentSet[field]))
                        isNotValid = !(currentSet[field].length);
                    else
                        isNotValid = ((currentSet[field] == null) || (currentSet[field] === ''));
                    return isNotValid;
                });

            if (!isEditPage && dataIsNotValid)
                return Message.send('Введены не все обязательные поля', Message.type.danger);

            const {error} = await API.request('attribute-sets', 'update', data);
            this.close();
            if (error)
                Message.send(`ошибка при ${(isEditPage) ? 'редактировании' : 'создании'} набора атрибутов, повторите попытку позже`, Message.type.danger);
            else {
                Message.send(`набор атрибутов успешно ${(isEditPage) ? 'изменен' : 'создан'}`, Message.type.success);
                this.updateSets();
            }
        };
        this.deleteSet = async (_id = this.state.currentSet._id) => {
            const {show} = this.state;
            const {error} = await API.request('attribute-sets', 'update', {_id});

            if (error)
                Message.send('ошибка при удалении набора атрибутов, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage')
                    this.close();
                this.updateSets();
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
        this.requiredFields = ['name', 'title', 'attributes'];
        this.fields = this.requiredFields;
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const setPromise = API.request('attribute-sets', 'list');
        const attrPromise = API.request('attributes', 'list', {hash: true});
        const {error: errorA, data: {attributes, attributesHash}} = await attrPromise;
        if (!attributes.length) {
            Message.send('необходимо сначала добавить атрибуты', Message.type.info);
            return this.setState({
                loading: false,
                redirectTo: '/account/client/info'
            });
        }
        const {error: errorS, data: sets} = await setPromise;
        if (!errorS && !errorA)
            this.setState({
                loading: false,
                sets,
                attributes,
                attributesHash,
                currentAttribute: attributes[0]._id
            });
        else
            Message.send('ошибка при получении списка наборов атрибутов, повторите попытку позже', Message.type.danger);
    };

    renderAttributes(prop, key) {
        const {attributes = [], attributesHash, currentAttribute, currentSet, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <select onChange={e => this.setState({currentAttribute: e.target.value})}>
                    {attributes.map(({_id, title}) => <option value={_id} key={_id}>{title}</option>)}
                </select>
                <button onClick={() => {
                    const newChanges = {
                        ...changes,
                        [prop]: [...(changes[prop] || currentSet[prop] || [])]
                    };
                    if (!newChanges[prop].includes(currentAttribute))
                        newChanges[prop].push(currentAttribute);
                    else
                        Message.send('Такой атрибут уже добавлен', Message.type.info);

                    if (show === 'editPage')
                        this.setState({changes: newChanges});
                    else
                        this.setState({currentSet: {...currentSet, ...newChanges}});
                }}>add
                </button>
                {(changes.attributes || currentSet.attributes || []).map((attribute, index) => (
                    <div key={attribute._id || attribute}>
                        <span>{attributesHash[attribute] ? attributesHash[attribute].title : attribute.title}</span>
                        <span onClick={() => {
                            const newAttributes = [...(changes.attributes || currentSet.attributes)];
                            newAttributes.splice(index, 1);
                            const newChanges = {
                                ...changes,
                                [prop]: newAttributes
                            };

                            if (show === 'editPage')
                                this.setState({changes: newChanges});
                            else
                                this.setState({currentSet: {...currentSet, ...newChanges}});
                        }} className='icon remove-button'/>
                    </div>
                ))}
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'attributes')
            return this.renderAttributes(prop, key);
        const {currentSet, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input value={!(changes[prop] == null) ? changes[prop] : (currentSet[prop] || '')}
                       onChange={value => {
                           const newChanges = {
                               ...changes,
                               [prop]: value
                           };
                           if (show === 'editPage')
                               this.setState({changes: newChanges});
                           else
                               this.setState({currentSet: {...currentSet, ...newChanges}});
                       }}/>
            </div>
        )
    };

    renderProps() {
        return this.fields.map((prop, key) => this.renderProp(prop, key));
    };

    renderList() {
        const {sets = []} = this.state;
        return sets.map(set => (
            <div className='a--list-item' key={set._id}>
                <span>{set.title}</span>
                <span onClick={() => this.show('editPage', set)} className='icon pencil'/>
                <span onClick={() => this.deleteSet(set._id)} className='icon remove-button'/>
            </div>
        ))
    };

    render() {
        const {loading, show, redirectTo} = this.state;
        if (loading)
            return <Loading/>;
        if (redirectTo)
            return <Redirect to={redirectTo}/>;
        const actions = (show === 'editPage')
            ? [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteSet}]
            : this.buttons;
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