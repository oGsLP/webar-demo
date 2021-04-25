const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const outputPath = path.resolve(__dirname, 'dist');

module.exports = {
    entry: {
        index: './src/views/index/index.js',
        interact: './src/views/interact/index.js',
        scan: './src/views/scan/index.js',
        paint: './src/views/paint/index.js',
        wash: './src/views/wash/index.js',
        share: './src/views/share/index.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: outputPath
    },
    devServer: {
        contentBase: outputPath,
        compress: true,
        port: 9000,
        https: true
    },
    devtool: 'inline-source-map',
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
        minimizer: [
            new UglifyJsPlugin(),
            new OptimizeCssAssetsWebpackPlugin()
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/views/index/index.html',
            hash: true
        }),
        new HtmlWebpackPlugin({
            filename: 'interact.html',
            template: './src/views/interact/index.html',
            hash: true
        }),
        new HtmlWebpackPlugin({
            filename: 'paint.html',
            template: './src/views/paint/index.html',
            hash: true
        }),
        new HtmlWebpackPlugin({
            filename: 'scan.html',
            template: './src/views/scan/index.html',
            hash: true
        }), new HtmlWebpackPlugin({
            filename: 'share.html',
            template: './src/views/share/index.html',
            hash: true
        }),
        new HtmlWebpackPlugin({
            filename: 'wash.html',
            template: './src/views/wash/index.html',
            hash: true
        }),
        new ProgressBarPlugin(),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            outputPath: 'img/',
                            limit: 8 * 1024
                        }
                    }
                ]
            },
            {
                test: /\.(gltf|plb|obj|mtl)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            outputPath: 'objs/',
                        }
                    }
                ]
            },
            // {
            //     test: /.js$/,
            //     exclude: /node_modules/,
            //     use: ['eslint-loader'],
            //     enforce: 'pre'
            // },
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            ['@babel/plugin-proposal-decorators', {'legacy': true}],
                            ['@babel/plugin-proposal-class-properties', {'loose': true}]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader'
                ]
            }
        ]
    }
};
