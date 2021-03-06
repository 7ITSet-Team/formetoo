import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import Config from '@project/config';
import Routes from '@server/core/routes';

const __modelName = 'user';
export default db => {
    const schema = new mongoose.Schema({
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            unique: true,
            //required: true
        },
        name: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            required: true
        },
        role: String
    }, {collection: __modelName});

    /*schema.pre('save', function (next) {
        this.ID = this.ID || new mongoose.Types.ObjectId();
        next();
    });*/

    schema.statics.getByToken = async function (token) {
        const payload = jwt.verify(token, Config.jwt.secret);
        return await this.findOne({_id: new mongoose.Types.ObjectId(payload.id)}, {__v: 0});
    };

    schema.statics.getAll = async function () {
        return await this.find({}, {__v: 0, password: 0});
    };

    schema.statics.getHash = async function () {
        const users = await this.find({}, {__v: 0, password: 0});
        const hash = {};
        users.forEach(user => hash[user._id] = user);
        return hash;
    };

    schema.statics.getByID = async function (id) {
	    if (Array.isArray(id))
            return await this.find({_id: {$in: id}});
	    else
            return await this.findOne({_id: new mongoose.Types.ObjectId(id)});
    };

    schema.statics.getByEmail = async function (email) {
        email = email.toLowerCase();
        return await this.findOne({email});
    };

    schema.statics.getByPhone = async function (phone) {
        return await this.findOne({phone});
    };

    schema.statics.activateById = async function (id) {
        await this.update({_id: new mongoose.Types.ObjectId(id)}, {$set: {isActive: true}});
    };

    schema.methods.getPermissions = async function () {
        if (!this.role)
            return [];

        if (this.role === 'root') {
            const rootPermissions = Object.keys(Routes);
            rootPermissions.splice(rootPermissions.indexOf('guest'), 1);
            return rootPermissions;
        }

        const role = await db.role.getByName(this.role);
        if (!role)
            return [];

        return role.permissions || [];
    };

    schema.statics.update = async function (data) {
        const isExist = await this.findOne({_id: new mongoose.Types.ObjectId(data._id)});
        if (isExist) {
            if (data.changes) {
                const ok = (await this.updateOne({_id: new mongoose.Types.ObjectId(data._id)}, {$set: data.changes})).ok;
                if (!ok)
                    return {error: true}
            } else {
                const ok = (await this.remove({_id: new mongoose.Types.ObjectId(data._id)})).ok;
                if (!ok)
                    return {error: true}
            }
        } else {
            const newUser = await this.create(data);
            return {newUser, error: !newUser};
        }
        return {error: false};
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};