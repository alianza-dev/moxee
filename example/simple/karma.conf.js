module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'], // <-- currently, these are both required... PR welcome to make it work without that!
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-ui-router/release/angular-ui-router.js',
      'dist/moxee.js', // <-- normally this would be in your node_modules
      'js/*.js',
      'test/*.js'
    ],
    exclude: [
      'js/bootstrap.js' // <-- we'll do our own bootstrapping in our tests
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher'
    ]
  });
};
