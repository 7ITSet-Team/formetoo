import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import Config from '@project/config';
import RPC from '@server/core/rpc';
import Renderer from '@server/core/renderer';

RPC.init();
const server = express();

const router = express.Router();
//static files
router.use(express.static(path.resolve('build', 'public'), {maxAge: '30d'}));
//react-app
router.get('*', Renderer);
//API handlers
router.use(cookieParser());
router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({limit: '50mb'}));
router.post('/api/', RPC.router);
server.use(router);

server.listen(Config.connection.port, error => {
    if (error) {
        return console.log('something bad happened', error);
    }
    console.log("listening on " + Config.connection.port + "...");
});
