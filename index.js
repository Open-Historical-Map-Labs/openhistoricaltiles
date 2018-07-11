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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _maplayers = __webpack_require__(3);

var MIN_ZOOM = 2;
var MAX_ZOOM = 16;
var START_ZOOM = 3;
var START_CENTER = [-99.5, 37.9];

window.MAP = undefined;

$(document).ready(function () {
    //
    // basic map
    //
    MAP = new mapboxgl.Map({
        container: "map",
        style: _maplayers.GLMAP_STYLE,
        zoom: START_ZOOM,
        center: START_CENTER,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM
    });

    MAP.addControl(new mapboxgl.NavigationControl());

    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // read a simple location hash: #Z/LAT/LNG   example:  #15/47.6073/-122.3327
        // now at page load, then keep watching the address bar
        if (window.location.hash) {
            window.checkHashAndApply();
        }
        window.addEventListener("hashchange", function () {
            window.checkHashAndApply();
        }, false);
    });
});

window.checkHashAndApply = function () {
    var zxy_regex = /^\#(\d+)\/(\-?\d+\.\d+)\/(\-\d+\.\d+)/;
    var zxy = window.location.hash.match(zxy_regex);
    if (!zxy) return; // not a match, maybe blank, maybe malformed?

    var z = zxy[1];
    var lat = zxy[2];
    var lng = zxy[3];

    MAP.setZoom(z);
    MAP.setCenter([lng, lat]);
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "index.html";

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * A MB Style object, used as-is by the Mapbox GL map define layers, styles, basemap options, etc
 * Broken into a separate file for more modular version control, so design folks can mess with it with fewer merge conflicts
 * This file being a JSON-like structure, but not a JSON document, we have certain liberties such as commenting and variable interpolation.
 *
 * While this structure can be READ at startup to create UI etc,
 * the official source of truth once the map is running would be MAP.getStyle().layers
 * which would reflect the actual state of the layers at that time: changed visibility, style & filters, ...
 * and it's the LayerPickerControl which will change the visibility of these layers (that's why they're all "none" right now)
 */

var OHM_BASE_URL = exports.OHM_BASE_URL = "http://ec2-18-209-171-18.compute-1.amazonaws.com";
var OHM_TILEJSON = exports.OHM_TILEJSON = OHM_BASE_URL + "/index.json";
var OHM_URL = exports.OHM_URL = OHM_BASE_URL + "/{z}/{x}/{y}.pbf";

var GLMAP_STYLE = exports.GLMAP_STYLE = {
  "version": 8,
  "name": "mandesdemo",
  "sources": {
    "ohm-data": {
      "type": "vector",
      "tiles": [OHM_URL]
    },
    "modern-basemap-light": {
      "type": "raster",
      "tiles": ["https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", "https://d.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"],
      "tileSize": 256
    },
    "modern-basemap-labels": {
      "type": "raster",
      "tiles": ["https://a.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png", "https://b.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png", "https://c.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png", "https://d.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png"],
      "tileSize": 256
    }
  },
  "sprite": "https://openmaptiles.github.io/osm-bright-gl-style/sprite",
  "glyphs": "https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key=RiS4gsgZPZqeeMlIyxFo",
  "layers": [
  /*
   * BASEMAP OPTIONS
   */
  {
    "id": "modern-basemap-light",
    "type": "raster",
    "source": "modern-basemap-light"
  },

  /*
   * THE OHM LAYER, the real meat of the matter
   * Layer list of of July 12 2018:
   * water
   * waterway
   * landcover
   * landuse
   * mountain_peak
   * park
   * boundary
   * aeroway
   * transportation
   * building
   * water_name
   * transportation_name
   * place
   * housenumber
   * poi
   * aerodrome_label
   */

  {
    "id": "ohm-transportation",
    "source": "ohm-data",
    "source-layer": "transportation",
    "type": "line",
    "paint": {
      "line-color": "rgb(0, 0, 0)",
      "line-width": 3
    }
  }, {
    "id": "ohm-poi",
    "source": "ohm-data",
    "source-layer": "poi",
    "type": "circle",
    "paint": {
      "circle-color": "rgb(255, 0, 0)",
      "circle-radius": 10
    }
  },

  /*
   * MODERN LABELS, over top of everything else
   */
  {
    "id": "modern-basemap-labels",
    "type": "raster",
    "source": "modern-basemap-labels",
    "paint": {
      "raster-opacity": 0.50 /*,
                             "layout": {
                              "visibility": "none"
                             }*/
    } }]
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// webpack entry point
// list JS files to include, CSS and SASS files to include, HTML templates to have [hash] replacement, etc.

__webpack_require__(2);
__webpack_require__(0);
__webpack_require__(1);

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map