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
        },
        unit: String
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
        if (isExist)
            if (attribute.changes) {
                const query = {};
                if (attribute.changes.unit === '') {
                    query.$unset = {unit: ''};
                    delete attribute.changes.unit;
                }
                query.$set = attribute.changes;
                if (!Object.keys(query.$set).length)
                    delete query.$set;
                const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(attribute._id)}, query)).ok;
                if (!ok)
                    return false;
            } else {
                const attrOk = (await this.remove({_id: new mongoose.Types.ObjectId(attribute._id)})).ok;
                if (!attrOk)
                    return false;
                const setOk = (await db.attributeSet.removeAttribute(attribute)).ok;
                if (!setOk)
                    return false;
                const prodOk = (await db.product.removeAttribute(attribute)).ok;
                if (!prodOk)
                    return false;
            }
        else {
            const insertedAttribute = await this.create(attribute);
            if (!insertedAttribute)
                return false;
        }
        return true;
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};