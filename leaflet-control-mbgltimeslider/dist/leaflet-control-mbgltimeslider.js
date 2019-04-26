/******/ (function(modules) { // webpackBootstrap
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(1);

L.Control.MBGLTimeSlider = L.Control.extend({
    options: {
        position: 'topright',
        mbgllayer: undefined,
        timeSliderOptions: {}
    },
    initialize: function initialize(options) {
        L.setOptions(this, options);

        if (!this.options.mbgllayer) throw 'L.Control.MBGLTimeSlider the mbgllayer option is required';
        if (!this.options.mbgllayer._glMap) throw 'L.Control.MBGLTimeSlider layer specified by mbgllayer option is not a L.mapboxGL instance';
    },
    onAdd: function onAdd(map) {
        var _this = this;

        this._map = map;
        this._glmaplayer = this.options.mbgllayer;

        // create our container
        // no UI of our own, but we do move the MBGL TimeSlider container DIV into our own, so it properly falls into div.leaflet-control-container
        // for positioning reasons, and layer-stackig reasons (the control being inside the MBGL map, means it is in the display panes!)
        this._container = L.DomUtil.create('div', 'leaflet-control-mbgltimeslider');

        // wait for the MBGL layer to "load" (note that the layer is in fact a whole MBGL.Map)
        // then add the TimeSlider control to it
        if (!TimeSlider || !TimeSlider.TimeSliderControl) throw 'L.Control.MBGLTimeSlider could not find the MBGL TimeSlider library loaded';

        this._glmaplayer._glMap.on('load', function () {
            _this._addTimeSliderControlToMap();
        });

        // all done
        return this._container;
    },
    onRemove: function onRemove() {
        this._removeTimeSliderControlFromMap();
    },
    _addTimeSliderControlToMap: function _addTimeSliderControlToMap() {
        // create the control and add it to the MBGL map
        this._timeslider = new TimeSlider.TimeSliderControl(this.options.timeSliderOptions);
        this._glmaplayer._glMap.addControl(this._timeslider);

        // stop mouse event propagation from the TimeSlider's DIV
        // so using the control won't also pan the map, zoom in if they double-click, etc.
        L.DomEvent.disableClickPropagation(this._timeslider._container);

        // move the MBGL slider's UI container into our own container,
        // so it will be properly positioned, and also stacked above the map content
        this._container.appendChild(this._timeslider._container);
    },
    _removeTimeSliderControlFromMap: function _removeTimeSliderControlFromMap() {
        // remove the TimeSlider from the MBGL map
        this._glmaplayer._glMap.removeControl(this._timeslider);
    }
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);
//# sourceMappingURL=leaflet-control-mbgltimeslider.js.map