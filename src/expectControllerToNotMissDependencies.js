const angular = require('./angular-fix');
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

module.exports = expectControllerToNotMissDependencies;

function expectControllerToNotMissDependencies(controller, $injector, locals) {
  controller = angular.isString(controller) ? $injector.get(controller) : controller;
  const controllerDeps = getDependencies(controller);
  const isMissing = true;
  const missingDependencies = controllerDeps.filter(function(dep) {
    if (angular.isDefined(locals[dep])) {
      return !isMissing;
    }
    try {
      $injector.get(dep);
      return !isMissing;
    } catch(e) {
      return isMissing;
    }
  });
  expect(missingDependencies,
    `The controller \`${controller.displayName || controller.name || 'anonymous'}\` has dependencies not available ` +
    `in its module or its module's dependencies. Extra dependencies: "` +
    `${missingDependencies.join(', ')}"`
  ).to.be.empty;


  function getDependencies(func) {
    if (func.$inject) {
      return func.$inject;
    } else if (angular.isArray(func)) {
      return func.slice(0, func.length - 1);
    }
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null) {
      result = [];
    }
    return result;
  }
}
