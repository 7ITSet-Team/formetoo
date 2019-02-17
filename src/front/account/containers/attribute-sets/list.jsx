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
            setList: undefined,
            currentSet: undefined,
            attributes: undefined,
            currentAttribute: undefined, // chosen attribute in <select>
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentSet = {}) => this.setState({show: page, currentSet: currentSet});
        this.close = () => this.setState({show: undefined, currentSet: undefined, changes: undefined});
        this.updateSetList = async () => {
            this.setState({loading: true});
            const {error, data: setList} = await API.request('attribute-sets', 'list');
            if (!error) this.setState({loading: false, setList});
            else Modal.send('ошибка при обновлении списка ннаборов атрибутов, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes = {}, currentSet, show} = this.state;
            const isChangesExist = !!(Object.keys(changes).length);
            const isEdit = (show === 'editPage');
            if (isEdit && !isChangesExist) return this.close();
            let data = currentSet;
            if (isEdit) data = {_id: currentSet._id, changes};
            const isNotValid = ['name', 'title', 'attributes']
                .map(prop => {
                    const isPropNotExist = ((currentSet[prop] == null) || (currentSet[prop] === ''));
                    const isPropEmpty = ((Array.isArray(currentSet[prop]) && !currentSet[prop].length));
                    return (isPropNotExist || isPropEmpty);
                }) // the existence of "true" element means that user printed data is not valid
                .includes(true);
            if (!isEdit && isNotValid) return Message.send('Введены не все обязательные поля', Message.type.danger);
            const {error} = await API.request('attribute-sets', 'update', data);
            this.close();
            if (error) Message.send(`ошибка при ${isEdit ? 'редактировании' : 'создании'} набора атрибутов, повторите попытку позже`, Message.type.danger);
            else {
                Message.send(`набор атрибутов успешно ${isEdit ? 'изменен' : 'создан'}`, Message.type.success);
                this.updateSetList();
            }
        };
        this.deleteSet = async (setID = this.state.currentSet._id) => {
            const {show} = this.state;
            const {error} = await API.request('attribute-sets', 'update', {_id: setID});
            if (error) Message.send('ошибка при удалении набора атрибутов, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage') this.close();
                this.updateSetList();
                Message.send('набор атрибутов успешно удален', Message.type.success);
            }
        };
        this.generateHash = (data) => {
            const hash = {};
            data.forEach(item => hash[item._id] = item);
            return hash;
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
        const setPromise = API.request('attribute-sets', 'list');
        const attrPromise = API.request('attributes', 'list');
        const {errorS, data: setList} = await setPromise;
        const {errorA, data: attributes} = await attrPromise;
        const attributesHash = this.generateHash(attributes);
        if (!errorS)
            if (!errorA)
                this.setState({
                    loading: false,
                    setList,
                    attributes,
                    attributesHash,
                    currentAttribute: attributes[0]._id // default value for <select>
                });
            else Message.send('ошибка при получении списка атрибутов, повторите попытку позже', Message.type.danger);
        else Message.send('ошибка при получении списка наборов атрибутов, повторите попытку позже', Message.type.danger);
    };

    renderAttributes(prop, key) {
        const {attributes, currentAttribute, currentSet, show, changes = {}, attributesHash} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <select onChange={e => this.setState({currentAttribute: e.target.value})}>
                    {attributes.map(({_id, title}, index) => <option value={_id} key={index}>{title}</option>)}
                </select>
                <button onClick={() => {
                    const newChanges = {...changes, [prop]: [...(changes[prop] || currentSet[prop] || [])]};
                    if (!newChanges[prop].includes(currentAttribute)) newChanges[prop].push(currentAttribute);
                    else Message.send('Такой атрибут уже добавлен', Message.type.info);
                    if (show === 'editPage') this.setState({changes: newChanges});
                    else this.setState({currentSet: {...currentSet, ...newChanges}});
                }}>
                    add
                </button>
                {(changes.attributes || currentSet.attributes || []).map((attributeID, index) => (
                    <div key={index}>
                        <span>{attributesHash[attributeID].title}</span>
                        <span onClick={() => {
                            const newAttributes = [...(changes.attributes || currentSet.attributes)];
                            newAttributes.splice(index, 1);
                            const newChanges = {...changes, [prop]: newAttributes};
                            if (show === 'editPage') this.setState({changes: newChanges});
                            else this.setState({currentSet: {...currentSet, ...newChanges}});
                        }} className='icon remove-button'/>
                    </div>
                ))}
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'attributes') return this.renderAttributes(prop, key);
        const {currentSet, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input value={(show === 'editPage') ? (changes[prop] || currentSet[prop]) : undefined}
                       onChange={value => {
                           const newChanges = {...changes, [prop]: value};

                           if (show === 'editPage') this.setState({changes: newChanges});
                           else this.setState({currentSet: {...currentSet, ...newChanges}});
                       }}/>
            </div>
        )
    };

    renderProps() {
        return ['name', 'title', 'attributes'].map((prop, key) => this.renderProp(prop, key));
    };

    renderList() {
        const {setList = []} = this.state;
        return setList.map((set, key) => (
            <div className='a--list-item' key={key}>
                <span>{set.title}</span>
                <span onClick={() => this.show('editPage', set)} className='icon pencil'/>
                <span onClick={() => this.deleteSet(set._id)} className='icon remove-button'/>
            </div>
        ))
    };

    render() {
        const {loading, show} = this.state;
        if (loading) return <Loading/>;
        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteSet}];
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