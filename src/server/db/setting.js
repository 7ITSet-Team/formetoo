import mongoose from 'mongoose';

const __modelName = 'setting';
export default db => {
    const schema = new mongoose.Schema({
        isPrivate: {
            type: Boolean,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    }, {collection: __modelName});

    schema.statics.getAll = async function () {
        return await this.find({isPrivate: false}, {__v: 0});
    };

    schema.statics.update = async function (data) {
        const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
        return (ok === 1);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};