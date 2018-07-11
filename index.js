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

var _mbglControlTimeslider = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./js/mbgl-control-timeslider\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _mbglControlLayerpicker = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./js/mbgl-control-layerpicker\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _mbglControlMousehovers = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./js/mbgl-control-mousehovers\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _mbglControlMouseclicks = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./js/mbgl-control-mouseclicks\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _mbglControlInspectorpanel = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./js/mbgl-control-inspectorpanel\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var MIN_ZOOM = 3;
var MAX_ZOOM = 10;
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

    // for this demo, the Newberry data
    // 1629 is the Plymouth land grant, the first county/township
    // 1783 is the Treaty of Paris, where US states became legit (despite the US saying they were legit in 1776)
    MAP.TIMESLIDER = new _mbglControlTimeslider.TimeSliderControl({
        year: 1783,
        min: 1630,
        max: 2000,
        step: 1,
        play_years: 5,
        maplayerids: ['state-boundaries-historical', 'county-boundaries-historical']
    });
    MAP.addControl(MAP.TIMESLIDER);

    MAP.LAYERPICKER = new _mbglControlLayerpicker.LayerPickerControl();
    MAP.addControl(MAP.LAYERPICKER);

    MAP.INSPECTORPANEL = new _mbglControlInspectorpanel.InspectorPanelControl({
        templates: {
            'states-modern': function statesModern(feature) {
                return '' + feature.properties.STATE_NAME;
            },
            'counties-modern': function countiesModern(feature) {
                return feature.properties.NAME + ' County';
            },
            'states-historical': function statesHistorical(feature) {
                return '\n                    <b>' + feature.properties.NAME + ', ' + feature.properties.START + ' - ' + (feature.properties.END != '9999/12/31' ? feature.properties.END : 'Present') + '</b>\n                    <br/>\n                    <div class="small">' + feature.properties.CHANGE + ' ' + feature.properties.CITATION + '</div>\n                ';
            },
            'counties-historical': function countiesHistorical(feature) {
                return '\n                    <b>' + feature.properties.NAME + ', ' + feature.properties.START + ' - ' + (feature.properties.END != '9999/12/31' ? feature.properties.END : 'Present') + '</b>\n                    <br/>\n                    <div class="small">' + feature.properties.CHANGE + ' ' + feature.properties.CITATION + '</div>\n                ';
            }
        }
    });
    MAP.addControl(MAP.INSPECTORPANEL);

    MAP.HOVERS = new _mbglControlMousehovers.MapHoversControl({
        layers: {
            'state-boundaries-historical': {
                enter: function enter(mouseevent) {
                    // there's a highlight layer: same data as state boundaries, but alternative style to be shown in conjunction with the visible one
                    var featureid = mouseevent.features[0].properties.IDNUM;
                    var tooltip = mouseevent.features[0].properties.NAME;
                    MAP.setFilter('state-boundaries-historical-hover', ["==", "IDNUM", featureid]);
                    document.getElementById('map').title = tooltip;
                    MAP.getCanvas().style.cursor = 'crosshair';
                },
                leave: function leave(mouseevent) {
                    MAP.setFilter('state-boundaries-historical-hover', ["==", "IDNUM", -1]);
                    document.getElementById('map').title = "";
                    MAP.getCanvas().style.cursor = 'inherit';
                }
            },
            'county-boundaries-historical': {
                enter: function enter(mouseevent) {
                    // there's a highlight layer: same data as county boundaries, but alternative style to be shown in conjunction with the visible one
                    var featureid = mouseevent.features[0].properties.IDNUM;
                    var tooltip = mouseevent.features[0].properties.NAME;
                    MAP.setFilter('county-boundaries-historical-hover', ["==", "IDNUM", featureid]);
                    document.getElementById('map').title = tooltip;
                    MAP.getCanvas().style.cursor = 'crosshair';
                },
                leave: function leave(mouseevent) {
                    MAP.setFilter('county-boundaries-historical-hover', ["==", "IDNUM", -1]);
                    document.getElementById('map').title = "";
                    MAP.getCanvas().style.cursor = 'inherit';
                }
            }
        }
    });
    MAP.addControl(MAP.HOVERS);

    MAP.CLICKS = new _mbglControlMouseclicks.MapClicksControl({
        click: function click(clickevent) {
            // one layer at a time, compile the history of thisd point location
            // past state/territory status and modern state
            // past county/township status and modern county
            // the inspector panel expects a list of result sets, with a title and a list of results and a spec as to which layout template to use
            //
            // warning: a known "feature" of vector tile querying like this, is that it ONLY OPERATES ON WHAT'S VISIBLE IN THE VIEWPORT
            // e.g. no counties until you've zoomed in
            var collected_feature_groups = [{
                title: "Present Day",
                template: 'states-modern',
                features: MAP.queryRenderedFeatures(clickevent.point, { layers: ['states-modern-clickable'] })
            }, {
                title: "Present County/Township",
                template: 'counties-modern',
                features: MAP.queryRenderedFeatures(clickevent.point, { layers: ['counties-modern-clickable'] })
            }, {
                title: "Historical State/Territory",
                template: 'states-historical',
                features: MAP.queryRenderedFeatures(clickevent.point, { layers: ['states-historical-clickable'] })
            }, {
                title: "Historical County/Township",
                template: 'counties-historical',
                features: MAP.queryRenderedFeatures(clickevent.point, { layers: ['counties-historical-clickable'] })
            }];

            // unique-ify each set of features by its IDNUM; MBGL is documented to return duplicates when features span tiles
            // the modern datasets lack an IDNUM which is okay: there will only be one feature (if any), with a key of undefined, so we still end up with 1 feature afterward (if any)
            collected_feature_groups.forEach(function (featuregroup) {
                var uniques = {};
                featuregroup.features.forEach(function (feature) {
                    uniques[feature.properties.IDNUM] = feature;
                });
                featuregroup.features = Object.values(uniques);
            });
            collected_feature_groups.forEach(function (featuregroup) {
                switch (featuregroup.template) {
                    case 'counties-historical':
                    case 'states-historical':
                        featuregroup.features.sort(function (p, q) {
                            return p.properties.START < q.properties.START ? 1 : -1;
                        });
                        break;
                }
            });

            // ready; hand off
            MAP.INSPECTORPANEL.loadFeatures(collected_feature_groups);
        }
    });
    MAP.addControl(MAP.CLICKS);

    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // nothing else to do here; controls all have their own map.load handlers to fire up their dynamic actions
        // this is where one would load a querystring/hash to set up initial state: filtering and layer visibility, etc.
    });
});

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

var VECTILES_BASE_URL = exports.VECTILES_BASE_URL = "https://ohm-demo.s3.amazonaws.com/tiles/";

var STATES_MIN_ZOOM = exports.STATES_MIN_ZOOM = 3;
var COUNTIES_MIN_ZOOM = exports.COUNTIES_MIN_ZOOM = 6;

var GLMAP_STYLE = exports.GLMAP_STYLE = {
  "version": 8,
  "name": "mandesdemo",
  "sources": {
    "states-historical": {
      "type": "vector",
      "tiles": [VECTILES_BASE_URL + "states-historical/{z}/{x}/{y}.pbf"]
    },
    "counties-historical": {
      "type": "vector",
      "tiles": [VECTILES_BASE_URL + "counties-historical/{z}/{x}/{y}.pbf"]
    },
    "states-modern": {
      "type": "vector",
      "tiles": [VECTILES_BASE_URL + "states-modern/{z}/{x}/{y}.pbf"]
    },
    "counties-modern": {
      "type": "vector",
      "tiles": [VECTILES_BASE_URL + "counties-modern/{z}/{x}/{y}.pbf"]
    },
    "basemap-light": {
      "type": "raster",
      "tiles": ["https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", "https://d.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"],
      "tileSize": 256
    },
    "basemap-labels": {
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
    "id": "basemap-light",
    "type": "raster",
    "source": "basemap-light"
  },

  /*
   * HISTORICAL BOUNDARIES, the real meat of the matter
   * these are likely to be broken up to form color-classifications
   */
  {
    "id": "state-boundaries-historical",
    "source": "states-historical",
    "source-layer": "states",
    "type": "fill",
    "minzoom": STATES_MIN_ZOOM,
    "paint": {
      "fill-color": "rgb(168, 74, 0)",
      "fill-outline-color": "rgb(0, 0, 0)"
    },
    "layout": {
      "visibility": "none"
    },
    "filter": ['all', ["<=", "START", "9999/12/31"], [">", "END", "9999/12/31"]] // filter: start date and end date clauses, drop in a year to see what had any presence during that year
  }, {
    "id": "county-boundaries-historical",
    "source": "counties-historical",
    "source-layer": "counties",
    "type": "fill",
    "minzoom": COUNTIES_MIN_ZOOM,
    "paint": {
      "fill-color": "rgb(241, 168, 66)",
      "fill-outline-color": "rgb(0, 0, 0)"
    },
    "layout": {
      "visibility": "none"
    },
    "filter": ['all', ["<=", "START", "9999/12/31"], [">", "END", "9999/12/31"]] // filter: start date and end date clauses, drop in a year to see what had any presence during that year
  },

  /*
   * MODERN BOUNDARIES, for reference
   */
  {
    "id": "state-boundaries-modern-line",
    "source": "states-modern",
    "source-layer": "states",
    "type": "line",
    "minzoom": STATES_MIN_ZOOM,
    "paint": {
      "line-color": "black",
      "line-width": 4
    },
    "layout": {
      "visibility": "none"
    }
  }, {
    "id": "county-boundaries-modern-line",
    "source": "counties-modern",
    "source-layer": "counties",
    "type": "line",
    "minzoom": COUNTIES_MIN_ZOOM,
    "paint": {
      "line-color": "black",
      "line-width": 2
    },
    "layout": {
      "visibility": "none"
    }
  },

  /*
   * HOVER EFFECTS, same state/county shapes as above, but lighter color... and with a filter to match nothing until mouse movement changes the filter
   */
  {
    "id": "county-boundaries-historical-hover",
    "source": "counties-historical",
    "source-layer": "counties",
    "type": "fill",
    "minzoom": COUNTIES_MIN_ZOOM,
    "paint": {
      "fill-color": "white",
      "fill-opacity": 0.5
    },
    "layout": {
      "visibility": "visible"
    },
    "filter": ["==", "IDNUM", -1] // for highlighting by this unique feature ID
  }, {
    "id": "state-boundaries-historical-hover",
    "source": "states-historical",
    "source-layer": "states",
    "type": "fill",
    "minzoom": STATES_MIN_ZOOM,
    "paint": {
      "fill-color": "white",
      "fill-opacity": 0.5
    },
    "layout": {
      "visibility": "visible"
    },
    "filter": ["==", "IDNUM", -1] // for highlighting by this unique feature ID
  },

  /*
   * CLICKABLES; the historical and modern boundaries data
   * no filters, unclassified and with transparent fill
   * so the map can be clicked to get info about everything in one go
   */
  {
    "id": "counties-modern-clickable",
    "source": "counties-modern",
    "source-layer": "counties",
    "type": "fill",
    "minzoom": COUNTIES_MIN_ZOOM,
    "paint": {
      "fill-color": "transparent"
    },
    "layout": {
      "visibility": "visible"
    }
  }, {
    "id": "states-modern-clickable",
    "source": "states-modern",
    "source-layer": "states",
    "type": "fill",
    "minzoom": STATES_MIN_ZOOM,
    "paint": {
      "fill-color": "transparent"
    },
    "layout": {
      "visibility": "visible"
    }
  }, {
    "id": "counties-historical-clickable",
    "source": "counties-historical",
    "source-layer": "counties",
    "type": "fill",
    "minzoom": COUNTIES_MIN_ZOOM,
    "paint": {
      "fill-color": "transparent"
    },
    "layout": {
      "visibility": "visible"
    }
  }, {
    "id": "states-historical-clickable",
    "source": "states-historical",
    "source-layer": "states",
    "type": "fill",
    "minzoom": STATES_MIN_ZOOM,
    "paint": {
      "fill-color": "transparent"
    },
    "layout": {
      "visibility": "visible"
    }
  }]
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