'use strict';

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const prod = process.argv.indexOf('-p') !== -1;

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9000
    },
    entry: {
        index: './src/index.js',
        resume: './src/resume/index.js',
        slider: './src/slider/index.js'
    },
    resolve: {
        modules: ["./src", "node_modules"]
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'js/[name]-[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use:[
                    'babel-loader', 'eslint-loader'
                ],
                exclude: /node_modules|bower_components/
            }, {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }, {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', "less-loader"]
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
        new FaviconsWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    context: __dirname + '/src',
                    from: __dirname + '/src/a9234de10b68.html',
                    to: __dirname + '/dist/'
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name]-[hash].css',
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            template: __dirname + '/src/index.html',
            chunks: ['index'],
            inject: true,
            filename: 'index.html'
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
