const angular = require('./angular-fix');
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
const defaultLocals = {
  $scope: {},
  $element: {},
  $attrs: {}
};

module.exports = expectControllerToNotMissDependencies;

function expectControllerToNotMissDependencies(controllerFn, $injector, locals = {}, strictDi = false) {
  const controllerDeps = getDependencies(controllerFn, strictDi);
  const isMissing = true;
  const missingDependencies = controllerDeps.filter(function(dep) {
    if (angular.isDefined(defaultLocals[dep]) || angular.isDefined(locals[dep])) {
      return !isMissing;
    }
    return !$injector.has(dep);
  });
  if (missingDependencies.length) {
    console.warn(getControllerMessage(controllerFn,
      `has dependencies not available in its module or its module's dependencies. ` +
      `The extra dependencies are: \`${missingDependencies.join(', ')}\``
    ));
  }
}

function getDependencies(func, strictDi) {
  if (func.$inject) {
    return func.$inject;
  } else if (angular.isArray(func)) {
    return func.slice(0, func.length - 1);
  }
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) {
    result = [];
  } else if (strictDi) {
    console.warn(getControllerMessage(func,
      `has dependencies, but it's using Implicit Annotation (see https://docs.angularjs.org/guide/di)`
    ));
  }
  return result;
}

function getControllerMessage(controllerFn, message) {
  const controllerName = controllerFn.displayName || controllerFn.name || 'anonymous';
  const needsMoreInfo = controllerName === 'anonymous';
  let resultingMessage = `The controller \`${controllerName}\` `;
  if (needsMoreInfo) {
    resultingMessage += `that starts with something like this: \`\n${controllerFn.toString().substring(0, 50)}\n\` `;
  }
  resultingMessage += message;
  return resultingMessage;
}
