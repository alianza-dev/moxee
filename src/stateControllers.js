// automatically create tests for all controllers
const expectControllerToNotMissDependencies = require('./expectControllerToNotMissDependencies');
const _ = require('lodash');

module.exports = harnessStateControllers;

function harnessStateControllers(allStates) {
  _.each(allStates, function(state) {
    if (!state.controller) {
      return;
    }
    const resolves = mockResolves(state);
    createControllerTest(state.controller, state.data.module, resolves);
  });

  function mockResolves(state) {
    let parent = state;
    const resolves = {};
    while(parent) {
      _.each(parent.resolve, mockResolve);
      parent = parent.data && parent.data.parent;
    }
    return resolves;

    function mockResolve(resolve, key) {
      resolves[key] = {};
    }
  }

  function createControllerTest(controller, ngModuleName, resolves) {
    describe('controller ' + controller.name, function() {
      beforeEach(window.module(ngModuleName));

      it('should not use anything it does not explicitly depend on', inject(function($injector) {
        expectControllerToNotMissDependencies(controller, $injector, _.assign({$scope: {}}, resolves));
      }));
    });
  }
}
