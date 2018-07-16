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
 * July 12 2018 - GA
 * This style is a direct lift of openmaptiles/osm-bright-gl-style
 * https://github.com/openmaptiles/osm-bright-gl-style
 */

var OHM_BASE_URL = exports.OHM_BASE_URL = "http://ec2-18-209-171-18.compute-1.amazonaws.com";
var OHM_TILEJSON = exports.OHM_TILEJSON = OHM_BASE_URL + "/index.json";
var OHM_URL = exports.OHM_URL = OHM_BASE_URL + "/{z}/{x}/{y}.pbf";

var SPRITE_URL_ROOT = exports.SPRITE_URL_ROOT = "http://localhost:9000/" + "styles/osm-bright-gl-style/sprite";

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
      "visibility": "none"
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
    "id": "landcover-glacier",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landcover",
    "filter": ["==", "subclass", "glacier"],
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "#fff",
      "fill-opacity": {
        "base": 1,
        "stops": [[0, 0.9], [10, 0.3]]
      }
    }
  }, {
    "id": "landuse-residential",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landuse",
    "filter": ["==", "class", "residential"],
    "paint": {
      "fill-color": {
        "base": 1,
        "stops": [[12, "hsla(30, 19%, 90%, 0.4)"], [16, "hsla(30, 19%, 90%, 0.2)"]]
      }
    }
  }, {
    "id": "landuse-commercial",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landuse",
    "filter": ["all", ["==", "$type", "Polygon"], ["==", "class", "commercial"]],
    "paint": {
      "fill-color": "hsla(0, 60%, 87%, 0.23)"
    }
  }, {
    "id": "landuse-industrial",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landuse",
    "filter": ["all", ["==", "$type", "Polygon"], ["==", "class", "industrial"]],
    "paint": {
      "fill-color": "hsla(49, 100%, 88%, 0.34)"
    }
  }, {
    "id": "park",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "park",
    "filter": ["==", "$type", "Polygon"],
    "paint": {
      "fill-color": "#d8e8c8",
      "fill-opacity": {
        "base": 1.8,
        "stops": [[9, 0.5], [12, 0.2]]
      }
    }
  }, {
    "id": "park-outline",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "park",
    "filter": ["==", "$type", "Polygon"],
    "layout": {},
    "paint": {
      "line-color": {
        "base": 1,
        "stops": [[6, "hsla(96, 40%, 49%, 0.36)"], [8, "hsla(96, 40%, 49%, 0.66)"]]
      },
      "line-dasharray": [3, 3]
    }
  }, {
    "id": "landuse-cemetery",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landuse",
    "filter": ["==", "class", "cemetery"],
    "paint": {
      "fill-color": "#e0e4dd"
    }
  }, {
    "id": "landuse-hospital",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landuse",
    "filter": ["==", "class", "hospital"],
    "paint": {
      "fill-color": "#fde"
    }
  }, {
    "id": "landuse-school",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landuse",
    "filter": ["==", "class", "school"],
    "paint": {
      "fill-color": "#f0e8f8"
    }
  }, {
    "id": "landuse-railway",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landuse",
    "filter": ["==", "class", "railway"],
    "paint": {
      "fill-color": "hsla(30, 19%, 90%, 0.4)"
    }
  }, {
    "id": "landcover-wood",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landcover",
    "filter": ["==", "class", "wood"],
    "paint": {
      "fill-color": "#6a4",
      "fill-opacity": 0.1,
      "fill-outline-color": "hsla(0, 0%, 0%, 0.03)",
      "fill-antialias": {
        "base": 1,
        "stops": [[0, false], [9, true]]
      }
    }
  }, {
    "id": "landcover-grass",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landcover",
    "filter": ["==", "class", "grass"],
    "paint": {
      "fill-color": "#d8e8c8",
      "fill-opacity": 1
    }
  }, {
    "id": "landcover-grass-park",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "park",
    "filter": ["==", "class", "public_park"],
    "paint": {
      "fill-color": "#d8e8c8",
      "fill-opacity": 0.8
    }
  }, {
    "id": "waterway_tunnel",
    "filter": ["all", ["in", "class", "river", "stream", "canal"], ["==", "brunnel", "tunnel"]],
    "type": "line",
    "source": "ohm-data",
    "source-layer": "waterway",
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-width": {
        "base": 1.3,
        "stops": [[13, 0.5], [20, 6]]
      },
      "line-dasharray": [2, 4]
    },
    "minzoom": 14
  }, {
    "id": "waterway-other",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "waterway",
    "filter": ["!in", "class", "canal", "river", "stream"],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-width": {
        "base": 1.3,
        "stops": [[13, 0.5], [20, 2]]
      }
    }
  }, {
    "id": "waterway-stream-canal",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "waterway",
    "filter": ["all", ["in", "class", "canal", "stream"], ["!=", "brunnel", "tunnel"]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-width": {
        "base": 1.3,
        "stops": [[13, 0.5], [20, 6]]
      }
    }
  }, {
    "id": "waterway-river",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "waterway",
    "filter": ["all", ["==", "class", "river"], ["!=", "brunnel", "tunnel"]],
    "layout": {
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#a0c8f0",
      "line-width": {
        "base": 1.2,
        "stops": [[10, 0.8], [20, 6]]
      }
    }
  }, {
    "id": "water-offset",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "water",
    "maxzoom": 8,
    "filter": ["==", "$type", "Polygon"],
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-opacity": 1,
      "fill-color": "#a0c8f0",
      "fill-translate": {
        "base": 1,
        "stops": [[6, [2, 0]], [8, [0, 0]]]
      }
    }
  }, {
    "id": "water",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "water",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "hsl(210, 67%, 85%)"
    }
  }, {
    "id": "water-pattern",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "water",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-translate": [0, 2.5],
      "fill-pattern": "wave"
    }
  }, {
    "id": "landcover-ice-shelf",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "landcover",
    "filter": ["==", "subclass", "ice_shelf"],
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "#fff",
      "fill-opacity": {
        "base": 1,
        "stops": [[0, 0.9], [10, 0.3]]
      }
    }
  }, {
    "id": "building",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "building",
    "paint": {
      "fill-color": {
        "base": 1,
        "stops": [[15.5, "#f2eae2"], [16, "#dfdbd7"]]
      },
      "fill-antialias": true
    }
  }, {
    "id": "building-top",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "building",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-translate": {
        "base": 1,
        "stops": [[14, [0, 0]], [16, [-2, -2]]]
      },
      "fill-outline-color": "#dfdbd7",
      "fill-color": "#f2eae2",
      "fill-opacity": {
        "base": 1,
        "stops": [[13, 0], [16, 1]]
      }
    }
  }, {
    "id": "tunnel-service-track-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["in", "class", "service", "track"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#cfcdca",
      "line-dasharray": [0.5, 0.25],
      "line-width": {
        "base": 1.2,
        "stops": [[15, 1], [16, 4], [20, 11]]
      }
    }
  }, {
    "id": "tunnel-minor-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "minor"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#cfcdca",
      "line-opacity": {
        "stops": [[12, 0], [12.5, 1]]
      },
      "line-width": {
        "base": 1.2,
        "stops": [[12, 0.5], [13, 1], [14, 4], [20, 15]]
      }
    }
  }, {
    "id": "tunnel-secondary-tertiary-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["in", "class", "secondary", "tertiary"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[8, 1.5], [20, 17]]
      }
    }
  }, {
    "id": "tunnel-trunk-primary-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["in", "class", "primary", "trunk"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-width": {
        "base": 1.2,
        "stops": [[5, 0.4], [6, 0.6], [7, 1.5], [20, 22]]
      }
    }
  }, {
    "id": "tunnel-motorway-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "motorway"]],
    "layout": {
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-dasharray": [0.5, 0.25],
      "line-width": {
        "base": 1.2,
        "stops": [[5, 0.4], [6, 0.6], [7, 1.5], [20, 22]]
      }
    }
  }, {
    "id": "tunnel-path",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["==", "brunnel", "tunnel"], ["==", "class", "path"]]],
    "paint": {
      "line-color": "#cba",
      "line-dasharray": [1.5, 0.75],
      "line-width": {
        "base": 1.2,
        "stops": [[15, 1.2], [20, 4]]
      }
    }
  }, {
    "id": "tunnel-service-track",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["in", "class", "service", "track"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff",
      "line-width": {
        "base": 1.2,
        "stops": [[15.5, 0], [16, 2], [20, 7.5]]
      }
    }
  }, {
    "id": "tunnel-minor",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "minor_road"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[13.5, 0], [14, 2.5], [20, 11.5]]
      }
    }
  }, {
    "id": "tunnel-secondary-tertiary",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["in", "class", "secondary", "tertiary"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff4c6",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [7, 0.5], [20, 10]]
      }
    }
  }, {
    "id": "tunnel-trunk-primary",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["in", "class", "primary", "trunk"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff4c6",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [7, 0.5], [20, 18]]
      }
    }
  }, {
    "id": "tunnel-motorway",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "motorway"]],
    "layout": {
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#ffdaa6",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [7, 0.5], [20, 18]]
      }
    }
  }, {
    "id": "tunnel-railway",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "rail"]],
    "paint": {
      "line-color": "#bbb",
      "line-width": {
        "base": 1.4,
        "stops": [[14, 0.4], [15, 0.75], [20, 2]]
      },
      "line-dasharray": [2, 2]
    }
  }, {
    "id": "ferry",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["in", "class", "ferry"]],
    "layout": {
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "rgba(108, 159, 182, 1)",
      "line-width": 1.1,
      "line-dasharray": [2, 2]
    }
  }, {
    "id": "aeroway-taxiway-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "aeroway",
    "minzoom": 12,
    "filter": ["all", ["in", "class", "taxiway"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "rgba(153, 153, 153, 1)",
      "line-width": {
        "base": 1.5,
        "stops": [[11, 2], [17, 12]]
      },
      "line-opacity": 1
    }
  }, {
    "id": "aeroway-runway-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "aeroway",
    "minzoom": 12,
    "filter": ["all", ["in", "class", "runway"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "rgba(153, 153, 153, 1)",
      "line-width": {
        "base": 1.5,
        "stops": [[11, 5], [17, 55]]
      },
      "line-opacity": 1
    }
  }, {
    "id": "aeroway-area",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "aeroway",
    "minzoom": 4,
    "filter": ["all", ["==", "$type", "Polygon"], ["in", "class", "runway", "taxiway"]],
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-opacity": {
        "base": 1,
        "stops": [[13, 0], [14, 1]]
      },
      "fill-color": "rgba(255, 255, 255, 1)"
    }
  }, {
    "id": "aeroway-taxiway",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "aeroway",
    "minzoom": 4,
    "filter": ["all", ["in", "class", "taxiway"], ["==", "$type", "LineString"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "rgba(255, 255, 255, 1)",
      "line-width": {
        "base": 1.5,
        "stops": [[11, 1], [17, 10]]
      },
      "line-opacity": {
        "base": 1,
        "stops": [[11, 0], [12, 1]]
      }
    }
  }, {
    "id": "aeroway-runway",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "aeroway",
    "minzoom": 4,
    "filter": ["all", ["in", "class", "runway"], ["==", "$type", "LineString"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "rgba(255, 255, 255, 1)",
      "line-width": {
        "base": 1.5,
        "stops": [[11, 4], [17, 50]]
      },
      "line-opacity": {
        "base": 1,
        "stops": [[11, 0], [12, 1]]
      }
    }
  }, {
    "id": "highway-area",
    "type": "fill",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["==", "$type", "Polygon"],
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "hsla(0, 0%, 89%, 0.56)",
      "fill-outline-color": "#cfcdca",
      "fill-opacity": 0.9,
      "fill-antialias": false
    }
  }, {
    "id": "highway-motorway-link-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 12,
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["==", "class", "motorway_link"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[12, 1], [13, 3], [14, 4], [20, 15]]
      }
    }
  }, {
    "id": "highway-link-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 13,
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["in", "class", "primary_link", "secondary_link", "tertiary_link", "trunk_link"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[12, 1], [13, 3], [14, 4], [20, 15]]
      }
    }
  }, {
    "id": "highway-minor-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["!=", "brunnel", "tunnel"], ["in", "class", "minor", "service", "track"]]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#cfcdca",
      "line-opacity": {
        "stops": [[12, 0], [12.5, 1]]
      },
      "line-width": {
        "base": 1.2,
        "stops": [[12, 0.5], [13, 1], [14, 4], [20, 15]]
      }
    }
  }, {
    "id": "highway-secondary-tertiary-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["in", "class", "secondary", "tertiary"]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[8, 1.5], [20, 17]]
      }
    }
  }, {
    "id": "highway-primary-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 5,
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["in", "class", "primary"]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": {
        "stops": [[7, 0], [8, 1]]
      },
      "line-width": {
        "base": 1.2,
        "stops": [[7, 0], [8, 0.6], [9, 1.5], [20, 22]]
      }
    }
  }, {
    "id": "highway-trunk-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 5,
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["in", "class", "trunk"]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": {
        "stops": [[5, 0], [6, 1]]
      },
      "line-width": {
        "base": 1.2,
        "stops": [[5, 0], [6, 0.6], [7, 1.5], [20, 22]]
      }
    }
  }, {
    "id": "highway-motorway-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 4,
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["==", "class", "motorway"]],
    "layout": {
      "line-cap": "butt",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-width": {
        "base": 1.2,
        "stops": [[4, 0], [5, 0.4], [6, 0.6], [7, 1.5], [20, 22]]
      },
      "line-opacity": {
        "stops": [[4, 0], [5, 1]]
      }
    }
  }, {
    "id": "highway-path",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["!in", "brunnel", "bridge", "tunnel"], ["==", "class", "path"]]],
    "paint": {
      "line-color": "#cba",
      "line-dasharray": [1.5, 0.75],
      "line-width": {
        "base": 1.2,
        "stops": [[15, 1.2], [20, 4]]
      }
    }
  }, {
    "id": "highway-motorway-link",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 12,
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["==", "class", "motorway_link"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fc8",
      "line-width": {
        "base": 1.2,
        "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
      }
    }
  }, {
    "id": "highway-link",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 13,
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["in", "class", "primary_link", "secondary_link", "tertiary_link", "trunk_link"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": {
        "base": 1.2,
        "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
      }
    }
  }, {
    "id": "highway-minor",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["!=", "brunnel", "tunnel"], ["in", "class", "minor", "service", "track"]]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fff",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[13.5, 0], [14, 2.5], [20, 11.5]]
      }
    }
  }, {
    "id": "highway-secondary-tertiary",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["!in", "brunnel", "bridge", "tunnel"], ["in", "class", "secondary", "tertiary"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [8, 0.5], [20, 13]]
      }
    }
  }, {
    "id": "highway-primary",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["!in", "brunnel", "bridge", "tunnel"], ["in", "class", "primary"]]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": {
        "base": 1.2,
        "stops": [[8.5, 0], [9, 0.5], [20, 18]]
      }
    }
  }, {
    "id": "highway-trunk",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["!in", "brunnel", "bridge", "tunnel"], ["in", "class", "trunk"]]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [7, 0.5], [20, 18]]
      }
    }
  }, {
    "id": "highway-motorway",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 5,
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["!in", "brunnel", "bridge", "tunnel"], ["==", "class", "motorway"]]],
    "layout": {
      "line-cap": "round",
      "line-join": "round",
      "visibility": "visible"
    },
    "paint": {
      "line-color": "#fc8",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [7, 0.5], [20, 18]]
      }
    }
  }, {
    "id": "railway-transit",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["==", "class", "transit"], ["!in", "brunnel", "tunnel"]]],
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "line-color": "hsla(0, 0%, 73%, 0.77)",
      "line-width": {
        "base": 1.4,
        "stops": [[14, 0.4], [20, 1]]
      }
    }
  }, {
    "id": "railway-transit-hatching",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["==", "class", "transit"], ["!in", "brunnel", "tunnel"]]],
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "line-color": "hsla(0, 0%, 73%, 0.68)",
      "line-dasharray": [0.2, 8],
      "line-width": {
        "base": 1.4,
        "stops": [[14.5, 0], [15, 2], [20, 6]]
      }
    }
  }, {
    "id": "railway-service",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["==", "class", "rail"], ["has", "service"]]],
    "paint": {
      "line-color": "hsla(0, 0%, 73%, 0.77)",
      "line-width": {
        "base": 1.4,
        "stops": [[14, 0.4], [20, 1]]
      }
    }
  }, {
    "id": "railway-service-hatching",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["==", "class", "rail"], ["has", "service"]]],
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "line-color": "hsla(0, 0%, 73%, 0.68)",
      "line-dasharray": [0.2, 8],
      "line-width": {
        "base": 1.4,
        "stops": [[14.5, 0], [15, 2], [20, 6]]
      }
    }
  }, {
    "id": "railway",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["!has", "service"], ["!in", "brunnel", "bridge", "tunnel"], ["==", "class", "rail"]]],
    "paint": {
      "line-color": "#bbb",
      "line-width": {
        "base": 1.4,
        "stops": [[14, 0.4], [15, 0.75], [20, 2]]
      }
    }
  }, {
    "id": "railway-hatching",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["!has", "service"], ["!in", "brunnel", "bridge", "tunnel"], ["==", "class", "rail"]]],
    "paint": {
      "line-color": "#bbb",
      "line-dasharray": [0.2, 8],
      "line-width": {
        "base": 1.4,
        "stops": [[14.5, 0], [15, 3], [20, 8]]
      }
    }
  }, {
    "id": "bridge-motorway-link-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "motorway_link"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[12, 1], [13, 3], [14, 4], [20, 15]]
      }
    }
  }, {
    "id": "bridge-link-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["in", "class", "primary_link", "secondary_link", "tertiary_link", "trunk_link"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[12, 1], [13, 3], [14, 4], [20, 15]]
      }
    }
  }, {
    "id": "bridge-secondary-tertiary-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["in", "class", "secondary", "tertiary"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-opacity": 1,
      "line-width": {
        "base": 1.2,
        "stops": [[8, 1.5], [20, 28]]
      }
    }
  }, {
    "id": "bridge-trunk-primary-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["in", "class", "primary", "trunk"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "hsl(28, 76%, 67%)",
      "line-width": {
        "base": 1.2,
        "stops": [[5, 0.4], [6, 0.6], [7, 1.5], [20, 26]]
      }
    }
  }, {
    "id": "bridge-motorway-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "motorway"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#e9ac77",
      "line-width": {
        "base": 1.2,
        "stops": [[5, 0.4], [6, 0.6], [7, 1.5], [20, 22]]
      }
    }
  }, {
    "id": "bridge-path-casing",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["==", "brunnel", "bridge"], ["==", "class", "path"]]],
    "paint": {
      "line-color": "#f8f4f0",
      "line-width": {
        "base": 1.2,
        "stops": [[15, 1.2], [20, 18]]
      }
    }
  }, {
    "id": "bridge-path",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "$type", "LineString"], ["all", ["==", "brunnel", "bridge"], ["==", "class", "path"]]],
    "paint": {
      "line-color": "#cba",
      "line-width": {
        "base": 1.2,
        "stops": [[15, 1.2], [20, 4]]
      },
      "line-dasharray": [1.5, 0.75]
    }
  }, {
    "id": "bridge-motorway-link",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "motorway_link"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fc8",
      "line-width": {
        "base": 1.2,
        "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
      }
    }
  }, {
    "id": "bridge-link",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["in", "class", "primary_link", "secondary_link", "tertiary_link", "trunk_link"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": {
        "base": 1.2,
        "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
      }
    }
  }, {
    "id": "bridge-secondary-tertiary",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["in", "class", "secondary", "tertiary"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [7, 0.5], [20, 20]]
      }
    }
  }, {
    "id": "bridge-trunk-primary",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["in", "class", "primary", "trunk"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fea",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [7, 0.5], [20, 18]]
      }
    }
  }, {
    "id": "bridge-motorway",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "motorway"]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#fc8",
      "line-width": {
        "base": 1.2,
        "stops": [[6.5, 0], [7, 0.5], [20, 18]]
      }
    }
  }, {
    "id": "bridge-railway",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "rail"]],
    "paint": {
      "line-color": "#bbb",
      "line-width": {
        "base": 1.4,
        "stops": [[14, 0.4], [15, 0.75], [20, 2]]
      }
    }
  }, {
    "id": "bridge-railway-hatching",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "rail"]],
    "paint": {
      "line-color": "#bbb",
      "line-dasharray": [0.2, 8],
      "line-width": {
        "base": 1.4,
        "stops": [[14.5, 0], [15, 3], [20, 8]]
      }
    }
  }, {
    "id": "cablecar",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 13,
    "filter": ["==", "class", "cable_car"],
    "layout": {
      "visibility": "visible",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "hsl(0, 0%, 70%)",
      "line-width": {
        "base": 1,
        "stops": [[11, 1], [19, 2.5]]
      }
    }
  }, {
    "id": "cablecar-dash",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 13,
    "filter": ["==", "class", "cable_car"],
    "layout": {
      "visibility": "visible",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "hsl(0, 0%, 70%)",
      "line-width": {
        "base": 1,
        "stops": [[11, 3], [19, 5.5]]
      },
      "line-dasharray": [2, 3]
    }
  }, {
    "id": "boundary-land-level-4",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "boundary",
    "filter": ["all", [">=", "admin_level", 4], ["<=", "admin_level", 8], ["!=", "maritime", 1]],
    "layout": {
      "line-join": "round"
    },
    "paint": {
      "line-color": "#9e9cab",
      "line-dasharray": [3, 1, 1, 1],
      "line-width": {
        "base": 1.4,
        "stops": [[4, 0.4], [5, 1], [12, 3]]
      }
    }
  }, {
    "id": "boundary-land-level-2",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "boundary",
    "filter": ["all", ["==", "admin_level", 2], ["!=", "maritime", 1], ["!=", "disputed", 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "hsl(248, 7%, 66%)",
      "line-width": {
        "base": 1,
        "stops": [[0, 0.6], [4, 1.4], [5, 2], [12, 8]]
      }
    }
  }, {
    "id": "boundary-land-disputed",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "boundary",
    "filter": ["all", ["!=", "maritime", 1], ["==", "disputed", 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "hsl(248, 7%, 70%)",
      "line-dasharray": [1, 3],
      "line-width": {
        "base": 1,
        "stops": [[0, 0.6], [4, 1.4], [5, 2], [12, 8]]
      }
    }
  }, {
    "id": "boundary-water",
    "type": "line",
    "source": "ohm-data",
    "source-layer": "boundary",
    "filter": ["all", ["in", "admin_level", 2, 4], ["==", "maritime", 1]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "rgba(154, 189, 214, 1)",
      "line-width": {
        "base": 1,
        "stops": [[0, 0.6], [4, 1.4], [5, 2], [12, 8]]
      },
      "line-opacity": {
        "stops": [[6, 0.6], [10, 1]]
      }
    }
  }, {
    "id": "waterway-name",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "waterway",
    "minzoom": 13,
    "filter": ["all", ["==", "$type", "LineString"], ["has", "name"]],
    "layout": {
      "text-font": ["Noto Sans Italic"],
      "text-size": 14,
      "text-field": "{name}",
      "text-max-width": 5,
      "text-rotation-alignment": "map",
      "symbol-placement": "line",
      "text-letter-spacing": 0.2,
      "symbol-spacing": 350
    },
    "paint": {
      "text-color": "#74aee9",
      "text-halo-width": 1.5,
      "text-halo-color": "rgba(255,255,255,0.7)"
    }
  }, {
    "id": "water-name-lakeline",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "water_name",
    "filter": ["==", "$type", "LineString"],
    "layout": {
      "text-font": ["Noto Sans Italic"],
      "text-size": 14,
      "text-field": "{name}",
      "text-max-width": 5,
      "text-rotation-alignment": "map",
      "symbol-placement": "line",
      "symbol-spacing": 350,
      "text-letter-spacing": 0.2
    },
    "paint": {
      "text-color": "#74aee9",
      "text-halo-width": 1.5,
      "text-halo-color": "rgba(255,255,255,0.7)"
    }
  }, {
    "id": "water-name-ocean",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "water_name",
    "filter": ["all", ["==", "$type", "Point"], ["==", "class", "ocean"]],
    "layout": {
      "text-font": ["Noto Sans Italic"],
      "text-size": 14,
      "text-field": "{name}",
      "text-max-width": 5,
      "text-rotation-alignment": "map",
      "symbol-placement": "point",
      "symbol-spacing": 350,
      "text-letter-spacing": 0.2
    },
    "paint": {
      "text-color": "#74aee9",
      "text-halo-width": 1.5,
      "text-halo-color": "rgba(255,255,255,0.7)"
    }
  }, {
    "id": "water-name-other",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "water_name",
    "filter": ["all", ["==", "$type", "Point"], ["!in", "class", "ocean"]],
    "layout": {
      "text-font": ["Noto Sans Italic"],
      "text-size": {
        "stops": [[0, 10], [6, 14]]
      },
      "text-field": "{name}",
      "text-max-width": 5,
      "text-rotation-alignment": "map",
      "symbol-placement": "point",
      "symbol-spacing": 350,
      "text-letter-spacing": 0.2,
      "visibility": "visible"
    },
    "paint": {
      "text-color": "#74aee9",
      "text-halo-width": 1.5,
      "text-halo-color": "rgba(255,255,255,0.7)"
    }
  }, {
    "id": "poi-level-3",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "poi",
    "minzoom": 16,
    "filter": ["all", ["==", "$type", "Point"], [">=", "rank", 25]],
    "layout": {
      "text-padding": 2,
      "text-font": ["Noto Sans Regular"],
      "text-anchor": "top",
      "icon-image": "{class}_11",
      "text-field": "{name}",
      "text-offset": [0, 0.6],
      "text-size": 12,
      "text-max-width": 9
    },
    "paint": {
      "text-halo-blur": 0.5,
      "text-color": "#666",
      "text-halo-width": 1,
      "text-halo-color": "#ffffff"
    }
  }, {
    "id": "poi-level-2",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "poi",
    "minzoom": 15,
    "filter": ["all", ["==", "$type", "Point"], ["<=", "rank", 24], [">=", "rank", 15]],
    "layout": {
      "text-padding": 2,
      "text-font": ["Noto Sans Regular"],
      "text-anchor": "top",
      "icon-image": "{class}_11",
      "text-field": "{name}",
      "text-offset": [0, 0.6],
      "text-size": 12,
      "text-max-width": 9
    },
    "paint": {
      "text-halo-blur": 0.5,
      "text-color": "#666",
      "text-halo-width": 1,
      "text-halo-color": "#ffffff"
    }
  }, {
    "id": "poi-level-1",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "poi",
    "minzoom": 14,
    "filter": ["all", ["==", "$type", "Point"], ["<=", "rank", 14], ["has", "name"]],
    "layout": {
      "text-padding": 2,
      "text-font": ["Noto Sans Regular"],
      "text-anchor": "top",
      "icon-image": "{class}_11",
      "text-field": "{name}",
      "text-offset": [0, 0.6],
      "text-size": 12,
      "text-max-width": 9
    },
    "paint": {
      "text-halo-blur": 0.5,
      "text-color": "#666",
      "text-halo-width": 1,
      "text-halo-color": "#ffffff"
    }
  }, {
    "id": "poi-railway",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "poi",
    "minzoom": 13,
    "filter": ["all", ["==", "$type", "Point"], ["has", "name"], ["==", "class", "railway"], ["==", "subclass", "station"]],
    "layout": {
      "text-padding": 2,
      "text-font": ["Noto Sans Regular"],
      "text-anchor": "top",
      "icon-image": "{class}_11",
      "text-field": "{name}",
      "text-offset": [0, 0.6],
      "text-size": 12,
      "text-max-width": 9,
      "icon-optional": false,
      "icon-ignore-placement": false,
      "icon-allow-overlap": false,
      "text-ignore-placement": false,
      "text-allow-overlap": false,
      "text-optional": true
    },
    "paint": {
      "text-halo-blur": 0.5,
      "text-color": "#666",
      "text-halo-width": 1,
      "text-halo-color": "#ffffff"
    }
  }, {
    "id": "road_oneway",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 15,
    "filter": ["all", ["==", "oneway", 1], ["in", "class", "motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service"]],
    "layout": {
      "symbol-placement": "line",
      "icon-image": "oneway",
      "symbol-spacing": 75,
      "icon-padding": 2,
      "icon-rotation-alignment": "map",
      "icon-rotate": 90,
      "icon-size": {
        "stops": [[15, 0.5], [19, 1]]
      }
    },
    "paint": {
      "icon-opacity": 0.5
    }
  }, {
    "id": "road_oneway_opposite",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "transportation",
    "minzoom": 15,
    "filter": ["all", ["==", "oneway", -1], ["in", "class", "motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service"]],
    "layout": {
      "symbol-placement": "line",
      "icon-image": "oneway",
      "symbol-spacing": 75,
      "icon-padding": 2,
      "icon-rotation-alignment": "map",
      "icon-rotate": -90,
      "icon-size": {
        "stops": [[15, 0.5], [19, 1]]
      }
    },
    "paint": {
      "icon-opacity": 0.5
    }
  }, {
    "id": "highway-name-path",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "transportation_name",
    "minzoom": 15.5,
    "filter": ["==", "class", "path"],
    "layout": {
      "text-size": {
        "base": 1,
        "stops": [[13, 12], [14, 13]]
      },
      "text-font": ["Noto Sans Regular"],
      "text-field": "{name}",
      "symbol-placement": "line",
      "text-rotation-alignment": "map"
    },
    "paint": {
      "text-halo-color": "#f8f4f0",
      "text-color": "hsl(30, 23%, 62%)",
      "text-halo-width": 0.5
    }
  }, {
    "id": "highway-name-minor",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "transportation_name",
    "minzoom": 15,
    "filter": ["all", ["==", "$type", "LineString"], ["in", "class", "minor", "service", "track"]],
    "layout": {
      "text-size": {
        "base": 1,
        "stops": [[13, 12], [14, 13]]
      },
      "text-font": ["Noto Sans Regular"],
      "text-field": "{name}",
      "symbol-placement": "line",
      "text-rotation-alignment": "map"
    },
    "paint": {
      "text-halo-blur": 0.5,
      "text-color": "#765",
      "text-halo-width": 1
    }
  }, {
    "id": "highway-name-major",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "transportation_name",
    "minzoom": 12.2,
    "filter": ["in", "class", "primary", "secondary", "tertiary", "trunk"],
    "layout": {
      "text-size": {
        "base": 1,
        "stops": [[13, 12], [14, 13]]
      },
      "text-font": ["Noto Sans Regular"],
      "text-field": "{name}",
      "symbol-placement": "line",
      "text-rotation-alignment": "map"
    },
    "paint": {
      "text-halo-blur": 0.5,
      "text-color": "#765",
      "text-halo-width": 1
    }
  }, {
    "id": "highway-shield",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "transportation_name",
    "minzoom": 8,
    "filter": ["all", ["<=", "ref_length", 6], ["==", "$type", "LineString"], ["!in", "network", "us-interstate", "us-highway", "us-state"]],
    "layout": {
      "text-size": 10,
      "icon-image": "road_{ref_length}",
      "icon-rotation-alignment": "viewport",
      "symbol-spacing": 200,
      "text-font": ["Noto Sans Regular"],
      "symbol-placement": {
        "base": 1,
        "stops": [[10, "point"], [11, "line"]]
      },
      "text-rotation-alignment": "viewport",
      "icon-size": 1,
      "text-field": "{ref}"
    },
    "paint": {}
  }, {
    "id": "highway-shield-us-interstate",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "transportation_name",
    "minzoom": 7,
    "filter": ["all", ["<=", "ref_length", 6], ["==", "$type", "LineString"], ["in", "network", "us-interstate"]],
    "layout": {
      "text-size": 10,
      "icon-image": "{network}_{ref_length}",
      "icon-rotation-alignment": "viewport",
      "symbol-spacing": 200,
      "text-font": ["Noto Sans Regular"],
      "symbol-placement": {
        "base": 1,
        "stops": [[7, "point"], [7, "line"], [8, "line"]]
      },
      "text-rotation-alignment": "viewport",
      "icon-size": 1,
      "text-field": "{ref}"
    },
    "paint": {
      "text-color": "rgba(0, 0, 0, 1)"
    }
  }, {
    "id": "highway-shield-us-other",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "transportation_name",
    "minzoom": 9,
    "filter": ["all", ["<=", "ref_length", 6], ["==", "$type", "LineString"], ["in", "network", "us-highway", "us-state"]],
    "layout": {
      "text-size": 10,
      "icon-image": "{network}_{ref_length}",
      "icon-rotation-alignment": "viewport",
      "symbol-spacing": 200,
      "text-font": ["Noto Sans Regular"],
      "symbol-placement": {
        "base": 1,
        "stops": [[10, "point"], [11, "line"]]
      },
      "text-rotation-alignment": "viewport",
      "icon-size": 1,
      "text-field": "{ref}"
    },
    "paint": {
      "text-color": "rgba(0, 0, 0, 1)"
    }
  }, {
    "id": "airport-label-major",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "aerodrome_label",
    "minzoom": 10,
    "filter": ["all", ["has", "iata"]],
    "layout": {
      "text-padding": 2,
      "text-font": ["Noto Sans Regular"],
      "text-anchor": "top",
      "icon-image": "airport_11",
      "text-field": "{name}",
      "text-offset": [0, 0.6],
      "text-size": 12,
      "text-max-width": 9,
      "visibility": "visible",
      "icon-size": 1,
      "text-optional": true
    },
    "paint": {
      "text-halo-blur": 0.5,
      "text-color": "#666",
      "text-halo-width": 1,
      "text-halo-color": "#ffffff"
    }
  }, {
    "id": "place-other",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["!in", "class", "city", "town", "village", "country", "continent"],
    "layout": {
      "text-letter-spacing": 0.1,
      "text-size": {
        "base": 1.2,
        "stops": [[12, 10], [15, 14]]
      },
      "text-font": ["Noto Sans Bold"],
      "text-field": "{name}",
      "text-transform": "uppercase",
      "text-max-width": 9,
      "visibility": "visible"
    },
    "paint": {
      "text-color": "#633",
      "text-halo-width": 1.2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-village",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["==", "class", "village"],
    "layout": {
      "text-font": ["Noto Sans Regular"],
      "text-size": {
        "base": 1.2,
        "stops": [[10, 12], [15, 22]]
      },
      "text-field": "{name}",
      "text-max-width": 8,
      "visibility": "visible"
    },
    "paint": {
      "text-color": "#333",
      "text-halo-width": 1.2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-town",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["==", "class", "town"],
    "layout": {
      "text-font": ["Noto Sans Regular"],
      "text-size": {
        "base": 1.2,
        "stops": [[10, 14], [15, 24]]
      },
      "text-field": "{name}",
      "text-max-width": 8,
      "visibility": "visible"
    },
    "paint": {
      "text-color": "#333",
      "text-halo-width": 1.2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-city",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["all", ["!=", "capital", 2], ["==", "class", "city"]],
    "layout": {
      "text-font": ["Noto Sans Regular"],
      "text-size": {
        "base": 1.2,
        "stops": [[7, 14], [11, 24]]
      },
      "text-field": "{name}",
      "text-max-width": 8,
      "visibility": "visible"
    },
    "paint": {
      "text-color": "#333",
      "text-halo-width": 1.2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-city-capital",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["all", ["==", "capital", 2], ["==", "class", "city"]],
    "layout": {
      "text-font": ["Noto Sans Regular"],
      "text-size": {
        "base": 1.2,
        "stops": [[7, 14], [11, 24]]
      },
      "text-field": "{name}",
      "text-max-width": 8,
      "icon-image": "star_11",
      "text-offset": [0.4, 0],
      "icon-size": 0.8,
      "text-anchor": "left",
      "visibility": "visible"
    },
    "paint": {
      "text-color": "#333",
      "text-halo-width": 1.2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-country-other",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["all", ["==", "class", "country"], [">=", "rank", 3], ["!has", "iso_a2"]],
    "layout": {
      "text-font": ["Noto Sans Italic"],
      "text-field": "{name}",
      "text-size": {
        "stops": [[3, 11], [7, 17]]
      },
      "text-transform": "uppercase",
      "text-max-width": 6.25,
      "visibility": "visible"
    },
    "paint": {
      "text-halo-blur": 1,
      "text-color": "#334",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-country-3",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["all", ["==", "class", "country"], [">=", "rank", 3], ["has", "iso_a2"]],
    "layout": {
      "text-font": ["Noto Sans Bold"],
      "text-field": "{name}",
      "text-size": {
        "stops": [[3, 11], [7, 17]]
      },
      "text-transform": "uppercase",
      "text-max-width": 6.25,
      "visibility": "visible"
    },
    "paint": {
      "text-halo-blur": 1,
      "text-color": "#334",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-country-2",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["all", ["==", "class", "country"], ["==", "rank", 2], ["has", "iso_a2"]],
    "layout": {
      "text-font": ["Noto Sans Bold"],
      "text-field": "{name}",
      "text-size": {
        "stops": [[2, 11], [5, 17]]
      },
      "text-transform": "uppercase",
      "text-max-width": 6.25,
      "visibility": "visible"
    },
    "paint": {
      "text-halo-blur": 1,
      "text-color": "#334",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-country-1",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "filter": ["all", ["==", "class", "country"], ["==", "rank", 1], ["has", "iso_a2"]],
    "layout": {
      "text-font": ["Noto Sans Bold"],
      "text-field": "{name}",
      "text-size": {
        "stops": [[1, 11], [4, 17]]
      },
      "text-transform": "uppercase",
      "text-max-width": 6.25,
      "visibility": "visible"
    },
    "paint": {
      "text-halo-blur": 1,
      "text-color": "#334",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.8)"
    }
  }, {
    "id": "place-continent",
    "type": "symbol",
    "source": "ohm-data",
    "source-layer": "place",
    "maxzoom": 1,
    "filter": ["==", "class", "continent"],
    "layout": {
      "text-font": ["Noto Sans Bold"],
      "text-field": "{name}",
      "text-size": 14,
      "text-max-width": 6.25,
      "text-transform": "uppercase",
      "visibility": "visible"
    },
    "paint": {
      "text-halo-blur": 1,
      "text-color": "#334",
      "text-halo-width": 2,
      "text-halo-color": "rgba(255,255,255,0.8)"
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
      "visibility": "none"
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