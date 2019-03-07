import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';
import Input from '@components/ui/input';
import Pagination from '@components/ui/pagination';
import MultiplePhoto from '@components/multiple-photo';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            sendLoading: false,
            products: undefined,
            attributes: undefined,
            sets: undefined,
            categories: undefined,
            media: undefined,
            currentProduct: undefined,
            currentAttribute: undefined,
            currentSet: undefined,
            attributesHash: undefined,
            changes: undefined,
            show: undefined,
            showMediaDialog: undefined,
            filter: undefined,
            sort: undefined,
            page: 1,
            totalPages: 1
        };
        this.show = (page, currentProduct = {}) =>
            this.setState({
                show: page,
                currentProduct
            });
        this.close = () => this.setState({show: undefined, currentProduct: undefined, changes: undefined});
        this.closeMediaDialog = () => this.setState({showMediaDialog: false});
        this.updateProducts = async (page = this.state.page) => {
            const {sort, filter} = this.state;
            this.setState({loading: true, page});
            const {error, data: {pages: totalPages, products}} = await API.request('products', 'list', {
                sort,
                filter,
                page
            });

            if (totalPages && (page > totalPages))
                return this.updateProducts(1);

            if (!error)
                this.setState({loading: false, products, totalPages});
            else
                Message.send('ошибка при обновлении списка продуктов, повторите попытку позже');
        };
        this.saveChanges = async () => {
            const {currentProduct, changes = {}, show, categories} = this.state;
            const isEdit = (show === 'editPage');

            if (isEdit && !Object.keys(changes).length)
                return this.close();

            const data = (isEdit)
                ? {_id: currentProduct._id, changes}
                : {categoryID: categories[0]._id, ...currentProduct};

            const media = (isEdit ? data.changes : data).media;
            if (media)
                media.forEach((media, index, _media) => (typeof media === 'object') && (_media[index] = media._id));
            let msg;
            if (!isEdit) {
                const isNotValid = this.requiredFields
                    .some(field => {
                        const isNull = (data[field] == null) || (data[field] === '');
                        if ((field === 'price') && !isNull && isNaN(data[field])) {
                            msg = 'Ошибка валидации: цена - число';
                            return true;
                        }
                        msg = 'Введены не все обязательные поля';
                        return isNull;
                    });
                if (isNotValid)
                    return Message.send(msg, Message.type.danger);
            }
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
                /*
                    временное решение.
                 */
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
            let newFilter = {...filter};
            if (filterBy === 'price.after') {
                newFilter.price = {...(newFilter.price || {}), $gte: (value || undefined)};
                delete newFilter['price.after'];
            } else if (filterBy === 'price.before') {
                newFilter.price = {...(newFilter.price || {}), $lte: (value || undefined)};
                delete newFilter['price.before'];
            } else
                newFilter[filterBy] = (value || undefined);
            for (const filter in newFilter) {
                if (filter === 'price') {
                    if ((newFilter.price.$gte == null) || (newFilter.price.$gte === ''))
                        delete newFilter.price.$gte;
                    if ((newFilter.price.$lte == null) || (newFilter.price.$lte === ''))
                        delete newFilter.price.$lte;
                    if (!Object.keys(newFilter[filter]).length)
                        delete newFilter[filter];
                }
                if (newFilter[filter] === undefined)
                    delete newFilter[filter];
            }
            if (!Object.keys(newFilter).length)
                newFilter = undefined;
            this.setState({filter: newFilter, page: 1}, this.updateProducts);
        };
        this.acceptSort = sortBy => {
            const {sort = {}} = this.state;
            this.setState({sort: {/*...sort, */[sortBy]: (sort[sortBy] === 1) ? -1 : 1}}, this.updateProducts);
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
        this.requiredFields = ['categoryID', 'code', 'name', 'slug', 'price', 'description', 'shortDescription'];
        this.fields = [...this.requiredFields, 'keywords', 'media', 'props'];
        this.filters = ['name', 'price.after', 'price.before', 'code', 'slug', 'categoryID'];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {errorP, data: {products, pages: totalPages}} = await API.request('products', 'list', {page: this.state.page});
        const {errorA, data: {attributes, attributesHash}} = await API.request('attributes', 'list', {hash: true});
        const {errorC, data: categories} = await API.request('categories', 'list');
        const {errorS, data: sets} = await API.request('attribute-sets', 'list');
        const {errorM, data: media} = await API.request('media', 'list');
        if (!errorP && !errorA && !errorC && !errorS && !errorM)
            this.setState({
                loading: false,
                products,
                attributes,
                categories,
                sets,
                attributesHash,
                media,
                totalPages,
                currentAttribute: (attributes[0] && attributes[0]._id),
                currentSet: (sets[0] && sets[0]._id)
            });
        else
            Message.send('ошибка при получении списка продуктов, повторите попытку позже', Message.type.danger);
    };

    renderPropDropDown() {
        const {attributes = [], currentProduct, currentAttribute, sets = [], currentSet, show, changes = {}, attributesHash} = this.state;
        return (
            <>
                <div>
                    <select onChange={e => this.setState({currentAttribute: e.target.value})}>
                        {attributes.map(attribute => <option value={attribute._id}
                                                             key={attribute._id}>{attribute.title}</option>)}
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
        const {categories = [], currentProduct, show, changes = {}} = this.state;
        return (
            <select
                onChange={e => {
                    const newChanges = {...changes, categoryID: e.target.value};
                    if (show === 'editPage')
                        this.setState({changes: newChanges});
                    else
                        this.setState({currentProduct: {...currentProduct, ...newChanges}});
                }}
                value={changes.categoryID || currentProduct.categoryID || ''}>
                {categories.map(category => <option value={category._id} key={category._id}>{category.name}</option>)}
            </select>
        )
    };

    renderMedia() {
        const {currentProduct, changes = {}, show} = this.state;
        return (
            <>
                {(changes.media || currentProduct.media || []).map((image, key) => (
                    <div key={key}>
                        {Array.isArray(image.url)
                            ? <MultiplePhoto frames={image.url}/>
                            : <img src={image.url || image} width='200' height='200' alt=''/>}
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
                <div>Загрузить фотографии или 3D картинки:</div>
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
                                else
                                    this.setState({
                                        currentProduct: {
                                            ...currentProduct,
                                            media: [...(currentProduct.media || []), ...media]
                                        }
                                    });
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
        const {currentProduct, show} = this.state;
        let {changes} = this.state;
        return ((changes && changes.props) || (currentProduct && currentProduct.props) || []).map((prop, index) => {
            let propInput;
            let propValue;
            if (show === 'editPage') {
                if (changes && changes.props && changes.props[index])
                    propValue = changes.props[index].value;
                else
                    propValue = currentProduct.props[index].value
            } else if (currentProduct.props[index])
                propValue = currentProduct.props[index].value;
            propValue = (propValue || '');
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
            switch (prop.attribute.type) {
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
                    const getValue = (ref => {
                        let value;
                        if (show === 'editPage') {
                            if (changes && changes.props && changes.props[index])
                                value = changes.props[index].value[ref];
                            else
                                value = currentProduct.props[index].value[ref];
                        } else
                            value = currentProduct.props[index].value[ref];
                        return (value || '');
                    });
                    propInput = [{title: 'от', ref: 'after'}, {title: 'до', ref: 'before'}]
                        .map(({title, ref}, key) => (
                            <div key={key}>
                                <span>{title}</span>
                                <input
                                    type='number'
                                    value={getValue(ref)}
                                    onChange={value => propOnChange(value, ref)}/>
                            </div>
                        ));
                    break;
            }
            return (
                <div key={index}>
                    <span>{prop.attribute.title}</span>
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
                        else
                            this.setState({currentProduct: {...currentProduct, ...newChanges}});
                    }}/>
            </div>
        )
    };

    renderList() {
        const {loading, products = []} = this.state;
        if (loading)
            return <Loading/>;
        return (
            <>
                {products.map((product, key) => (
                    <div key={key}>
                        <span>{product.name} || {product.price}</span>
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

    renderToolbar() {
        const {filter = {}} = this.state;
        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                    <button className='c--btn c--btn--primary' onClick={this.handleExport}>Export csv</button>
                    <span>Import  csv</span>
                    <input type='file' onChange={this.handleUpload}/>
                </div>

                {this.filters.map((filterBy, key) => {
                    if (filterBy === 'categoryID') {
                        const {categories = []} = this.state;
                        return (
                            <select onChange={e => this.acceptFilter(filterBy, e.target.value)} key={key}>
                                <option value=''>Любая категория</option>
                                {categories.map(category => (
                                    <option value={category._id} key={category._id}>{category.name}</option>
                                ))}
                            </select>
                        );
                    }
                    let value;
                    if (filterBy === 'price.after')
                        value = (filter.price && filter.price.$gte) || '';
                    else if (filterBy === 'price.before')
                        value = (filter.price && filter.price.$lte) || '';
                    else
                        value = filter[filterBy] || '';
                    return (
                        <Input key={key} placeholder={filterBy} onChange={value => this.acceptFilter(filterBy, value)}
                               value={value}/>
                    );
                })}

                <div>sort by:</div>
                <button onClick={() => this.acceptSort('price')}>price</button>
                <button onClick={() => this.acceptSort('name')}>name</button>
            </>
        )
    };

    render() {
        const {show, showMediaDialog, media = [], sendLoading, page, totalPages} = this.state;
        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteProduct}];
        return (
            <>
                {this.renderToolbar()}
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
                    }]} onClose={this.closeMediaDialog}>
                        <div>
                            {media.map((img, key) => (
                                <div className='a--list-item' key={key} onClick={() => {
                                    const {changes = {}, currentProduct} = this.state;
                                    let newMedia;
                                    const oldMedia = (show === 'editPage') ? changes.media : currentProduct.media;

                                    if (oldMedia && (Array.isArray(img.url) && !oldMedia.includes(img.url[0]) || !oldMedia.includes(img.url))) {
                                        newMedia = [...oldMedia, img];
                                    } else
                                        newMedia = (show === 'editPage')
                                            ? Array.isArray(img.url) ? [...currentProduct.media, img] : [...currentProduct.media, img]
                                            : [img];

                                    if (show === 'editPage')
                                        this.setState({changes: {...changes, media: newMedia}});
                                    else
                                        this.setState({currentProduct: {...currentProduct, media: newMedia}});
                                    this.closeMediaDialog();
                                }}>
                                    {Array.isArray(img.url)
                                        ? <MultiplePhoto frames={img.url}/>
                                        : <img src={img.url || img} width='200' height='200' alt=''/>}
                                </div>
                            ))}
                        </div>
                    </Modal>
                )}
                <Pagination page={page} totalPages={totalPages} goToPage={goTo => this.updateProducts(goTo)}/>
            </>
        );
    };
};
