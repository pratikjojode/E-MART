const path = require("path");
const webpack = require("webpack");

module.exports = {
  resolve: {
    fallback: {
      buffer: require.resolve("buffer/"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  // Other configurations (entry, output, module, etc.) can go here
};
