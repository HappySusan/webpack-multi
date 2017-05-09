var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
//定义了一些文件夹的路径
var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'app');
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');
var TEM_PATH = path.resolve(ROOT_PATH, 'templates');
/*
extract-text-webpack-plugin插件，
有了它就可以将你的样式提取到单独的css文件里，
妈妈再也不用担心样式会被打包到js文件里了。
 */
var ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
  //采用source-map的形式直接显示你出错代码的位置
  devtool: 'eval-source-map',
  devServer: {
    port: 6666,
    hot: true,
    inline: true,
    proxy: {//与后端联调使用，假定在本机他是类似http://localhost:5000/api/*这类的请求，现在添加配置让ajax请求可以直接proxy过去。
      '/api/*': {
          target: 'http://localhost:5000',
          secure: false
      }
    }
  },
  entry: {//项目的文件夹 可以直接用文件夹名称 默认会找index.js 也可以确定是哪个文件名字
    app: path.resolve(APP_PATH, 'index.js'),
    mobile: path.resolve(APP_PATH, 'mobile.js'),
    vendors: ['jquery'] //添加要打包在vendors里面的库
  },
  //输出的文件名 合并以后的js会命名为bundle.js
  output: {
    path: BUILD_PATH,
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        //配置css的抽取器、加载器。'-loader'可以省去
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader') 
      },
      {
        test: /\.jsx?$/,
        include: APP_PATH,
        enforce: "pre",
        loader: 'jshint-loader',
        options: {
          esnext: true//jshint校验时允许es6写法
        }
      },

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
 
  //添加我们的插件 会自动生成一个html文件
  plugins: [
    //这个使用uglifyJs压缩你的js代码
    new webpack.optimize.UglifyJsPlugin({minimize: true}),
    //把入口文件里面的数组打包成verdors.js
    new webpack.optimize.CommonsChunkPlugin({ 
      name: 'vendors', 
      filename: 'vendors.js' 
    }),
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

















// var webpack = require('webpack');
// var path = require('path');
// var AssetsPlugin = require('assets-webpack-plugin');
// var fs =  require('fs');
// var cheerio = require('cheerio');
// module.exports = {
//   // entry: './static/activity/lucky/js/index.js',
//   // context: path.resolve(__dirname, 'static'),
//   // entry: __dirname,
//   entry:{
//     lucky: "./static/activity/lucky/lucky.js"
//   },
//   output: {
//     path: path.resolve(__dirname, './dist'),
//     filename: '[name]/[hash].lucky.js',
//     publicPath: './page/'// 输出解析文件的目录，url 相对于 HTML 页面
//   },
//   module: {
//     loaders: [
//         // {
//         //   test: /\.jsx?$/,
//         //   exclude: /node_modules/,
//         //   loader: 'babel',
//         //   query: {presets: ['es2015','react']}
//         // },
//         {test: /\.css$/, loader: 'style-loader!css-loader'}
//     ]
//   },
//   plugins: [
//       // 其他插件
//       function (){
//         new AssetsPlugin({
//           filename: 'path/to/stats.json'
//         })
//       }
      
//       // function(){
//       //   this.plugin('done', stats => {
//       //       fs.readFile('./activity/lucky/lucky.html', (err, data) => {
//       //           const $ = cheerio.load(data);
//       //           $('script[src*=dest]').attr('src', 'dest/bundle.'+stats.hash+'.js');
//       //           fs.write('./activity/lucky/lucky.html', $.html(), err => {
//       //               !err && console.log('Set has success: '+stats.hash)
//       //           })
//       //       })
//       //   })
//       // }
//   ]
// }



//js加了hash之后引用名字的问题












// var webpack = require('webpack')

// module.exports = {
//   entry: './index.js',
//   output: {
//     path: __dirname,
//     filename: 'bundle.js'
//   },
//   module: {
//     loaders: [
//       {test: /\.css$/, loader: 'style-loader!css-loader'}
//     ]
//   },
//   plugins: [
//     new webpack.BannerPlugin('This file is created by nanjing')
//   ]
//   // resolve: { fallback: path.join(__dirname, "node_modules") },
//   // resolveLoader: { fallback: path.join(__dirname, "node_modules") }
// }