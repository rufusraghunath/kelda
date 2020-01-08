/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/kelda-js/dist/bundle.js":
/*!**********************************************!*\
  !*** ./node_modules/kelda-js/dist/bundle.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {!function(t,e){ true?module.exports=e():undefined}(global,(function(){return function(t){var e={};function r(o){if(e[o])return e[o].exports;var n=e[o]={i:o,l:!1,exports:{}};return t[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=t,r.c=e,r.d=function(t,e,o){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)r.d(o,n,function(e){return t[e]}.bind(null,n));return o},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,r){"use strict";r.r(e);var o,n=function(){function t(t){this.isDone=!1,this.work=t}return t.prototype.execute=function(){var t=this;return new Promise((function(e,r){try{e(t.work())}catch(t){r(t)}})).finally((function(){return t.isDone=!0}))},t}();!function(t){t.START="$$_KELDA_START",t.DONE="$$_KELDA_DONE",t.ERROR="$$_KELDA_ERROR"}(o||(o={}));var i,u=function(){function t(t){this.isDone=!1,this.worker=null,this.cleanUp=this.cleanUp.bind(this),this.work=t,this.url=this.getWorkerUrl()}return t.prototype.execute=function(){return this.getWorkPromise().finally(this.cleanUp)},t.prototype.cleanUp=function(){var t;URL.revokeObjectURL(this.url),null===(t=this.worker)||void 0===t||t.terminate(),this.isDone=!0},t.prototype.getWorkPromise=function(){var t=this;return new Promise((function(e,r){try{t.doWorkInWorker(e,r)}catch(t){r(t)}}))},t.prototype.doWorkInWorker=function(t,e){this.worker=new Worker(this.url),this.initWorkerMessageHandling(t,e),this.startWork()},t.prototype.startWork=function(){var t;null===(t=this.worker)||void 0===t||t.postMessage({type:o.START})},t.prototype.initWorkerMessageHandling=function(t,e){var r;null===(r=this.worker)||void 0===r||r.addEventListener("message",(function(r){var n=r.data,i=n.type,u=n.result,s=n.error;switch(i){case o.DONE:t(u);break;case o.ERROR:e(s)}}))},t.prototype.getWorkerUrl=function(){var t=this.getWorkerScript(),e=new Blob([t],{type:"text/javascript"});return URL.createObjectURL(e)},t.prototype.getWorkerScript=function(){return"("+function(t){var e=!1;self.onmessage=function(r){var o;if(!e&&"$$_KELDA_START"===(null===(o=r.data)||void 0===o?void 0:o.type))try{var n=t.call(null);n instanceof Promise?n.then((function(t){self.postMessage({type:"$$_KELDA_DONE",result:t})})):self.postMessage({type:"$$_KELDA_DONE",result:n}),self.postMessage({type:"$$_KELDA_DONE",result:n})}catch(t){self.postMessage({type:"$$_KELDA_ERROR",error:t})}finally{e=!0}}}+")("+this.work+")"},t}(),s=function(){function t(){}return t.getJob=function(t){var e;return(null===(e=window)||void 0===e?void 0:e.Worker)?new u(t):new n(t)},t}(),a=function(){function t(){this.isIdle=!0}return t.prototype.do=function(t){var e=this;return this.isIdle=!1,t.execute().finally((function(){return e.isIdle=!0}))},t}(),c=(i=function(t,e){return(i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r])})(t,e)},function(t,e){function r(){this.constructor=t}i(t,e),t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)}),f=function(t){function e(e){var r=t.call(this,e)||this;return r.message=e,r.name="KeldaError",r}return c(e,t),e}(Error),l=function(){function t(e){this.queue=[],t.validate(e),this.threads=this.populateThreads(e),this.doFromQueue=this.doFromQueue.bind(this)}return t.validate=function(t){if(t<=0)throw new f("threadPoolDepth must be greater than 0")},t.prototype.schedule=function(t){var e=this,r=this.getThread();return r?r.do(t).finally(this.doFromQueue):new Promise((function(r,o){var n=[t,r,o];e.queue.push(n)}))},t.prototype.doFromQueue=function(){var t,e=this.queue.shift();if(e){var r=e[0],o=e[1],n=e[2];null===(t=this.getThread())||void 0===t||t.do(r).then(o).catch(n).finally(this.doFromQueue)}},t.prototype.populateThreads=function(t){return Array(t).fill(null).map((function(){return new a}))},t.prototype.getThread=function(){return this.threads.find((function(t){return t.isIdle}))},t}(),p={threadPoolDepth:1},h=function(){function t(t){var e=(void 0===t?p:t).threadPoolDepth;this.threadPool=new l(e)}return t.prototype.orderWork=function(t){var e=s.getJob(t);return this.threadPool.schedule(e).catch(this.toKeldaError)},t.prototype.toKeldaError=function(t){var e=t.message||"Something went wrong while processing work";throw new f(e)},t}();e.default=h}]).default}));
//# sourceMappingURL=bundle.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var kelda_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! kelda-js */ "./node_modules/kelda-js/dist/bundle.js");
/* harmony import */ var kelda_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(kelda_js__WEBPACK_IMPORTED_MODULE_0__);


const work = () => 1 + 1;

const kelda = new kelda_js__WEBPACK_IMPORTED_MODULE_0___default.a();

kelda
  .orderWork(work)
  .then(console.log)
  .catch(console.error);

console.log("STARTED UP");


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map