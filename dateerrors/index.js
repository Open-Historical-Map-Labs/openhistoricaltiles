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


var _mapconstants = __webpack_require__(7);

var _mbglControlUrlhash = __webpack_require__(6);

var _mbglControlMousehovers = __webpack_require__(5);

var _mbglControlMouseclicks = __webpack_require__(4);

var MIN_ZOOM = 2;
var MAX_ZOOM = 16;
var START_ZOOM = 3;
var START_CENTER = [-99.5, 37.9];

window.MAP = undefined;

window.toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

$(document).ready(function () {
    //
    // basic map
    //
    MAP = new mapboxgl.Map({
        container: "map",
        style: _mapconstants.GLMAP_STYLE,
        zoom: START_ZOOM,
        center: START_CENTER,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM
    });

    MAP.addControl(new mapboxgl.NavigationControl());

    MAP.HOVERS = new _mbglControlMousehovers.MapHoversControl({
        layers: {
            //
            // buildings; no name, but a type
            //
            'building': function building(feature) {
                return toTitleCase(feature.properties.building.replace(/_/g, ' '));
            },
            //
            // water (bodies); has a proper name field
            //
            'water': function water(feature) {
                return feature.properties.name;
            },

            //
            // waterways; have a name field
            //
            'waterway_tunnel': function waterway_tunnel(feature) {
                return feature.properties.name;
            },
            'waterway-other': function waterwayOther(feature) {
                return feature.properties.name;
            },
            'waterway-stream-canal': function waterwayStreamCanal(feature) {
                return feature.properties.name;
            },
            'waterway-river': function waterwayRiver(feature) {
                return feature.properties.name;
            },
            //
            // POIs; no name, but a type
            //
            'poi-level-3': function poiLevel3(feature) {
                return feature.properties.name;
            },
            'poi-level-2': function poiLevel2(feature) {
                return feature.properties.name;
            },
            'poi-level-1': function poiLevel1(feature) {
                return feature.properties.name;
            },
            'poi-railway': function poiRailway(feature) {
                return feature.properties.name;
            },
            //
            // Roads etc; have a name
            //
            'tunnel-path': function tunnelPath(feature) {
                return feature.properties.name;
            },
            'tunnel-service-track': function tunnelServiceTrack(feature) {
                return feature.properties.name;
            },
            'tunnel-minor': function tunnelMinor(feature) {
                return feature.properties.name;
            },
            'tunnel-secondary-tertiary': function tunnelSecondaryTertiary(feature) {
                return feature.properties.name;
            },
            'tunnel-trunk-primary': function tunnelTrunkPrimary(feature) {
                return feature.properties.name;
            },
            'tunnel-motorway': function tunnelMotorway(feature) {
                return feature.properties.name;
            },
            'tunnel-railway': function tunnelRailway(feature) {
                return feature.properties.name;
            },
            'ferry': function ferry(feature) {
                return feature.properties.name;
            },
            'highway-area': function highwayArea(feature) {
                return feature.properties.name;
            },
            'highway-path': function highwayPath(feature) {
                return feature.properties.name;
            },
            'highway-motorway-link': function highwayMotorwayLink(feature) {
                return feature.properties.name;
            },
            'highway-link': function highwayLink(feature) {
                return feature.properties.name;
            },
            'highway-minor': function highwayMinor(feature) {
                return feature.properties.name;
            },
            'highway-secondary-tertiary': function highwaySecondaryTertiary(feature) {
                return feature.properties.name;
            },
            'highway-primary': function highwayPrimary(feature) {
                return feature.properties.name;
            },
            'highway-trunk': function highwayTrunk(feature) {
                return feature.properties.name;
            },
            'highway-motorway': function highwayMotorway(feature) {
                return feature.properties.name;
            },
            'railway-transit': function railwayTransit(feature) {
                return feature.properties.name;
            },
            'railway-service': function railwayService(feature) {
                return feature.properties.name;
            },
            'railway': function railway(feature) {
                return feature.properties.name;
            },
            'bridge-path': function bridgePath(feature) {
                return feature.properties.name;
            },
            'bridge-motorway-link': function bridgeMotorwayLink(feature) {
                return feature.properties.name;
            },
            'bridge-link': function bridgeLink(feature) {
                return feature.properties.name;
            },
            'bridge-secondary-tertiary': function bridgeSecondaryTertiary(feature) {
                return feature.properties.name;
            },
            'bridge-trunk-primary': function bridgeTrunkPrimary(feature) {
                return feature.properties.name;
            },
            'bridge-motorway': function bridgeMotorway(feature) {
                return feature.properties.name;
            },
            'bridge-railway': function bridgeRailway(feature) {
                return feature.properties.name;
            },
            'cablecar': function cablecar(feature) {
                return feature.properties.name;
            },
            'road_oneway': function road_oneway(feature) {
                return feature.properties.name;
            },
            'road_oneway_opposite': function road_oneway_opposite(feature) {
                return feature.properties.name;
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
            //    tip: return a empty string to effectively skip this feature
            var collected_feature_groups = [{
                title: "Roads, Rails, and Routes",
                features: MAP.queryRenderedFeatures(clickevent.point, {
                    layers: ['highway-primary', 'highway-trunk', 'highway-secondary-tertiary', 'highway-motorway', 'highway-minor', 'highway-motorway-link', 'highway-link', 'bridge-motorway-link', 'bridge-link', 'bridge-secondary-tertiary', 'bridge-trunk-primary', 'bridge-motorway', 'railway-transit', 'railway-service', 'railway', 'bridge-railway', 'tunnel-path', 'tunnel-service-track', 'tunnel-minor', 'tunnel-secondary-tertiary', 'tunnel-trunk-primary', 'tunnel-motorway', 'tunnel-railway', 'ferry', 'cablecar', 'road_oneway', 'road_oneway_opposite']
                }),
                template: function template(feature) {
                    var infohtml = '' + feature.properties.name;

                    // add date info, if we have any
                    if (feature.properties.start_date && feature.properties.end_date) {
                        infohtml += '<br/>From ' + feature.properties.start_date + ' to ' + feature.properties.end_date;
                    } else if (feature.properties.start_date) {
                        infohtml += '<br/>Starting ' + feature.properties.start_date;
                    } else if (feature.properties.end_date) {
                        infohtml += '<br/>Until ' + feature.properties.end_date;
                    }

                    // add OSM ID, if it has one
                    if (feature.properties.osm_id) {
                        infohtml += '<br/>OSM ID: ' + feature.properties.osm_id;
                    }

                    return infohtml;
                }
            }, {
                title: "Water Features",
                features: MAP.queryRenderedFeatures(clickevent.point, {
                    layers: ['water', 'waterway_tunnel', 'waterway-other', 'waterway-stream-canal', 'waterway-river']
                }),
                template: function template(feature) {
                    var infohtml = '' + feature.properties.name;

                    // add date info, if we have any
                    if (feature.properties.start_date && feature.properties.end_date) {
                        infohtml += '<br/>From ' + feature.properties.start_date + ' to ' + feature.properties.end_date;
                    } else if (feature.properties.start_date) {
                        infohtml += '<br/>Starting ' + feature.properties.start_date;
                    } else if (feature.properties.end_date) {
                        infohtml += '<br/>Until ' + feature.properties.end_date;
                    }

                    // add OSM ID, if it has one
                    if (feature.properties.osm_id) {
                        infohtml += '<br/>OSM ID: ' + feature.properties.osm_id;
                    }

                    return infohtml;
                }
            }, {
                title: "Points of Interest",
                features: MAP.queryRenderedFeatures(clickevent.point, {
                    layers: ['poi-level-3', 'poi-level-2', 'poi-level-1', 'poi-railway', 'building']
                }),
                template: function template(feature) {
                    var infohtml = "";
                    switch (feature.layer.id) {
                        case 'building':
                            infohtml = toTitleCase(feature.properties.building.replace(/_/g, ' '));
                            break;
                        default:
                            infohtml = '' + feature.properties.name;
                            break;
                    }

                    // add date info, if we have any
                    if (feature.properties.start_date && feature.properties.end_date) {
                        infohtml += '<br/>From ' + feature.properties.start_date + ' to ' + feature.properties.end_date;
                    } else if (feature.properties.start_date) {
                        infohtml += '<br/>Starting ' + feature.properties.start_date;
                    } else if (feature.properties.end_date) {
                        infohtml += '<br/>Until ' + feature.properties.end_date;
                    }

                    // add OSM ID, if it has one
                    if (feature.properties.osm_id) {
                        infohtml += '<br/>OSM ID: ' + feature.properties.osm_id;
                    }

                    return infohtml;
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
                    if (!thishtml) return; // returning blank HTML = skip this feature
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
        key: 'onAdd',
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            // when the map comes ready, attach the given events to the given layers
            // each layer is a callback, which will be passed a feature and should return the tooltip text
            this._map.on('load', function () {
                Object.entries(_this.options.layers).forEach(function (_ref) {
                    var _ref2 = _slicedToArray(_ref, 2),
                        layerid = _ref2[0],
                        callback = _ref2[1];

                    _this._map.on("mousemove", layerid, function (mouseevent) {
                        var feature = mouseevent.features[0];
                        console.log(['MapHoversControl', layerid, feature]);

                        var tooltip = callback(feature);
                        _this.setMapToolTip(tooltip);
                    });
                    _this._map.on("mouseleave", layerid, function () {
                        _this.clearMapToolTip();
                    });
                });
            });

            // return some dummy container we won't use
            this._container = document.createElement('span');
            return this._container;
        }
    }, {
        key: 'onRemove',
        value: function onRemove() {
            var _this2 = this;

            // detach events
            Object.entries(this.options.layers).forEach(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    layerid = _ref4[0],
                    callbacks = _ref4[1];

                _this2._map.off("mousemove", layerid, callbacks.enter);
                _this2._map.off("mouseleave", layerid, callbacks.leave);
            });

            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }, {
        key: 'setMapToolTip',
        value: function setMapToolTip(tooltip) {
            if (!tooltip) {
                return this.clearMapToolTip(); // setting a blank = they meant to clear it
            }

            //GDA clean up DIV name, auto-detection
            document.getElementById('map').title = tooltip;
            this._map.getCanvas().style.cursor = 'crosshair';
        }
    }, {
        key: 'clearMapToolTip',
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

/*
 * This style is intended to highlight date issues, where the start_date and/or end_date are blank or otherwise not in YYYY-MM-DD format
 */

var OHM_BASE_URL = exports.OHM_BASE_URL = "https://vtiles.openhistoricalmap.org/";
var OHM_TILEJSON = exports.OHM_TILEJSON = OHM_BASE_URL + "/index.json";
var OHM_URL = exports.OHM_URL = OHM_BASE_URL + "/{z}/{x}/{y}.pbf";

var THIS_URL = exports.THIS_URL = window.location.href.split('#')[0];
var SPRITE_URL_ROOT = exports.SPRITE_URL_ROOT = THIS_URL + "styles/osm-bright-gl-style/sprite";

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
  "sprite": SPRITE_URL_ROOT,
  "glyphs": "https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key=RiS4gsgZPZqeeMlIyxFo",
  "layers": [
  /*
   * BASEMAP OPTIONS
   */
  {
    "id": "modern-basemap-light",
    "type": "raster",
    "source": "modern-basemap-light",
    "layout": {
      "visibility": "visible"
    }
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
    "id": "dateerror-water",
    "source-layer": "water",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "type": "fill",
    "paint": {
      "fill-color": "red"
    }
  }, {
    "id": "dateerror-waterway",
    "source-layer": "waterway",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "LineString"]],
    "type": "line",
    "paint": {
      "line-color": "red",
      "line-width": 3
    }
  }, {
    "id": "dateerror-landcover",
    "source-layer": "landcover",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "type": "fill",
    "paint": {
      "fill-color": "red"
    }
  }, {
    "id": "dateerror-landuse",
    "source-layer": "landuse",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "type": "fill",
    "paint": {
      "fill-color": "red"
    }
  }, {
    "id": "dateerror-park",
    "source-layer": "park",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "type": "fill",
    "paint": {
      "fill-color": "red"
    }
  }, {
    "id": "dateerror-boundary",
    "source-layer": "boundary",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "LineString"]],
    "type": "line",
    "paint": {
      "line-color": "red"
    }
  }, {
    "id": "dateerror-aeroway-polygon",
    "source-layer": "aeroway",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "type": "fill",
    "paint": {
      "fill-color": "red"
    }
  }, {
    "id": "dateerror-aeroway-linstring",
    "source-layer": "aeroway",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "LineString"]],
    "type": "line",
    "paint": {
      "line-color": "red"
    }
  }, {
    "id": "dateerror-transportation-polygon",
    "source-layer": "transportation",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "type": "fill",
    "paint": {
      "fill-color": "red"
    }
  }, {
    "id": "dateerror-transportation-linestring",
    "source-layer": "transportation",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "LineString"]],
    "type": "line",
    "paint": {
      "line-color": "red"
    }
  }, {
    "id": "dateerror-building",
    "source-layer": "building",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "type": "fill",
    "paint": {
      "fill-color": "red"
    }
  }, {
    "id": "dateerror-poi",
    "source-layer": "poi",
    "source": "ohm-data",
    "filter": ["all", ["==", "$type", "Point"]],
    "type": "circle",
    "paint": {
      "circle-color": "red",
      "circle-radius": 5
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
      "raster-opacity": 0.50
    },
    "layout": {
      "visibility": "visible"
    }
  }]
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