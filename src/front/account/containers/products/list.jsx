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
            categoriesList: undefined,
            currentProduct: undefined,
            currentAttribute: undefined,
            attributes: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentProduct) => {
            const {attributesList, categoriesList} = this.state;
            let newState = {
                show: page,
                currentAttribute: {_id: attributesList[0]._id, name: attributesList[0].name}
            };
            if (page === 'editPage') {
                const attributesNames = [];
                const productProps = [...currentProduct.props];
                productProps.forEach((prop, index, _productProps) => {
                    attributesNames.push(prop.attribute.name);
                    _productProps[index] = prop.attribute._id;
                });
                newState.currentProduct = {...currentProduct, props: productProps};
                newState.attributes = attributesNames;
            } else
                newState.currentProduct = {categoryID: categoriesList[0]._id};
            this.setState(newState);
        };
        this.close = () => this.setState({
            show: undefined,
            currentProduct: undefined,
            currentAttribute: undefined,
            changes: undefined,
            attributes: undefined
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
            let data = currentProduct;
            if (show === 'editPage')
                data = {_id: currentProduct._id, changes};
            const {error} = await API.request('products', 'update', data);
            if (error) {
                Message.send(`ошибка при ${(show === 'editPage') ? 'редактировании' : 'создании'} продукта, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`продукт успешно ${(show === 'editPage') ? 'изменен' : 'создан'}`, Message.type.success);
                this.close();
                this.updateProductsList();
            }
        };
        this.deleteProduct = async productID => {
            const {currentProduct, show} = this.state;
            const {error} = await API.request('products', 'update', {_id: (productID || currentProduct._id)});
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
            const {error, data} = await API.request('products', 'get-data', {type: 'csv'});
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
        if (!errorP && !errorA && !errorC)
            this.setState({loading: false, productsList, attributesList, categoriesList});
        else
            Message.send('ошибка при получении списка продуктов, повторите попытку позже', Message.type.danger);
    };

    renderPropDropDown() {
        // Рендер дропдауна с кнопкой добавления атрибутов
        const {attributesList, currentProduct, currentAttribute, attributes} = this.state;
        return (
            <>
                <select onChange={e => this.setState({
                    currentAttribute: {_id: e.target.value, name: e.target.options[e.target.selectedIndex].text}
                })}>
                    {attributesList && attributesList.map((attribute, key) => (
                        <option value={attribute._id} key={key}>{attribute.name}</option>
                    ))}
                </select>
                <button onClick={() => {
                    this.setState({
                        currentProduct: {
                            ...currentProduct,
                            props: [...(currentProduct.props || []), {attribute: currentAttribute._id}]
                        },
                        attributes: [...(attributes || []), currentAttribute.name]
                    })
                }}>add attribute
                </button>
            </>
        )
    };

    renderCategoryDropDown() {
        // Рендер дропдауна для категорий
        const {categoriesList, currentProduct, show, changes} = this.state;

        return (
            <select
                value={(show === 'editPage') ? currentProduct.categoryID : undefined}
                onChange={e => this.setState({
                    currentProduct: {...currentProduct, categoryID: e.target.value},
                    changes: {...(changes || {}), categoryID: e.target.value}
                })}>
                {categoriesList && categoriesList.map((category, key) => (
                    <option value={category._id} key={key}>{category.name}</option>
                ))}
            </select>
        )
    };

    renderMedia() {
        let {currentProduct, changes} = this.state;

        return ((changes && changes.media) || currentProduct.media).map((image, key) => (
            <div key={key}>
                <img src={image}/>
                <div className="icon remove-button" onClick={() => {
                    changes = changes || {};
                    changes.media = [...currentProduct.media];
                    changes.media.splice(key, 1);
                    this.setState({changes})
                }}/>
            </div>
        ));
    };

    renderPropList() {
        // Рендер списка атрибутов с их значениями
        let {attributes, currentProduct, show, changes} = this.state;

        return (attributes || []).map((attribute, index) => (
            <div key={index}>
                <span>{attribute}</span>
                <Input value={(show === 'editPage') ? currentProduct.props[index].value : undefined}
                       onChange={value => {
                           currentProduct.props[index].value = value;
                           this.setState({
                               currentProduct,
                               changes: (show === 'editPage') ? {...changes, props: currentProduct.props} : undefined
                           })
                       }}/>
                <span onClick={() => {
                    attributes.splice(index, 1);
                    currentProduct.props.splice(index, 1);
                    this.setState({
                        attributes,
                        currentProduct: {...currentProduct, props: currentProduct.props},
                        changes: (show === 'editPage') ? {...changes, props: currentProduct.props} : undefined
                    })
                }} className='icon remove-button'/>
            </div>
        ))
    };

    renderProp(prop, key) {
        if (prop === 'categoryID')
            return <div key={key}>{this.renderCategoryDropDown()}</div>;
        else if (prop === 'props')
            return (
                <div key={key}>
                    {this.renderPropDropDown()}
                    {this.renderPropList()}
                </div>
            );
        else if (prop === 'media')
            return <div key={key}>{this.renderMedia()}</div>;
        else {
            let {currentProduct, changes, show} = this.state;
            return (
                <div key={key}>
                    <span>{prop}</span>
                    <Input
                        value={(show === 'editPage') ? ((changes && changes[prop]) || currentProduct[prop]) : undefined}
                        onChange={value => {
                            const {show, currentProduct} = this.state;

                            changes = changes || {};
                            changes[prop] = value;
                            if (show === 'editPage')
                                this.setState({changes});
                            else if (show === 'createPage')
                                this.setState({currentProduct: {...currentProduct, ...changes}});
                        }}/>
                </div>
            )
        }
    };

    renderList() {
        const {productsList} = this.state;
        return (
            <>
                {productsList && productsList.map((product, key) => (
                    <div key={key}>
                        <span>{product.name}</span>
                        <span onClick={() => this.show('editPage', product)} className='icon pencil'/>
                        <span onClick={() => this.deleteProduct(product._id)} className='icon remove-button'/>
                    </div>
                ))}
            </>
        )
    };

    render() {
        const {loading, show, currentProduct} = this.state;

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
                <Modal title='Редактирование' show={(show === 'editPage')} buttons={actions} onClose={this.close}>
                    <div>
                        {Object.keys(currentProduct || {}).map((prop, key) => (prop !== '_id') && this.renderProp(prop, key))}
                    </div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={actions} onClose={this.close}>
                    <div>
                        {['categoryID', 'code', 'name', 'price', 'slug', 'props'].map((prop, key) => this.renderProp(prop, key))}
                        <button>add image</button>
                    </div>
                </Modal>
            </>
        );
    };
};