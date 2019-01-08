const rimraf = require('rimraf');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const IconfontWebpackPlugin = require('iconfont-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fontGenerator = require('./font.build');
const nodeExternals = require('webpack-node-externals');
const nodemon = require('nodemon');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const ENV = process.env.NODE_ENV || 'production';//'development';

const _root = path.resolve();
const _project = path.join(_root, '/src');
const _front = path.join(_project, '/front');
const _server = path.join(_project, '/server');

const _shop = path.join(_front, '/shop');
const _account = path.join(_front, '/account');
const _common = path.join(_front, '/common');

const _frontEntry = path.join(_front, '/launcher.js');
const _serverEntry = path.join(_server, '/launcher.js');
const _initEntry = path.join(_project, '/init/init.js');
const _htmlTemplate = path.join(_front, '/index.ejs');

const _assets = path.join(_common, '/assets');
const _components = path.join(_common, '/components');
const _models = path.join(_common, '/models');
const _commonStyles = path.join(_common, '/styles');

const _build = path.join(_root, '/build');
const _output = path.join(_build, '/public');

const aliases = {
	'@assets': _assets,
	'@shop': _shop,
	'@account': _account,
	'@common': _common,
	"@components": _components,
    "@models": _models,
	"@front": _front,
	"@server": _server,
	"@project": _project
};

rimraf(_output, () => console.log(`=========DELETED FOLDER=========  ${_output}`));
fontGenerator(_commonStyles);

//=============Config
const config = {
	mode: ENV,
	context: _front,
	name: 'client',
	entry: _frontEntry,
	output: {
		path: _output,
		filename: '[hash].bundle.js',
		chunkFilename: '[hash].[name].bundle.js',
		publicPath: '/'
	},
	optimization: {
		minimize: (ENV === 'production')
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|non_npm_dependencies)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-react',
								['@babel/preset-env', {"targets": "> 0.25%, not dead"}]
							],
							plugins: [
								"@babel/plugin-transform-runtime",
								["@babel/plugin-proposal-decorators", {"legacy": true}],
								"@babel/plugin-proposal-class-properties",
								"@babel/plugin-syntax-dynamic-import",
								"@babel/plugin-syntax-import-meta",
								"@babel/plugin-proposal-json-strings"
							],
							cacheDirectory: false
						}
					}
				]
			},
			{
				test: /\.(eot|svg|ttf|woff)$/,
				use: [
					{
						loader: 'file-loader',
						query: {
							context: './',
							useRelativePath: false,
							outputPath: 'static/'
						}
					}
				]
			},
			{
				test: /\.less|css$/i,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader"
					},
					{
						loader: "postcss-loader",
						options: {
							plugins: loader => [
								autoprefixer({browsers: ['last 3 version', '> 3%', 'safari 5', 'ios 6', 'android 4']}),
								new IconfontWebpackPlugin(loader)
							]
						}
					},
					{
						loader: "less-loader"
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: _build + '/index.html',
			template: '!!ejs-compiled-loader!' + _htmlTemplate,
			//favicon: 'favicon.png',
		}),
		new MiniCssExtractPlugin({
			filename: '[hash].bundle.css',
			chunkFilename: '[hash].[name].bundle.css'
		}),
		new CopyWebpackPlugin([
			{
				context: _assets,
				from: {
					glob: "**/*",
					dot: true
				},
				to: _output
			},
			/*{
				context: _project,
				from: "support/robots.txt",
				to: _output
			},
			{
				context: _project,
				from: "support/sitemap.xml",
				to: _output
			},
			{
				context: _project,
				from: "assets/favicon.ico",
				to: _output
			}*/
		], {
			copyUnmodified: false
		}),
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: '../report.html',
			openAnalyzer: false
		})
	],
	resolve: {
		extensions: ['.js', '.jsx', '.css'],
		alias: aliases
	}
};

const serverConfig = {
	mode: ENV,
	name: 'server',
	target: 'node',
	externals: [nodeExternals()],
	entry: {
		server:_serverEntry,
		init:_initEntry
    },
	output: {
		path: _build,
		filename: '[name].js',
		publicPath: 'public/',
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|non_npm_dependencies)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-react',
								['@babel/preset-env', {"targets": "> 0.25%, not dead"}]
							],
							plugins: [
								"@babel/plugin-transform-runtime",
								["@babel/plugin-proposal-decorators", {"legacy": true}],
								"@babel/plugin-proposal-class-properties",
								"@babel/plugin-syntax-dynamic-import",
								"@babel/plugin-syntax-import-meta",
								"@babel/plugin-proposal-json-strings"
							],
							cacheDirectory: false
						}
					}
				]
			},
			{
				test: /\.(less|css|png|jpg|eot|svg|ttf|woff)$/,
				//loader: null
			}
		]
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: aliases,
	},
};

//=============Run build
let nodemonIsLaunched = false;
const compiler = webpack([config, serverConfig]);
const statsHandler = (err, stats) => {
	if (err) {
		console.log('webpack:build', err)
	}
	if ((ENV === 'development') && !nodemonIsLaunched) {
		nodemon({
			script: 'build/server.js',
			watch: 'build/server.js'
		}).on('restart', () => {
			process.env.NODEMON_STATUS = 'restarted';
		});
		nodemonIsLaunched = true;
	}
	//console.log(stats.toString('errors-only'));
	console.log(stats.toString({
		all: false,
		colors: true,
		errors: true,
		errorDetails: true,
		builtAt: true,
		warnings: true
	}))
};

if (ENV === 'development') {
	compiler.watch({}, statsHandler);
} else {
	compiler.run(statsHandler);
}