(function() {
  'use strict';

  var childB = angular.module('moxeeExampleChildModuleB', []); // has no dependencies

  childB.factory('alertFromB', function alertFromB($window) {
    return function alert() {
      $window.alert('I was fired off from the childModuleB!');
    };
  });

  childB.directive('childBDir', function childBDirDirective() {
    return {
      restrict: 'E',
      template: '<div>' +
      'childModuleB: ' +
      '<button ng-click="vm.alertFromA()">Should do nothing...</button>' +
      '</div>',
      scope: {},
      controllerAs: 'vm',
      bindToController: true,
      controller: function(alertFromA) { // <-- this should not be possible!
        var vm = this;

        vm.alertFromA = alertFromA;
      }
    };
  });

  childB.run(function(alertFromA, $log) { // <-- this should not be possible as well!
    $log.info(typeof alertFromA); // <-- logs 'function' :-(
  });
})();
