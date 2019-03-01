import mongoose from 'mongoose';

const __modelName = 'category';
export default db => {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        img: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'media'
        },
        slug: {
            type: String,
            required: true
        }
    }, {collection: __modelName, autoIndex: false});

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0}).populate('img', 'url');
    };

    schema.statics.getBySlug = async function (slug) {
        return await this.findOne({slug}, {__v: 0});
    };

    schema.statics.getByID = async function (_id) {
        return await this.findOne({_id}, {__v: 0});
    };

    schema.statics.removeMedia = async function (id) {
        return this.updateMany({img: id}, {$unset: {img: ''}});
    };

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        if (isExist)
            if (data.changes) {
                if (data.changes.img === '') {
                    const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$unset: {img: ''}})).ok;
                    if (!ok)
                        return false;
                    delete data.changes.img;
                }
                if (Object.keys(data.changes).length) {
                    const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
                    if (!ok)
                        return false;
                }
            } else {
                const category = await this.findOne({_id: data._id});
                if (category.img !== '') {
                    const {isSuccess} = await db.media.update({_id: new mongoose.Types.ObjectId(category.img)});
                    if (!isSuccess)
                        return false
                }
                const ok = (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
                if (!ok)
                    return false;
                const pOk = (await db.product.removeCategory(data)).ok;
                if (!pOk)
                    return false;
            }
        else {
            const insertedCategory = await this.create(data);
            if (!insertedCategory)
                return false;
        }
        return true;
    };

    schema.methods.getProducts = async function () {
        return await db.product.getByCategoryID(this._id);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};