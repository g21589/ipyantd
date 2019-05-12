var path = require('path');
var version = require('./package.json').version;

// Custom webpack rules are generally the same for all webpack bundles, hence
// stored in a separate local variable.
var rules = [{
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
}, {
    test: /\.less$/,
    use: [{
        loader: 'style-loader',
    }, {
        loader: 'css-loader', // translates CSS into CommonJS
    }, {
        loader: 'less-loader', // compiles Less to CSS
        options: {
            javascriptEnabled: true,
            /*
            modifyVars: {
                //'@primary-color': '#42A5F5',
                '@font-size-base': '12px',
                '@border-radius-base': '2px',
                '@line-height-base': 1.0,
                '@padding-lg': '16px',
                '@padding-md': '12px',
                '@padding-sm': '8px',
                '@padding-xs': '6px',
                '@form-item-margin-bottom': '16px',
                '@btn-height-base': '28px',
                '@checkbox-size': '16px',
                '@radio-size': '16px',
                '@input-height-base': '24px',
                '@input-height-lg': '32px',
                '@input-height-sm': '16px',
                '@modal-body-padding': '8px',
                '@card-head-padding': '4px',
                '@card-inner-head-padding': '4px',
                '@card-padding-base': '8px',
                '@switch-height': '16px',
                '@switch-sm-height': '12px',
                '@drawer-header-padding': '8px 16px',
                '@drawer-body-padding': '8px'
            }
            */
        }
    }]
}, {
    test: /\.(woff|woff2|eot|ttf|svg)$/,
    loader: 'file?name=fonts/[name].[ext]'
}, {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
        loader: "babel-loader"
    }
}]


module.exports = [
    {// Notebook extension
        //
        // This bundle only contains the part of the JavaScript that is run on
        // load of the notebook. This section generally only performs
        // some configuration for requirejs, and provides the legacy
        // "load_ipython_extension" function which is required for any notebook
        // extension.
        //
        entry: './lib/extension.js',
        output: {
            filename: 'extension.js',
            path: path.resolve(__dirname, '..', 'ipyantd', 'static'),
            libraryTarget: 'amd'
        }
    },
    {// Bundle for the notebook containing the custom widget views and models
        //
        // This bundle contains the implementation for the custom widget views and
        // custom widget.
        // It must be an amd module
        //
        entry: './lib/index.js',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, '..', 'ipyantd', 'static'),
            libraryTarget: 'amd'
        },
        devtool: 'source-map',
        module: {
            rules: rules
        },
        externals: ['@jupyter-widgets/base']
    },
    {// Embeddable ipyantd bundle
        //
        // This bundle is generally almost identical to the notebook bundle
        // containing the custom widget views and models.
        //
        // The only difference is in the configuration of the webpack public path
        // for the static assets.
        //
        // It will be automatically distributed by unpkg to work with the static
        // widget embedder.
        //
        // The target bundle is always `dist/index.js`, which is the path required
        // by the custom widget embedder.
        //
        entry: './lib/embed.js',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'amd',
            publicPath: 'https://unpkg.com/ipyantd@' + version + '/dist/'
        },
        devtool: 'source-map',
        module: {
            rules: rules
        },
        externals: ['@jupyter-widgets/base']
    }
];
