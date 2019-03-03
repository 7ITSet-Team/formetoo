import mongoose from 'mongoose';

const __modelName = 'page';
export default db => {
    const schema = new mongoose.Schema({
        slug: {
            type: String,
            unique: true
        },
        name: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String,
            unique: true
        },
        content: {
            type: String
        },
        position: {
            type: Number,
            required: true
        },
        inMainMenu: {
            type: Boolean,
            required: true
        }
    }, {collection: __modelName});

    schema.statics.getMainMenu = async function () {
        return await this.find({}, {_id: 0, slug: 1, name: 1}, {sort: {position: 1}});
    };

    schema.statics.getBySlug = async function (slug) {
        return await this.findOne({slug}, {_id: 0, __v: 0, position: 0, name: 0, slug: 0});
    };

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0})
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
                    return false
            }
        else {
            const insertedPage = await this.create(data);
            if (!insertedPage)
                return false;
        }
        return true;
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};