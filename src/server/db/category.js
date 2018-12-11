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
        return await this.find({}, {_id: 0, __v: 0});
    };

    schema.statics.getBySlug = async function (slug) {
        return await this.findOne({slug}, { __v: 0});
    };

    schema.methods.getProducts = async function () {
        return await db.product.getByCategoryID(this._id);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};