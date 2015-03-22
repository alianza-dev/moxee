(function() {
  'use strict';

  var childA = angular.module('moxeeExampleChildModuleA', []); // has no dependencies

  childA.factory('alertFromA', function alertFromA($window) {
    return function alert() {
      $window.alert('I was fired off from the childModuleA!');
    };
  });

  childA.directive('childADir', function childADirDirective() {
    return {
      restrict: 'E',
      template: '<div>' +
      'childModuleA: ' +
      '<button ng-click="vm.alertFromB()">Should do nothing...</button>' +
      '</div>',
      scope: {},
      controllerAs: 'vm',
      bindToController: true,
      controller: function(alertFromB) { // <-- this should not be possible!
        var vm = this;

        vm.alertFromB = alertFromB;
      }
    };
  });
})();
