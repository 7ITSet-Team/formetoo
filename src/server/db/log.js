import mongoose from 'mongoose';

import {logView as productsUpdateView} from '@server/controllers/products/update';
import {logView as setsUpdateView} from '@server/controllers/attribute-sets/update';
import {logView as attributesUpdateView} from '@server/controllers/attributes/update';
import {logView as categoriesUpdateView} from '@server/controllers/categories/update';
import {logView as mediaUpdateView} from '@server/controllers/media/update';
import {logView as pagesUpdateView} from '@server/controllers/pages/update';
import {logView as rolesUpdateView} from '@server/controllers/roles/update';
import {logView as settingsUpdateView} from '@server/controllers/settings/update';

const views = {
    'products': {
        'update': productsUpdateView
    },
    media: {
        'update': mediaUpdateView
    },
    attributes: {
        'update': attributesUpdateView
    },
    'attribute-sets': {
        'update': setsUpdateView
    },
    roles: {
        'update': rolesUpdateView
    },
    categories: {
        'update': categoriesUpdateView
    },
    pages: {
        'update': pagesUpdateView
    },
    settings: {
        'update': settingsUpdateView
    }
};

const __modelName = 'log';
export default db => {
    const schema = new mongoose.Schema({
        time: {
            type: Date,
            required: true
        },
        user: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        method: {
            controller: {
                type: String,
                required: true
            },
            action: {
                type: String,
                required: true
            },
            data: {
                type: {},
                required: true
            }
        }
    }, {collection: __modelName, autoIndex: false});

    schema.statics.getAll = async function (data) {
        let logs = await this.find({}, {__v: 0});
        let filterByUser;

        if (data.filter) {
            if (data.filter['time.after']) {
                data.filter.time = {...(data.filter.time || {}), $gte: data.filter['time.after']};
                delete data.filter['time.after'];
            }
            if (data.filter['time.before']) {
                data.filter.time = {...(data.filter.time || {}), $lte: data.filter['time.before']};
                delete data.filter['time.before'];
            }
            filterByUser = data.filter['user.email'];
            if (data.filter['user.email'])
                delete data.filter['user.email'];
            logs = await this.find(data.filter, {__v: 0});
        } else
            logs = await this.find({}, {__v: 0});

        const userIDs = [];
        logs.forEach(log => (!userIDs.includes(log.user)) && userIDs.push(log.user));

        let users;

        if (filterByUser)
            users = await db.user.getByID(userIDs, {email: filterByUser});
        else
            users = await db.user.getByID(userIDs);

        const usersHash = {};
        users.forEach(user => usersHash[user._id] = user);

        let newLogs = [];
        for (const log of logs) {
            if (usersHash[log.user])
                newLogs.push({
                    ...(log.toJSON()),
                    user: usersHash[log.user],
                    view: await ((views[log.method.controller] || {})[log.method.action] || (() => undefined))(log.method.data, db)
                });
        }
        return newLogs;
    };

    schema.statics.insert = async function (controller, action, data) {
        const method = {controller, action, data: {...data}};
        delete method.data.userByToken;
        const user = data.userByToken._id;
        await this.create({time: new Date(), user, method});
    };

    schema.statics.deleteAll = async function () {
        return await this.remove({});
    };

    schema.statics.update = async function (data) {
        const ok = (await this.remove({_id: {$in: data.ids}})).ok;
        return (ok === 1);
    };

    schema.set('autoIndex', false);
    db[__modelName] = mongoose.model(__modelName, schema);
};