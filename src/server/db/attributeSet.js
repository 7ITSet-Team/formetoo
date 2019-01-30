import mongoose from 'mongoose';

const __modelName = 'attributeSet';
export default db => {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            unique: true,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        attributes: [{
            type: String,
            required: true
        }]
    }, {collection: __modelName, autoIndex: false});

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