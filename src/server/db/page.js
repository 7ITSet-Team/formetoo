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