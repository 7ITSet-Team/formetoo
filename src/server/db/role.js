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

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};