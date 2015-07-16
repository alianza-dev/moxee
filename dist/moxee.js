// moxee version 1.0.8 built with ♥ by Kent C. Dodds on Thu Jul 16 2015 13:15:30 GMT-0600 (MDT) (ó ì_í)=óò=(ì_í ò)

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
	  angular.forEach(getComponents(ngModule), function (component) {
	    return attachTestHarnesses(component, ngModule);
	  });
	  angular.forEach(getModuleDependencies(ngModule, shouldHarness), function (depModule) {
	    harnessModuleInvokeQueue(depModule, shouldHarness);
	  });
	}
	
	function getComponents(ngModule) {
	  return ngModule._invokeQueue.filter(function (component) {
	    return testableComponentTypes.indexOf(component[1]) !== -1;
	  }).map(function (component) {
	    var type = component[1];
	    var name = component[2][0];
	    var definition = component[2][1];
	    return { name: name, definition: definition, type: type };
	  });
	}
	
	function attachTestHarnesses(component, ngModule) {
	  if (testedThingsByName["component" + component.name]) {
	    return;
	  }
	  testedThingsByName["component" + component.name] = { component: component, ngModule: ngModule };
	  createGenericTestHarness(component, ngModule.name);
	}
	
	function getModuleDependencies(ngModule, shouldHarnessFn) {
	  return ngModule.requires.filter(shouldHarnessFn).map(function (name) {
	    return angular.module(name);
	  });
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
	            $attrs: {},
	            $transclude: angular.noop
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
	
	var expectControllerToNotMissDependencies = __webpack_require__(/*! ./expectControllerToNotMissDependencies */ 3);
	var angular = __webpack_require__(/*! ./angular-fix */ 4);
	
	module.exports = harnessStateControllers;
	
	function harnessStateControllers(allStates) {
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
	      parent = parent.data && parent.data.parent;
	    }
	    return resolves;
	
	    function mockResolve(resolve, key) {
	      resolves[key] = {};
	    }
	  }
	
	  function createControllerTest(controller, ngModuleName, resolves) {
	    if (typeof ngModuleName !== "string") {
	      ngModuleName = ngModuleName.name;
	    }
	    describe("controller " + controller.name, function () {
	      beforeEach(window.module(ngModuleName));
	
	      it("should not use anything it does not explicitly depend on", inject(function ($injector) {
	        expectControllerToNotMissDependencies(controller, $injector, angular.extend({ $scope: {} }, resolves));
	      }));
	    });
	  }
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
	
	module.exports = expectControllerToNotMissDependencies;
	
	function expectControllerToNotMissDependencies(controller, $injector, locals) {
	  controller = angular.isString(controller) ? $injector.get(controller) : controller;
	  var controllerDeps = getDependencies(controller);
	  var isMissing = true;
	  var missingDependencies = controllerDeps.filter(function (dep) {
	    if (angular.isDefined(locals[dep])) {
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
	    } else if (angular.isArray(func)) {
	      return func.slice(0, func.length - 1);
	    }
	    var fnStr = func.toString().replace(STRIP_COMMENTS, "");
	    var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
	    if (result === null) {
	      result = [];
	    }
	    return result;
	  }
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

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA1NTIwMmM4YmE3YjNlMzlhYmViYiIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9pbnZva2VRdWV1ZS5qcyIsIndlYnBhY2s6Ly8vLi9zdGF0ZUNvbnRyb2xsZXJzLmpzIiwid2VicGFjazovLy8uL2V4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vYW5ndWxhci1maXgvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYW5ndWxhclwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHdDOzs7Ozs7Ozs7Ozs7QUN0Q0EsT0FBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFVBQU8sRUFBRTtBQUNQLGdCQUFXLEVBQUUsbUJBQU8sQ0FBQyxzQkFBZSxDQUFDO0FBQ3JDLHFCQUFnQixFQUFFLG1CQUFPLENBQUMsMkJBQW9CLENBQUM7SUFDaEQ7RUFDRixDOzs7Ozs7Ozs7OztBQ0xELEtBQU0scUNBQXFDLEdBQUcsbUJBQU8sQ0FBQyxnREFBeUMsQ0FBQyxDQUFDO0FBQ2pHLEtBQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsc0JBQWUsQ0FBQyxDQUFDO0FBQ3pDLEtBQU0sc0JBQXNCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFV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QUMsQ0FBQztNQUN2QztBQUNELFNBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFELFNBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN6RixTQUFHLE1BQU0sS0FBSyxJQUFJLEVBQUU7QUFDbEIsYUFBTSxHQUFHLEVBQUUsQ0FBQztNQUNiO0FBQ0QsWUFBTyxNQUFNLENBQUM7SUFDZjs7Ozs7Ozs7Ozs7Ozs7QUN0Q0gsS0FBSSxPQUFPLEdBQUcsbUJBQU8sQ0FBQyxnQkFBUyxDQUFDLENBQUM7QUFDakMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7QUFDcEIsVUFBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7RUFDMUI7QUFDRCxPQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQzs7Ozs7Ozs7O0FDTnhCLGdEIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiYW5ndWxhclwiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXCJhbmd1bGFyXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIm1veGVlXCJdID0gZmFjdG9yeShyZXF1aXJlKFwiYW5ndWxhclwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wibW94ZWVcIl0gPSBmYWN0b3J5KHJvb3RbXCJhbmd1bGFyXCJdKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfNV9fKSB7XG5yZXR1cm4gXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uXG4gKiovIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgNTUyMDJjOGJhN2IzZTM5YWJlYmJcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaGFybmVzczoge1xuICAgIGludm9rZVF1ZXVlOiByZXF1aXJlKCcuL2ludm9rZVF1ZXVlJyksXG4gICAgc3RhdGVDb250cm9sbGVyczogcmVxdWlyZSgnLi9zdGF0ZUNvbnRyb2xsZXJzJylcbiAgfVxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL2luZGV4LmpzXG4gKiovIiwiY29uc3QgZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcyA9IHJlcXVpcmUoJy4vZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcycpO1xuY29uc3QgYW5ndWxhciA9IHJlcXVpcmUoJy4vYW5ndWxhci1maXgnKTtcbmNvbnN0IHRlc3RhYmxlQ29tcG9uZW50VHlwZXMgPSBbJ2RpcmVjdGl2ZScsICdmYWN0b3J5JywgJ3Byb3ZpZGVyJywgJ3JlZ2lzdGVyJ107XG5jb25zdCBoYXJuZXNzZWRNb2R1bGVzID0ge307XG5jb25zdCB0ZXN0ZWRUaGluZ3NCeU5hbWUgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBoYXJuZXNzTW9kdWxlSW52b2tlUXVldWU7XG5cbi8vIGF1dG9tYXRpY2FsbHkgY3JlYXRlIHRlc3RzIGZvciBhbGwgcmVnaXN0ZXJlZCBjb21wb25lbnRzXG5cbi8vIGF1dG8taGFybmVzcyBjb21wb25lbnRzIHRoYXQgZG9uJ3QgaGF2ZSB0ZXN0cyBzZXR1cFxuLy8gdGhpcyBoZWxwcyB0byBlbmZvcmNlIG1vZHVsYXJpdHlcbmZ1bmN0aW9uIGhhcm5lc3NNb2R1bGVJbnZva2VRdWV1ZShuZ01vZHVsZSwgc2hvdWxkSGFybmVzcykge1xuICBpZiAodHlwZW9mIG5nTW9kdWxlID09PSAnc3RyaW5nJykge1xuICAgIG5nTW9kdWxlID0gYW5ndWxhci5tb2R1bGUobmdNb2R1bGUpO1xuICB9XG4gIGlmIChoYXJuZXNzZWRNb2R1bGVzW25nTW9kdWxlLm5hbWVdKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGhhcm5lc3NlZE1vZHVsZXNbbmdNb2R1bGUubmFtZV0gPSB0cnVlO1xuICBhbmd1bGFyLmZvckVhY2goZ2V0Q29tcG9uZW50cyhuZ01vZHVsZSksIGNvbXBvbmVudCA9PiBhdHRhY2hUZXN0SGFybmVzc2VzKGNvbXBvbmVudCwgbmdNb2R1bGUpKTtcbiAgYW5ndWxhci5mb3JFYWNoKGdldE1vZHVsZURlcGVuZGVuY2llcyhuZ01vZHVsZSwgc2hvdWxkSGFybmVzcyksIGRlcE1vZHVsZSA9PiB7XG4gICAgaGFybmVzc01vZHVsZUludm9rZVF1ZXVlKGRlcE1vZHVsZSwgc2hvdWxkSGFybmVzcyk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRDb21wb25lbnRzKG5nTW9kdWxlKSB7XG4gIHJldHVybiBuZ01vZHVsZS5faW52b2tlUXVldWVcbiAgICAuZmlsdGVyKGNvbXBvbmVudCA9PiB0ZXN0YWJsZUNvbXBvbmVudFR5cGVzLmluZGV4T2YoY29tcG9uZW50WzFdKSAhPT0gLTEpXG4gICAgLm1hcChjb21wb25lbnQgPT4ge1xuICAgICAgY29uc3QgdHlwZSA9IGNvbXBvbmVudFsxXTtcbiAgICAgIGNvbnN0IG5hbWUgPSBjb21wb25lbnRbMl1bMF07XG4gICAgICBjb25zdCBkZWZpbml0aW9uID0gY29tcG9uZW50WzJdWzFdO1xuICAgICAgcmV0dXJuIHtuYW1lLCBkZWZpbml0aW9uLCB0eXBlfTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYXR0YWNoVGVzdEhhcm5lc3Nlcyhjb21wb25lbnQsIG5nTW9kdWxlKSB7XG4gIGlmICh0ZXN0ZWRUaGluZ3NCeU5hbWVbJ2NvbXBvbmVudCcgKyBjb21wb25lbnQubmFtZV0pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGVzdGVkVGhpbmdzQnlOYW1lWydjb21wb25lbnQnICsgY29tcG9uZW50Lm5hbWVdID0ge2NvbXBvbmVudCwgbmdNb2R1bGV9O1xuICBjcmVhdGVHZW5lcmljVGVzdEhhcm5lc3MoY29tcG9uZW50LCBuZ01vZHVsZS5uYW1lKTtcbn1cblxuZnVuY3Rpb24gZ2V0TW9kdWxlRGVwZW5kZW5jaWVzKG5nTW9kdWxlLCBzaG91bGRIYXJuZXNzRm4pIHtcbiAgcmV0dXJuIG5nTW9kdWxlLnJlcXVpcmVzXG4gICAgLmZpbHRlcihzaG91bGRIYXJuZXNzRm4pXG4gICAgLm1hcCgobmFtZSkgPT4gYW5ndWxhci5tb2R1bGUobmFtZSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHZW5lcmljVGVzdEhhcm5lc3MoY29tcG9uZW50LCBuZ01vZHVsZU5hbWUpIHtcbiAgZGVzY3JpYmUoY29tcG9uZW50LnR5cGUgKyAnICcgKyBjb21wb25lbnQubmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgYmVmb3JlRWFjaCh3aW5kb3cubW9kdWxlKG5nTW9kdWxlTmFtZSkpO1xuXG5cbiAgICBpdCgnc2hvdWxkIG5vdCB1c2UgYW55dGhpbmcgaXQgZG9lcyBub3QgZXhwbGljaXRseSBkZXBlbmQgb24nLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGFuZ3VsYXIgd2lsbCBjYXVzZSB0aGUgZmFpbHVyZSB3ZSdyZSBsb29raW5nIGZvci5cbiAgICAgIC8vIFNvIHRoaXMgYWx3YXlzIHBhc3NpbmcgYXNzZXJ0aW9uIHdvbnQgZXZlbiBydW4gaWZcbiAgICAgIC8vIEl0J3MgZGVwZW5kaW5nIG9uIHNvbWV0aGluZyBpdCBzaG91bGRuJ3QuXG4gICAgICBleHBlY3QodHJ1ZSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGlmIChjb21wb25lbnQudHlwZSA9PT0gJ2RpcmVjdGl2ZScpIHtcbiAgICAgIGl0KCdzaG91bGQgbm90IGhhdmUgYSBjb250cm9sbGVyIHRoYXQgdXNlcyBhbnl0aGluZyBpdCBzaG91bGQgbm90JywgaW5qZWN0KGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgICAgICBjb25zdCBkZG8gPSAkaW5qZWN0b3IuaW52b2tlKGNvbXBvbmVudC5kZWZpbml0aW9uKTtcbiAgICAgICAgaWYgKGRkby5jb250cm9sbGVyKSB7XG4gICAgICAgICAgZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcyhkZG8uY29udHJvbGxlciwgJGluamVjdG9yLCB7XG4gICAgICAgICAgICAkc2NvcGU6IHt9LFxuICAgICAgICAgICAgJGVsZW1lbnQ6IHt9LFxuICAgICAgICAgICAgJGF0dHJzOiB7fSxcbiAgICAgICAgICAgICR0cmFuc2NsdWRlOiBhbmd1bGFyLm5vb3BcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH1cbiAgfSk7XG59XG5cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vaW52b2tlUXVldWUuanNcbiAqKi8iLCIvLyBhdXRvbWF0aWNhbGx5IGNyZWF0ZSB0ZXN0cyBmb3IgYWxsIGNvbnRyb2xsZXJzXG5jb25zdCBleHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzID0gcmVxdWlyZSgnLi9leHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzJyk7XG5jb25zdCBhbmd1bGFyID0gcmVxdWlyZSgnLi9hbmd1bGFyLWZpeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGhhcm5lc3NTdGF0ZUNvbnRyb2xsZXJzO1xuXG5mdW5jdGlvbiBoYXJuZXNzU3RhdGVDb250cm9sbGVycyhhbGxTdGF0ZXMpIHtcbiAgYW5ndWxhci5mb3JFYWNoKGFsbFN0YXRlcywgZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoIXN0YXRlLmNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZXMgPSBtb2NrUmVzb2x2ZXMoc3RhdGUpO1xuICAgIGNyZWF0ZUNvbnRyb2xsZXJUZXN0KHN0YXRlLmNvbnRyb2xsZXIsIHN0YXRlLmRhdGEubmdNb2R1bGUsIHJlc29sdmVzKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gbW9ja1Jlc29sdmVzKHN0YXRlKSB7XG4gICAgbGV0IHBhcmVudCA9IHN0YXRlO1xuICAgIGNvbnN0IHJlc29sdmVzID0ge307XG4gICAgd2hpbGUocGFyZW50KSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGFyZW50LnJlc29sdmUsIG1vY2tSZXNvbHZlKTtcbiAgICAgIHBhcmVudCA9IHBhcmVudC5kYXRhICYmIHBhcmVudC5kYXRhLnBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc29sdmVzO1xuXG4gICAgZnVuY3Rpb24gbW9ja1Jlc29sdmUocmVzb2x2ZSwga2V5KSB7XG4gICAgICByZXNvbHZlc1trZXldID0ge307XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclRlc3QoY29udHJvbGxlciwgbmdNb2R1bGVOYW1lLCByZXNvbHZlcykge1xuICAgIGlmICh0eXBlb2YgbmdNb2R1bGVOYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmdNb2R1bGVOYW1lID0gbmdNb2R1bGVOYW1lLm5hbWU7XG4gICAgfVxuICAgIGRlc2NyaWJlKCdjb250cm9sbGVyICcgKyBjb250cm9sbGVyLm5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgYmVmb3JlRWFjaCh3aW5kb3cubW9kdWxlKG5nTW9kdWxlTmFtZSkpO1xuXG4gICAgICBpdCgnc2hvdWxkIG5vdCB1c2UgYW55dGhpbmcgaXQgZG9lcyBub3QgZXhwbGljaXRseSBkZXBlbmQgb24nLCBpbmplY3QoZnVuY3Rpb24oJGluamVjdG9yKSB7XG4gICAgICAgIGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMoY29udHJvbGxlciwgJGluamVjdG9yLCBhbmd1bGFyLmV4dGVuZCh7JHNjb3BlOiB7fX0sIHJlc29sdmVzKSk7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL3N0YXRlQ29udHJvbGxlcnMuanNcbiAqKi8iLCJjb25zdCBhbmd1bGFyID0gcmVxdWlyZSgnLi9hbmd1bGFyLWZpeCcpO1xuY29uc3QgU1RSSVBfQ09NTUVOVFMgPSAvKChcXC9cXC8uKiQpfChcXC9cXCpbXFxzXFxTXSo/XFwqXFwvKSkvbWc7XG5jb25zdCBBUkdVTUVOVF9OQU1FUyA9IC8oW15cXHMsXSspL2c7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcztcblxuZnVuY3Rpb24gZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcyhjb250cm9sbGVyLCAkaW5qZWN0b3IsIGxvY2Fscykge1xuICBjb250cm9sbGVyID0gYW5ndWxhci5pc1N0cmluZyhjb250cm9sbGVyKSA/ICRpbmplY3Rvci5nZXQoY29udHJvbGxlcikgOiBjb250cm9sbGVyO1xuICBjb25zdCBjb250cm9sbGVyRGVwcyA9IGdldERlcGVuZGVuY2llcyhjb250cm9sbGVyKTtcbiAgY29uc3QgaXNNaXNzaW5nID0gdHJ1ZTtcbiAgY29uc3QgbWlzc2luZ0RlcGVuZGVuY2llcyA9IGNvbnRyb2xsZXJEZXBzLmZpbHRlcihmdW5jdGlvbihkZXApIHtcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQobG9jYWxzW2RlcF0pKSB7XG4gICAgICByZXR1cm4gIWlzTWlzc2luZztcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICRpbmplY3Rvci5nZXQoZGVwKTtcbiAgICAgIHJldHVybiAhaXNNaXNzaW5nO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGlzTWlzc2luZztcbiAgICB9XG4gIH0pO1xuICBleHBlY3QobWlzc2luZ0RlcGVuZGVuY2llcyxcbiAgICBgVGhlIGNvbnRyb2xsZXIgXFxgJHtjb250cm9sbGVyLmRpc3BsYXlOYW1lIHx8IGNvbnRyb2xsZXIubmFtZSB8fCAnYW5vbnltb3VzJ31cXGAgaGFzIGRlcGVuZGVuY2llcyBub3QgYXZhaWxhYmxlIGAgK1xuICAgIGBpbiBpdHMgbW9kdWxlIG9yIGl0cyBtb2R1bGUncyBkZXBlbmRlbmNpZXMuIEV4dHJhIGRlcGVuZGVuY2llczogXCJgICtcbiAgICBgJHttaXNzaW5nRGVwZW5kZW5jaWVzLmpvaW4oJywgJyl9XCJgXG4gICkudG8uYmUuZW1wdHk7XG5cblxuICBmdW5jdGlvbiBnZXREZXBlbmRlbmNpZXMoZnVuYykge1xuICAgIGlmIChmdW5jLiRpbmplY3QpIHtcbiAgICAgIHJldHVybiBmdW5jLiRpbmplY3Q7XG4gICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzQXJyYXkoZnVuYykpIHtcbiAgICAgIHJldHVybiBmdW5jLnNsaWNlKDAsIGZ1bmMubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIGNvbnN0IGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoU1RSSVBfQ09NTUVOVFMsICcnKTtcbiAgICBsZXQgcmVzdWx0ID0gZm5TdHIuc2xpY2UoZm5TdHIuaW5kZXhPZignKCcpKzEsIGZuU3RyLmluZGV4T2YoJyknKSkubWF0Y2goQVJHVU1FTlRfTkFNRVMpO1xuICAgIGlmKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL2V4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMuanNcbiAqKi8iLCIvLyBzb21lIHZlcnNpb25zIG9mIGFuZ3VsYXIgZG9uJ3QgZXhwb3J0IHRoZSBhbmd1bGFyIG1vZHVsZSBwcm9wZXJseSxcbi8vIHNvIHdlIGdldCBpdCBmcm9tIHdpbmRvdyBpbiB0aGlzIGNhc2UuXG52YXIgYW5ndWxhciA9IHJlcXVpcmUoJ2FuZ3VsYXInKTtcbmlmICghYW5ndWxhci52ZXJzaW9uKSB7XG4gIGFuZ3VsYXIgPSB3aW5kb3cuYW5ndWxhcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhcjtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL2FuZ3VsYXItZml4L2luZGV4LmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzVfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwiYW5ndWxhclwiXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoibW94ZWUuanMifQ==