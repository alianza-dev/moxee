// moxee version 1.0.0 built with ♥ by Kent C. Dodds on Sat Mar 21 2015 22:18:19 GMT-0600 (MDT) (ó ì_í)=óò=(ì_í ò)

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("_"), require("angular"));
	else if(typeof define === 'function' && define.amd)
		define(["_", "angular"], factory);
	else if(typeof exports === 'object')
		exports["moxee"] = factory(require("_"), require("angular"));
	else
		root["moxee"] = factory(root["_"], root["angular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_6__) {
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
	
	var expectControllerToNotMissDependencies = __webpack_require__(/*! ./expectControllerToNotMissDependencies */ 4);
	var _ = __webpack_require__(/*! lodash */ 3);
	var angular = __webpack_require__(/*! ./angular-fix */ 5);
	var testableComponentTypes = ["directive", "factory", "provider", "register"];
	var harnessedModules = {};
	var testedThingsByName = {};
	
	module.exports = harnessModuleInvokeQueue;
	
	// automatically create tests for all registered components
	
	// auto-harness components that don't have tests setup
	// this helps to enforce modularity
	function harnessModuleInvokeQueue(ngModule, shouldHarness) {
	  if (typeof ngModule === "string") {
	    ngModule = angular.module(ngModule);
	  }
	  if (harnessedModules[ngModule.name]) {
	    return;
	  }
	  harnessedModules[ngModule.name] = true;
	  _.each(getComponents(ngModule), function (component) {
	    return attachTestHarnesses(component, ngModule);
	  });
	  _.each(getModuleDependencies(ngModule, shouldHarness), function (depModule) {
	    harnessModuleInvokeQueue(depModule, shouldHarness);
	  });
	}
	
	function getComponents(ngModule) {
	  return _.chain(ngModule._invokeQueue).filter(function (component) {
	    return _.contains(testableComponentTypes, component[1]);
	  }).map(function (component) {
	    var type = component[1];
	    var name = component[2][0];
	    var definition = component[2][1];
	    return { name: name, definition: definition, type: type };
	  }).value();
	}
	
	function attachTestHarnesses(component, ngModule) {
	  if (testedThingsByName["component" + component.name]) {
	    return;
	  }
	  testedThingsByName["component" + component.name] = { component: component, ngModule: ngModule };
	  createGenericTestHarness(component, ngModule.name);
	}
	
	function getModuleDependencies(ngModule, shouldHarnessFn) {
	  return _.chain(ngModule.requires).filter(shouldHarnessFn).map(function (name) {
	    return angular.module(name);
	  }).value();
	}
	
	function createGenericTestHarness(component, ngModuleName) {
	  describe(component.type + " " + component.name, function () {
	    beforeEach(window.module(ngModuleName));
	
	    it("should not use anything it does not explicitly depend on", function () {
	      // angular will cause the failure we're looking for.
	      // So this always passing assertion wont even run if
	      // It's depending on something it shouldn't.
	      expect(true).to.be["true"];
	    });
	
	    if (component.type === "directive") {
	      it("should not have a controller that uses anything it should not", inject(function ($injector) {
	        var ddo = $injector.invoke(component.definition);
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

/***/ },
/* 2 */
/*!*****************************!*\
  !*** ./stateControllers.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	// automatically create tests for all controllers
	"use strict";
	
	var expectControllerToNotMissDependencies = __webpack_require__(/*! ./expectControllerToNotMissDependencies */ 4);
	var _ = __webpack_require__(/*! lodash */ 3);
	
	module.exports = harnessStateControllers;
	
	function harnessStateControllers(allStates) {
	  _.each(allStates, function (state) {
	    if (!state.controller) {
	      return;
	    }
	    var resolves = mockResolves(state);
	    createControllerTest(state.controller, state.data.module, resolves);
	  });
	
	  function mockResolves(state) {
	    var parent = state;
	    var resolves = {};
	    while (parent) {
	      _.each(parent.resolve, mockResolve);
	      parent = parent.data && parent.data.parent;
	    }
	    return resolves;
	
	    function mockResolve(resolve, key) {
	      resolves[key] = {};
	    }
	  }
	
	  function createControllerTest(controller, ngModuleName, resolves) {
	    describe("controller " + controller.name, function () {
	      beforeEach(window.module(ngModuleName));
	
	      it("should not use anything it does not explicitly depend on", inject(function ($injector) {
	        expectControllerToNotMissDependencies(controller, $injector, _.assign({ $scope: {} }, resolves));
	      }));
	    });
	  }
	}

/***/ },
/* 3 */
/*!********************!*\
  !*** external "_" ***!
  \********************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/*!**************************************************!*\
  !*** ./expectControllerToNotMissDependencies.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _ = __webpack_require__(/*! lodash */ 3);
	
	module.exports = expectControllerToNotMissDependencies;
	
	function expectControllerToNotMissDependencies(controller, $injector, locals) {
	  controller = _.isString(controller) ? $injector.get(controller) : controller;
	  var controllerDeps = getDependencies(controller);
	  var isMissing = true;
	  var missingDependencies = _.filter(controllerDeps, function (dep) {
	    if (!_.isUndefined(locals[dep])) {
	      return !isMissing;
	    }
	    try {
	      $injector.get(dep);
	      return !isMissing;
	    } catch (e) {
	      return isMissing;
	    }
	  });
	  expect(missingDependencies, "The controller `" + (controller.displayName || controller.name || "anonymous") + "` has dependencies not available " + "in its module or its module's dependencies. Extra dependencies: \"" + ("" + missingDependencies.join(", ") + "\"")).to.be.empty;
	
	  function getDependencies(func) {
	    if (func.$inject) {
	      return func.$inject;
	    } else if (_.isArray(func)) {
	      return func.slice(0, func.length - 1);
	    }
	    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	    var ARGUMENT_NAMES = /([^\s,]+)/g;
	    var fnStr = func.toString().replace(STRIP_COMMENTS, "");
	    var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
	    if (result === null) {
	      result = [];
	    }
	    return result;
	  }
	}

/***/ },
/* 5 */
/*!******************************!*\
  !*** ./angular-fix/index.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {

	// some versions of angular don't export the angular module properly,
	// so we get it from window in this case.
	"use strict";
	
	var angular = __webpack_require__(/*! angular */ 6);
	if (!angular.version) {
	  angular = window.angular;
	}
	module.exports = angular;

/***/ },
/* 6 */
/*!**************************!*\
  !*** external "angular" ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA0MjM2OGVlZWJhOTZhODg4N2Y0MSIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9pbnZva2VRdWV1ZS5qcyIsIndlYnBhY2s6Ly8vLi9zdGF0ZUNvbnRyb2xsZXJzLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcIl9cIiIsIndlYnBhY2s6Ly8vLi9leHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzLmpzIiwid2VicGFjazovLy8uL2FuZ3VsYXItZml4L2luZGV4LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImFuZ3VsYXJcIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSx3Qzs7Ozs7Ozs7Ozs7O0FDdENBLE9BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFPLEVBQUU7QUFDUCxnQkFBVyxFQUFFLG1CQUFPLENBQUMsc0JBQWUsQ0FBQztBQUNyQyxxQkFBZ0IsRUFBRSxtQkFBTyxDQUFDLDJCQUFvQixDQUFDO0lBQ2hEO0VBQ0YsQzs7Ozs7Ozs7Ozs7QUNMRCxLQUFNLHFDQUFxQyxHQUFHLG1CQUFPLENBQUMsZ0RBQXlDLENBQUMsQ0FBQztBQUNqRyxLQUFNLENBQUMsR0FBRyxtQkFBTyxDQUFDLGVBQVEsQ0FBQyxDQUFDO0FBQzVCLEtBQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsc0JB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QUMsQ0FBQyxDQUFDO01BQ3ZDO0FBQ0QsU0FBTSxjQUFjLEdBQUcsa0NBQWtDLENBQUM7QUFDMUQsU0FBTSxjQUFjLEdBQUcsWUFBWSxDQUFDO0FBQ3BDLFNBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFELFNBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN6RixTQUFHLE1BQU0sS0FBSyxJQUFJLEVBQUU7QUFDbEIsYUFBTSxHQUFHLEVBQUUsQ0FBQztNQUNiO0FBQ0QsWUFBTyxNQUFNLENBQUM7SUFDZjs7Ozs7Ozs7Ozs7Ozs7QUN0Q0gsS0FBSSxPQUFPLEdBQUcsbUJBQU8sQ0FBQyxnQkFBUyxDQUFDLENBQUM7QUFDakMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7QUFDcEIsVUFBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7RUFDMUI7QUFDRCxPQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQzs7Ozs7Ozs7O0FDTnhCLGdEIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiX1wiKSwgcmVxdWlyZShcImFuZ3VsYXJcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW1wiX1wiLCBcImFuZ3VsYXJcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wibW94ZWVcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJfXCIpLCByZXF1aXJlKFwiYW5ndWxhclwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wibW94ZWVcIl0gPSBmYWN0b3J5KHJvb3RbXCJfXCJdLCByb290W1wiYW5ndWxhclwiXSk7XG59KSh0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzNfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV82X18pIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA0MjM2OGVlZWJhOTZhODg4N2Y0MVxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBoYXJuZXNzOiB7XG4gICAgaW52b2tlUXVldWU6IHJlcXVpcmUoJy4vaW52b2tlUXVldWUnKSxcbiAgICBzdGF0ZUNvbnRyb2xsZXJzOiByZXF1aXJlKCcuL3N0YXRlQ29udHJvbGxlcnMnKVxuICB9XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vaW5kZXguanNcbiAqKi8iLCJjb25zdCBleHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzID0gcmVxdWlyZSgnLi9leHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzJyk7XG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5jb25zdCBhbmd1bGFyID0gcmVxdWlyZSgnLi9hbmd1bGFyLWZpeCcpO1xuY29uc3QgdGVzdGFibGVDb21wb25lbnRUeXBlcyA9IFsnZGlyZWN0aXZlJywgJ2ZhY3RvcnknLCAncHJvdmlkZXInLCAncmVnaXN0ZXInXTtcbmNvbnN0IGhhcm5lc3NlZE1vZHVsZXMgPSB7fTtcbmNvbnN0IHRlc3RlZFRoaW5nc0J5TmFtZSA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGhhcm5lc3NNb2R1bGVJbnZva2VRdWV1ZTtcblxuLy8gYXV0b21hdGljYWxseSBjcmVhdGUgdGVzdHMgZm9yIGFsbCByZWdpc3RlcmVkIGNvbXBvbmVudHNcblxuLy8gYXV0by1oYXJuZXNzIGNvbXBvbmVudHMgdGhhdCBkb24ndCBoYXZlIHRlc3RzIHNldHVwXG4vLyB0aGlzIGhlbHBzIHRvIGVuZm9yY2UgbW9kdWxhcml0eVxuZnVuY3Rpb24gaGFybmVzc01vZHVsZUludm9rZVF1ZXVlKG5nTW9kdWxlLCBzaG91bGRIYXJuZXNzKSB7XG4gIGlmICh0eXBlb2YgbmdNb2R1bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgbmdNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShuZ01vZHVsZSk7XG4gIH1cbiAgaWYgKGhhcm5lc3NlZE1vZHVsZXNbbmdNb2R1bGUubmFtZV0pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaGFybmVzc2VkTW9kdWxlc1tuZ01vZHVsZS5uYW1lXSA9IHRydWU7XG4gIF8uZWFjaChnZXRDb21wb25lbnRzKG5nTW9kdWxlKSwgY29tcG9uZW50ID0+IGF0dGFjaFRlc3RIYXJuZXNzZXMoY29tcG9uZW50LCBuZ01vZHVsZSkpO1xuICBfLmVhY2goZ2V0TW9kdWxlRGVwZW5kZW5jaWVzKG5nTW9kdWxlLCBzaG91bGRIYXJuZXNzKSwgZGVwTW9kdWxlID0+IHtcbiAgICBoYXJuZXNzTW9kdWxlSW52b2tlUXVldWUoZGVwTW9kdWxlLCBzaG91bGRIYXJuZXNzKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldENvbXBvbmVudHMobmdNb2R1bGUpIHtcbiAgcmV0dXJuIF8uY2hhaW4obmdNb2R1bGUuX2ludm9rZVF1ZXVlKVxuICAgIC5maWx0ZXIoY29tcG9uZW50ID0+IF8uY29udGFpbnModGVzdGFibGVDb21wb25lbnRUeXBlcywgY29tcG9uZW50WzFdKSlcbiAgICAubWFwKGNvbXBvbmVudCA9PiB7XG4gICAgICBjb25zdCB0eXBlID0gY29tcG9uZW50WzFdO1xuICAgICAgY29uc3QgbmFtZSA9IGNvbXBvbmVudFsyXVswXTtcbiAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb21wb25lbnRbMl1bMV07XG4gICAgICByZXR1cm4ge25hbWUsIGRlZmluaXRpb24sIHR5cGV9O1xuICAgIH0pXG4gICAgLnZhbHVlKCk7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaFRlc3RIYXJuZXNzZXMoY29tcG9uZW50LCBuZ01vZHVsZSkge1xuICBpZiAodGVzdGVkVGhpbmdzQnlOYW1lWydjb21wb25lbnQnICsgY29tcG9uZW50Lm5hbWVdKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRlc3RlZFRoaW5nc0J5TmFtZVsnY29tcG9uZW50JyArIGNvbXBvbmVudC5uYW1lXSA9IHtjb21wb25lbnQsIG5nTW9kdWxlfTtcbiAgY3JlYXRlR2VuZXJpY1Rlc3RIYXJuZXNzKGNvbXBvbmVudCwgbmdNb2R1bGUubmFtZSk7XG59XG5cbmZ1bmN0aW9uIGdldE1vZHVsZURlcGVuZGVuY2llcyhuZ01vZHVsZSwgc2hvdWxkSGFybmVzc0ZuKSB7XG4gIHJldHVybiBfLmNoYWluKG5nTW9kdWxlLnJlcXVpcmVzKVxuICAgIC5maWx0ZXIoc2hvdWxkSGFybmVzc0ZuKVxuICAgIC5tYXAoKG5hbWUpID0+IGFuZ3VsYXIubW9kdWxlKG5hbWUpKVxuICAgIC52YWx1ZSgpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHZW5lcmljVGVzdEhhcm5lc3MoY29tcG9uZW50LCBuZ01vZHVsZU5hbWUpIHtcbiAgZGVzY3JpYmUoY29tcG9uZW50LnR5cGUgKyAnICcgKyBjb21wb25lbnQubmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgYmVmb3JlRWFjaCh3aW5kb3cubW9kdWxlKG5nTW9kdWxlTmFtZSkpO1xuXG5cbiAgICBpdCgnc2hvdWxkIG5vdCB1c2UgYW55dGhpbmcgaXQgZG9lcyBub3QgZXhwbGljaXRseSBkZXBlbmQgb24nLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGFuZ3VsYXIgd2lsbCBjYXVzZSB0aGUgZmFpbHVyZSB3ZSdyZSBsb29raW5nIGZvci5cbiAgICAgIC8vIFNvIHRoaXMgYWx3YXlzIHBhc3NpbmcgYXNzZXJ0aW9uIHdvbnQgZXZlbiBydW4gaWZcbiAgICAgIC8vIEl0J3MgZGVwZW5kaW5nIG9uIHNvbWV0aGluZyBpdCBzaG91bGRuJ3QuXG4gICAgICBleHBlY3QodHJ1ZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGlmIChjb21wb25lbnQudHlwZSA9PT0gJ2RpcmVjdGl2ZScpIHtcbiAgICAgIGl0KCdzaG91bGQgbm90IGhhdmUgYSBjb250cm9sbGVyIHRoYXQgdXNlcyBhbnl0aGluZyBpdCBzaG91bGQgbm90JywgaW5qZWN0KGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgICAgICBjb25zdCBkZG8gPSAkaW5qZWN0b3IuaW52b2tlKGNvbXBvbmVudC5kZWZpbml0aW9uKTtcbiAgICAgICAgaWYgKGRkby5jb250cm9sbGVyKSB7XG4gICAgICAgICAgZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcyhkZG8uY29udHJvbGxlciwgJGluamVjdG9yLCB7XG4gICAgICAgICAgICAkc2NvcGU6IHt9LFxuICAgICAgICAgICAgJGVsZW1lbnQ6IHt9LFxuICAgICAgICAgICAgJGF0dHJzOiB7fVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfVxuICB9KTtcbn1cblxuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2VzbGludC1sb2FkZXIhLi9pbnZva2VRdWV1ZS5qc1xuICoqLyIsIi8vIGF1dG9tYXRpY2FsbHkgY3JlYXRlIHRlc3RzIGZvciBhbGwgY29udHJvbGxlcnNcbmNvbnN0IGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMgPSByZXF1aXJlKCcuL2V4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMnKTtcbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBoYXJuZXNzU3RhdGVDb250cm9sbGVycztcblxuZnVuY3Rpb24gaGFybmVzc1N0YXRlQ29udHJvbGxlcnMoYWxsU3RhdGVzKSB7XG4gIF8uZWFjaChhbGxTdGF0ZXMsIGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKCFzdGF0ZS5jb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc29sdmVzID0gbW9ja1Jlc29sdmVzKHN0YXRlKTtcbiAgICBjcmVhdGVDb250cm9sbGVyVGVzdChzdGF0ZS5jb250cm9sbGVyLCBzdGF0ZS5kYXRhLm1vZHVsZSwgcmVzb2x2ZXMpO1xuICB9KTtcblxuICBmdW5jdGlvbiBtb2NrUmVzb2x2ZXMoc3RhdGUpIHtcbiAgICBsZXQgcGFyZW50ID0gc3RhdGU7XG4gICAgY29uc3QgcmVzb2x2ZXMgPSB7fTtcbiAgICB3aGlsZShwYXJlbnQpIHtcbiAgICAgIF8uZWFjaChwYXJlbnQucmVzb2x2ZSwgbW9ja1Jlc29sdmUpO1xuICAgICAgcGFyZW50ID0gcGFyZW50LmRhdGEgJiYgcGFyZW50LmRhdGEucGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gcmVzb2x2ZXM7XG5cbiAgICBmdW5jdGlvbiBtb2NrUmVzb2x2ZShyZXNvbHZlLCBrZXkpIHtcbiAgICAgIHJlc29sdmVzW2tleV0gPSB7fTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb250cm9sbGVyVGVzdChjb250cm9sbGVyLCBuZ01vZHVsZU5hbWUsIHJlc29sdmVzKSB7XG4gICAgZGVzY3JpYmUoJ2NvbnRyb2xsZXIgJyArIGNvbnRyb2xsZXIubmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICBiZWZvcmVFYWNoKHdpbmRvdy5tb2R1bGUobmdNb2R1bGVOYW1lKSk7XG5cbiAgICAgIGl0KCdzaG91bGQgbm90IHVzZSBhbnl0aGluZyBpdCBkb2VzIG5vdCBleHBsaWNpdGx5IGRlcGVuZCBvbicsIGluamVjdChmdW5jdGlvbigkaW5qZWN0b3IpIHtcbiAgICAgICAgZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcyhjb250cm9sbGVyLCAkaW5qZWN0b3IsIF8uYXNzaWduKHskc2NvcGU6IHt9fSwgcmVzb2x2ZXMpKTtcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vc3RhdGVDb250cm9sbGVycy5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8zX187XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcIl9cIlxuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzO1xuXG5mdW5jdGlvbiBleHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzKGNvbnRyb2xsZXIsICRpbmplY3RvciwgbG9jYWxzKSB7XG4gIGNvbnRyb2xsZXIgPSBfLmlzU3RyaW5nKGNvbnRyb2xsZXIpID8gJGluamVjdG9yLmdldChjb250cm9sbGVyKSA6IGNvbnRyb2xsZXI7XG4gIGNvbnN0IGNvbnRyb2xsZXJEZXBzID0gZ2V0RGVwZW5kZW5jaWVzKGNvbnRyb2xsZXIpO1xuICBjb25zdCBpc01pc3NpbmcgPSB0cnVlO1xuICBjb25zdCBtaXNzaW5nRGVwZW5kZW5jaWVzID0gXy5maWx0ZXIoY29udHJvbGxlckRlcHMsIGZ1bmN0aW9uKGRlcCkge1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChsb2NhbHNbZGVwXSkpIHtcbiAgICAgIHJldHVybiAhaXNNaXNzaW5nO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgJGluamVjdG9yLmdldChkZXApO1xuICAgICAgcmV0dXJuICFpc01pc3Npbmc7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gaXNNaXNzaW5nO1xuICAgIH1cbiAgfSk7XG4gIGV4cGVjdChtaXNzaW5nRGVwZW5kZW5jaWVzLFxuICAgIGBUaGUgY29udHJvbGxlciBcXGAke2NvbnRyb2xsZXIuZGlzcGxheU5hbWUgfHwgY29udHJvbGxlci5uYW1lIHx8ICdhbm9ueW1vdXMnfVxcYCBoYXMgZGVwZW5kZW5jaWVzIG5vdCBhdmFpbGFibGUgYCArXG4gICAgYGluIGl0cyBtb2R1bGUgb3IgaXRzIG1vZHVsZSdzIGRlcGVuZGVuY2llcy4gRXh0cmEgZGVwZW5kZW5jaWVzOiBcImAgK1xuICAgIGAke21pc3NpbmdEZXBlbmRlbmNpZXMuam9pbignLCAnKX1cImBcbiAgKS50by5iZS5lbXB0eTtcblxuXG4gIGZ1bmN0aW9uIGdldERlcGVuZGVuY2llcyhmdW5jKSB7XG4gICAgaWYgKGZ1bmMuJGluamVjdCkge1xuICAgICAgcmV0dXJuIGZ1bmMuJGluamVjdDtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheShmdW5jKSkge1xuICAgICAgcmV0dXJuIGZ1bmMuc2xpY2UoMCwgZnVuYy5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgY29uc3QgU1RSSVBfQ09NTUVOVFMgPSAvKChcXC9cXC8uKiQpfChcXC9cXCpbXFxzXFxTXSo/XFwqXFwvKSkvbWc7XG4gICAgY29uc3QgQVJHVU1FTlRfTkFNRVMgPSAvKFteXFxzLF0rKS9nO1xuICAgIGNvbnN0IGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoU1RSSVBfQ09NTUVOVFMsICcnKTtcbiAgICBsZXQgcmVzdWx0ID0gZm5TdHIuc2xpY2UoZm5TdHIuaW5kZXhPZignKCcpKzEsIGZuU3RyLmluZGV4T2YoJyknKSkubWF0Y2goQVJHVU1FTlRfTkFNRVMpO1xuICAgIGlmKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL2V4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMuanNcbiAqKi8iLCIvLyBzb21lIHZlcnNpb25zIG9mIGFuZ3VsYXIgZG9uJ3QgZXhwb3J0IHRoZSBhbmd1bGFyIG1vZHVsZSBwcm9wZXJseSxcbi8vIHNvIHdlIGdldCBpdCBmcm9tIHdpbmRvdyBpbiB0aGlzIGNhc2UuXG52YXIgYW5ndWxhciA9IHJlcXVpcmUoJ2FuZ3VsYXInKTtcbmlmICghYW5ndWxhci52ZXJzaW9uKSB7XG4gIGFuZ3VsYXIgPSB3aW5kb3cuYW5ndWxhcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhcjtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL2FuZ3VsYXItZml4L2luZGV4LmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzZfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwiYW5ndWxhclwiXG4gKiogbW9kdWxlIGlkID0gNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoibW94ZWUuanMifQ==