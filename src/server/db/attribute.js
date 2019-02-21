import mongoose from 'mongoose';

const __modelName = 'attribute';
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
        type: {
            type: String,
            required: true
        },
        isTab: {
            type: Boolean,
            required: true
        }
    }, {collection: __modelName, autoIndex: false});

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0});
    };

    schema.statics.getByID = async function (_id) {
        if (Array.isArray(_id))
            return await this.find({_id: {$in: _id}}, {__v: 0});
        else
            return await this.findOne({_id}, {__v: 0});
    };

    schema.statics.update = async function (attribute) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(attribute._id)});
        let ok;
        if (isExist)
            if (attribute.changes)
                ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(attribute._id)}, {$set: attribute.changes})).ok;
            else {
                const rmAttrPromise = this.remove({_id: new mongoose.Types.ObjectId(attribute._id)});
                const rmAttrSetPromise = db.attributeSet.removeAttribute(attribute);
                const rmAttrProductPromise = db.product.removeAttribute(attribute);
                ok = ((await rmAttrPromise).ok && (await rmAttrSetPromise).ok && (await rmAttrProductPromise).ok) ? 1 : 0;
            }
        else {
            const {_id} = await this.create(attribute);
            ok = _id ? 1 : 0;
        }
        return (ok === 1);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};