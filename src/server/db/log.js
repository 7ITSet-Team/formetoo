import mongoose from 'mongoose';

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
		logs.forEach(log => (usersHash[log.user] && newLogs.push({...(log.toJSON()), user: usersHash[log.user]})));
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