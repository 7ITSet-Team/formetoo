import fs from 'fs';
import mongoose from 'mongoose';
import rimraf from 'rimraf';

const __modelName = 'media';
export default db => {
    const schema = new mongoose.Schema({
        url: {
            type: {},
            require: true
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
        if (isExist)
            if (data.changes) {
                const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
                if (!ok)
                    return {isSuccess: false};
            } else {
                const media = await this.getByID(data._id);

                if (Array.isArray(media.url)) {
                    const folder = media.url[0].match(/\/uploads\/(.*)\/(.*)/)[1];
                    return new Promise((resolve, reject) => {
                        rimraf(`build/public/uploads/${folder}`, async () => {
                            const cOk = (await db.category.removeMedia(media._id)).ok;
                            if (!cOk)
                                reject({isSuccess: false});
                            const mOk = (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
                            if (!mOk)
                                reject({isSuccess: false});
                            result.isSuccess = true;
                            resolve(result);
                        });
                    });
                } else {
                    fs.unlinkSync(`build/public${media.url}`);
                    const cOk = (await db.category.removeMedia(media._id)).ok;
                    if (!cOk)
                        return {isSuccess: false};
                    const mOk = (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
                    if (!mOk)
                        return {isSuccess: false};
                }
            }
        else {
            const insertedMedia = await this.create(data);
            if (Array.isArray(insertedMedia))
                result.ids = insertedMedia.map(item => item._id);
            else
                result._id = insertedMedia._id;
            if (!result.ids && !result._id)
                return {isSuccess: false};
        }
        result.isSuccess = true;
        return result;
    };

    schema.methods.getProducts = async function () {
        return await db.product.find({media: {$in: this._id}}, {__v: 0});
    };

    schema.methods.getCategories = async function () {
        return await db.category.find({img: this._id}, {__v: 0});
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};