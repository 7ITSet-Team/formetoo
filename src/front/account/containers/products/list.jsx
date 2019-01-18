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
            productsList: [],
            currentProduct: undefined,
            changes: undefined
        };
        this.show = currentProduct => this.setState({show: true, currentProduct});
        this.close = () => this.setState({show: false, currentProduct: undefined, changes: undefined});
        this.updateProductsList = async () => {
            const {error, data: productsList} = await API.request('products', 'list');
            if (!error)
                this.setState({loading: false, productsList});
        };
        this.saveChanges = async () => {
            const {currentProduct, changes} = this.state;
            const {error} = await API.request('products', 'update', {_id: currentProduct._id, changes: changes || {}});
            if (error) {
                Message.send('ошибка при редактировании продукта, повторите попытку позже', Message.type.danger);
                this.close();
            } else {
                Message.send('продукт успешно изменен', Message.type.success);
                this.close();
                this.setState({loading: true});
                this.updateProductsList();
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
        const {error, data: productsList} = await API.request('products', 'list');
        if (!error)
            this.setState({loading: false, productsList});
    };

    renderPropMedia(prop) {
        let {currentProduct, changes} = this.state;
        return ((changes && changes[prop]) || currentProduct[prop]).map((image, key) => (
            <div key={key}>
                <img src={image}/>
                <div className="icon remove-button" onClick={() => {
                    changes = changes || {};
                    changes[prop] = [...currentProduct.media];
                    changes[prop].splice(key, 1);
                    this.setState({changes})
                }}/>
            </div>
        ));
    };

    renderPropList(prop) {
        let {currentProduct, changes} = this.state;
        return ((changes && changes[prop]) || currentProduct[prop]).map((field, key) => (
            <div key={key}>
                <span>{field.name}</span>
                <Input value={field.value} onChange={value => {
                    changes = changes || {};
                    changes[prop] = [...currentProduct[prop]];
                    changes[prop][key] = value;
                    this.setState({changes});
                }}/>
            </div>
        ));
    };

    renderProp(prop) {
        let {currentProduct, changes} = this.state;
        return (
            <>
            <span>{prop}</span>
            <Input value={(changes && changes[prop]) || currentProduct[prop]} onChange={value => {
                changes = changes || {};
                changes[prop] = value;
                this.setState({changes});
            }}/>
            </>
        )
    };

    render() {
        const {loading, productsList, show, currentProduct, changes} = this.state;

        if (loading)
            return (<Loading/>);

        return (
            <>
            <div className='c--items-group'>
                <button className='c--btn c--btn--primary'>add new</button>
            </div>
            {productsList.map((product, key) => (
                <div key={key}>
                    <span>{product.name}</span>
                    <span onClick={() => this.show(product)} className='icon pencil'/>
                </div>
            ))}
            <Modal title='Редактирование' show={show} buttons={this.buttons} onClose={this.close}>
                <div>
                    {currentProduct && Object.keys(currentProduct).map((prop, key) => (
                        <div key={key}>
                            {
                                Array.isArray(currentProduct) ? (
                                    (prop === 'media') ? this.renderPropMedia(prop) : this.renderPropList(prop)
                                ) : (
                                    (prop !== '_id') ? this.renderProp(prop) : null
                                )
                            }
                        </div>
                    ))}
                </div>
            </Modal>
            </>
        );
    };
};