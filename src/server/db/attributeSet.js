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
        attributes: [mongoose.Schema.Types.ObjectId]
    }, {collection: __modelName, autoIndex: false});

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0});
    };

    schema.statics.getByID = async function (_id) {
        return await this.findOne({_id}, {__v: 0});
    };

    schema.statics.removeAttribute = async function ({_id}) {
        return await this.updateMany(
            {},
            {$pull: {attributes: {$in: _id}}},
            {multi: true}
        );
    };

    schema.statics.update = async function (set) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(set._id)});
        let ok;
        if (isExist)
            ok = set.changes
                ? (await this.updateOne({_id: new mongoose.Types.ObjectId(set._id)}, {$set: set.changes})).ok
                : (await this.remove({_id: new mongoose.Types.ObjectId(set._id)})).ok;
        else {
            const {_id} = await this.create(set);
            ok = _id ? 1 : 0;
        }
        return (ok === 1);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};