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

    schema.statics.getByID = async function (ids) {
        return await this.find({_id: {$in: ids}}, {__v: 0});
    };

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        let ok;
        if (isExist)
            if (data.changes)
                ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
            else {
                const rmAttrPromise = this.remove({_id: new mongoose.Types.ObjectId(data._id)});
                const rmAttrSetPromise = db.attributeSet.removeAttribute(data);
                const rmAttrProductPromise = db.product.removeAttribute(data);
                ok = ((await rmAttrPromise).ok && (await rmAttrSetPromise).ok && (await rmAttrProductPromise).ok)
                    ? 1
                    : undefined;
            }
        else {
            await this.create(data);
            ok = 1;
        }
        return (ok === 1);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};