// automatically create tests for all controllers
const expectControllerToNotMissDependencies = require('./expectControllerToNotMissDependencies');
const angular = require('./angular-fix');

module.exports = harnessStateControllers;

function harnessStateControllers(allStates) {
  angular.forEach(allStates, function(state) {
    if (!state.controller) {
      return;
    }
    const resolves = mockResolves(state);
    createControllerTest(state.controller, state.data.ngModule, resolves);
  });

  function mockResolves(state) {
    let parent = state;
    const resolves = {};
    while(parent) {
      angular.forEach(parent.resolve, mockResolve);
      parent = parent.data && parent.data.parent;
    }
    return resolves;

    function mockResolve(resolve, key) {
      resolves[key] = {};
    }
  }

  function createControllerTest(controller, ngModuleName, resolves) {
    if (typeof ngModuleName !== 'string') {
      ngModuleName = ngModuleName.name;
    }
    describe('controller ' + controller.name, function() {
      beforeEach(window.module(ngModuleName));

      it('should not use anything it does not explicitly depend on', inject(function($injector) {
        expectControllerToNotMissDependencies(controller, $injector, angular.extend({$scope: {}}, resolves));
      }));
    });
  }
}
