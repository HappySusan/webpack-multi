var glob = require('glob');
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'static/activity');
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');
var TEM_PATH = path.resolve(ROOT_PATH, 'templates');
/*
extract-text-webpack-plugin插件，
有了它就可以将你的样式提取到单独的css文件里，
妈妈再也不用担心样式会被打包到js文件里了。
 */

var ExtractTextPlugin = require('extract-text-webpack-plugin');

function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, basename, pathname, extname;

    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = path.join(dirname, basename);
        pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] = ['./' + entry];
    }
    return entries;
}

var entries = getEntry('static/***/**/*.js', 'static/');
var chunks = Object.keys(entries);

var config = {
  devtool: 'eval-source-map',//采用source-map的形式直接显示你出错代码的位置
  devServer: {
    port: 9090,
    hot: false,
      inline: true,
      // contentBase: '/page/',
      watchContentBase: true,
      proxy: {//与后端联调使用，假定在本机他是类似http://localhost:5000/api/*这类的请求，现在添加配置让ajax请求可以直接proxy过去。
        '/api/*': {
          target: 'http://localhost:5000',
          secure: false
      }
    }
  },
  entry: entries,
  output: {
    path: BUILD_PATH,
          // publicPath: '/page/',
          filename: 'views/[name].js',
          chunkFilename: 'views/[id].chunk.js?[chunkhash]'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) //配置css的抽取器、加载器。'-loader'可以省去
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
        loader: ExtractTextPlugin.extract('css-loader!sass-loader'), 
        include: APP_PATH
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
            loader: 'url-loader',//若超过40000，将图片转为base64
            options: {
              loader: 'image-webpack-loader',//这个loader是针对图片的压缩
              limit:500
            }
        }
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
  plugins: [
    //这个使用uglifyJs压缩你的js代码
    new webpack.optimize.UglifyJsPlugin({minimize: true}),
    //把入口文件里面的数组打包成verdors.js
    new webpack.optimize.CommonsChunkPlugin({ 
      name: 'vendors', 
      filename: 'vendors.js' 
    }),
    new ExtractTextPlugin('views/[name]-[contenthash].css'),
    new webpack.ProvidePlugin({//每个页面都引用了jq
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    })
  ]
}

var pages = Object.keys(getEntry('templates/**/*.html', 'templates/'));
console.log(pages)
console.log(entries)
pages.forEach(function(pathname) {
    var conf = {
        filename: '../build/views/' + pathname + '.html', //生成的html存放路径，相对于path
        template: 'templates/' + pathname + '.html', //html模板路径
        inject: false,    //js插入的位置，true/'head'/'body'/false
        /*
        * 压缩这块，调用了html-minify，会导致压缩时候的很多html语法检查问题，
        * 如在html标签属性上使用{{...}}表达式，所以很多情况下并不需要在此配置压缩项，
        * 另外，UglifyJsPlugin会在压缩代码的时候连同html一起压缩。
        * 为避免压缩html，需要在html-loader上配置'html?-minimize'，见loaders中html-loader的配置。
         */
        // minify: { //压缩HTML文件
        //     removeComments: true, //移除HTML中的注释
        //     collapseWhitespace: false //删除空白符与换行符
        // }
    };
    if (pathname in entries) {
        // conf.favicon = 'src/imgs/favicon.ico';
        conf.inject = 'body';
        conf.chunks = ['vendors', pathname];//引入特定的js
        conf.hash = true;
    }
    config.plugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = config;
