import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';

import App from '@front/app';

const path = require("path");
const fs = require("fs");

export default (req, res, next) => {
	console.log('===render===',req.url);
	//const filePath = path.resolve('build', 'public', 'index.html');
    const filePath = path.resolve('build', 'index.html');

	fs.readFile(filePath, 'utf8', (err, htmlData) => {
		if (err) {
			console.error('err', err);
			return res.status(404).end()
		}
		const context = {
			status: 200
		};
		const html = ReactDOMServer.renderToString(
			<StaticRouter basename='' location={req.url} context={context}>
				<App/>
			</StaticRouter>
		);
		//console.log('==================',html);

		return res.status(context.status).send(htmlData.replace('<div id="app"></div>', `<div id="app">${html}</div>`));
	});
}