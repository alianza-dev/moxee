// moxee version 1.0.3 built with ♥ by Kent C. Dodds on Sat Mar 21 2015 22:54:55 GMT-0600 (MDT) (ó ì_í)=óò=(ì_í ò)

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBhMTE4ODY5M2ViZmFkNTQ5ZGY3ZiIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9pbnZva2VRdWV1ZS5qcyIsIndlYnBhY2s6Ly8vLi9zdGF0ZUNvbnRyb2xsZXJzLmpzIiwid2VicGFjazovLy8uL2V4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vYW5ndWxhci1maXgvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYW5ndWxhclwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHdDOzs7Ozs7Ozs7Ozs7QUN0Q0EsT0FBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFVBQU8sRUFBRTtBQUNQLGdCQUFXLEVBQUUsbUJBQU8sQ0FBQyxzQkFBZSxDQUFDO0FBQ3JDLHFCQUFnQixFQUFFLG1CQUFPLENBQUMsMkJBQW9CLENBQUM7SUFDaEQ7RUFDRixDOzs7Ozs7Ozs7OztBQ0xELEtBQU0scUNBQXFDLEdBQUcsbUJBQU8sQ0FBQyxnREFBeUMsQ0FBQyxDQUFDO0FBQ2pHLEtBQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsc0JBQWUsQ0FBQyxDQUFDO0FBQ3pDLEtBQU0sc0JBQXNCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFV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R0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDekYsU0FBRyxNQUFNLEtBQUssSUFBSSxFQUFFO0FBQ2xCLGFBQU0sR0FBRyxFQUFFLENBQUM7TUFDYjtBQUNELFlBQU8sTUFBTSxDQUFDO0lBQ2Y7Ozs7Ozs7Ozs7Ozs7O0FDdENILEtBQUksT0FBTyxHQUFHLG1CQUFPLENBQUMsZ0JBQVMsQ0FBQyxDQUFDO0FBQ2pDLEtBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3BCLFVBQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0VBQzFCO0FBQ0QsT0FBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLEM7Ozs7Ozs7OztBQ054QixnRCIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcImFuZ3VsYXJcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW1wiYW5ndWxhclwiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJtb3hlZVwiXSA9IGZhY3RvcnkocmVxdWlyZShcImFuZ3VsYXJcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIm1veGVlXCJdID0gZmFjdG9yeShyb290W1wiYW5ndWxhclwiXSk7XG59KSh0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzVfXykge1xucmV0dXJuIFxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvblxuICoqLyIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIGExMTg4NjkzZWJmYWQ1NDlkZjdmXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGhhcm5lc3M6IHtcbiAgICBpbnZva2VRdWV1ZTogcmVxdWlyZSgnLi9pbnZva2VRdWV1ZScpLFxuICAgIHN0YXRlQ29udHJvbGxlcnM6IHJlcXVpcmUoJy4vc3RhdGVDb250cm9sbGVycycpXG4gIH1cbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuLi9+L2VzbGludC1sb2FkZXIhLi9pbmRleC5qc1xuICoqLyIsImNvbnN0IGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMgPSByZXF1aXJlKCcuL2V4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMnKTtcbmNvbnN0IGFuZ3VsYXIgPSByZXF1aXJlKCcuL2FuZ3VsYXItZml4Jyk7XG5jb25zdCB0ZXN0YWJsZUNvbXBvbmVudFR5cGVzID0gWydkaXJlY3RpdmUnLCAnZmFjdG9yeScsICdwcm92aWRlcicsICdyZWdpc3RlciddO1xuY29uc3QgaGFybmVzc2VkTW9kdWxlcyA9IHt9O1xuY29uc3QgdGVzdGVkVGhpbmdzQnlOYW1lID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gaGFybmVzc01vZHVsZUludm9rZVF1ZXVlO1xuXG4vLyBhdXRvbWF0aWNhbGx5IGNyZWF0ZSB0ZXN0cyBmb3IgYWxsIHJlZ2lzdGVyZWQgY29tcG9uZW50c1xuXG4vLyBhdXRvLWhhcm5lc3MgY29tcG9uZW50cyB0aGF0IGRvbid0IGhhdmUgdGVzdHMgc2V0dXBcbi8vIHRoaXMgaGVscHMgdG8gZW5mb3JjZSBtb2R1bGFyaXR5XG5mdW5jdGlvbiBoYXJuZXNzTW9kdWxlSW52b2tlUXVldWUobmdNb2R1bGUsIHNob3VsZEhhcm5lc3MpIHtcbiAgaWYgKHR5cGVvZiBuZ01vZHVsZSA9PT0gJ3N0cmluZycpIHtcbiAgICBuZ01vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKG5nTW9kdWxlKTtcbiAgfVxuICBpZiAoaGFybmVzc2VkTW9kdWxlc1tuZ01vZHVsZS5uYW1lXSkge1xuICAgIHJldHVybjtcbiAgfVxuICBoYXJuZXNzZWRNb2R1bGVzW25nTW9kdWxlLm5hbWVdID0gdHJ1ZTtcbiAgYW5ndWxhci5mb3JFYWNoKGdldENvbXBvbmVudHMobmdNb2R1bGUpLCBjb21wb25lbnQgPT4gYXR0YWNoVGVzdEhhcm5lc3Nlcyhjb21wb25lbnQsIG5nTW9kdWxlKSk7XG4gIGFuZ3VsYXIuZm9yRWFjaChnZXRNb2R1bGVEZXBlbmRlbmNpZXMobmdNb2R1bGUsIHNob3VsZEhhcm5lc3MpLCBkZXBNb2R1bGUgPT4ge1xuICAgIGhhcm5lc3NNb2R1bGVJbnZva2VRdWV1ZShkZXBNb2R1bGUsIHNob3VsZEhhcm5lc3MpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29tcG9uZW50cyhuZ01vZHVsZSkge1xuICByZXR1cm4gbmdNb2R1bGUuX2ludm9rZVF1ZXVlXG4gICAgLmZpbHRlcihjb21wb25lbnQgPT4gdGVzdGFibGVDb21wb25lbnRUeXBlcy5pbmRleE9mKGNvbXBvbmVudFsxXSkgIT09IC0xKVxuICAgIC5tYXAoY29tcG9uZW50ID0+IHtcbiAgICAgIGNvbnN0IHR5cGUgPSBjb21wb25lbnRbMV07XG4gICAgICBjb25zdCBuYW1lID0gY29tcG9uZW50WzJdWzBdO1xuICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbXBvbmVudFsyXVsxXTtcbiAgICAgIHJldHVybiB7bmFtZSwgZGVmaW5pdGlvbiwgdHlwZX07XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaFRlc3RIYXJuZXNzZXMoY29tcG9uZW50LCBuZ01vZHVsZSkge1xuICBpZiAodGVzdGVkVGhpbmdzQnlOYW1lWydjb21wb25lbnQnICsgY29tcG9uZW50Lm5hbWVdKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRlc3RlZFRoaW5nc0J5TmFtZVsnY29tcG9uZW50JyArIGNvbXBvbmVudC5uYW1lXSA9IHtjb21wb25lbnQsIG5nTW9kdWxlfTtcbiAgY3JlYXRlR2VuZXJpY1Rlc3RIYXJuZXNzKGNvbXBvbmVudCwgbmdNb2R1bGUubmFtZSk7XG59XG5cbmZ1bmN0aW9uIGdldE1vZHVsZURlcGVuZGVuY2llcyhuZ01vZHVsZSwgc2hvdWxkSGFybmVzc0ZuKSB7XG4gIHJldHVybiBuZ01vZHVsZS5yZXF1aXJlc1xuICAgIC5maWx0ZXIoc2hvdWxkSGFybmVzc0ZuKVxuICAgIC5tYXAoKG5hbWUpID0+IGFuZ3VsYXIubW9kdWxlKG5hbWUpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2VuZXJpY1Rlc3RIYXJuZXNzKGNvbXBvbmVudCwgbmdNb2R1bGVOYW1lKSB7XG4gIGRlc2NyaWJlKGNvbXBvbmVudC50eXBlICsgJyAnICsgY29tcG9uZW50Lm5hbWUsIGZ1bmN0aW9uKCkge1xuICAgIGJlZm9yZUVhY2god2luZG93Lm1vZHVsZShuZ01vZHVsZU5hbWUpKTtcblxuXG4gICAgaXQoJ3Nob3VsZCBub3QgdXNlIGFueXRoaW5nIGl0IGRvZXMgbm90IGV4cGxpY2l0bHkgZGVwZW5kIG9uJywgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhbmd1bGFyIHdpbGwgY2F1c2UgdGhlIGZhaWx1cmUgd2UncmUgbG9va2luZyBmb3IuXG4gICAgICAvLyBTbyB0aGlzIGFsd2F5cyBwYXNzaW5nIGFzc2VydGlvbiB3b250IGV2ZW4gcnVuIGlmXG4gICAgICAvLyBJdCdzIGRlcGVuZGluZyBvbiBzb21ldGhpbmcgaXQgc2hvdWxkbid0LlxuICAgICAgZXhwZWN0KHRydWUpLnRvLmJlLnRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAoY29tcG9uZW50LnR5cGUgPT09ICdkaXJlY3RpdmUnKSB7XG4gICAgICBpdCgnc2hvdWxkIG5vdCBoYXZlIGEgY29udHJvbGxlciB0aGF0IHVzZXMgYW55dGhpbmcgaXQgc2hvdWxkIG5vdCcsIGluamVjdChmdW5jdGlvbigkaW5qZWN0b3IpIHtcbiAgICAgICAgY29uc3QgZGRvID0gJGluamVjdG9yLmludm9rZShjb21wb25lbnQuZGVmaW5pdGlvbik7XG4gICAgICAgIGlmIChkZG8uY29udHJvbGxlcikge1xuICAgICAgICAgIGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMoZGRvLmNvbnRyb2xsZXIsICRpbmplY3Rvciwge1xuICAgICAgICAgICAgJHNjb3BlOiB7fSxcbiAgICAgICAgICAgICRlbGVtZW50OiB7fSxcbiAgICAgICAgICAgICRhdHRyczoge31cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH1cbiAgfSk7XG59XG5cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vaW52b2tlUXVldWUuanNcbiAqKi8iLCIvLyBhdXRvbWF0aWNhbGx5IGNyZWF0ZSB0ZXN0cyBmb3IgYWxsIGNvbnRyb2xsZXJzXG5jb25zdCBleHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzID0gcmVxdWlyZSgnLi9leHBlY3RDb250cm9sbGVyVG9Ob3RNaXNzRGVwZW5kZW5jaWVzJyk7XG5jb25zdCBhbmd1bGFyID0gcmVxdWlyZSgnLi9hbmd1bGFyLWZpeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGhhcm5lc3NTdGF0ZUNvbnRyb2xsZXJzO1xuXG5mdW5jdGlvbiBoYXJuZXNzU3RhdGVDb250cm9sbGVycyhhbGxTdGF0ZXMpIHtcbiAgYW5ndWxhci5mb3JFYWNoKGFsbFN0YXRlcywgZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoIXN0YXRlLmNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVzb2x2ZXMgPSBtb2NrUmVzb2x2ZXMoc3RhdGUpO1xuICAgIGNyZWF0ZUNvbnRyb2xsZXJUZXN0KHN0YXRlLmNvbnRyb2xsZXIsIHN0YXRlLmRhdGEubmdNb2R1bGUsIHJlc29sdmVzKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gbW9ja1Jlc29sdmVzKHN0YXRlKSB7XG4gICAgbGV0IHBhcmVudCA9IHN0YXRlO1xuICAgIGNvbnN0IHJlc29sdmVzID0ge307XG4gICAgd2hpbGUocGFyZW50KSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGFyZW50LnJlc29sdmUsIG1vY2tSZXNvbHZlKTtcbiAgICAgIHBhcmVudCA9IHBhcmVudC5kYXRhICYmIHBhcmVudC5kYXRhLnBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc29sdmVzO1xuXG4gICAgZnVuY3Rpb24gbW9ja1Jlc29sdmUocmVzb2x2ZSwga2V5KSB7XG4gICAgICByZXNvbHZlc1trZXldID0ge307XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclRlc3QoY29udHJvbGxlciwgbmdNb2R1bGVOYW1lLCByZXNvbHZlcykge1xuICAgIGRlc2NyaWJlKCdjb250cm9sbGVyICcgKyBjb250cm9sbGVyLm5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgYmVmb3JlRWFjaCh3aW5kb3cubW9kdWxlKG5nTW9kdWxlTmFtZSkpO1xuXG4gICAgICBpdCgnc2hvdWxkIG5vdCB1c2UgYW55dGhpbmcgaXQgZG9lcyBub3QgZXhwbGljaXRseSBkZXBlbmQgb24nLCBpbmplY3QoZnVuY3Rpb24oJGluamVjdG9yKSB7XG4gICAgICAgIGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMoY29udHJvbGxlciwgJGluamVjdG9yLCBhbmd1bGFyLmV4dGVuZCh7JHNjb3BlOiB7fX0sIHJlc29sdmVzKSk7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4uL34vZXNsaW50LWxvYWRlciEuL3N0YXRlQ29udHJvbGxlcnMuanNcbiAqKi8iLCJjb25zdCBhbmd1bGFyID0gcmVxdWlyZSgnLi9hbmd1bGFyLWZpeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXM7XG5cbmZ1bmN0aW9uIGV4cGVjdENvbnRyb2xsZXJUb05vdE1pc3NEZXBlbmRlbmNpZXMoY29udHJvbGxlciwgJGluamVjdG9yLCBsb2NhbHMpIHtcbiAgY29udHJvbGxlciA9IGFuZ3VsYXIuaXNTdHJpbmcoY29udHJvbGxlcikgPyAkaW5qZWN0b3IuZ2V0KGNvbnRyb2xsZXIpIDogY29udHJvbGxlcjtcbiAgY29uc3QgY29udHJvbGxlckRlcHMgPSBnZXREZXBlbmRlbmNpZXMoY29udHJvbGxlcik7XG4gIGNvbnN0IGlzTWlzc2luZyA9IHRydWU7XG4gIGNvbnN0IG1pc3NpbmdEZXBlbmRlbmNpZXMgPSBjb250cm9sbGVyRGVwcy5maWx0ZXIoZnVuY3Rpb24oZGVwKSB7XG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGxvY2Fsc1tkZXBdKSkge1xuICAgICAgcmV0dXJuICFpc01pc3Npbmc7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAkaW5qZWN0b3IuZ2V0KGRlcCk7XG4gICAgICByZXR1cm4gIWlzTWlzc2luZztcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBpc01pc3Npbmc7XG4gICAgfVxuICB9KTtcbiAgZXhwZWN0KG1pc3NpbmdEZXBlbmRlbmNpZXMsXG4gICAgYFRoZSBjb250cm9sbGVyIFxcYCR7Y29udHJvbGxlci5kaXNwbGF5TmFtZSB8fCBjb250cm9sbGVyLm5hbWUgfHwgJ2Fub255bW91cyd9XFxgIGhhcyBkZXBlbmRlbmNpZXMgbm90IGF2YWlsYWJsZSBgICtcbiAgICBgaW4gaXRzIG1vZHVsZSBvciBpdHMgbW9kdWxlJ3MgZGVwZW5kZW5jaWVzLiBFeHRyYSBkZXBlbmRlbmNpZXM6IFwiYCArXG4gICAgYCR7bWlzc2luZ0RlcGVuZGVuY2llcy5qb2luKCcsICcpfVwiYFxuICApLnRvLmJlLmVtcHR5O1xuXG5cbiAgZnVuY3Rpb24gZ2V0RGVwZW5kZW5jaWVzKGZ1bmMpIHtcbiAgICBpZiAoZnVuYy4kaW5qZWN0KSB7XG4gICAgICByZXR1cm4gZnVuYy4kaW5qZWN0O1xuICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc0FycmF5KGZ1bmMpKSB7XG4gICAgICByZXR1cm4gZnVuYy5zbGljZSgwLCBmdW5jLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBjb25zdCBTVFJJUF9DT01NRU5UUyA9IC8oKFxcL1xcLy4qJCl8KFxcL1xcKltcXHNcXFNdKj9cXCpcXC8pKS9tZztcbiAgICBjb25zdCBBUkdVTUVOVF9OQU1FUyA9IC8oW15cXHMsXSspL2c7XG4gICAgY29uc3QgZm5TdHIgPSBmdW5jLnRvU3RyaW5nKCkucmVwbGFjZShTVFJJUF9DT01NRU5UUywgJycpO1xuICAgIGxldCByZXN1bHQgPSBmblN0ci5zbGljZShmblN0ci5pbmRleE9mKCcoJykrMSwgZm5TdHIuaW5kZXhPZignKScpKS5tYXRjaChBUkdVTUVOVF9OQU1FUyk7XG4gICAgaWYocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vZXhwZWN0Q29udHJvbGxlclRvTm90TWlzc0RlcGVuZGVuY2llcy5qc1xuICoqLyIsIi8vIHNvbWUgdmVyc2lvbnMgb2YgYW5ndWxhciBkb24ndCBleHBvcnQgdGhlIGFuZ3VsYXIgbW9kdWxlIHByb3Blcmx5LFxuLy8gc28gd2UgZ2V0IGl0IGZyb20gd2luZG93IGluIHRoaXMgY2FzZS5cbnZhciBhbmd1bGFyID0gcmVxdWlyZSgnYW5ndWxhcicpO1xuaWYgKCFhbmd1bGFyLnZlcnNpb24pIHtcbiAgYW5ndWxhciA9IHdpbmRvdy5hbmd1bGFyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi4vfi9lc2xpbnQtbG9hZGVyIS4vYW5ndWxhci1maXgvaW5kZXguanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfNV9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJhbmd1bGFyXCJcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJtb3hlZS5qcyJ9