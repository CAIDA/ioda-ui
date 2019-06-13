// Load and configure Encore
const Encore = require('@symfony/webpack-encore');
Encore.configureRuntimeEnvironment('dev');

// Load the Webpack config
const webpackConfig = require("./webpack.config.js");
// Remove the entry property (this is handled by Karma)
delete webpackConfig.entry;

module.exports = function (config) {
    config.set({
        basePath: 'assets',
        frameworks: ['mocha', 'chai'],
        files: ['tests/**/*.js'],
        exclude: [],
        preprocessors: {
            "tests/**/*.js": ["webpack"]
        },
        webpack: webpackConfig,
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['ChromeHeadless', 'FirefoxHeadless'],
        singleRun: true,
        concurrency: Infinity,
        coverageReporter: {
            type: 'text'
        }
    });
};
