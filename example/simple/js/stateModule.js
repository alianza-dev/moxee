angular.module('moxeeExampleStateModule', ['ui.router', 'moxeeExampleChildModuleA'], function config($stateProvider) {

  $stateProvider.state({
    name: 'home',
    url: '/',
    template: '<div ui-view></div>',
    controllerAs: 'vm',
    controller: function(alertFromA, alertFromB) {
      // this will fail because it doesn't depend on the "childModuleB"
    },
    resolve: {
      parentDependency: function() {
        return 'dependency';
      }
    },
    data: {
      module: 'stateModule'
    }
  });

  $stateProvider.state({
    name: 'home.childState',
    url: 'child',
    template: '<div>Hello world!</div>',
    controllerAs: 'vm',
    controller: function(parentDependency, childDependency) {
      // this will pass because parentDependency comes from the parent's resolve
      // and the childDependency comes from this state's resolve.
    },
    resolve: {
      childDependency: function() {
        return 'childDependency';
      }
    },
    data: {
      module: 'stateModule',
      parent: 'home'
    }
  });

});
