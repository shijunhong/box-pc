
const path = require('path');
const webpack = require('webpack');

const commonConfig = require('./webpack.common.js');
const webpackMerge = require('webpack-merge');

const devConfig = {
	// 这里开发环境用hash 是因为和hot冲突
	output: {
		filename: '[name].[hash].js'
	},

	/*module: {
		rules: [{
			test: /\.css$/,
			use: ['style-loader', 'css-loader', 'postcss-loader']
		},{
			test: /\.less$/,
			use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
		}]
	},*/
	/*resolve: {
		alias: {
			pages: path.join(__dirname, 'src/pages')
		}
	},*/
	devtool: 'inline-source-map',
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('development')
			}
		})
	],

	devServer: {
		contentBase: path.join(__dirname, 'src'),
		historyApiFallback: true
	}
};

module.exports = webpackMerge(commonConfig, devConfig);
