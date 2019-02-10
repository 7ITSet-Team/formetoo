import mongoose from 'mongoose';

import Routes from '@server/core/routes';
import Config from '@project/config';
import * as Models from '@server/db';

export default class RPC {
	constructor() {

	};

	static init() {
		mongoose.connect(Config.db.url, {autoIndex: false});
		mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
		mongoose.connection.once('open', () => {
			RPC.inited = true;
		});

		RPC.db = {};
		Object.keys(Models).forEach(modelName => Models[modelName](RPC.db));
	};

	static async getRoute(token, controller, action, data) {
		const {permissions, user} = await RPC.auth(token);
		permissions.unshift('guest');
		let handler;
		let permissionScope;
		permissions.forEach(permission => {
			handler = ((Routes[permission] || {})[controller] || {})[action] || handler;
			if (handler)
				permissionScope = permission;
		});
        if (handler && (!['guest, client'].includes(permissionScope)) && (action !== 'list'))
			RPC.db.log.insert(controller, action, {...data, userByToken: user});
		return {user, handler};
	};


	static async auth(token) {
		const result = {
			permissions: [],
			user: undefined
		};
		if (!token)
			return result;

		result.user = await RPC.db.user.getByToken(token);
		if (!result.user)
			return result;

		result.permissions = await result.user.getPermissions();
		return result;
	};

	static async router(req, res) {
		if (!RPC.inited) {
			console.log('RPC is not initialized');
			return;
		}
		console.log('===rpc===', req.url, req.body);
		try {
			const {controller, action, data} = req.body;
			const {user, handler} = await RPC.getRoute(req.cookies.JWT, controller, action, data);
			data.userByToken = user;
			if (handler)
				res.json(await handler(RPC.db, req, res, data) || {});
			else
				res.status(404).json({result: undefined, error: 'undefined handler'});
		} catch (e) {
			console.log(e);
			res.status(500).json({error: 'unknown error'});
		}
	}
};