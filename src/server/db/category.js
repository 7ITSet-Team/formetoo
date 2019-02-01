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
        return await this.findOne({slug}, { __v: 0});
    };

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        let ok;
        if (isExist)
            if (data.changes)
                ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
            else {
                const categoryOk = (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
                const productOk = (await db.product.removeCategory(data)).ok;
                ok = (categoryOk && productOk) ? 1 : undefined;
            }
        else {
            await this.create(data);
            ok = 1;
        }
        return (ok === 1);
    };

    schema.methods.getProducts = async function () {
        return await db.product.getByCategoryID(this._id);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};