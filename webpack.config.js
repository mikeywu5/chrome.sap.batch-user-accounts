const path = require("path");

module.exports = {
  mode: "development",
  devtool: false,
  entry: {
    popup: "./popup.js",
    content: "./content.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, ""),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
};
