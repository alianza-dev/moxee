var webpack = require('webpack');
var _ = require('lodash');
var path = require('path');
var packageJson = require('../package.json');
module.exports = function getConfig(context) {
  /* jshint maxcomplexity:7 */
  context = context || 'dev';
  var dev = context === 'dev';
  var test = context === 'test';
  var prod = context === 'prod';

  var plugins = {
    commonPre: [
    ],
    dev: [],
    prod: [
      new webpack.DefinePlugin({
        ON_DEV: false,
        ON_PROD: true,
        ON_TEST: false
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ],
    commonPost: [
      new webpack.BannerPlugin(getBanner(), {raw: true})
    ]
  };
  plugins.test = plugins.prod;

  return {
    entry: './index.js',
    output: {
      filename: prod ? 'moxee.min.js' : 'moxee.js',
      path: here('dist'),
      library: 'moxee',
      libraryTarget: 'umd',
      pathinfo: dev
    },

    context: here('src'),

    stats: {
      colors: true,
      reasons: true
    },

    devtool: prod ? 'source-map' : 'inline-source-map',

    plugins: _.filter(_.union(
      plugins.commonPre, plugins[context], plugins.commonPost
    )),

    resolve: {
      extensions: ['', '.js']
    },

    resolveLoader: {
      modulesDirectories: ['webpack/loaders', 'node_modules'],
      root: here()
    },

    externals: {
      angular: 'angular',
      'angular-mocks': null,
      lodash: '_'
    },

    module: {
      loaders: [
        {test: /\.js$/, loader: 'ng-annotate!babel!eslint', exclude: /node_modules/}
      ]
    },
    eslint: {
      emitError: !dev,
      failOnError: !dev,
      failOnWarning: !dev
    }
  }
};

function getBanner() {
  return '// moxee version ' + packageJson.version +
    ' built with ♥ by Kent C. Dodds on ' + new Date() +
    ' (ó ì_í)=óò=(ì_í ò)\n';
}


function here(p) {
  return path.join(__dirname, '../', p || '');
}
