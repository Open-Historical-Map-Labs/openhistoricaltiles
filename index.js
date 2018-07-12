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
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _maplayers = __webpack_require__(7);

var _mbglControlUrlhash = __webpack_require__(6);

var _mbglControlMousehovers = __webpack_require__(5);

var _mbglControlMouseclicks = __webpack_require__(4);

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

    MAP.HOVERS = new _mbglControlMousehovers.MapHoversControl({
        layers: {
            'ohm-transportation': {
                enter: function enter(mouseevent) {
                    // console.log(mouseevent.features[0].properties);
                    var tooltip = 'Transportation: ' + mouseevent.features[0].properties.class;
                    MAP.HOVERS.setMapToolTip(tooltip);
                },
                leave: function leave(mouseevent) {
                    MAP.HOVERS.clearMapToolTip();
                }
            },
            'ohm-poi': {
                enter: function enter(mouseevent) {
                    // console.log(mouseevent.features[0].properties);
                    var tooltip = 'POI: ' + mouseevent.features[0].properties.name;
                    MAP.HOVERS.setMapToolTip(tooltip);
                },
                leave: function leave(mouseevent) {
                    MAP.HOVERS.clearMapToolTip();
                }
            }
        }
    });
    MAP.addControl(MAP.HOVERS);

    MAP.CLICKS = new _mbglControlMouseclicks.MapClicksControl({
        click: function click(clickevent) {
            // collect a set of resultssets by drilling down through the stated layers in the stated sequence
            // each resultset is:
            // - "title" for that set, e.g. Water Features
            // - "features" list of features to be displayed, e.g. from MAP.queryRenderedFeatures()
            // - "template" function to return a HTML string for each feature (function, means can contain conditionals, etc)
            var collected_feature_groups = [{
                title: "Transportation",
                features: MAP.queryRenderedFeatures(clickevent.point, { layers: ['ohm-transportation'] }),
                template: function template(feature) {
                    return '' + feature.properties.class;
                }
            }, {
                title: "POIs",
                features: MAP.queryRenderedFeatures(clickevent.point, { layers: ['ohm-poi'] }),
                template: function template(feature) {
                    return '' + feature.properties.name;
                }
            }];

            // ready; hand off
            MAP.CLICKS.displayFeatures(collected_feature_groups);
        }
    });
    MAP.addControl(MAP.CLICKS);

    MAP.HASHWATCHER = new _mbglControlUrlhash.UrlHashControl();
    MAP.addControl(MAP.HASHWATCHER);

    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // nothing to do here; most behaviors are implemented as Controls
    });
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "index.html";

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Map click control for MBGL
 *
 * Params:
 * layers -- an object mapping layer-ID onto a callback when a feature in that layer is clicked
 * Example:
 *     new MapClicksControl({
 *         layers: {
 *             'state-boundaries-historical': function (clickevent) {
 *             },
 *             'county-boundaries-historical': function (clickevent) {
 *             },
 *         }
 * OR
 * click -- a callback when the map is clicked
 *     new MapClicksControl({
 *         click: function (clickevent) {
 *         },
 *     });
 */

var MapClicksControl = exports.MapClicksControl = function () {
    function MapClicksControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, MapClicksControl);

        // merge suppplied options with these defaults
        this.options = Object.assign({
            layers: {} /// layerid => clickevent callback
        }, options);
    }

    _createClass(MapClicksControl, [{
        key: 'getDefaultPosition',
        value: function getDefaultPosition() {
            return 'bottom-right';
        }
    }, {
        key: 'onAdd',
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            // when the map comes ready, attach these events
            this._map.on('load', function () {
                if (_this.options.layers) {
                    Object.entries(_this.options.layers).forEach(function (_ref) {
                        var _ref2 = _slicedToArray(_ref, 2),
                            layerid = _ref2[0],
                            callback = _ref2[1];

                        _this._map.on("click", layerid, callback);
                    });
                }
                if (_this.options.click) {
                    _this._map.on("click", _this.options.click);
                }
            });

            // create the container: the container itself, X to close it, and the target area for results

            this._container = document.createElement("DIV");
            this._container.className = "mapboxgl-ctrl mbgl-control-mouseclicks mbgl-control-mouseclicks-closed";

            this._closebutton = document.createElement("I");
            this._closebutton.className = 'mbgl-control-mouseclicks-closebutton glyphicons glyphicons-remove-circle';
            this._container.appendChild(this._closebutton);
            this._closebutton.addEventListener('click', function () {
                _this.closePanel();
            });

            this._listing = document.createElement("DIV");
            this._listing.className = 'mbgl-control-mouseclicks-listing';
            this._container.appendChild(this._listing);

            return this._container;
        }
    }, {
        key: 'onRemove',
        value: function onRemove() {
            var _this2 = this;

            // detach the event handlers
            if (this.options.layers) {
                Object.entries(this.options.layers).forEach(function (_ref3) {
                    var _ref4 = _slicedToArray(_ref3, 2),
                        layerid = _ref4[0],
                        callback = _ref4[1];

                    _this2._map.off("click", layerid, callback);
                });
            }
            if (this.options.click) {
                this._map.off("click", this.options.click);
            }

            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }, {
        key: 'displayFeatures',
        value: function displayFeatures(collected_featuregroups) {
            // first we need to uniqueify the features
            // a known effect of vectiles is that a feature can cross tiles and thus appear multiple times
            collected_featuregroups.forEach(function (featuregroup) {
                var uniques = {};
                featuregroup.features.forEach(function (feature) {
                    uniques[feature.id] = feature;
                });
                featuregroup.features = Object.values(uniques);
            });

            // generate HTML
            // look over groups, skip any which are empty
            // run each feature through its template function to generate HTML
            // collect these all into one big list of HTML strings: group title, results, group title, results, ...
            var collected_html = [];
            collected_featuregroups.forEach(function (featuregroup) {
                if (!featuregroup.features.length) return;
                collected_html.push('<h1 class="mbgl-control-mouseclicks-grouptitle">' + featuregroup.title + '</h1>');

                collected_html.push('<div class="mbgl-control-mouseclicks-featuregroup">');

                featuregroup.features.forEach(function (feature) {
                    var thishtml = featuregroup.template(feature);
                    collected_html.push('<div class="mbgl-control-mouseclicks-feature">' + thishtml + '</div>');
                });

                collected_html.push('</div>');
            });

            // if we collected nothing at all, then we have found nothing
            if (!collected_html.length) {
                this.closePanel();
                return;
            }

            // stick it into the panel
            this.openPanel();
            this._listing.innerHTML = collected_html.join('');
        }
    }, {
        key: 'closePanel',
        value: function closePanel() {
            this._container.classList.add('mbgl-control-mouseclicks-closed');
        }
    }, {
        key: 'openPanel',
        value: function openPanel() {
            this._container.classList.remove('mbgl-control-mouseclicks-closed');
        }
    }]);

    return MapClicksControl;
}();

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapHoversControl = exports.MapHoversControl = function () {
    function MapHoversControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, MapHoversControl);

        // merge suppplied options with these defaults
        this.options = Object.assign({
            layers: {} /// layerid => mouseevent callback
        }, options);
    }

    _createClass(MapHoversControl, [{
        key: "onAdd",
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            // when the map comes ready, attach the given events to the given layers
            this._map.on('load', function () {
                Object.entries(_this.options.layers).forEach(function (_ref) {
                    var _ref2 = _slicedToArray(_ref, 2),
                        layerid = _ref2[0],
                        callbacks = _ref2[1];

                    if (callbacks.enter) {
                        _this._map.on("mousemove", layerid, callbacks.enter);
                    }
                    if (callbacks.leave) {
                        _this._map.on("mouseleave", layerid, callbacks.leave);
                    }
                });
            });

            // return some dummy container we won't use
            this._container = document.createElement('span');
            return this._container;
        }
    }, {
        key: "onRemove",
        value: function onRemove() {
            var _this2 = this;

            // detach events
            Object.entries(this.options.layers).forEach(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    layerid = _ref4[0],
                    callbacks = _ref4[1];

                if (callbacks.enter) {
                    _this2._map.off("mousemove", layerid, callbacks.enter);
                }
                if (callbacks.leave) {
                    _this2._map.off("mouseleave", layerid, callbacks.leave);
                }
            });

            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }, {
        key: "setMapToolTip",
        value: function setMapToolTip(tooltip) {
            if (!tooltip) {
                return this.clearMapToolTip(); // setting a blank = they meant to clear it
            }

            //GDA clean up DIV name, auto-detection
            document.getElementById('map').title = tooltip;
            this._map.getCanvas().style.cursor = 'crosshair';
        }
    }, {
        key: "clearMapToolTip",
        value: function clearMapToolTip() {
            //GDA clean up DIV name, auto-detection
            document.getElementById('map').title = '';
            this._map.getCanvas().style.cursor = 'inherit';
        }
    }]);

    return MapHoversControl;
}();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * URL hash control for MBGL
 * watch for the page's URL hash for #Z/LAT/LNG format, example:  #15/47.6073/-122.3327
 * move the map when the hash changes
 * update the hash when the map changes
 *
 * No params and no functions other than what's built in.
 * Example:
 *     MAP.addControl(new UrlHashControl());
 */

var UrlHashControl = exports.UrlHashControl = function () {
    function UrlHashControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, UrlHashControl);

        // merge suppplied options with these defaults
        // not used, but leave in place so we can add them later as the ideas come in
        this.options = Object.assign({}, options);
    }

    _createClass(UrlHashControl, [{
        key: "onAdd",
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            // effectively on load: read existing hash and apply it
            if (window.location.hash) {
                this.applyUrlHashToMap(window.location.hash);
            }

            // start listening for changes to the hash, and to the map
            this._map2hash = function () {
                _this.updateUrlHashFromMap();
            };
            this._hash2map = function () {
                _this.readUrlHashAndApply();
            };
            window.addEventListener("hashchange", this._hash2map, false);
            this._map.on("moveend", this._map2hash);

            // return some dummy container we won't use
            this._container = document.createElement('span');
            return this._container;
        }
    }, {
        key: "onRemove",
        value: function onRemove() {
            // detach the event handlers
            window.removeEventListener("hashchange", this._hash2map);
            this._map.off("moveend", this._map2hash);

            // detach the map
            this._map = undefined;
        }
    }, {
        key: "readUrlHashAndApply",
        value: function readUrlHashAndApply() {
            var hashstring = window.location.hash;
            this.applyUrlHashToMap(hashstring);
        }
    }, {
        key: "applyUrlHashToMap",
        value: function applyUrlHashToMap(hashstring) {
            var zxy_regex = /^\#(\d+\.?\d*)\/(\-?\d+\.\d+)\/(\-\d+\.\d+)/;
            var zxy = hashstring.match(zxy_regex);
            if (!zxy) return; // not a match, maybe blank, maybe malformed?

            var z = zxy[1];
            var lat = zxy[2];
            var lng = zxy[3];

            this._map.setZoom(z);
            this._map.setCenter([lng, lat]);
        }
    }, {
        key: "updateUrlHashFromMap",
        value: function updateUrlHashFromMap() {
            var z = this._map.getZoom().toFixed(2);
            var lat = this._map.getCenter().lat.toFixed(5);
            var lng = this._map.getCenter().lng.toFixed(5);
            var hashstring = z + "/" + lat + "/" + lng + "/";
            window.location.hash = hashstring;
        }
    }]);

    return UrlHashControl;
}();

/***/ }),
/* 7 */
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// webpack entry point
// list JS files to include, CSS and SASS files to include, HTML templates to have [hash] replacement, etc.

__webpack_require__(3);
__webpack_require__(0);
__webpack_require__(1);

__webpack_require__(2);

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map