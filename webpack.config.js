const HtmlWebPackPlugin = require('html-webpack-plugin');

const app = {
	mode: 'development',
	entry: './src/index.js',
	stats: {
		modulesSort: 'size',
		modulesSpace: 70,
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.html$/,
				use: ['html-loader'],
			},
			{
				test: /\.(css|scss)$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
			{
				test: /\.(png|svg)$/,
				use: ['file-loader'],
			},
		],
	},
	output: {
		path: __dirname + '/docs',
		filename: 'athosSnapiExplorer.js',
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: './public/index.html',
			favicon: './public/favicon.svg',
		}),
	],
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			react: 'preact/compat',
			'react-dom/test-utils': 'preact/test-utils',
			'react-dom': 'preact/compat',
		},
	},
	devtool: 'source-map',
	devServer: {
		port: 3000,
	},
};

module.exports = app;
