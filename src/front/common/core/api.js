const axios = require('axios');

export default class API {
	constructor() {
		axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
		axios.defaults.headers.post['Content-Type'] = 'application/json';
	};

	static async request(controller = '', action = '', data = {}) {
		try {
			const response = await axios.post('/api', {
				controller,
				action,
				data
			});
			return {error: response.data.error, data: response.data.result};
		} catch (error) {
			return {error, data: undefined};
		}
	};
};