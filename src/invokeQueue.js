const expectControllerToNotMissDependencies = require('./expectControllerToNotMissDependencies');
const angular = require('./angular-fix');
const testableComponentTypes = ['directive', 'factory', 'provider', 'register'];
const harnessedModules = {};
const testedThingsByName = {};

module.exports = harnessModuleInvokeQueue;

// automatically create tests for all registered components

// auto-harness components that don't have tests setup
// this helps to enforce modularity
function harnessModuleInvokeQueue(ngModule, shouldHarness) {
  if (typeof ngModule === 'string') {
    ngModule = angular.module(ngModule);
  }
  if (harnessedModules[ngModule.name]) {
    return;
  }
  harnessedModules[ngModule.name] = true;
  angular.forEach(getComponents(ngModule), component => attachTestHarnesses(component, ngModule));
  angular.forEach(getModuleDependencies(ngModule, shouldHarness), depModule => {
    harnessModuleInvokeQueue(depModule, shouldHarness);
  });
}

function getComponents(ngModule) {
  return ngModule._invokeQueue
    .filter(component => testableComponentTypes.indexOf(component[1]) !== -1)
    .map(component => {
      const type = component[1];
      const name = component[2][0];
      const definition = component[2][1];
      return {name, definition, type};
    });
}

function attachTestHarnesses(component, ngModule) {
  if (testedThingsByName['component' + component.name]) {
    return;
  }
  testedThingsByName['component' + component.name] = {component, ngModule};
  createGenericTestHarness(component, ngModule.name);
}

function getModuleDependencies(ngModule, shouldHarnessFn) {
  return ngModule.requires
    .filter(shouldHarnessFn)
    .map((name) => angular.module(name));
}

function createGenericTestHarness(component, ngModuleName) {
  describe(component.type + ' ' + component.name, function() {
    beforeEach(window.module(ngModuleName));


    it('should not use anything it does not explicitly depend on', function() {
      // angular will cause the failure we're looking for.
      // So this always passing assertion wont even run if
      // It's depending on something it shouldn't.
      expect(true).to.be.true;
    });

    if (component.type === 'directive') {
      it('should not have a controller that uses anything it should not', inject(function($injector) {
        const ddo = $injector.invoke(component.definition);
        if (ddo.controller) {
          expectControllerToNotMissDependencies(ddo.controller, $injector, {
            $scope: {},
            $element: {},
            $attrs: {}
          });
        }
      }));
    }
  });
}


