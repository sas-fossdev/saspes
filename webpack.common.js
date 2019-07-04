const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'js/saspowerschoolff': path.join(__dirname, 'src', 'js', 'saspowerschoolff.js'),
        'js/background': path.join(__dirname, 'src', 'js', 'background.js'),
        'ui/options': path.join(__dirname, 'src', 'ui', 'options.js'),
        'ui/historygrades': path.join(__dirname, 'src', 'ui', 'historygrades.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new CopyPlugin([
            { from: "src", to: '', ignore: ['*.js', 'manifest.json', 'manifest - chromium.json', '.eslintrc.json']}
        ])
    ],
    resolve: {
        extensions: ['.js']
    }
};
