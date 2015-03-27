angular.module('moxeeExampleStateModule', ['ui.router', 'moxeeExampleChildModuleA'], function config($stateProvider) {

  $stateProvider.state({
    name: 'home',
    url: '/',
    template: '<div ui-view></div>',
    controllerAs: 'vm',
    controller: function HomeCtrl(alertFromA, alertFromB) {
      // this will fail because it doesn't depend on the "childModuleB"
    },
    resolve: {
      parentDependency: function() {
        return 'dependency';
      }
    },
    data: {
      ngModule: 'moxeeExampleStateModule'
    }
  });

  $stateProvider.state({
    name: 'home.childState',
    url: 'child',
    template: '<div>Hello world!</div>',
    controllerAs: 'vm',
    controller: function ChildCtrl(parentDependency, childDependency) {
      // this will pass because parentDependency comes from the parent's resolve
      // and the childDependency comes from this state's resolve.
    },
    resolve: {
      childDependency: function() {
        return 'childDependency';
      }
    },
    data: {
      ngModule: 'moxeeExampleStateModule',
      parent: 'home'
    }
  });

});
