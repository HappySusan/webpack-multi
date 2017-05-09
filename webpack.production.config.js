var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
//定义了一些文件夹的路径
var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'app');
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');

module.exports = {
  //项目的文件夹 可以直接用文件夹名称 默认会找index.js 也可以确定是哪个文件名字
  entry: APP_PATH,
  //输出的文件名 合并以后的js会命名为bundle.js
  output: {
    path: BUILD_PATH,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap'],
        include: APP_PATH
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
            loader: 'url-loader',//若超过40000，将图片转为base64
            options: {
              // name: 'assets/[name]-[hash:5].[ext]',
              loader: 'image-webpack-loader',//这个loader是针对图片的压缩
              limit:500
            }
        }
        // loader: 'url-loader?limit=40000'//若超过40000，将图片转为base64
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: APP_PATH,
        options: {
          presets: ['es2015']
        }
      }
    ]
  },
  //配置jshint的选项，支持es6的校验
  // jshint: {
  //   "esnext": true
  // },
  //添加我们的插件 会自动生成一个html文件
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Hello World app'
    }),
    new webpack.ProvidePlugin({//每个页面都引用了jq
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    })
  ]
  
};















