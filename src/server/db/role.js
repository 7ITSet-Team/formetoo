import mongoose from 'mongoose';

const __modelName = 'role';
export default db => {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        alias: String,
        permissions: [String]
    }, {collection: __modelName});

    schema.statics.getByName = async function (name) {
        return await this.findOne({name});
    };

    schema.statics.getAll = async function () {
        return await this.find({}, {_id: 0, __v: 0});
    };

    schema.statics.update = async function (role) {
        const {ok} = await this.updateOne({name: role.name}, role, {upsert: true});
        return ok === 1;
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};