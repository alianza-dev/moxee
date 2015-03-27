// moxee version 1.0.6 built with ♥ by Kent C. Dodds on Fri Mar 27 2015 09:08:56 GMT-0600 (MDT) (ó ì_í)=óò=(ì_í ò)

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("angular"));
	else if(typeof define === 'function' && define.amd)
		define(["angular"], factory);
	else if(typeof exports === 'object')
		exports["moxee"] = factory(require("angular"));
	else
		root["moxee"] = factory(root["angular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = {
	  harness: {
	    invokeQueue: __webpack_require__(/*! ./invokeQueue */ 1),
	    stateControllers: __webpack_require__(/*! ./stateControllers */ 2)
	  }
	};

/***/ },
/* 1 */
/*!************************!*\
  !*** ./invokeQueue.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var expectControllerToNotMissDependencies = __webpack_require__(/*! ./expectControllerToNotMissDependencies */ 3);
	var angular = __webpack_require__(/*! ./angular-fix */ 4);
	
	var _require = __webpack_require__(/*! ./utils */ 6);
	
	var getInjector = _require.getInjector;
	
	var testableComponentTypes = ["directive", "factory", "provider", "register"];
	
	// check for modularity in the invokeQueue and ddo controllers
	module.exports = function (mainNgModule, shouldHarness, strictDi) {
	  var harnessedModules = {};
	  var testedThingsByName = {};
	  ensureInvokeQueueIsModular(mainNgModule, shouldHarness, harnessedModules, testedThingsByName, strictDi);
	
	  // auto-harness components that don't have tests setup
	  // this helps to enforce modularity
	  function ensureInvokeQueueIsModular(ngModule) {
	    if (typeof ngModule === "string") {
	      ngModule = angular.module(ngModule);
	    }
	    if (harnessedModules[ngModule.name]) {
	      return;
	    }
	    harnessedModules[ngModule.name] = true;
	    angular.forEach(getComponents(ngModule), function (component) {
	      return assertComponentIsModular(component, ngModule);
	    });
	    angular.forEach(getModuleDependencies(ngModule, shouldHarness), ensureInvokeQueueIsModular);
	
	    function assertComponentIsModular(component) {
	      var id = "" + ngModule.name + "" + component.name;
	      if (testedThingsByName[id] && component.definition === testedThingsByName[id].definition) {
	        return;
	      }
	      testedThingsByName[id] = { component: component, ngModule: ngModule };
	
	      var $injector = getInjector(ngModule, strictDi);
	
	      if (component.type === "controller") {
	        expectControllerToNotMissDependencies(component.definition, $injector, {}, strictDi);
	        return;
	      }
	
	      // this will throw an error if it's not modular (or if strictDi=true and it's not using strictDi)
	      $injector.get(component.name);
	      if (component.type === "directive") {
	        var ddo = $injector.invoke(component.definition);
	        if (ddo.controller && typeof ddo.controller !== "string") {
	          expectControllerToNotMissDependencies(ddo.controller, $injector, {}, strictDi);
	        } else {}
	      }
	    }
	  }
	};
	
	function getComponents(ngModule) {
	  return ngModule._invokeQueue.filter(function (component) {
	    return testableComponentTypes.indexOf(component[1]) !== -1;
	  }).map(function (component) {
	    var isController = component[0] === "$controllerProvider";
	    var type = isController ? "controller" : component[1];
	    var name = component[2][0];
	    var definition = component[2][1];
	    return { name: name, definition: definition, type: type };
	  });
	}
	
	function getModuleDependencies(ngModule) {
	  var shouldHarnessFn = arguments[1] === undefined ? function () {
	    return true;
	  } : arguments[1];
	
	  return ngModule.requires.filter(shouldHarnessFn).map(function (name) {
	    return angular.module(name);
	  });
	}
	
	/* eslint no-empty:0 */
	// in the case that the controller is a string, it will be its own component

/***/ },
/* 2 */
/*!*****************************!*\
  !*** ./stateControllers.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	// automatically create tests for all controllers
	"use strict";
	
	var expectControllerToNotMissDependencies = __webpack_require__(/*! ./expectControllerToNotMissDependencies */ 3);
	var angular = __webpack_require__(/*! ./angular-fix */ 4);
	
	module.exports = assertStateControllersAreModular;
	
	function assertStateControllersAreModular(allStates) {
	  angular.forEach(allStates, function (state) {
	    if (!state.controller) {
	      return;
	    }
	    var resolves = mockResolves(state);
	    createControllerTest(state.controller, state.data.ngModule, resolves);
	  });
	
	  function mockResolves(state) {
	    var parent = state;
	    var resolves = {};
	    while (parent) {
	      angular.forEach(parent.resolve, mockResolve);
	      parent = getParent(parent, allStates);
	    }
	    return resolves;
	
	    function mockResolve(resolve, key) {
	      resolves[key] = {};
	    }
	  }
	
	  function createControllerTest(controller, ngModuleName, resolves, strictDi) {
	    if (typeof ngModuleName !== "string") {
	      ngModuleName = ngModuleName.name;
	    }
	    var $injector = angular.injector(["ng", ngModuleName], strictDi);
	
	    // this will throw an error if it's not modular (or if strictDi=true and it's not using strictDi)
	    $injector.get(controller.name);
	    expectControllerToNotMissDependencies(controller, $injector, resolves);
	  }
	}
	
	function getParent(child, allStates) {
	  var parent = child.data && child.data.parent;
	  if (typeof parent === "string") {
	    parent = allStates.filter(function (state) {
	      return state.name === parent;
	    })[0];
	  }
	  return parent;
	}

/***/ },
/* 3 */
/*!**************************************************!*\
  !*** ./expectControllerToNotMissDependencies.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var angular = __webpack_require__(/*! ./angular-fix */ 4);
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	var ARGUMENT_NAMES = /([^\s,]+)/g;
	var defaultLocals = {
	  $scope: {},
	  $element: {},
	  $attrs: {}
	};
	
	module.exports = expectControllerToNotMissDependencies;
	
	function expectControllerToNotMissDependencies(controllerFn, $injector) {
	  var locals = arguments[2] === undefined ? {} : arguments[2];
	  var strictDi = arguments[3] === undefined ? false : arguments[3];
	
	  var controllerDeps = getDependencies(controllerFn, strictDi);
	  var isMissing = true;
	  var missingDependencies = controllerDeps.filter(function (dep) {
	    if (angular.isDefined(defaultLocals[dep]) || angular.isDefined(locals[dep])) {
	      return !isMissing;
	    }
	    return !$injector.has(dep);
	  });
	  if (missingDependencies.length) {
	    console.warn(getControllerMessage(controllerFn, "has dependencies not available in its module or its module's dependencies. " + ("The extra dependencies are: `" + missingDependencies.join(", ") + "`")));
	  }
	}
	
	function getDependencies(func, strictDi) {
	  if (func.$inject) {
	    return func.$inject;
	  } else if (angular.isArray(func)) {
	    return func.slice(0, func.length - 1);
	  }
	  var fnStr = func.toString().replace(STRIP_COMMENTS, "");
	  var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
	  if (result === null) {
	    result = [];
	  } else if (strictDi) {
	    console.warn(getControllerMessage(func, "has dependencies, but it's using Implicit Annotation (see https://docs.angularjs.org/guide/di)"));
	  }
	  return result;
	}
	
	function getControllerMessage(controllerFn, message) {
	  var controllerName = controllerFn.displayName || controllerFn.name || "anonymous";
	  var needsMoreInfo = controllerName === "anonymous";
	  var resultingMessage = "The controller `" + controllerName + "` ";
	  if (needsMoreInfo) {
	    resultingMessage += "that starts with something like this: `\n" + controllerFn.toString().substring(0, 50) + "\n` ";
	  }
	  resultingMessage += message;
	  return resultingMessage;
	}

/***/ },
/* 4 */
/*!******************************!*\
  !*** ./angular-fix/index.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	// some versions of angular don't export the angular module properly,
	// so we get it from window in this case.
	"use strict";
	
	var angular = __webpack_require__(/*! angular */ 5);
	if (!angular.version) {
	  angular = window.angular;
	}
	module.exports = angular;

/***/ },
/* 5 */
/*!**************************!*\
  !*** external "angular" ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/*!******************!*\
  !*** ./utils.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var angular = __webpack_require__(/*! ./angular-fix */ 4);
	var name = 0;
	module.exports = { getInjector: getInjector };
	
	function getInjector(moduleName, strictDi) {
	  if (typeof moduleName !== "string") {
	    moduleName = moduleName.name;
	  }
	  var moxeeModuleName = "moxeeMockModule" + name++;
	  var moxeeModule = angular.module(moxeeModuleName, ["ng", moduleName]).provider("$rootElement", function () {
	    this.$get = function () {
	      return angular.element("<div ng-app></div>");
	    };
	  });
	
	  var modNames = [moxeeModuleName];
	  loadModuleDependencies(moxeeModule, modNames);
	
	  return angular.injector(modNames, strictDi);
	}
	
	function loadModuleDependencies(ngModule, deps) {
	  ngModule.requires.forEach(function (modName) {
	    if (deps.indexOf(modName) === -1) {
	      deps.push(modName);
	    }
	    loadModuleDependencies(angular.module(modName), deps);
	  });
	  return deps;
	}

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA1MzJjYjlmYWVjZjcyNjIxYzFiMCIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9pbnZva2VRdWV1ZS5qcyIsIndlYnBhY2s6Ly8vLi9zdGF0ZUNvbnRyb2xsZXJzLmpzIiwid2VicGFjazovLy8uL2V4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vYW5ndWxhci1maXgvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYW5ndWxhclwiIiwid2VicGFjazovLy8uL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHdDOzs7Ozs7Ozs7Ozs7QUN0Q0EsT0FBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFVBQU8sRUFBRTtBQUNQLGdCQUFXLEVBQUUsbUJBQU8sQ0FBQyxzQkFBZSxDQUFDO0FBQ3JDLHFCQUFnQixFQUFFLG1CQUFPLENBQUMsMkJBQW9CLENBQUM7SUFDaEQ7RUFDRixDOzs7Ozs7Ozs7OztBQ0xELEtBQU0scUNBQXFDLEdBQUcsbUJBQU8sQ0FBQyxnREFBeUMsQ0FBQyxDQUFDO0FBQ2pHLEtBQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsc0JBQWUsQ0FBQyxDQUFDOztnQkFDbkIsbUJBQU8sQ0FBQyxnQkFBUyxDQUFDOztLQUFqQyxX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T0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7RUFDN0M7O0FBRUQsVUFBUyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQzlDLFdBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGlCQUFPLEVBQUk7QUFDbkMsU0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2hDLFdBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7TUFDcEI7QUFDRCwyQkFBc0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZELENBQUMsQ0FBQztBQUNILFVBQU8sSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiYW5ndWxhclwiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXCJhbmd1bGFyXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIm1veGVlXCJdID0gZmFjdG9yeShyZXF1aXJlKFwiYW5ndWxhclwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wibW94ZWVcIl0gPSBmYWN0b3J5KHJvb3RbXCJhbmd1bGFyXCJdKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfNV9fKSB7XG5yZXR1cm4gXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uXG4gKiovIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNTMyY2I5ZmFlY2Y3MjYyMWMxYjBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaGFybmVzczoge1xuICAgIGludm9rZVF1ZXVlOiByZXF1aXJlKCcuL2ludm9rZVF1ZXVlJyksXG4gICAgc3RhdGVDb250cm9sbGVyczogcmVxdWlyZSgnLi9zdGF0ZUNvbnRyb2xsZXJzJylcbiAgfVxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL2luZGV4LmpzXG4gKiovIiwiY29uc3QgZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcyA9IHJlcXVpcmUoJy4vZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcycpO1xuY29uc3QgYW5ndWxhciA9IHJlcXVpcmUoJy4vYW5ndWxhci1maXgnKTtcbmNvbnN0IHtnZXRJbmplY3Rvcn0gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5jb25zdCB0ZXN0YWJsZUNvbXBvbmVudFR5cGVzID0gWydkaXJlY3RpdmUnLCAnZmFjdG9yeScsICdwcm92aWRlcicsICdyZWdpc3RlciddO1xuXG4vLyBjaGVjayBmb3IgbW9kdWxhcml0eSBpbiB0aGUgaW52b2tlUXVldWUgYW5kIGRkbyBjb250cm9sbGVyc1xubW9kdWxlLmV4cG9ydHMgPSAobWFpbk5nTW9kdWxlLCBzaG91bGRIYXJuZXNzLCBzdHJpY3REaSkgPT4ge1xuICBjb25zdCBoYXJuZXNzZWRNb2R1bGVzID0ge307XG4gIGNvbnN0IHRlc3RlZFRoaW5nc0J5TmFtZSA9IHt9O1xuICBlbnN1cmVJbnZva2VRdWV1ZUlzTW9kdWxhcihtYWluTmdNb2R1bGUsIHNob3VsZEhhcm5lc3MsIGhhcm5lc3NlZE1vZHVsZXMsIHRlc3RlZFRoaW5nc0J5TmFtZSwgc3RyaWN0RGkpO1xuXG4gIC8vIGF1dG8taGFybmVzcyBjb21wb25lbnRzIHRoYXQgZG9uJ3QgaGF2ZSB0ZXN0cyBzZXR1cFxuICAvLyB0aGlzIGhlbHBzIHRvIGVuZm9yY2UgbW9kdWxhcml0eVxuICBmdW5jdGlvbiBlbnN1cmVJbnZva2VRdWV1ZUlzTW9kdWxhcihuZ01vZHVsZSkge1xuICAgIGlmICh0eXBlb2YgbmdNb2R1bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKG5nTW9kdWxlKTtcbiAgICB9XG4gICAgaWYgKGhhcm5lc3NlZE1vZHVsZXNbbmdNb2R1bGUubmFtZV0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaGFybmVzc2VkTW9kdWxlc1tuZ01vZHVsZS5uYW1lXSA9IHRydWU7XG4gICAgYW5ndWxhci5mb3JFYWNoKGdldENvbXBvbmVudHMobmdNb2R1bGUpLCBjb21wb25lbnQgPT4gYXNzZXJ0Q29tcG9uZW50SXNNb2R1bGFyKGNvbXBvbmVudCwgbmdNb2R1bGUpKTtcbiAgICBhbmd1bGFyLmZvckVhY2goZ2V0TW9kdWxlRGVwZW5kZW5jaWVzKG5nTW9kdWxlLCBzaG91bGRIYXJuZXNzKSwgZW5zdXJlSW52b2tlUXVldWVJc01vZHVsYXIpO1xuXG4gICAgZnVuY3Rpb24gYXNzZXJ0Q29tcG9uZW50SXNNb2R1bGFyKGNvbXBvbmVudCkge1xuICAgICAgY29uc3QgaWQgPSBgJHtuZ01vZHVsZS5uYW1lfSR7Y29tcG9uZW50Lm5hbWV9YDtcbiAgICAgIGlmICh0ZXN0ZWRUaGluZ3NCeU5hbWVbaWRdICYmIGNvbXBvbmVudC5kZWZpbml0aW9uID09PSB0ZXN0ZWRUaGluZ3NCeU5hbWVbaWRdLmRlZmluaXRpb24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGVzdGVkVGhpbmdzQnlOYW1lW2lkXSA9IHtjb21wb25lbnQsIG5nTW9kdWxlfTtcblxuICAgICAgY29uc3QgJGluamVjdG9yID0gZ2V0SW5qZWN0b3IobmdNb2R1bGUsIHN0cmljdERpKTtcblxuICAgICAgaWYgKGNvbXBvbmVudC50eXBlID09PSAnY29udHJvbGxlcicpIHtcbiAgICAgICAgZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcyhjb21wb25lbnQuZGVmaW5pdGlvbiwgJGluamVjdG9yLCB7fSwgc3RyaWN0RGkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIHRoaXMgd2lsbCB0aHJvdyBhbiBlcnJvciBpZiBpdCdzIG5vdCBtb2R1bGFyIChvciBpZiBzdHJpY3REaT10cnVlIGFuZCBpdCdzIG5vdCB1c2luZyBzdHJpY3REaSlcbiAgICAgICRpbmplY3Rvci5nZXQoY29tcG9uZW50Lm5hbWUpO1xuICAgICAgaWYgKGNvbXBvbmVudC50eXBlID09PSAnZGlyZWN0aXZlJykge1xuICAgICAgICBjb25zdCBkZG8gPSAkaW5qZWN0b3IuaW52b2tlKGNvbXBvbmVudC5kZWZpbml0aW9uKTtcbiAgICAgICAgaWYgKGRkby5jb250cm9sbGVyICYmIHR5cGVvZiBkZG8uY29udHJvbGxlciAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBleHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzKGRkby5jb250cm9sbGVyLCAkaW5qZWN0b3IsIHt9LCBzdHJpY3REaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLyogZXNsaW50IG5vLWVtcHR5OjAgKi9cbiAgICAgICAgICAvLyBpbiB0aGUgY2FzZSB0aGF0IHRoZSBjb250cm9sbGVyIGlzIGEgc3RyaW5nLCBpdCB3aWxsIGJlIGl0cyBvd24gY29tcG9uZW50XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cblxuXG5mdW5jdGlvbiBnZXRDb21wb25lbnRzKG5nTW9kdWxlKSB7XG4gIHJldHVybiBuZ01vZHVsZS5faW52b2tlUXVldWVcbiAgICAuZmlsdGVyKGNvbXBvbmVudCA9PiB0ZXN0YWJsZUNvbXBvbmVudFR5cGVzLmluZGV4T2YoY29tcG9uZW50WzFdKSAhPT0gLTEpXG4gICAgLm1hcChjb21wb25lbnQgPT4ge1xuICAgICAgY29uc3QgaXNDb250cm9sbGVyID0gY29tcG9uZW50WzBdID09PSAnJGNvbnRyb2xsZXJQcm92aWRlcic7XG4gICAgICBjb25zdCB0eXBlID0gaXNDb250cm9sbGVyID8gJ2NvbnRyb2xsZXInIDogY29tcG9uZW50WzFdO1xuICAgICAgY29uc3QgbmFtZSA9IGNvbXBvbmVudFsyXVswXTtcbiAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb21wb25lbnRbMl1bMV07XG4gICAgICByZXR1cm4ge25hbWUsIGRlZmluaXRpb24sIHR5cGV9O1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRNb2R1bGVEZXBlbmRlbmNpZXMobmdNb2R1bGUsIHNob3VsZEhhcm5lc3NGbiA9ICgpID0+IHRydWUpIHtcbiAgcmV0dXJuIG5nTW9kdWxlLnJlcXVpcmVzXG4gICAgLmZpbHRlcihzaG91bGRIYXJuZXNzRm4pXG4gICAgLm1hcCgobmFtZSkgPT4gYW5ndWxhci5tb2R1bGUobmFtZSkpO1xufVxuXG5cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vaW52b2tlUXVldWUuanNcbiAqKi8iLCIvLyBhdXRvbWF0aWNhbGx5IGNyZWF0ZSB0ZXN0cyBmb3IgYWxsIGNvbnRyb2xsZXJzXG5jb25zdCBleHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzID0gcmVxdWlyZSgnLi9leHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzJyk7XG5jb25zdCBhbmd1bGFyID0gcmVxdWlyZSgnLi9hbmd1bGFyLWZpeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2VydFN0YXRlQ29udHJvbGxlcnNBcmVNb2R1bGFyO1xuXG5mdW5jdGlvbiBhc3NlcnRTdGF0ZUNvbnRyb2xsZXJzQXJlTW9kdWxhcihhbGxTdGF0ZXMpIHtcbiAgYW5ndWxhci5mb3JFYWNoKGFsbFN0YXRlcywgZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoIXN0YXRlLmNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZXMgPSBtb2NrUmVzb2x2ZXMoc3RhdGUpO1xuICAgIGNyZWF0ZUNvbnRyb2xsZXJUZXN0KHN0YXRlLmNvbnRyb2xsZXIsIHN0YXRlLmRhdGEubmdNb2R1bGUsIHJlc29sdmVzKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gbW9ja1Jlc29sdmVzKHN0YXRlKSB7XG4gICAgbGV0IHBhcmVudCA9IHN0YXRlO1xuICAgIGNvbnN0IHJlc29sdmVzID0ge307XG4gICAgd2hpbGUocGFyZW50KSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGFyZW50LnJlc29sdmUsIG1vY2tSZXNvbHZlKTtcbiAgICAgIHBhcmVudCA9IGdldFBhcmVudChwYXJlbnQsIGFsbFN0YXRlcyk7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlcztcblxuICAgIGZ1bmN0aW9uIG1vY2tSZXNvbHZlKHJlc29sdmUsIGtleSkge1xuICAgICAgcmVzb2x2ZXNba2V5XSA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZXJUZXN0KGNvbnRyb2xsZXIsIG5nTW9kdWxlTmFtZSwgcmVzb2x2ZXMsIHN0cmljdERpKSB7XG4gICAgaWYgKHR5cGVvZiBuZ01vZHVsZU5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuZ01vZHVsZU5hbWUgPSBuZ01vZHVsZU5hbWUubmFtZTtcbiAgICB9XG4gICAgY29uc3QgJGluamVjdG9yID0gYW5ndWxhci5pbmplY3RvcihbJ25nJywgbmdNb2R1bGVOYW1lXSwgc3RyaWN0RGkpO1xuXG4gICAgLy8gdGhpcyB3aWxsIHRocm93IGFuIGVycm9yIGlmIGl0J3Mgbm90IG1vZHVsYXIgKG9yIGlmIHN0cmljdERpPXRydWUgYW5kIGl0J3Mgbm90IHVzaW5nIHN0cmljdERpKVxuICAgICRpbmplY3Rvci5nZXQoY29udHJvbGxlci5uYW1lKTtcbiAgICBleHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzKGNvbnRyb2xsZXIsICRpbmplY3RvciwgcmVzb2x2ZXMpO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50KGNoaWxkLCBhbGxTdGF0ZXMpIHtcbiAgbGV0IHBhcmVudCA9IGNoaWxkLmRhdGEgJiYgY2hpbGQuZGF0YS5wYXJlbnQ7XG4gIGlmICh0eXBlb2YgcGFyZW50ID09PSAnc3RyaW5nJykge1xuICAgIHBhcmVudCA9IGFsbFN0YXRlcy5maWx0ZXIoKHN0YXRlKSA9PiBzdGF0ZS5uYW1lID09PSBwYXJlbnQpWzBdO1xuICB9XG4gIHJldHVybiBwYXJlbnQ7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2VzbGludC1sb2FkZXIhLi9zdGF0ZUNvbnRyb2xsZXJzLmpzXG4gKiovIiwiY29uc3QgYW5ndWxhciA9IHJlcXVpcmUoJy4vYW5ndWxhci1maXgnKTtcbmNvbnN0IFNUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xuY29uc3QgQVJHVU1FTlRfTkFNRVMgPSAvKFteXFxzLF0rKS9nO1xuY29uc3QgZGVmYXVsdExvY2FscyA9IHtcbiAgJHNjb3BlOiB7fSxcbiAgJGVsZW1lbnQ6IHt9LFxuICAkYXR0cnM6IHt9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXM7XG5cbmZ1bmN0aW9uIGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMoY29udHJvbGxlckZuLCAkaW5qZWN0b3IsIGxvY2FscyA9IHt9LCBzdHJpY3REaSA9IGZhbHNlKSB7XG4gIGNvbnN0IGNvbnRyb2xsZXJEZXBzID0gZ2V0RGVwZW5kZW5jaWVzKGNvbnRyb2xsZXJGbiwgc3RyaWN0RGkpO1xuICBjb25zdCBpc01pc3NpbmcgPSB0cnVlO1xuICBjb25zdCBtaXNzaW5nRGVwZW5kZW5jaWVzID0gY29udHJvbGxlckRlcHMuZmlsdGVyKGZ1bmN0aW9uKGRlcCkge1xuICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChkZWZhdWx0TG9jYWxzW2RlcF0pIHx8IGFuZ3VsYXIuaXNEZWZpbmVkKGxvY2Fsc1tkZXBdKSkge1xuICAgICAgcmV0dXJuICFpc01pc3Npbmc7XG4gICAgfVxuICAgIHJldHVybiAhJGluamVjdG9yLmhhcyhkZXApO1xuICB9KTtcbiAgaWYgKG1pc3NpbmdEZXBlbmRlbmNpZXMubGVuZ3RoKSB7XG4gICAgY29uc29sZS53YXJuKGdldENvbnRyb2xsZXJNZXNzYWdlKGNvbnRyb2xsZXJGbixcbiAgICAgIGBoYXMgZGVwZW5kZW5jaWVzIG5vdCBhdmFpbGFibGUgaW4gaXRzIG1vZHVsZSBvciBpdHMgbW9kdWxlJ3MgZGVwZW5kZW5jaWVzLiBgICtcbiAgICAgIGBUaGUgZXh0cmEgZGVwZW5kZW5jaWVzIGFyZTogXFxgJHttaXNzaW5nRGVwZW5kZW5jaWVzLmpvaW4oJywgJyl9XFxgYFxuICAgICkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlcGVuZGVuY2llcyhmdW5jLCBzdHJpY3REaSkge1xuICBpZiAoZnVuYy4kaW5qZWN0KSB7XG4gICAgcmV0dXJuIGZ1bmMuJGluamVjdDtcbiAgfSBlbHNlIGlmIChhbmd1bGFyLmlzQXJyYXkoZnVuYykpIHtcbiAgICByZXR1cm4gZnVuYy5zbGljZSgwLCBmdW5jLmxlbmd0aCAtIDEpO1xuICB9XG4gIGNvbnN0IGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoU1RSSVBfQ09NTUVOVFMsICcnKTtcbiAgbGV0IHJlc3VsdCA9IGZuU3RyLnNsaWNlKGZuU3RyLmluZGV4T2YoJygnKSArIDEsIGZuU3RyLmluZGV4T2YoJyknKSkubWF0Y2goQVJHVU1FTlRfTkFNRVMpO1xuICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgcmVzdWx0ID0gW107XG4gIH0gZWxzZSBpZiAoc3RyaWN0RGkpIHtcbiAgICBjb25zb2xlLndhcm4oZ2V0Q29udHJvbGxlck1lc3NhZ2UoZnVuYyxcbiAgICAgIGBoYXMgZGVwZW5kZW5jaWVzLCBidXQgaXQncyB1c2luZyBJbXBsaWNpdCBBbm5vdGF0aW9uIChzZWUgaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvZ3VpZGUvZGkpYFxuICAgICkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGdldENvbnRyb2xsZXJNZXNzYWdlKGNvbnRyb2xsZXJGbiwgbWVzc2FnZSkge1xuICBjb25zdCBjb250cm9sbGVyTmFtZSA9IGNvbnRyb2xsZXJGbi5kaXNwbGF5TmFtZSB8fCBjb250cm9sbGVyRm4ubmFtZSB8fCAnYW5vbnltb3VzJztcbiAgY29uc3QgbmVlZHNNb3JlSW5mbyA9IGNvbnRyb2xsZXJOYW1lID09PSAnYW5vbnltb3VzJztcbiAgbGV0IHJlc3VsdGluZ01lc3NhZ2UgPSBgVGhlIGNvbnRyb2xsZXIgXFxgJHtjb250cm9sbGVyTmFtZX1cXGAgYDtcbiAgaWYgKG5lZWRzTW9yZUluZm8pIHtcbiAgICByZXN1bHRpbmdNZXNzYWdlICs9IGB0aGF0IHN0YXJ0cyB3aXRoIHNvbWV0aGluZyBsaWtlIHRoaXM6IFxcYFxcbiR7Y29udHJvbGxlckZuLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDUwKX1cXG5cXGAgYDtcbiAgfVxuICByZXN1bHRpbmdNZXNzYWdlICs9IG1lc3NhZ2U7XG4gIHJldHVybiByZXN1bHRpbmdNZXNzYWdlO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcy5qc1xuICoqLyIsIi8vIHNvbWUgdmVyc2lvbnMgb2YgYW5ndWxhciBkb24ndCBleHBvcnQgdGhlIGFuZ3VsYXIgbW9kdWxlIHByb3Blcmx5LFxuLy8gc28gd2UgZ2V0IGl0IGZyb20gd2luZG93IGluIHRoaXMgY2FzZS5cbnZhciBhbmd1bGFyID0gcmVxdWlyZSgnYW5ndWxhcicpO1xuaWYgKCFhbmd1bGFyLnZlcnNpb24pIHtcbiAgYW5ndWxhciA9IHdpbmRvdy5hbmd1bGFyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vYW5ndWxhci1maXgvaW5kZXguanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfNV9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJhbmd1bGFyXCJcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJjb25zdCBhbmd1bGFyID0gcmVxdWlyZSgnLi9hbmd1bGFyLWZpeCcpO1xubGV0IG5hbWUgPSAwO1xuZXhwb3J0IGRlZmF1bHQge2dldEluamVjdG9yfTtcblxuZnVuY3Rpb24gZ2V0SW5qZWN0b3IobW9kdWxlTmFtZSwgc3RyaWN0RGkpIHtcbiAgaWYgKHR5cGVvZiBtb2R1bGVOYW1lICE9PSAnc3RyaW5nJykge1xuICAgIG1vZHVsZU5hbWUgPSBtb2R1bGVOYW1lLm5hbWU7XG4gIH1cbiAgY29uc3QgbW94ZWVNb2R1bGVOYW1lID0gYG1veGVlTW9ja01vZHVsZSR7bmFtZSsrfWA7XG4gIGNvbnN0IG1veGVlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUobW94ZWVNb2R1bGVOYW1lLCBbJ25nJywgbW9kdWxlTmFtZV0pLnByb3ZpZGVyKCckcm9vdEVsZW1lbnQnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgbmctYXBwPjwvZGl2PicpO1xuICAgIH07XG4gIH0pO1xuXG4gIGNvbnN0IG1vZE5hbWVzID0gW21veGVlTW9kdWxlTmFtZV07XG4gIGxvYWRNb2R1bGVEZXBlbmRlbmNpZXMobW94ZWVNb2R1bGUsIG1vZE5hbWVzKTtcblxuICByZXR1cm4gYW5ndWxhci5pbmplY3Rvcihtb2ROYW1lcywgc3RyaWN0RGkpO1xufVxuXG5mdW5jdGlvbiBsb2FkTW9kdWxlRGVwZW5kZW5jaWVzKG5nTW9kdWxlLCBkZXBzKSB7XG4gIG5nTW9kdWxlLnJlcXVpcmVzLmZvckVhY2gobW9kTmFtZSA9PiB7XG4gICAgaWYgKGRlcHMuaW5kZXhPZihtb2ROYW1lKSA9PT0gLTEpIHtcbiAgICAgIGRlcHMucHVzaChtb2ROYW1lKTtcbiAgICB9XG4gICAgbG9hZE1vZHVsZURlcGVuZGVuY2llcyhhbmd1bGFyLm1vZHVsZShtb2ROYW1lKSwgZGVwcyk7XG4gIH0pO1xuICByZXR1cm4gZGVwcztcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL3V0aWxzLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoibW94ZWUuanMifQ==