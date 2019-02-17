import mongoose from 'mongoose';

import Parser from '@server/core/csv-json-parser';

const __modelName = 'product';
export default db => {
    const schema = new mongoose.Schema({
        categoryID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        code: {
            type: String,
            unique: true
        },
        name: {
            type: String,
            unique: true,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        media: [String],
        props: [{
            attribute: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            value: {
                type: {},
                required: true
            }
        }]
    }, {collection: __modelName});

    schema.statics.getBySlug = async function (slug) {
        return await this.findOne({slug}, {__v: 0});
    };

    schema.statics.getByID = async function (id) {
        if (Array.isArray(id))
            return await this.find({_id: {$in: id}}, {__v: 0});
        else {
            return await this.findOne({_id: id}, {__v: 0});
        }
    };

    schema.statics.getByCategoryID = async function (categoryID) {
        return await this.find({categoryID: new mongoose.Types.ObjectId(categoryID)}, {__v: 0});
    };

    schema.statics.removeAttribute = async function (data) {
        return this.updateMany(
            {},
            {$pull: {props: {attribute: data._id}}},
            {multi: true}
        );
    };

    schema.statics.removeCategory = async function (data) {
        return this.updateMany(
            {categoryID: new mongoose.Types.ObjectId(data._id)},
            {$set: {categoryID: (await db.category.getBySlug('root'))._id}}
        );
    };

    schema.statics.getAll = async function (options = {__v: 0}) {
        const products = await this.find({}, options);
        const attributeIDs = [];
        products.forEach(product => {
            const props = product.props;
            props.forEach(prop => (!attributeIDs.includes(prop.attribute) && attributeIDs.push(prop.attribute)));
        });
        const attributes = await db.attribute.getByID(attributeIDs);
        let attributesHash = {};
        attributes.forEach(attribute => attributesHash[attribute._id] = attribute);
        return products.map(product => ({
            ...product.toJSON(),
            props: (product.toJSON()).props.map(prop => ({...prop, attribute: attributesHash[prop.attribute]}))
        }));
    };

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        let ok;
        if (isExist)
            ok = data.changes
                ? (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok
                : (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
        else {
            await this.create(data);
            ok = 1;
        }
        return (ok === 1);
    };

    schema.statics.upload = async function (data) {
        if (data.type === 'csv') {
            const parsedData = Parser.csv2json(data.content);
            const validData = [];
            const errorRows = [];
            parsedData.forEach((item, index) => {
                const error = db[__modelName](item).validateSync();
                if (!error)
                    validData.push(item);
                else
                    errorRows.push(index + 2);
            });
            return {
                error: !(await this.create(validData)),
                errorRows
            };
        }
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};