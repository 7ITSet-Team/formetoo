import express from 'express';
import path from 'path';

import Config from '@project/config';
import RPC from './core/rpc';
import Renderer from './core/renderer';

const server = express();
const router = express.Router();
//static files
router.use(express.static(path.resolve('build', 'public'),{ maxAge: '30d' }));
//react-app
router.get('*', Renderer);
//API handlers
router.use(express.json());
router.post('/api/', RPC);
server.use(router);

server.listen(Config.port, error => {
	if (error) {
		return console.log('something bad happened', error);
	}
	console.log("listening on " + Config.port + "...");
});