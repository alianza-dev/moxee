// this is how you setup testing states
// you need the $injector if you're going to tests states
var mainModuleName = 'moxeeExampleParentModule';
var $injector = angular.bootstrap(document, [mainModuleName]);
var allStates = $injector.get('$state').get();
moxee.harness.stateControllers(allStates);

// this is how you setup testing the invokeQueue and directive's controllers
var myModulePrefix = 'moxeeExample';
moxee.harness.invokeQueue(mainModuleName, function(ngModuleName) {
  return ngModuleName.indexOf(myModulePrefix) === 0;
});
