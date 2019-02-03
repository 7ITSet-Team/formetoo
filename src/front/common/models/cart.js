import API from '@common/core/api';
import Message from '@components/ui/message';

export default class Cart {
    static get listeners() {
        this._listeners = this._listeners || new Set();
        return this._listeners;
    };

    static talk(){
        for (let listener of this.listeners) (typeof listener === 'function') && listener(this);
    };

    static clear(){
        this.products = [];
        this.count = 0;
        this.sum = 0;
        this.productsIDs = {};
        this.talk();
    };

    static async update(newData) {
        if (!newData) {
            const {error, data = {}} = await API.request('cart', 'info');
            newData = data;
            if (error) {
                Message.send(error, Message.type.danger);
                return;
            }
        }
        this.products = newData.products || [];
        this.count = newData.count || 0;
        this.sum = newData.sum || 0;
        this.productsIDs = {};
        this.products.forEach(item => this.productsIDs[item._id] = item.count);
        this.talk();
    };

    static async putInCart(product, count) {
        const {error, data} = await API.request('cart', 'put-in-order', {productID: product._id, count});
        if (error)
            Message.send(error, Message.type.danger);
        else {
            Message.send(`Количество товара ${product.name} в корзине изменено`, Message.type.success);
            this.update(data);
        }
        return !error;
    };

    static isItemInCart(item) {
        return (this.productsIDs && this.productsIDs[item._id]);
    };

    static async orderPlacement(data) {
        const {error} = await API.request('cart', 'placing-orders', data);
        return error;
    };
};