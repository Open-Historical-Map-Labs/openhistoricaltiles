// Webpack configuration
// index.js6 is the entry point, and should require() the JS libs, .src.html template, and .src.scss stylesheet, as well as defining executable JS code
// SCSS files are compiled with SASS
// JS files run through Babel and JSHint
// HTML files have a [hash] replaced for cache-busting

const ExtractTextPlugin = require("extract-text-webpack-plugin");

var StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = {
    entry: {
        index: './mbgl-control-timeslider-entrypoint.js',
    },
    output: {
        path: __dirname + '/dist/',
        filename: 'mbgl-control-timeslider.js'
    },

    module: {
        loaders: [
            /*
             * Plain JS files
             * just kidding; Webpack already does those without any configuration  :)
             * but we do not want to lump them in with ES6 files: they would be third-party and then run through JSHint and we can't waste time linting third-party JS
             */

            /*
             * run .js6 files through Babel + ES-ENV via loader; lint and transpile into X.js
             * that's our suffix for ECMAScript 2015 / ES6 files
             */
            {
                test: /\.js$/,
                use: [
                    { loader: 'babel-loader', options: { presets: ['env'] } },
                    { loader: 'jshint-loader', options: { esversion: 6, emitErrors: true, failOnHint: true } }
                ],
                exclude: /node_modules/
            },

            /*
             * CSS files and also SASS-to-CSS all go into one bundled X.css
             */
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        { loader: 'css-loader', options: { minimize: true, sourceMap: true, url: false } }
                    ],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        { loader: 'css-loader', options: { minimize: true, sourceMap: true, url: false } },
                        { loader: 'sass-loader', options: { sourceMap:true } },
                    ],
                    fallback: 'style-loader'
                })
            }
        ]
    },


    /*
     * enable source maps, applicable to both JS and CSS
     */
    devtool: "nosources-source-map",

    /*
     * plugins for the above
     */
    plugins: [
        // CSS output from the CSS + LESS handlers above
        new ExtractTextPlugin({
            disable: false,
            filename: 'mbgl-control-timeslider.css'
        }),
        // for doing string replacements on files
        new StringReplacePlugin(),
    ],

    /*
     * plugins for the above
     */
    devServer: {
      contentBase: '.',
      port: 9000
    }
};
