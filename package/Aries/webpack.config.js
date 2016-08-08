var webpack = require('webpack')
var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')
var _ = require('underscore')
var autoprefixer = require('autoprefixer')
var LiveReloadPlugin = require('webpack-livereload-plugin')
var env = require('./src/env')

var option = process.argv.slice(2)
var isProduction = option[0] === '-p'

// 删除 build 目录，防止开发模式下读取以及线上模式中的文件累积
rimraf.sync('./build')

var config = {
  entry: {
    app: path.join(__dirname, 'src')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name]' + (isProduction ? '.[hash]' : '') + '.js',
    chunkFilename: '[id]' + (isProduction ? '.[hash]' : '') + '.js',
    //静态资源全路径
    //publicPath: ((isProduction ? env.basePath : '') + '/build/').replace(/\/\//, '/')
    publicPath: ((isProduction ? env.basePath : '') + '/static/aries/').replace(/\/\//, '/')
  },
  module: {
    noParse: [],
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ["es2015", "stage-0", "react"],
        plugins: ['transform-runtime']
      }
    }, {
      test: /\.css$/,
      loader: 'style!css!postcss'
    }, {
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg)(\?v=[\d\.]+)?$/,
      loader: 'file?name=files/[hash].[ext]'
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.less$/,
      loader: 'style!css!less'
    }]
  },
  postcss: [autoprefixer({ browsers: ['last 3 versions'] })],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      public: path.join(__dirname, 'src/public'),
      bfd: 'bfd-ui/lib'
    }
  },
  plugins: []
}

if (isProduction) {
  config.plugins.push(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }))
} else {
  config.plugins.push(new LiveReloadPlugin({
    appendScriptTag: true
  }))
}

_.templateSettings = {
  evaluate:    /<#([\s\S]+?)#>/g,
  interpolate: /<#=([\s\S]+?)#>/g
}

// 动态生成开发、线上环境下的模板文件
config.plugins.push(function() {
  this.plugin('done', function(statsData) {
    var stats = statsData.toJson()
    var templateFile = 'index.tpl'
    var template = fs.readFileSync(path.join(__dirname, templateFile), 'utf8')

    template = _.template(template)({
      publicPath: config.output.publicPath,
      isProduction: isProduction,
      hash: isProduction ? stats.hash : ''
    })
    fs.writeFileSync(path.join(__dirname, 'index.' + (isProduction ? 'jsp' : 'ejs')), template)
  })
})

module.exports = config
