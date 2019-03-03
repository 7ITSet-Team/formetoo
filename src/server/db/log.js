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
    products: {
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
            ref: 'user',
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
        let filterByUser = {};
        if (data.filter && data.filter['user.email']) {
            filterByUser = await db.user.getByEmail(data.filter['user.email']);
            if (filterByUser) {
                data.filter.user = filterByUser._id;
                delete data.filter['user.email'];
            } else
                return {logs: [], pages: 0};
        }
        let {value: perPage} = await db.setting.getByName('pagination');
        perPage = Number(perPage) || 5;
        const logs = await this
            .find(data.filter || {}, {__v: 0})
            .skip((perPage * data.page) - perPage)
            .limit(perPage)
            .populate('user', '-__v');
        let newLogs = [];
        for (const log of logs)
            newLogs.push({
                ...(log.toJSON()),
                view: await ((views[log.method.controller] || {})[log.method.action] || (() => undefined))(log.method.data, db)
            });
        return {
            logs: newLogs,
            pages: Math.ceil((await this.find(data.filter || {})).length / perPage)
        };
    };

    schema.statics.insert = async function (controller, action, data) {
        const method = {controller, action, data: {...data}};
        delete method.data.userByToken;
        const user = data.userByToken._id;
        return await this.create({time: new Date(), user, method});
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