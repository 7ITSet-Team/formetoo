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
        media: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'media'
        }],
        props: [{
            attribute: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'attribute',
                required: true
            },
            value: {
                type: {},
                required: true
            }
        }]
    }, {collection: __modelName});

    schema.statics.getAll = async function (data = {}, options = {__v: 0}) {
        let {value: perPage} = await db.setting.getByName('pagination');
        perPage = Number(perPage) || 5;
        const result = {};
        result.products = await this
            .find((data.filter || {}), options)
            .sort(data.sort || {})
            .skip((perPage * data.page) - perPage)
            .limit(perPage)
            .populate('media', 'url')
            .populate('props.attribute', '-__v');
        result.pages = Math.ceil((await this.find((data.filter || {}), options)).length / perPage);
        return result;
    };

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

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        if (isExist)
            if (data.changes) {
                const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
                if (!ok)
                    return false;
            } else {
                const ok = (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
                if (!ok)
                    return false;
            }
        else {
            const insertedProduct = await this.create(data);
            if (!insertedProduct)
                return false;
        }
        return true;
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