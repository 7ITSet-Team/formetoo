import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import Config from '@project/config';

const __modelName = 'order';
export default db => {
    const schema = new mongoose.Schema({
        userID: mongoose.Schema.Types.ObjectId,
        createDate: Date,
        products: [],
        statusDate: Date,
        status: {
            type: String,
            required: true
        }
    }, {collection: __modelName});

    schema.statics.getByUser = async function (user) {
        const orders = await this.find({userID: new mongoose.Types.ObjectId(user._id), status: {$not: 'closed'}});
        if (orders && orders.length > 0)
            return orders.sort((a, b) => b.createDate - a.createDate)[0];
    };

    schema.statics.getByOrderToken = async function (token) {
        const payload = jwt.verify(token, Config.jwt.secret);
        return await this.findOne({_id: new mongoose.Types.ObjectId(payload.id), status: {$not: 'closed'}});
    };

    schema.statics.getByUserOrOrderToken = async function (user, token) {
        if (user)
            return await this.order.getByUser(user);
        if (token)
            return await this.order.getByOrderToken(token);
    };

    schema.methods.setStatus = async function (newStatus) {
        this.status = newStatus;
        await this.save();
    };

    schema.methods.cart = async function () {
        const counts = {};
        let sum = 0
        let count = 0

        const ids = this.products.map(item => {
            counts[item._id] = item.count;
            return item._id;
        });

        const products = await db.product.find({_id: {$in: ids}}, {__v: 0});
        products.forEach(item => {
            item.count = (counts[item._id] || 0);
            count += item.count;
            sum += item.count * item.price;
        });
        return {products, count, sum};
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};