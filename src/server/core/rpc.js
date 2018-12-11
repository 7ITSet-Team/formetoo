import routes from '@server/core/routes';
import mongoose from 'mongoose';

import Config from '@project/config';
import * as models from '@server/db';
import DBGenerator from '@server/generator/db-generator';

export default class RPC {
    constructor() {

    };

    static init(db) {
        mongoose.connect(Config.db.url, { autoIndex: false });
        mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
        mongoose.connection.once('open', () => {
            RPC.inited = true;
        });

        RPC.db = {};
        Object.keys(models).forEach(modelName => models[modelName](RPC.db));

        DBGenerator.init(RPC.db);
    };

    static route(controller, action) {
        return (routes[controller] || {})[action] || {};
    };


    static async auth(route, token) {
        if (route.visibility.includes('quest'))
            return {status: true, user: undefined};
        else if (!token) {
            return {status: false, user: undefined};
        } else {
            const user = await RPC.db.user.getByToken(token);
            let status = false;
            ((user && user.visibility) || []).forEach(item => status = status || route.visibility.includes(item));

            let permissionStatus = true;
            if (route.permission) {
                permissionStatus = false;
                if (user.role) {
                    const {permissions = []} = (await RPC.db.role.getByName(user.role) || {});
                    permissionStatus = permissionStatus && permissions.includes(route.permission);
                    user.permissions = permissions;
                }
            }
            return {status: status && permissionStatus, user}
        }
    };

    static async router(req, res) {
        if (!RPC.inited) {
            console.log('RPC is not initialized');
            return;
        }
        console.log('===rpc===', req.url, req.body);
        try {
            const {controller, action, data} = req.body;
            const token = req.cookies.JWT;
            const route = RPC.route(controller, action);
            const handler = route.handler;
            const {status, user} = await RPC.auth(route, token);
            data.userByToken = user;
            if (!handler)
                res.status(404).json({result: undefined, error: 'undefined handler'});
            else if (!status)
                res.status(401).json({result: undefined, error: 'access denied'});
            else if (handler && status)
                res.json(await handler(RPC.db, req, res, data) || {});
            else
                res.status(500).json({error: 'auth error'});
        } catch (e) {
            console.log(e);
            res.status(500).json({error: 'unknown error'});
        }
    }
};