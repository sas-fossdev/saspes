const merge = require('webpack-merge');
const chromiumConfig = require('./webpack.chromium.js');

module.exports = merge(chromiumConfig, {
    mode: 'development',
    devtool: 'source-map'
});
