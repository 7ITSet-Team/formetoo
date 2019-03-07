import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Message from '@components/ui/message';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            tree: undefined,
            open: []
        };
        this.updateTree = async () => {
            const {error, data: tree} = await API.request('tree', 'list');
            if (!error)
                this.setState({loading: false, tree});
            else
                Message.send('ошибка при получении дерева, повторите попытку позже', Message.type.danger);
        };
        this.changeParentCategory = async product => {
            const {error} = await API.request('products', 'update', {
                _id: product._id,
                changes: {categoryID: this.state.onDragTarget}
            });
            if (!error)
                this.updateTree();
            else
                Message.send('ошибка при изменении дерева, повторите попытку позже', Message.type.danger);
        };
        this.deleteCategory = async categoryID => {
            const {error} = await API.request('categories', 'update', {_id: categoryID});
            if (!error) {
                this.updateTree();
                Message.send('категория успешно удалена', Message.type.success);
            } else
                Message.send('ошибка при удалении категории, повторите попытку позже', Message.type.danger);
        };
        this.deleteProduct = async productID => {
            const {error} = await API.request('products', 'update', {_id: productID});
            if (!error) {
                this.updateTree();
                Message.send('продукт успешно удален', Message.type.success);
            } else
                Message.send('ошибка при удалении продукта, повторите попытку позже', Message.type.danger);
        };
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: tree} = await API.request('tree', 'list');
        if (!error)
            this.setState({loading: false, tree});
        else
            Message.send('ошибка при получении дерева, повторите попытку позже', Message.type.danger);
    };

    render() {
        const {loading, tree = [], open} = this.state;
        if (loading)
            return <Loading/>;
        return (
            <div>
                {tree.map(category => (
                    <div key={category._id} className='tree'>
                        <div>
                            <span onClick={() => {
                                if (open.includes(category._id)) {
                                    const newOpen = [...open];
                                    newOpen.splice(open.indexOf(category._id), 1);
                                    this.setState({open: newOpen});
                                } else
                                    this.setState({open: [...open, category._id]})
                            }} onDragEnter={() => {
                                this.setState({
                                    onDragTarget: category._id
                                })
                            }}>{category.name}</span>
                            {(category.slug !== 'root') &&
                            <span onClick={() => this.deleteCategory(category._id)} className='icon remove-button'/>}
                        </div>
                        {open.includes(category._id) && (
                            <div>
                                {category.products && category.products.map(product => (
                                    <div key={product._id} draggable={true}
                                         onDragEnd={e => this.changeParentCategory(product)}>
                                        <span>{product.name}</span>
                                        <span onClick={() => this.deleteProduct(product._id)}
                                              className='icon remove-button'/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };
};