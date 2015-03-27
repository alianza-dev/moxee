const expectControllerToNotMissDependencies = require('./expectControllerToNotMissDependencies');
const angular = require('./angular-fix');
const {getInjector} = require('./utils');
const testableComponentTypes = ['directive', 'factory', 'provider', 'register'];

// check for modularity in the invokeQueue and ddo controllers
module.exports = (mainNgModule, shouldHarness, strictDi) => {
  const harnessedModules = {};
  const testedThingsByName = {};
  ensureInvokeQueueIsModular(mainNgModule, shouldHarness, harnessedModules, testedThingsByName, strictDi);

  // auto-harness components that don't have tests setup
  // this helps to enforce modularity
  function ensureInvokeQueueIsModular(ngModule) {
    if (typeof ngModule === 'string') {
      ngModule = angular.module(ngModule);
    }
    if (harnessedModules[ngModule.name]) {
      return;
    }
    harnessedModules[ngModule.name] = true;
    angular.forEach(getComponents(ngModule), component => assertComponentIsModular(component, ngModule));
    angular.forEach(getModuleDependencies(ngModule, shouldHarness), ensureInvokeQueueIsModular);

    function assertComponentIsModular(component) {
      const id = `${ngModule.name}${component.name}`;
      if (testedThingsByName[id] && component.definition === testedThingsByName[id].definition) {
        return;
      }
      testedThingsByName[id] = {component, ngModule};

      const $injector = getInjector(ngModule, strictDi);

      if (component.type === 'controller') {
        expectControllerToNotMissDependencies(component.definition, $injector, {}, strictDi);
        return;
      }

      // this will throw an error if it's not modular (or if strictDi=true and it's not using strictDi)
      $injector.get(component.name);
      if (component.type === 'directive') {
        const ddo = $injector.invoke(component.definition);
        if (ddo.controller && typeof ddo.controller !== 'string') {
          expectControllerToNotMissDependencies(ddo.controller, $injector, {}, strictDi);
        } else {
          /* eslint no-empty:0 */
          // in the case that the controller is a string, it will be its own component
        }
      }
    }
  }
};



function getComponents(ngModule) {
  return ngModule._invokeQueue
    .filter(component => testableComponentTypes.indexOf(component[1]) !== -1)
    .map(component => {
      const isController = component[0] === '$controllerProvider';
      const type = isController ? 'controller' : component[1];
      const name = component[2][0];
      const definition = component[2][1];
      return {name, definition, type};
    });
}

function getModuleDependencies(ngModule, shouldHarnessFn = () => true) {
  return ngModule.requires
    .filter(shouldHarnessFn)
    .map((name) => angular.module(name));
}



