const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app : "./src/index.js",
  },
  mode: 'development',
  module:{
    rules:[
      {
        test:/\.sass/,
        use : ['style-loader','css-loader','sass-loader']
      }
    ]
  },
  devtool: "inline-source-map",
  devServer:{
    open: true,
    hot: true,
    compress: true
  },

  plugins:[
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      title: "index",
    }),
    new webpack.HotModuleReplacementPlugin()
  ],

  output: {
    filename: "[name][fullhash:8].js",
    path: path.resolve(__dirname,"/dist")
  }
}
