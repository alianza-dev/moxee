// automatically create tests for all controllers
const expectControllerToNotMissDependencies = require('./expectControllerToNotMissDependencies');
const angular = require('./angular-fix');

module.exports = assertStateControllersAreModular;

function assertStateControllersAreModular(allStates) {
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
      parent = getParent(parent, allStates);
    }
    return resolves;

    function mockResolve(resolve, key) {
      resolves[key] = {};
    }
  }

  function createControllerTest(controller, ngModuleName, resolves, strictDi) {
    if (typeof ngModuleName !== 'string') {
      ngModuleName = ngModuleName.name;
    }
    const $injector = angular.injector(['ng', ngModuleName], strictDi);

    // this will throw an error if it's not modular (or if strictDi=true and it's not using strictDi)
    $injector.get(controller.name);
    expectControllerToNotMissDependencies(controller, $injector, resolves);
  }

}

function getParent(child, allStates) {
  let parent = child.data && child.data.parent;
  if (typeof parent === 'string') {
    parent = allStates.filter((state) => state.name === parent)[0];
  }
  return parent;
}
