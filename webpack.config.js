const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const Encore = require('@symfony/webpack-encore');

Encore
    // directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // public path used by the web server to access the output path
    .setPublicPath('/build')
    // only needed for CDN's or sub-directory deploy
    //.setManifestKeyPrefix('build/')

    // enable hash in file name to force cache busting
    .enableVersioning()

    /*
     * ENTRY CONFIG
     *
     * Add 1 entry for each "page" of your app
     * (including one that's included on every page - e.g. "app")
     */
    /* TODO: figure out which entries we want here */
    .addEntry('ioda', ['babel-polyfill', './assets/js/Ioda/index.js'])

    // shim to webpackify the horribly old jquery BBQ plugin
    .addLoader({
        test: require.resolve('jquery2-bbq'),
        loader: 'exports-loader?jQuery.bbq!imports-loader?jQuery=jquery,this=>window'
    })

    // shim for jstree to inject jquery
    .addLoader({
        test: require.resolve('jstree'),
        loader: 'imports-loader?jQuery=jquery'
    })

    // boostrap-select
    .addLoader({
        test: require.resolve('bootstrap-select/dist/js/bootstrap-select'),
        loader: 'imports-loader?jQuery=jquery'
    })

    // bootstrap
    .addLoader({
        test: require.resolve('bootstrap/dist/js/bootstrap'),
        loader: 'imports-loader?jQuery=jquery'
    })

    // yaml-loader
    .addLoader({
        test: require.resolve('yaml-loader'),
        loader: 'yaml-loader',
    })
    .addRule({
        test: /\.ya?ml$/,
        use: 'yaml-loader'
    })

    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()
    //.enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    // enables React support
    .enableReactPreset()

    // enables Sass/SCSS support
    //.enableSassLoader()

    // uncomment if you use TypeScript
    //.enableTypeScriptLoader()

    // uncomment if you're having problems with a jQuery plugin
    //.autoProvidejQuery()

    .configureBabel(function (babelConfig) {
        babelConfig.plugins.push('transform-class-properties');
        babelConfig.plugins.push('syntax-dynamic-import');
        babelConfig.plugins.push('transform-object-rest-spread');
        babelConfig.plugins.push('istanbul');
    })
;

let webpackConfig = Encore.getWebpackConfig();

webpackConfig.resolve.alias = {
    // hax to get daterangepicker to work correctly
    'jquery': require.resolve('jquery'),

    // convenience for accessing our local static assets
    'css': path.resolve(__dirname, './assets/css/'),
    'images': path.resolve(__dirname, './assets/images/'),

    // convenience for accessing our top-level modules
    'utils': path.resolve(__dirname, './assets/js/utils/'),
    'Config': path.resolve(__dirname, './assets/js/config/'),
    'ioda/css': path.resolve(__dirname, './assets/css/Ioda/'),
    'ioda': path.resolve(__dirname, './assets/js/Ioda/'),
};

webpackConfig.plugins.push(
    new CopyWebpackPlugin([
        { from: './assets/images/logos/', to: 'images/'}
    ])
);


webpackConfig.plugins.push(
    new Dotenv({
        path: './.env.local',
    })
);

module.exports = webpackConfig;
