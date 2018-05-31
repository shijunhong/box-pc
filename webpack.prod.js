
const path = require('path');
const webpack = require('webpack');


const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
/*const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin("assets/css/less.[contenthash:6].css");
const extractCss = new ExtractTextPlugin("assets/css/css.[contenthash:6].css");
*/
const commonConfig = require('./webpack.common.js');
const webpackMerge = require('webpack-merge');

const prodsConfg = {

	/*module: {
		rules: [{
			test: /\.css$/,
			// use: ['style-loader', 'css-loader']
			use: extractCss.extract({
				fallback: 'style-loader',
				use: [{
					loader: 'css-loader',
					options: {
						minimize: true //css压缩
					}
					
				}, 'postcss-loader'
				]
			}),
			//include: [path.join(__dirname, 'src/pages/user')]
		},{
			test: /\.less$/i,
			// use: ['style-loader', 'css-loader']
			use: extractLess.extract({
				fallback: 'style-loader',
				use: [
					{
						loader: 'css-loader',
						options: {
							minimize: true //css压缩
						}
						
					}, 'postcss-loader', 'less-loader'
				]
			})
		}]
	},*/
	/*resolve: {
		alias: {
			pages: path.join(__dirname, 'src/pages')
		}
	},*/
	devtool: 'cheap-module-source-map',

	plugins: [

		new UglifyJsPlugin({
			uglifyOptions: {
				output: {
					comments: false,
					beautify: false,
				},
				compress: {
					drop_console: true
					// drop_debugger  default true
				},
				warnings: false
			}
			
		}),
		// new webpack.optimize.UglifyJsPlugin(),
		
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),

		/*extractLess,
		extractCss,*/

		/*new ExtractTextPlugin({
			filename: '[name].[contenthash:6].css',
			allChunks: true
		})*/
	]
};

module.exports = webpackMerge(commonConfig, prodsConfg);