(function() {
  'use strict';

  var parent = angular.module('moxeeExampleParentModule', [
    'moxeeExampleChildModuleA', 'moxeeExampleChildModuleB', 'moxeeExampleStateModule'
  ]);

  parent.directive('parentDir', function parentDirDirective() {

    return {
      restrict: 'E',
      template: '<div>' +
      '<div>These two buttons are fine:</div>' +
      '<div>' +
      '<button ng-click="vm.alertFromA()">Alert from A</button>' +
      '<button ng-click="vm.alertFromB()">Alert from B</button>' +
      '</div>' +
      '<div>But these two directives come from the independent modules themselves, so they should not work</div>' +
      '<div>' +
      '<child-a-dir></child-a-dir>' +
      '<child-b-dir></child-b-dir>' +
      '</div>' +
      '</div>',
      scope: {},
      controllerAs: 'vm',
      bindToController: true,
      controller: function(alertFromA, alertFromB) {
        var vm = this;

        vm.alertFromA = alertFromA;
        vm.alertFromB = alertFromB;
      }
    };
  });
})();
