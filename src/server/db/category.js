import mongoose from 'mongoose';

const __modelName = 'category';
export default db => {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true
        },
        img: String,
        slug: {
            type: String,
            required: true,
            unique: true
        }
    }, {collection: __modelName, autoIndex: false});

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0});
    };

    schema.statics.getBySlug = async function (slug) {
        return await this.findOne({slug}, {__v: 0});
    };

    schema.statics.removeMedia = async function (id) {
        return this.updateMany({img: id}, {$set: {img: ''}});
    };

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        let ok;
        if (isExist)
            if (data.changes)
                ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
            else {
                const category = await this.findOne({_id: data._id});
                if (category.img !== '') {
                    const mediaOk = (await db.media.update({_id: new mongoose.Types.ObjectId(category.img)})).isSuccess;
                    if (!mediaOk)
                        return false
                }
                const rmCatPromise = this.remove({_id: new mongoose.Types.ObjectId(data._id)});
                const rmCatProductPromise = db.product.removeCategory(data);
                ok = ((await rmCatPromise).ok && (await rmCatProductPromise).ok) ? 1 : 0;
            }
        else {
            const {_id} = await this.create(data);
            ok = _id ? 1 : 0;
        }
        return (ok === 1);
    };

    schema.methods.getProducts = async function () {
        return await db.product.getByCategoryID(this._id);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};