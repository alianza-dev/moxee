var webpackConfig = require('./webpack/getConfig')('test');
var deepExtend = require('deep-extend');
var path = require('path');


module.exports = getConfig();
module.exports.getConfig = getConfig;

function getConfig(context) {
  context = context || 'dev';
  var prod = context === 'prod';

  var testConfig = deepExtend({}, webpackConfig, {
    entry: './index.test.js',
    watch: !prod
  });
  var entry = path.join(testConfig.context, testConfig.entry);
  var preprocessors = {};
  preprocessors[entry] = ['webpack'];

  return function(config) {
    config.set({

      // base path that will be used to resolve all patterns (eg. files, exclude)
      basePath: './',
      frameworks: ['mocha', 'chai-sinon'],
      files: [entry],
      exclude: [],


      // preprocess matching files before serving them to the browser
      // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
      preprocessors: preprocessors,

      webpack: testConfig,


      // test results reporter to use
      // possible values: 'dots', 'progress'
      // available reporters: https://npmjs.org/browse/keyword/karma-reporter
      reporters: ['progress'],


      // web server port
      port: 9876,


      // enable / disable colors in the output (reporters and logs)
      colors: true,


      // level of logging
      // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
      logLevel: config.LOG_INFO,


      // enable / disable watching file and executing tests whenever any file changes
      autoWatch: !prod,


      // start these browsers
      // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
      browsers: ['Chrome'],


      // Continuous Integration mode
      // if true, Karma captures browsers, runs the tests and exits
      singleRun: prod,

      // webpack takes a while to compile everything...
      browserNoActivityTimeout: 180000,

      plugins: [
        require('karma-webpack'),
        'karma-mocha',
        'karma-chai-sinon',
        'karma-chrome-launcher'
      ]
    });
  };
}
