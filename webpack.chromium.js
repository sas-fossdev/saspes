const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new CopyPlugin([
            { from: path.join(__dirname, 'src', 'manifest - chromium.json'), to: 'manifest.json'}
        ])
    ]
});