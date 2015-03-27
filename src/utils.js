const angular = require('./angular-fix');
let name = 0;
export default {getInjector};

function getInjector(moduleName, strictDi) {
  if (typeof moduleName !== 'string') {
    moduleName = moduleName.name;
  }
  const moxeeModuleName = `moxeeMockModule${name++}`;
  const moxeeModule = angular.module(moxeeModuleName, ['ng', moduleName]).provider('$rootElement', function() {
    this.$get = function() {
      return angular.element('<div ng-app></div>');
    };
  });

  const modNames = [moxeeModuleName];
  loadModuleDependencies(moxeeModule, modNames);

  return angular.injector(modNames, strictDi);
}

function loadModuleDependencies(ngModule, deps) {
  ngModule.requires.forEach(modName => {
    if (deps.indexOf(modName) === -1) {
      deps.push(modName);
    }
    loadModuleDependencies(angular.module(modName), deps);
  });
  return deps;
}
