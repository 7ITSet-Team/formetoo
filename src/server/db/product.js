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
            name: {
                type: String,
                unique: true,
                required: true
            },
            value: {}
        }]
    }, {collection: __modelName});

    schema.statics.getBySlug = async function (slug) {
        return await this.findOne({slug}, {__v: 0});
    };

    schema.statics.getByCategoryID = async function (categoryID) {
        return await this.find({categoryID: new mongoose.Types.ObjectId(categoryID)}, {__v: 0});
    };

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0});
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
            let errorRows = [];
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