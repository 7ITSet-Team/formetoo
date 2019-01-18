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
        this.show = async product => this.setState({show: true, currentProduct: product});
        this.close = () => this.setState({show: false, currentProduct: undefined, changes: undefined});
        this.updateProductsList = async () => {
            const productsList = await API.request('products', 'list');
            if (!productsList.error)
                this.setState({
                    loading: false,
                    productsList: productsList.data
                });
        };
        this.saveChanges = async () => {
            const {currentProduct, changes} = this.state;
            const {error} = await API.request('products', 'update', {_id: currentProduct._id, changes});
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
                handler: () => this.saveChanges()
            }
        ];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const productsList = await API.request('products', 'list');
        if (!productsList.error)
            this.setState({
                loading: false,
                productsList: productsList.data
            });
    };

    render() {
        const {loading, productsList, show, currentProduct, changes} = this.state;
        if (loading)
            return (<Loading/>);
        return (
            <>
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
                                    currentProduct[prop] instanceof Array
                                        ? prop === 'media'
                                        ? currentProduct[prop].map((image, key) => (
                                            <div key={key}>
                                                <img src={image}/>
                                                <div className="icon remove-button" onClick={() => {
                                                    const media = [...currentProduct.media];
                                                    media.splice(media.indexOf(image), 1);
                                                    this.setState({
                                                        currentProduct: {
                                                            ...currentProduct,
                                                            media
                                                        },
                                                        changes: {
                                                            ...changes,
                                                            media
                                                        }
                                                    })
                                                }}/>
                                            </div>
                                        ))
                                        : currentProduct[prop].map((field, key) => (
                                            <div key={key}>
                                                <span>{field.name}</span>
                                                <Input value={field.value} onChange={value => {
                                                    const props = [...currentProduct.props];
                                                    props[key].value = value;
                                                    this.setState({
                                                        currentProduct: {
                                                            ...currentProduct,
                                                            props
                                                        },
                                                        changes: {
                                                            ...changes,
                                                            props
                                                        }
                                                    })
                                                }}/>
                                            </div>
                                        ))
                                        : prop !== '_id'
                                        ? (
                                            <>
                                                <span>{prop}</span>
                                                <Input value={currentProduct[prop]} key={key}
                                                       onChange={value => {
                                                           this.setState({
                                                               currentProduct: {
                                                                   ...currentProduct,
                                                                   [prop]: value
                                                               },
                                                               changes: {
                                                                   ...changes,
                                                                   [prop]: value
                                                               }
                                                           })
                                                       }}/>
                                            </>
                                        )
                                        : null
                                }
                            </div>
                        ))}
                    </div>
                </Modal>
            </>
        )
    };
};