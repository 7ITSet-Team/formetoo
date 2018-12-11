import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import Config from '@project/config';

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
            required: true
        },
        name: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        visibility: [String],
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
        return await this.findOne({_id: new mongoose.Types.ObjectId(payload.id)});
    };

    schema.statics.getByEmail = async function (email) {
        email = email.toLocaleLowerCase();
        return await this.findOne({email});
    };

    schema.methods.activateById = async function (id) {
        await this.update({_id: new mongoose.Types.ObjectId(id)}, {$set: {isActive: true}});
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};