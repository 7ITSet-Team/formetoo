import mongoose from 'mongoose';

const __modelName = 'role';
export default db => {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        alias: {
            type: String,
            required: true
        },
        permissions: [String]
    }, {collection: __modelName});

    schema.statics.getByName = async function (name) {
        return await this.findOne({name});
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

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};