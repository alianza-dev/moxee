const _ = require('lodash');

module.exports = expectControllerToNotMissDependencies;

function expectControllerToNotMissDependencies(controller, $injector, locals) {
  controller = _.isString(controller) ? $injector.get(controller) : controller;
  const controllerDeps = getDependencies(controller);
  const isMissing = true;
  const missingDependencies = _.filter(controllerDeps, function(dep) {
    if (!_.isUndefined(locals[dep])) {
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
    } else if (_.isArray(func)) {
      return func.slice(0, func.length - 1);
    }
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null) {
      result = [];
    }
    return result;
  }
}
