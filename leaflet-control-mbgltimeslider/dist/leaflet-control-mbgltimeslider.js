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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(0);

/*
 *
 */

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
    },

    //
    // MBGL TimeSlider API methods
    // the rest of these simply "pass through" to the real control, passing params as-given, so Leaflet consumers can use getDate() setRange() et al
    //
    getDate: function getDate() {
        var _timeslider;

        return (_timeslider = this._timeslider).getDate.apply(_timeslider, arguments);
    },
    getRange: function getRange() {
        var _timeslider2;

        return (_timeslider2 = this._timeslider).getRange.apply(_timeslider2, arguments);
    },
    getLimit: function getLimit() {
        var _timeslider3;

        return (_timeslider3 = this._timeslider).getLimit.apply(_timeslider3, arguments);
    },
    yearForward: function yearForward() {
        var _timeslider4;

        return (_timeslider4 = this._timeslider).yearForward.apply(_timeslider4, arguments);
    },
    yearBack: function yearBack() {
        var _timeslider5;

        return (_timeslider5 = this._timeslider).yearBack.apply(_timeslider5, arguments);
    },
    setDate: function setDate() {
        var _timeslider6;

        return (_timeslider6 = this._timeslider).setDate.apply(_timeslider6, arguments);
    },
    setRange: function setRange() {
        var _timeslider7;

        return (_timeslider7 = this._timeslider).setRange.apply(_timeslider7, arguments);
    },
    setRangeUpper: function setRangeUpper() {
        var _timeslider8;

        return (_timeslider8 = this._timeslider).setRangeUpper.apply(_timeslider8, arguments);
    },
    setRangeLower: function setRangeLower() {
        var _timeslider9;

        return (_timeslider9 = this._timeslider).setRangeLower.apply(_timeslider9, arguments);
    },
    isDateWithinRange: function isDateWithinRange() {
        var _timeslider10;

        return (_timeslider10 = this._timeslider).isDateWithinRange.apply(_timeslider10, arguments);
    },
    isDateWithinLimit: function isDateWithinLimit() {
        var _timeslider11;

        return (_timeslider11 = this._timeslider).isDateWithinLimit.apply(_timeslider11, arguments);
    }
});

/*
 * THE HASH READER AND WRITER
 * again, a thin wrapper over the real controls TimeSlider.UrlHashReader and TimeSlider.UrlHashWriter
 * rathr than duplicating their logic
 */

L.Control.MBGLTimeSliderUrlHashReader = L.Control.extend({
    options: {
        position: 'topright', // not really used, there is no visible UI
        timeslidercontrol: undefined
    },
    initialize: function initialize(options) {
        L.setOptions(this, options);

        var isslider = this.options.timeslidercontrol instanceof L.Control.MBGLTimeSlider;
        if (!isslider) throw 'L.Control.MBGLTimeSliderUrlHashWriter timeslidercontrol must point to a  L.Control.MBGLTimeSlider instance';
    },
    onAdd: function onAdd(map) {
        var _this2 = this;

        this._map = map;

        // if the URL params contain /zoom/lat/lng then we DO need to apply those here to our parent map
        // if not, then the params are still parsed by the real UrlHashReader and that one layer is panned and zoomed,
        // which gets real silly the first time we pan/zoom the real map!


        var theregex = /^#(\d+\.?\d+)\/(\-?\d+\.\d+)\/(\-?\d+\.\d+)/;
        var thematch = location.hash.match(theregex);
        if (thematch) {
            var zoom = parseFloat(thematch[1]);
            var lat = parseFloat(thematch[2]);
            var lng = parseFloat(thematch[3]);
            this._map.setView([lat, lng], zoom);
        }

        // wait until the Leaflet slider control's MBGL layer has load-ed
        // create the real control (told you, this is but a thin wrapper) and add it to our real MBGL map
        var theglmap = this.options.timeslidercontrol._glmaplayer._glMap;
        theglmap.on('load', function () {
            var therealslider = _this2.options.timeslidercontrol._timeslider;

            _this2._realcontrol = new TimeSlider.UrlHashReader({
                timeslidercontrol: therealslider,
                leafletZoomLevelHack: true
            });
            theglmap.addControl(_this2._realcontrol);

            window.addEventListener('hashchange', function () {
                _this2.handleHashChange();
            });
        });

        // we have no visible UI, but we are required to create a container DIV
        this._container = L.DomUtil.create('div', 'leaflet-control-mbgltimeslider-urlhashreader');
        return this._container;
    },
    onRemove: function onRemove() {
        var _this3 = this;

        this._map = undefined;

        var theglmap = this.options.timeslidercontrol._glmaplayer._glMap;
        theglmap.removeControl(this._realcontrol);

        window.removeEventListener('hashchange', function () {
            _this3.handleHashChange();
        });
    },
    handleHashChange: function handleHashChange() {
        // beyond the TimeSlider.UrlHashReader's own behavior,
        // this Leaflet map should also be affected when hash changes, e.g. center and zoom
        // example: #18/40.8217108/-73.9119449/1980,1970-2000
        // zoom, lat, lng, date and range
        var theregex = /^#(\d+\.?\d+)\/(\-?\d+\.\d+)\/(\-?\d+\.\d+)\/(\-?\d+),(\-?\d+)\-(\-?\d+)/;
        var thematch = location.hash.match(theregex);
        if (!thematch) return console.debug('UrlHashReader found no URL params to apply');

        var zoom = parseFloat(thematch[1]);
        var lat = parseFloat(thematch[2]);
        var lng = parseFloat(thematch[3]);
        this._map.setView([lat, lng], zoom);
    }
});

L.Control.MBGLTimeSliderUrlHashWriter = L.Control.extend({
    options: {
        position: 'topright', // not really used, there is no visible UI
        timeslidercontrol: undefined
    },
    initialize: function initialize(options) {
        L.setOptions(this, options);

        var isslider = this.options.timeslidercontrol instanceof L.Control.MBGLTimeSlider;
        if (!isslider) throw 'L.Control.MBGLTimeSliderUrlHashWriter timeslidercontrol must point to a  L.Control.MBGLTimeSlider instance';
    },
    onAdd: function onAdd(map) {
        var _this4 = this;

        this._map = map;

        // wait until the Leaflet slider control's MBGL layer has load-ed
        // create the real control (told you, this is but a thin wrapper) and add it to our real MBGL map
        var theglmap = this.options.timeslidercontrol._glmaplayer._glMap;
        theglmap.on('load', function () {
            var therealslider = _this4.options.timeslidercontrol._timeslider;

            _this4._realcontrol = new TimeSlider.UrlHashWriter({
                timeslidercontrol: therealslider,
                leafletZoomLevelHack: true
            });
            theglmap.addControl(_this4._realcontrol);
        });

        // we have no visible UI, but we are required to create a container DIV
        this._container = L.DomUtil.create('div', 'leaflet-control-mbgltimeslider-urlhashwriter');
        return this._container;
    },
    onRemove: function onRemove() {
        this._map = undefined;

        var theglmap = this.options.timeslidercontrol._glmaplayer._glMap;
        theglmap.removeControl(this._realcontrol);
    }
});

/***/ })
/******/ ]);
//# sourceMappingURL=leaflet-control-mbgltimeslider.js.map