module.exports = {
    mode: 'production',
    target: 'node',
    devtool: "source-map",
    externals: {
      "@actions/core": "commonjs @actions/core",
      "@actions/github": "commonjs @actions/github",
    }
};