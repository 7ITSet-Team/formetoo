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
        permissions: [{
            type: String,
            required: true
        }]
    }, {collection: __modelName});

    schema.statics.getByName = async function (name) {
        return await this.findOne({name});
    };

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0});
    };

    schema.statics.getByID = async function (_id) {
        return await this.findOne({_id}, {__v: 0});
    };

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        if (isExist)
            if (data.changes) {
                const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
                if (!ok)
                    return false;
            } else {
                const ok = (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
                if (!ok)
                    return false;
            }
        else {
            const insertedRole = await this.create(data);
            if (!insertedRole)
                return false;
        }
        return true;
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};