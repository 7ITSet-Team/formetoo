import mongoose from 'mongoose';

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
        return await this.find({}, {__v: 0})
    };

    schema.statics.update = async function (product) {
        const {ok} = await this.updateOne({_id: product._id}, {$set: product.changes});
        return ok === 1;
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};