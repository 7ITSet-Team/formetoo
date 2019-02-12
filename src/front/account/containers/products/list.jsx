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
            productsList: undefined,
            attributesList: undefined,
            setsList: undefined,
            categoriesList: undefined,
            currentProduct: undefined,
            currentAttribute: undefined,
            currentSet: undefined,
            attributesHash: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentProduct) => {
            const {attributesList, categoriesList, setsList} = this.state;
            let newState = {
                show: page,
                currentAttribute: (attributesList[0] && attributesList[0]._id),
                currentSet: (setsList[0] && setsList[0]._id)
            };
            if (page === 'editPage') {
                const props = [...currentProduct.props];
                props.forEach((prop, index, _props) => {
                    _props[index] = {attribute: prop.attribute._id, value: prop.value};
                });
                newState.currentProduct = {...currentProduct, props};
            } else
                newState.currentProduct = {categoryID: categoriesList[0]._id};
            this.setState(newState);
        };
        this.close = () => this.setState({
            show: undefined,
            currentProduct: undefined,
            currentAttribute: undefined,
            changes: undefined
        });
        this.updateProductsList = async () => {
            this.setState({loading: true});
            const {error, data: productsList} = await API.request('products', 'list');
            if (!error)
                this.setState({loading: false, productsList});
            else
                Message.send('ошибка при обновлении списка продуктов, повторите попытку позже');
        };
        this.saveChanges = async () => {
            const {currentProduct, changes, show} = this.state;
            if ((show === 'editPage') && (Object.keys(changes || {}).length === 0))
                return this.close();
            let data = currentProduct;
            if (show === 'editPage')
                data = {_id: currentProduct._id, changes};
            let msg;
            const isNotValid = ['categoryID', 'code', 'name', 'slug', 'price']
                .map(prop => {
                        const isNull = (currentProduct[prop] == null) || (currentProduct[prop] === '');
                        if ((prop === 'price') && !isNull && isNaN(currentProduct[prop])) {
                            msg = 'Ошибка валидации: цена - число';
                            return true;
                        }
                        msg = 'Введены не все обязательные поля';
                        return isNull;
                    }
                )
                .includes(true);
            if ((show === 'createPage') && isNotValid)
                return Message.send(msg, Message.type.danger);
            const {error} = await API.request('products', 'update', data);
            if (error)
                Message.send(`ошибка при ${(show === 'editPage') ? 'редактировании' : 'создании'} продукта, повторите попытку позже`, Message.type.danger);
            else {
                Message.send(`продукт успешно ${(show === 'editPage') ? 'изменен' : 'создан'}`, Message.type.success);
                this.updateProductsList();
            }
            this.close();
        };
        this.deleteProduct = async (productID = this.state.currentProduct._id) => {
            const {show} = this.state;
            const {error} = await API.request('products', 'update', {_id: productID});
            if (!error) {
                if (show === 'editPage')
                    this.close();
                this.updateProductsList();
                Message.send('продукт успешно удален', Message.type.success);
            } else
                Message.send('ошибка при удалении продукта, повторите попытку позже', Message.type.danger);
        };
        this.handleUpload = async e => {
            const selectedFile = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (file => async () => {
                const content = file.result;
                const {error, data: errorRows} = await API.request('products', 'upload-data', {type: 'csv', content});
                if (error)
                    Message.send('ошибка при добавлении продуктов, повторите попытку позже', Message.type.danger);
                else if (!error && errorRows.length > 0) {
                    Message.send(`продукты успешно добавлены, но допущены ошибки в строках: ${errorRows.toString()}`, Message.type.info);
                    this.updateProductsList();
                } else {
                    Message.send('продукты успешно добавлены', Message.type.success);
                    this.updateProductsList();
                }
            })(reader);
            reader.readAsText(selectedFile);
        };
        this.handleExport = async () => {
            const {error, data} = await API.request('products', 'export', {type: 'csv'});
            if (error)
                Message.send('ошибка при экспорте продуктов, повторите попытку позже', Message.type.danger);
            else {
                // ================АХТУНГ!||ACHTUNG!||WTF?!
                const a = window.document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob([data], {type: 'text/csv'}));
                const time = new Date();
                a.download = `${time.getHours().toString()}:${time.getMinutes().toString()}:${time.getSeconds().toString()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
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
        const {errorP, data: productsList} = await API.request('products', 'list');
        const {errorA, data: attributesList} = await API.request('attributes', 'list');
        const {errorC, data: categoriesList} = await API.request('categories', 'list');
        const {errorS, data: setsList} = await API.request('attribute-sets', 'list');
        const attributesHash = {};
        attributesList.forEach(attribute => attributesHash[attribute._id] = attribute);
        if (!errorP && !errorA && !errorC && !errorS)
            this.setState({loading: false, productsList, attributesList, categoriesList, setsList, attributesHash});
        else
            Message.send('ошибка при получении списка продуктов, повторите попытку позже', Message.type.danger);
    };

    renderPropDropDown() {
        // Рендер дропдауна с кнопкой добавления атрибутов
        const {attributesList, currentProduct, currentAttribute, setsList = [], currentSet, show, changes = {}, attributesHash} = this.state;
        return (
            <>
                <div>
                    <select onChange={e => this.setState({currentAttribute: e.target.value})}>
                        {(attributesList || []).map((attribute, key) => (
                            <option value={attribute._id} key={key}>{attribute.title}</option>
                        ))}
                    </select>
                    <button onClick={() => {
                        const newChanges = {...changes};
                        newChanges.props = [
                            ...((changes && changes.props) || currentProduct.props || []),
                            {
                                attribute: currentAttribute,
                                value: (attributesHash[currentAttribute].type === 'rangeField')
                                    ? {after: '', before: ''}
                                    : ''
                            }
                        ];
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else if (show === 'createPage')
                            this.setState({currentProduct: {...currentProduct, ...newChanges}});
                    }}>add attribute
                    </button>
                </div>
                <div>
                    <select onChange={e => this.setState({currentSet: e.target.value})}>
                        {setsList.map((set, key) => <option value={set._id} key={key}>{set.title}</option>)}
                    </select>
                    <button onClick={() => {
                        const newChanges = {...changes};
                        newChanges.props = [...(changes.props || currentProduct.props || [])];
                        setsList.forEach(set => {
                            if (set._id === currentSet)
                                set.attributes.forEach(attribute => {
                                    newChanges.props.push({attribute: attribute._id, value: ''});
                                })
                        });
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else if (show === 'createPage')
                            this.setState({currentProduct: {...currentProduct, ...newChanges}});
                    }}>add attribute set
                    </button>
                </div>
            </>
        )
    };

    renderCategoryDropDown() {
        // Рендер дропдауна для категорий
        const {categoriesList = [], currentProduct, show, changes = {}} = this.state;
        return (
            <select
                value={(show === 'editPage') ? (changes.categoryID || currentProduct.categoryID) : undefined}
                onChange={e => {
                    const newChanges = {...changes, categoryID: e.target.value};
                    if (show === 'editPage')
                        this.setState({changes: newChanges});
                    else if (show === 'createPage')
                        this.setState({currentProduct: {...currentProduct, ...newChanges}});
                }}>
                {categoriesList.map((category, key) => (
                    <option value={category._id} key={key}>{category.name}</option>
                ))}
            </select>
        )
    };

    renderMedia() {
        const {currentProduct, changes = {}} = this.state;
        return (changes.media || (currentProduct && currentProduct.media) || []).map((image, key) => (
            <div key={key}>
                <img src={image}/>
                <div className="icon remove-button" onClick={() => {
                    const newChanges = {
                        ...changes,
                        media: [...(changes.media || (currentProduct && currentProduct.media))]
                    };
                    newChanges.media.splice(key, 1);
                    this.setState({changes: newChanges})
                }}/>
            </div>
        ));
    };

    renderPropList() {
        // Рендер списка атрибутов с их значениями
        const {currentProduct, show, attributesHash} = this.state;
        let {changes = {}} = this.state;
        return (changes.props || (currentProduct && currentProduct.props) || []).map((prop, index) => {
            let propInput;
            let propValue = (show === 'editPage')
                ? (changes.props && changes.props[index])
                    ? changes.props[index].value
                    : currentProduct.props[index].value
                : undefined;
            let propOnChange = (arg) => {
                changes = changes || {props: [...currentProduct.props]};
                if (typeof arg === 'object')
                    changes.props[index].value = arg.target.value;
                else
                    changes.props[index].value = arg;
                if (show === 'editPage')
                    this.setState({changes});
                else if (show === 'createPage')
                    this.setState({currentProduct: {...currentProduct, ...changes}});
            };
            switch (attributesHash[prop.attribute].type) {
                case 'textField':
                    propInput = (
                        <Input
                            value={propValue}
                            onChange={propOnChange}/>
                    );
                    break;
                case 'numberField':
                    propInput = (
                        <input
                            type='number'
                            value={propValue}
                            onChange={propOnChange}/>
                    );
                    break;
                case 'textArea':
                    propInput = (
                        <textarea
                            value={propValue}
                            onChange={propOnChange}/>
                    );
                    break;
                case 'rangeField':
                    propOnChange = (e, position) => {
                        changes = changes || {props: [...currentProduct.props]};
                        changes.props[index].value = {...changes.props[index].value, [position]: e.target.value};
                        if (show === 'editPage')
                            this.setState({changes});
                        else if (show === 'createPage')
                            this.setState({currentProduct: {...currentProduct, ...changes}});
                    };
                    propInput = [{title: 'от', trans: 'after'}, {
                        title: 'до',
                        trans: 'before'
                    }].map(({title, trans}, key) => (
                        <div key={key}>
                            <span>{title}</span>
                            <input
                                type='number'
                                value={(show === 'editPage')
                                    ? (changes && changes.props && changes.props[index])
                                        ? (changes.props[index].value[trans] || '')
                                        : (currentProduct.props[index].value[trans] || '')
                                    : undefined}
                                onChange={value => propOnChange(value, trans)}/>
                        </div>
                    ));
                    break;
            }
            return (
                <div key={index}>
                    <span>{attributesHash[prop.attribute].title}</span>
                    {propInput}
                    <span onClick={() => {
                        const newChanges = {...changes, props: [...(changes.props || currentProduct.props || [])]};
                        newChanges.props.splice(index, 1);
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else if (show === 'createPage')
                            this.setState({currentProduct: {...currentProduct, ...newChanges}});
                    }} className='icon remove-button'/>
                </div>
            )
        })
    };

    renderProp(prop, key) {
        if (prop === 'categoryID')
            return <div key={key}>{this.renderCategoryDropDown()}</div>;
        if (prop === 'props')
            return (
                <div key={key}>
                    {this.renderPropDropDown()}
                    {this.renderPropList()}
                </div>
            );
        if (prop === 'media')
            return <div key={key}>{this.renderMedia()}</div>;
        const {currentProduct, changes = {}, show} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input
                    value={(show === 'editPage') ? (changes[prop] || currentProduct[prop]) : undefined}
                    onChange={value => {
                        const newChanges = {...changes, [prop]: value};
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else if (show === 'createPage')
                            this.setState({currentProduct: {...currentProduct, ...newChanges}});
                    }}/>
            </div>
        )
    };

    renderList() {
        const {productsList = []} = this.state;
        return (
            <>
                {productsList.map((product, key) => (
                    <div key={key}>
                        <span>{product.name}</span>
                        <span onClick={() => this.show('editPage', product)} className='icon pencil'/>
                        <span onClick={() => this.deleteProduct(product._id)} className='icon remove-button'/>
                    </div>
                ))}
            </>
        )
    };

    renderProps() {
        return ['media', 'categoryID', 'code', 'name', 'price', 'slug', 'props'].map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show} = this.state;
        if (loading)
            return <Loading/>;
        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteProduct}];
        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                    <button className='c--btn c--btn--primary' onClick={this.handleExport}>Export csv</button>
                    <span>Import  csv</span>
                    <input type='file' onChange={this.handleUpload}/>
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