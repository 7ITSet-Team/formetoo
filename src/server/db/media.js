import fs from 'fs';
import mongoose from 'mongoose';

const __modelName = 'media';
export default db => {
    const schema = new mongoose.Schema({
        url: {
            type: String,
            require: true,
            unique: true
        }
    }, {collection: __modelName, autoIndex: false});

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0});
    };

    schema.statics.getByID = async function (ids) {
        if (Array.isArray(ids))
            return await this.find({_id: {$in: ids}}, {__v: 0});
        else
            return await this.findOne({_id: ids}, {__v: 0});
    };

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        const result = {};
        let ok;
        if (isExist)
            if (data.changes)
                ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
            else {
                const media = await this.getByID(data._id);
                fs.unlinkSync(`build/public${media.url}`);
                const categoriesOk = (await db.category.removeMedia(media._id)).ok;
                const mediaOk = (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
                if (categoriesOk && mediaOk)
                    ok = 1;
            }
        else {
            const insertedData = await this.create(data);
            if (Array.isArray(insertedData))
                result.ids = insertedData.map(item => item._id);
            else
                result._id = insertedData._id;
            if (result.ids || result._id)
                ok = 1;
        }
        result.isSuccess = (ok === 1);
        return result;
    };

    schema.methods.getProducts = async function () {
        return await db.product.getByCategoryID(this._id);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};