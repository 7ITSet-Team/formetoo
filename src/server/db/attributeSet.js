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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'attribute'
        }]
    }, {collection: __modelName, autoIndex: false});

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0}).populate('attributes', '-__v');
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
        if (isExist) {
            if (set.changes) {
                const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(set._id)}, {$set: set.changes})).ok;
                if (!ok)
                    return false;
            } else {
                const ok = (await this.remove({_id: new mongoose.Types.ObjectId(set._id)})).ok;
                if (!ok)
                    return false;
            }
        } else {
            const insertedSet = await this.create(set);
            if (!insertedSet)
                return false;
        }
        return true;
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};