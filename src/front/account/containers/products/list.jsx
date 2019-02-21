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
            sendLoading: false, // we use this flag for rendering a spinner in the edit modal window because sending an image takes a lot of time
            products: [],
            attributes: [],
            sets: [],
            categories: [],
            media: [],
            currentProduct: undefined,
            currentAttribute: undefined,
            currentSet: undefined,
            attributesHash: undefined,
            changes: undefined,
            show: undefined,
            showMediaDialog: undefined,
            filter: {}
        };
        this.show = (page, currentProduct) => {
            const {categories} = this.state;
            let newState = {show: page};
            if (page === 'editPage') {
                const props = currentProduct.props.map(prop => ({attribute: prop.attribute._id, value: prop.value}));
                newState.currentProduct = {...currentProduct, props};
            } else
                newState.currentProduct = {categoryID: categories[0]._id};
            this.setState(newState);
        };
        this.close = () => this.setState({show: undefined, currentProduct: undefined, changes: undefined});
        this.closeMediaDialog = () => this.setState({showMediaDialog: false});
        this.updateProducts = async () => {
            this.setState({loading: true});
            const {errorP, data: products} = await API.request('products', 'list');
            const {errorM, data: {mediaHash}} = await API.request('media', 'list', {hash: true});
            if (!errorP && !errorM)
                this.setState({loading: false, products, mediaHash});
            else
                Message.send('ошибка при обновлении списка продуктов, повторите попытку позже');
        };
        this.saveChanges = async () => {
            const {currentProduct, changes, show} = this.state;
            const isEdit = (show === 'editPage');
            if (isEdit && (Object.keys(changes || {}).length === 0))
                return this.close();
            const data = (isEdit) ? {_id: currentProduct._id, changes} : currentProduct;
            let msg;
            const isNotValid = this.requiredFields
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
            if (!isEdit && isNotValid)
                return Message.send(msg, Message.type.danger);
            this.setState({sendLoading: true});
            const {error} = await API.request('products', 'update', data);
            this.setState({sendLoading: false});
            if (error)
                Message.send(`ошибка при ${isEdit ? 'редактировании' : 'создании'} продукта, повторите попытку позже`, Message.type.danger);
            else {
                Message.send(`продукт успешно ${isEdit ? 'изменен' : 'создан'}`, Message.type.success);
                this.updateProducts();
            }
            this.close();
        };
        this.deleteProduct = async (productID = this.state.currentProduct._id) => {
            const {show} = this.state;
            const {error} = await API.request('products', 'update', {_id: productID});
            if (!error) {
                if (show === 'editPage')
                    this.close();
                this.updateProducts();
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
                else {
                    if (!error && errorRows.length > 0)
                        Message.send(`продукты успешно добавлены, но допущены ошибки в строках: ${errorRows.toString()}`, Message.type.info);
                    else
                        Message.send('продукты успешно добавлены', Message.type.success);
                    this.updateProducts();
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
        this.acceptFilter = async (filterBy, value) => {
            const {filter} = this.state;
            const newFilter = {...filter};
            newFilter[filterBy] = value;
            for (const key in newFilter)
                if (newFilter[key] === undefined)
                    delete newFilter[key];
            this.setState({filter: newFilter});
            const {error, data: products} = await API.request('products', 'list', {filter: newFilter});
            if (!error)
                this.setState({products});
            else
                Message.send('ошибка при обновлении списка продуктов, повторите попытку позже');
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
        this.requiredFields = ['categoryID', 'code', 'name', 'slug', 'price'];
        this.fields = [...this.requiredFields, 'media', 'props'];
        this.filters = ['name', 'price.after', 'price.before', 'code', 'slug', 'categoryID'];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {errorP, data: products} = await API.request('products', 'list');
        const {errorA, data: {attributes, attributesHash}} = await API.request('attributes', 'list', {hash: true});
        const {errorC, data: categories} = await API.request('categories', 'list');
        const {errorS, data: sets} = await API.request('attribute-sets', 'list');
        const {errorM, data: {media, mediaHash}} = await API.request('media', 'list', {hash: true});
        if (!errorP && !errorA && !errorC && !errorS && !errorM)
            this.setState({
                loading: false,
                products,
                attributes,
                categories,
                sets,
                attributesHash,
                mediaHash,
                media,
                currentAttribute: (attributes[0] && attributes[0]._id),
                currentSet: (sets[0] && sets[0]._id)
            });
        else
            Message.send('ошибка при получении списка продуктов, повторите попытку позже', Message.type.danger);
    };

    renderPropDropDown() {
        // Рендер дропдауна с кнопкой добавления атрибутов
        const {attributes, currentProduct, currentAttribute, sets, currentSet, show, changes = {}, attributesHash} = this.state;
        return (
            <>
                <div>
                    <select onChange={e => this.setState({currentAttribute: e.target.value})}>
                        {attributes.map(attribute => (
                            <option value={attribute._id} key={attribute._id}>{attribute.title}</option>
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
                        else
                            this.setState({currentProduct: {...currentProduct, ...newChanges}});
                    }}>
                        add attribute
                    </button>
                </div>
                <div>
                    <select onChange={e => this.setState({currentSet: e.target.value})}>
                        {sets.map(set => <option value={set._id} key={set._id}>{set.title}</option>)}
                    </select>
                    <button onClick={() => {
                        const newChanges = {...changes};
                        newChanges.props = [...(changes.props || currentProduct.props || [])];
                        sets.forEach(set => {
                            if (set._id === currentSet)
                                set.attributes.forEach(attribute => newChanges.props.push({attribute, value: ''}))
                        });
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else
                            this.setState({currentProduct: {...currentProduct, ...newChanges}});
                    }}>add attribute set
                    </button>
                </div>
            </>
        )
    };

    renderCategoryDropDown() {
        // Рендер дропдауна для категорий
        const {categories, currentProduct, show, changes = {}} = this.state;
        return (
            <select
                onChange={e => {
                    const newChanges = {...changes, categoryID: e.target.value};
                    if (show === 'editPage')
                        this.setState({changes: newChanges});
                    else
                        this.setState({currentProduct: {...currentProduct, ...newChanges}});
                }}>
                {categories.map(category => <option value={category._id} key={category._id}>{category.name}</option>)}
            </select>
        )
    };

    renderMedia() {
        const {currentProduct, changes = {}, show, mediaHash} = this.state;
        return (
            <>
                {(changes.media || currentProduct.media || []).map((image, key) => (
                    <div key={key}>
                        <img src={mediaHash[image] ? mediaHash[image].url : image} width='200' height='200'/>
                        <div className="icon remove-button" onClick={() => {
                            const newChanges = {
                                ...changes,
                                media: [...(changes.media || (currentProduct && currentProduct.media))]
                            };
                            newChanges.media.splice(key, 1);
                            this.setState({changes: newChanges})
                        }}/>
                    </div>
                ))}
                <input type='file' onChange={e => {
                    const files = e.target.files;
                    const media = [];
                    Object.keys(files).forEach(key => {
                        const reader = new FileReader();
                        reader.onload = async () => {
                            media.push(reader.result);
                            if (media.length === Object.keys(files).length)
                                if (show === 'editPage')
                                    this.setState({
                                        changes: {
                                            ...changes,
                                            media: [...(changes.media || currentProduct.media), ...media]
                                        }
                                    });
                                else this.setState({currentProduct: {...currentProduct, media}});
                        };
                        reader.readAsDataURL(files[key])
                    });
                }} multiple/>
                <div>Или выбрать из существующих:</div>
                <button onClick={() => this.setState({showMediaDialog: true})}>Выбрать</button>
            </>
        )
    };

    renderPropList() {
        // Рендер списка атрибутов с их значениями
        const {currentProduct, show, attributesHash} = this.state;
        let {changes} = this.state;
        return ((changes && changes.props) || (currentProduct && currentProduct.props) || []).map((prop, index) => {
            let propInput;
            let propValue = (show === 'editPage')
                ? (changes && changes.props && changes.props[index])
                    ? changes.props[index].value
                    : currentProduct.props[index].value
                : undefined;
            let propOnChange = arg => {
                changes = changes || {props: [...currentProduct.props]};
                if (typeof arg === 'object')
                    changes.props[index].value = arg.target.value;
                else
                    changes.props[index].value = arg;
                if (show === 'editPage')
                    this.setState({changes});
                else
                    this.setState({currentProduct: {...currentProduct, ...changes}});
            };
            switch (attributesHash[prop.attribute].type) {
                case 'textField':
                    propInput = <Input value={propValue} onChange={propOnChange}/>;
                    break;
                case 'numberField':
                    propInput = <input type='number' value={propValue} onChange={propOnChange}/>;
                    break;
                case 'textArea':
                    propInput = <textarea value={propValue} onChange={propOnChange}/>;
                    break;
                case 'rangeField':
                    propOnChange = (e, position) => {
                        changes = changes || {props: [...currentProduct.props]};
                        changes.props[index].value = {...changes.props[index].value, [position]: e.target.value};
                        if (show === 'editPage')
                            this.setState({changes});
                        else
                            this.setState({currentProduct: {...currentProduct, ...changes}});
                    };
                    propInput = [{title: 'от', trans: 'after'}, {title: 'до', trans: 'before'}]
                        .map(({title, trans}, key) => (
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
                        const newChanges = {
                            ...changes,
                            props: [...((changes && changes.props) || currentProduct.props || [])]
                        };
                        newChanges.props.splice(index, 1);
                        if (show === 'editPage')
                            this.setState({changes: newChanges});
                        else
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
        if (prop === 'media') return <div key={key}>{this.renderMedia()}</div>;
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
                        else
                            this.setState({currentProduct: {...currentProduct, ...newChanges}});
                    }}/>
            </div>
        )
    };

    renderList() {
        const {products, filter} = this.state;
        return (
            <>
                {this.filters.map((filterBy, key) => {
                    if (filterBy === 'categoryID') {
                        const {categories} = this.state;
                        return (
                            <select onChange={e => this.acceptFilter(filterBy, e.target.value)} key={key}>
                                <option value=''>Любая категория</option>
                                {categories.map(category => (
                                    <option value={category._id} key={category._id}>{category.name}</option>
                                ))}
                            </select>
                        );
                    }
                    return (
                        <Input key={key} placeholder={filterBy} onChange={value => this.acceptFilter(filterBy, value)}
                               value={filter[filterBy] || ''}/>
                    );
                })}
                {products.map((product, key) => (
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
        return this.fields.map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show, showMediaDialog, media, sendLoading} = this.state;
        if (loading) return <Loading/>;
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
                        <div>
                            {this.renderProps()}
                            {sendLoading && <Loading/>}
                        </div>
                    </Modal>
                )}
                {showMediaDialog && (
                    <Modal title='Медиа' show={true} buttons={[{
                        name: 'закрыть',
                        types: 'secondary',
                        handler: this.closeMediaDialog
                    }]} onClose={this.close}>
                        <div>
                            {media.map((img, key) => (
                                <div className='a--list-item' key={key} onClick={() => {
                                    const {changes = {}, currentProduct} = this.state;
                                    if (show === 'editPage') {
                                        if (changes.media) {
                                            if (!changes.media.includes(img._id)) {
                                                this.setState({
                                                    changes: {
                                                        ...changes,
                                                        media: [...changes.media, img._id]
                                                    }
                                                });
                                            }
                                        } else this.setState({
                                            changes: {
                                                ...changes,
                                                media: [...currentProduct.media, img._id]
                                            }
                                        });
                                    } else {
                                        if (currentProduct.media) {
                                            if (!currentProduct.media.includes(img._id)) {
                                                this.setState({
                                                    currentProduct: {
                                                        ...changes,
                                                        media: [...currentProduct.media, img._id]
                                                    }
                                                });
                                            }
                                        } else this.setState({currentProduct: {...currentProduct, media: [img._id]}});
                                    }
                                    this.closeMediaDialog();
                                }}>
                                    <img width='200' height='200' src={img.url} alt=''/>
                                </div>
                            ))}
                        </div>
                    </Modal>
                )}
            </>
        );
    };
};
