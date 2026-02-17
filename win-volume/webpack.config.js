const path = require('path');

module.exports = [
    {
        mode: 'production',
        target: 'node',
        devtool: 'source-map',
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'main.js'
        }
    },
    {
        mode: 'production',
        target: 'node',
        devtool: 'source-map',
        entry: './src/post.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'post.js'
        }
    }
];
