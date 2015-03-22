# Moxee

Enforcing modularity in AngularJS applications.

Here's [the problem](http://jsbin.com/kolaci/edit?html,js,output). Angular's module system is this big global context.
This makes it impossible for you to enforce any kind of modularity in Angular applications. And in a large application
with many developers, this becomes a serious issue very fast.

Moxee will create tests for you which will ensure that no injectable function is requiring anything that the module
doesn't provide on its own (or via one of its dependencies).

## Supported Injectable Functions

 - Auto-testing components to ensure they only utilize components that they should
 - `invokeQueue` (includes all injectable functions when creating angular-things, like `services`, `directives`, etc.)
 - Directive controllers
 - angular-ui-router state controllers

## Injectable Functions to support

 - `configQueue`
 - `runQueue`
 - Any `$injector.invoke` call. ... good luck with this one...
 - Use of directives in templates for states and directives... good luck with this one too...
 - Am I missing any?

Moxee's goal is to enforce modularity in Angular applications so we can develop maintainable applications with
confidence that they wont be maintenance nightmares in the future. Moxee is part of a larger initiative which is still
a WIP. Look forward to what's coming :-)

## Other TODOs

 - Currently, we only support `mocha` and `chai`. Would like to support any testing framework.

## Examples

There's a very simple example application in the [`example`](example) directory which will hopefully be instructive. If
you open the `index.html` in a browser, you'll notice the application works just fine, no errors/warnings/etc. However,
if you run the tests, you'll notice that Moxee has created tests that fail because modules are using other module's
stuff even though they don't explicitly depend on them.

## Usage

```javascript
// Your karma.conf.js

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'], // <-- currently, these are both required... PR welcome to make it work without that!
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-ui-router/release/angular-ui-router.js',
      'node_modules/moxee/dist/moxee.js',

      'js/*.js', // <-- your own source files
      'test/*.js' // <-- an example of the contents of your main moxee setup test file is below
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    plugins: [
      'karma-mocha', // <-- required currently. PRs welcome!
      'karma-chai', // <-- required currently. PRs welcome!
      'karma-phantomjs-launcher'
    ]
  });
};
```

```javascript
// Your main test.js file

// this is how you setup testing states
// you need the $injector if you're going to tests states
var mainModuleName = 'moxeeExampleParentModule';
var $injector = angular.bootstrap(document, [mainModuleName]);
var allStates = $injector.get('$state').get();
moxee.harness.stateControllers(allStates);

// this is how you setup testing the invokeQueue and directive's controllers
var myModulePrefix = 'moxeeExample';
moxee.harness.invokeQueue(mainModuleName, function shouldHarnessModule(ngModuleName) {
  // return whether or not you wish to test this module
  // this will be passed all the modules that your application uses
  // including third parties. You may not care to test those...
  return ngModuleName.indexOf(myModulePrefix) === 0;
});
```


