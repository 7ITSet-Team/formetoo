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
        },
        finalSum: Number
    }, {collection: __modelName});

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0});
    };

    schema.statics.getByUser = async function (user) {
        const orders = await this.find({
            userID: new mongoose.Types.ObjectId(user._id),
            status: {$not: {$eq: 'closed'}}
        });
        if (orders && orders.length > 0)
            return orders.sort((a, b) => b.createDate - a.createDate)[0];
    };

    schema.statics.getByOrderToken = async function (token) {
        const payload = jwt.verify(token, Config.jwt.secret);
        return await this.findOne({_id: new mongoose.Types.ObjectId(payload.id), status: {$not: {$eq: 'closed'}}});
    };

    schema.statics.getByUserOrOrderToken = async function (user, token) {
        if (user)
            return await this.getByUser(user);
        if (token)
            return await this.getByOrderToken(token);
    };

    schema.statics.createNewOrder = async function (user) {
        return await new this({
            userID: user ? user._id : undefined,
            createDate: new Date(),
            products: [],
            statusDate: new Date(),
            status: 'created'
        }).save();
    };

    schema.statics.setLinkOnUser = async function (token, user) {
        const payload = jwt.verify(token, Config.jwt.secret);
        await this.update(
            {_id: new mongoose.Types.ObjectId(payload.id)},
            {$set: {userID: new mongoose.Types.ObjectId(user._id)}}
        );
    };

    schema.methods.putInOrder = async function (productID, count) {
        let alwaysInOrder = false;
        this.products.forEach(item => {
            if (item._id.equals(productID)) {
                item.count = Math.max(count, 0);
                alwaysInOrder = true;
            }
        });

        if (alwaysInOrder) {
            this.markModified('products');
            await this.save();
            return;
        }

        const product = await db.product.findOne({_id: productID}, {__v: 0});
        if (!product)
            return 'Продукт не найден';

        this.products.push({count: Math.max(count, 0), _id: product._id});
        await this.save();
        return;
    };

    schema.methods.setStatus = async function (newStatus) {
        this.status = newStatus;
        await this.save();
    };

    schema.methods.cart = async function () {
        const counts = {};
        let sum = 0;
        let count = 0;

        const ids = this.products.map(item => {
            counts[item._id] = item.count;
            return item._id;
        });

        const productsList = await db.product.find({_id: {$in: ids}}, {__v: 0});
        const products = productsList.map(item => {
            let product = item.toObject();
            product.count = (counts[product._id] || 0);
            count += product.count;
            sum += product.count * product.price;
            return product;
        });
        return {products, count, sum};
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};