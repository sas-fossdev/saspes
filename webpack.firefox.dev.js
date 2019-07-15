const merge = require('webpack-merge');
const firefoxConfig = require('./webpack.firefox.js');
const path = require('path');

module.exports = merge(firefoxConfig, {
    mode: 'development',
    devtool: 'source-map'
});
