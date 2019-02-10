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

	schema.statics.getAll = async function () {
		const logs = await this.find({}, {__v: 0});
		const userIDs = [];
		logs.forEach(log => (!userIDs.includes(log.user)) && userIDs.push(log.user));
		const users = await db.user.getByID(userIDs);
		const usersHash = {};
		users.forEach(user => usersHash[user._id] = user);
		return logs.map(log => ({...(log.toJSON()), user: usersHash[log.user]}));
	};

	schema.statics.insert = async function (controller, action, data) {
		const method = {controller, action, data: {...data}};
		delete method.data.userByToken;
		const user = data.userByToken._id;
		await this.create({time: new Date(), user, method});
	};

	schema.statics.delete = async function (data) {
		return await this.remove({_id: new mongoose.Types.ObjectId(data._id)});
	};

	schema.set('autoIndex', false);
	db[__modelName] = mongoose.model(__modelName, schema);
};