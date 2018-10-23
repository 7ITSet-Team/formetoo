import routes from './routes';

class RPC{
	constructor() {

	};

	static route(controller, action) {
		return (routes[controller] || {})[action];
	};
};

export default(req, res) => {
	console.log('===rpc===',req.url);
	try {
		const {controller, action, data} = req.body;
		const handler = RPC.route(controller, action);

		const answer = handler ? {...handler(data)} : {result: undefined, error: 'undefined handler'};
		res.json(answer);
	}catch{

	}
};