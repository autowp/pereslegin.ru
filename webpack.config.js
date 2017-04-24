'use strict';

var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const prod = process.argv.indexOf('-p') !== -1;

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, "public"),
        compress: true,
        port: 9000
    },
    entry: {
        resume: './src/resume/index.js',
        slider: './src/slider/index.js'
    },
    resolve: {
        modules: ["./src", "node_modules"]
    },
    output: {
        path: __dirname + '/public',
        publicPath: '/',
        filename: 'js/[name]-[hash].js'
    },
    module: {
        rules: [
            { test: /bootstrap/, use: {
                loader: 'imports-loader',
                options: {'jQuery': 'jquery'}
            }}, {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.js$/, // include .js files
                enforce: "pre", // preload the jshint loader
                exclude: /node_modules|bower_components/,
                use:[
                    'jshint-loader',
                    {
                        loader: "jshint-loader", 
                        options: { 
                            camelcase: false, 
                            emitErrors: false, 
                            failOnHint: false
                        }
                    }
                ]
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader", 
                    use: "css-loader"
                })
            }, {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader", 
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }]
                })
            }, {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            prefix: 'img/',
                            limit: 1024,
                            hash: 'sha512',
                            digest: 'hex',
                            name: 'img/[hash].[ext]'
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            optipng: {
                                optimizationLevel: 5,
                            },
                            gifsicle: {
                                interlaced: false
                            }
                        }
                    }
                ]
            }, { 
                test: /.html$/,
                use: {
                    loader: "html-loader"
                }
            }, { 
                test: /.woff(2)?$/,
                use: {
                    loader: "url-loader",
                    options: {
                        name: 'fonts/[hash].[ext]', 
                        limit: 10000,
                        mimetype: 'application/font-woff'
                    }
                }
            }, { 
                test: /.(ttf|eot|svg)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: 'fonts/[hash].[ext]'
                    }
                }
            }
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                context: __dirname + '/src',
                from: __dirname + '/src/{a9234de10b68.html,index.html}',
                to: __dirname + '/public/'
            }
        ]),
        new ExtractTextPlugin({
            filename: 'css/[name]-[hash].css',
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            template: __dirname + '/src/resume/index.html',
            chunks: ['resume'],
            inject: true,
            filename: 'resume/index.html'
        }),
        new HtmlWebpackPlugin({
            template: __dirname + '/src/slider/index.html',
            chunks: ['slider'],
            inject: true,
            filename: 'slider/index.html'
        }),
    ]
};
