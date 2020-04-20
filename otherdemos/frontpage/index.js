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
/******/ 	return __webpack_require__(__webpack_require__.s = 20);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _mapconstants = __webpack_require__(11);

var _mbglControlUrlhash = __webpack_require__(9);

var _mbglControlMousehovers = __webpack_require__(8);

var _mbglControlMouseclicks = __webpack_require__(7);

var _mbglControlDateslider = __webpack_require__(3);

var _mbglControlWelcomepanel = __webpack_require__(10);

var _mbglControlLayerswitcher = __webpack_require__(6);

var _mbglControlGeocoder = __webpack_require__(4);

var _mbglControlGeolocate = __webpack_require__(5);

window.MAP = undefined; // this will be THE map

window.makeOHMUrl = function (feature) {
    // if it's a line or polygon w/ a positive osm_id, it's a way
    // if it's a point w/ a positive osm_id, it's a node
    // if it's a line or polygon w/ a negative osm_id, it's a relation

    var osmtype = 'way';
    if (feature.geometry.type == 'Point') {
        osmtype = 'node';
    } else if (feature.properties.osm_id < 0) {
        osmtype = 'relation';
    }

    var url = 'http://www.openhistoricalmap.org/' + osmtype + '/' + feature.properties.osm_id;
    return url;
};

window.onload = function () {
    initBadDateLayerCopies();
    initMap1();

    MAP.on('moveend', function () {
        highlightBadDatesOnMap();
    });

    MAP.on('load', function () {
        initMap2();
        initLoadUrlState();
    });
};

window.listRealMapLayers = function () {
    return _mapconstants.GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('datemissing-') == -1 && layerinfo.id.indexOf('dateinvalid-') == -1 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });
};
window.listInvalidDateMapLayers = function () {
    return _mapconstants.GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('dateinvalid-') == 0 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });
};
window.listMissingDateMapLayers = function () {
    return _mapconstants.GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('datemissing-') == 0 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });
};

function highlightBadDatesOnMap() {
    // see also the setup in initBadDateLayerCopies() where we created second copies of these layers, same data different style

    // step 0
    // make lists of layer IDs: the real map layers, the copied layers for drawing missing/invalid dates
    var re_iso8601 = /^\d\d\d\d\-\d\d\-\d\d$/;

    var realmaplayers = listRealMapLayers();
    var invalidlayers = listInvalidDateMapLayers();
    var missinglayers = listMissingDateMapLayers();
    // console.log([ 'Map layers to check for bad dates', realmaplayers ]);

    // step 1
    // query all features in the viewport (rendered or not),
    // and generate lists of OHM IDs for features with invalid dates and missing dates
    // lists must be unique-ified, and cannot be empty
    var osmids_invalid = [];
    var osmids_missing = [];
    var osmids_looksok = [];

    realmaplayers.forEach(function (layerid) {
        var mapfeatures = MAP.querySourceFeatures('ohm-data', {
            sourceLayer: layerid,
            filter: ['has', 'osm_id']
        });

        mapfeatures.forEach(function (feature) {
            var startdate = feature.properties.start_date;
            var enddate = feature.properties.end_date;
            var osmid = feature.properties.osm_id;

            if (!startdate || !enddate) {
                osmids_missing.push(osmid);
            } else if (!startdate.match(re_iso8601) || !enddate.match(re_iso8601)) {
                osmids_invalid.push(osmid);
            } else {
                osmids_looksok.push(osmid);
            }
        });
    });

    osmids_invalid = osmids_invalid.unique();
    osmids_missing = osmids_missing.unique();
    osmids_looksok = osmids_looksok.unique();

    osmids_invalid.sort();
    osmids_missing.sort();
    osmids_looksok.sort();

    // console.log([ 'OSM IDs Missing dates', osmids_missing ]);
    // console.log([ 'OSM IDs Invalid dates', osmids_invalid ]);
    // console.log([ 'OSM IDs Good dates', osmids_looksok ]);

    if (!osmids_invalid.length) osmids_invalid.push(-1);
    if (!osmids_missing.length) osmids_missing.push(-1);
    if (!osmids_looksok.length) osmids_looksok.push(-1);

    // step 2
    // update those datemissing-X and dateinvalid-X map layers, asserting a new filter to those OSM IDs
    // per initBadDateLayerCopies() filter [3] is the match against osm_id being on a list
    invalidlayers.forEach(function (layerid) {
        var thesefilters = MAP.getFilter(layerid);
        thesefilters[3] = ['match', ['get', 'osm_id'], osmids_invalid, true, false];
        MAP.setFilter(layerid, thesefilters);
    });
    missinglayers.forEach(function (layerid) {
        var thesefilters = MAP.getFilter(layerid);
        thesefilters[3] = ['match', ['get', 'osm_id'], osmids_missing, true, false];
        MAP.setFilter(layerid, thesefilters);
    });
}

function initBadDateLayerCopies() {
    // add to the map style, the new layers datemissing-X and dateinvalid-X
    // where X is every distinct "source-layer" found in the "ohm-date" source
    // do point, line, and polygon versions for all, even if it sounds silly (a water point, a POI polygon)
    // the hover & click behaviors will look over the layer list for datemissing-X and dateinvalid-X entries and configure itself to them,
    // and the moveend handler which performs filtering, also looks over the layer list for these new layers
    var dateissue_layers = _mapconstants.GLMAP_STYLE.layers.map(function (layerinfo) {
        return layerinfo['source-layer'];
    }).filter(function (lid) {
        return lid;
    }).unique();
    dateissue_layers.forEach(function (sourcelayername) {
        var _GLMAP_STYLE$layers;

        (_GLMAP_STYLE$layers = _mapconstants.GLMAP_STYLE.layers).push.apply(_GLMAP_STYLE$layers, [{
            "id": 'datemissing-' + sourcelayername + '-polygon',
            "source": "ohm-data", "source-layer": sourcelayername,
            "type": "fill",
            "paint": {
                "fill-color": "red"
            },
            "layout": {
                "visibility": "none" // layers are turned off by default, see layerswitcher control for toggling these
            },
            "filter": ['all', ['==', ['geometry-type'], "Polygon"], ['has', 'osm_id'], ['match', ['get', 'osm_id'], [-1], true, false]]
        }, {
            "id": 'datemissing-' + sourcelayername + '-line',
            "source": "ohm-data", "source-layer": sourcelayername,
            "type": "line",
            "paint": {
                "line-color": "red"
            },
            "layout": {
                "visibility": "none" // layers are turned off by default, see layerswitcher control for toggling these
            },
            "filter": ['all', ['==', ['geometry-type'], "LineString"], ['has', 'osm_id'], ['match', ['get', 'osm_id'], [-1], true, false]]
        }, {
            "id": 'datemissing-' + sourcelayername + '-point',
            "source": "ohm-data", "source-layer": sourcelayername,
            "type": "circle",
            "paint": {
                "circle-color": "red",
                "circle-radius": 5
            },
            "layout": {
                "visibility": "none" // layers are turned off by default, see layerswitcher control for toggling these
            },
            "filter": ['all', ['==', ['geometry-type'], "Point"], ['has', 'osm_id'], ['match', ['get', 'osm_id'], [-1], true, false]]
        }, {
            "id": 'dateinvalid-' + sourcelayername + '-polygon',
            "source": "ohm-data", "source-layer": sourcelayername,
            "type": "fill",
            "paint": {
                "fill-color": "orange"
            },
            "layout": {
                "visibility": "none" // layers are turned off by default, see layerswitcher control for toggling these
            },
            "filter": ['all', ['==', ['geometry-type'], "Polygon"], ['has', 'osm_id'], ['match', ['get', 'osm_id'], [-1], true, false]]
        }, {
            "id": 'dateinvalid-' + sourcelayername + '-line',
            "source": "ohm-data", "source-layer": sourcelayername,
            "type": "line",
            "paint": {
                "line-color": "orange"
            },
            "layout": {
                "visibility": "none" // layers are turned off by default, see layerswitcher control for toggling these
            },
            "filter": ['all', ['==', ['geometry-type'], "LineString"], ['has', 'osm_id'], ['match', ['get', 'osm_id'], [-1], true, false]]
        }, {
            "id": 'dateinvalid-' + sourcelayername + '-point',
            "source": "ohm-data", "source-layer": sourcelayername,
            "type": "circle",
            "paint": {
                "circle-color": "orange",
                "circle-radius": 5
            },
            "layout": {
                "visibility": "none" // layers are turned off by default, see layerswitcher control for toggling these
            },
            "filter": ['all', ['==', ['geometry-type'], "Point"], ['has', 'osm_id'], ['match', ['get', 'osm_id'], [-1], true, false]]
        }]);
    });
}

function initMap1() {
    //
    // basic map
    // and a container for those custom controls, which we may need to refer to later
    //
    MAP = new mapboxgl.Map({
        container: "map",
        style: _mapconstants.GLMAP_STYLE,
        zoom: _mapconstants.START_ZOOM,
        center: _mapconstants.START_CENTER,
        minZoom: _mapconstants.MIN_ZOOM,
        maxZoom: _mapconstants.MAX_ZOOM
    });

    MAP.addControl(new mapboxgl.NavigationControl());

    MAP.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
    }));
    MAP.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
    }));

    MAP.CONTROLS = {};

    MAP.CONTROLS.HOVERS = new _mbglControlMousehovers.MapHoversControl({
        labeler: function labeler(feature) {
            var tooltip = '';
            if (feature.properties.osm_id && feature.properties.name) {
                tooltip = feature.properties.name + ' :: ' + feature.properties.osm_id;
            } else if (feature.properties.name) {
                tooltip = '' + feature.properties.name;
            } else if (feature.properties.osm_id) {
                tooltip = '' + feature.properties.osm_id;
            }

            if (feature.properties.start_date && feature.properties.end_date) {
                tooltip = tooltip + ' :: ' + feature.properties.start_date + ' to ' + feature.properties.end_date;
            }
            return tooltip;
        }
    });
    MAP.addControl(MAP.CONTROLS.HOVERS);

    MAP.CONTROLS.CLICKS = new _mbglControlMouseclicks.MapClicksControl({
        click: function click(clickevent) {
            // the tool supports grouping layers into sections, e.g. Rails and Roads as a heading
            // we just use one group: Where You Clicked
            // collect a set of resultssets by drilling down through the stated layers in the stated sequence
            // each resultset is:
            // - "title" for that set, e.g. Water Features
            // - "features" list of features to be displayed, e.g. from MAP.queryRenderedFeatures()
            // - "template" function to return a HTML string for each feature (function, means can contain conditionals, etc)
            //    tip: return a empty string to effectively skip this feature
            var collected_feature_groups = [{
                title: "Where You Clicked",
                features: MAP.queryRenderedFeatures(clickevent.point),
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
                        var ohmlink = makeOHMUrl(feature);
                        infohtml += '<br/>OSM ID: <a target="_blank" href="' + ohmlink + '">' + feature.properties.osm_id + '</a>';
                    }

                    // add the layer ID where this was found, to aid in debugging what's what
                    infohtml += '<br/>Layer: ' + feature.layer.id;

                    return infohtml;
                }
            }];

            MAP.CONTROLS.CLICKS.displayFeatures(collected_feature_groups);
        }
    });
    MAP.addControl(MAP.CONTROLS.CLICKS);

    MAP.CONTROLS.WELCOMEPANEL = new _mbglControlWelcomepanel.WelcomePanelControl({
        htmltext: '\n            <h1>Welcome to OpenHistoricalMap!</h1>\n\n            <p>OpenHistoricalMap is a project designed to store and display map data throughout the history of the world. This is a work in progress, we\'ll be playing around with many new features as we time-enable the site. We encourage you to start playing around and editing data, too.</p>\n\n            <div class="center bold" style="margin-top: 1em;">\n                <a href="http://www.openhistoricalmap.org/about">Learn More</a>\n                &bull;\n                <a href="http://www.openhistoricalmap.org/user/new">Start Mapping</a>\n            </div>\n        '
    });
    MAP.addControl(MAP.CONTROLS.WELCOMEPANEL);

    MAP.CONTROLS.GEOLOCATE = new _mbglControlGeolocate.GeolocationControl();
    MAP.addControl(MAP.CONTROLS.GEOLOCATE);

    MAP.CONTROLS.GEOCODER = new _mbglControlGeocoder.GeocoderControl();
    MAP.addControl(MAP.CONTROLS.GEOCODER);

    MAP.CONTROLS.LAYERSWITCHER = new _mbglControlLayerswitcher.LayerSwitcherControl({
        bases: [{ layerid: 'reference-osm', label: "OSM Basemap", opacity: 0.2 }, { layerid: 'reference-satellite', label: "Satellite Basemap", opacity: 0.2 }],
        labels: [{ layerid: 'reference-labels', label: "Streets and Labels", opacity: 0.7 }]
    });
    MAP.addControl(MAP.CONTROLS.LAYERSWITCHER);
}

function initMap2() {
    MAP.CONTROLS.DATESLIDER = new _mbglControlDateslider.MapDateFilterControl({
        // which layers get a date filter prepended to whatever filters are already in place?
        // for us, all of them
        // NOTE that this will change the filters on the layers, prepending a "all" and the start_date/end_date filter
        // and wrapping your other filters into a list starting as element 3
        // e.g. "all", [ "<=", "start_date", "XXXX" ], [ ">=" "end_date", "XXXX" ], [ your other filters here ]
        layers: ["landcover-glacier", "landuse-residential", "landuse-commercial", "landuse-industrial", "park", "park-outline", "landuse-cemetery", "landuse-hospital", "landuse-school", "landuse-railway", "landcover-wood", "landcover-grass", "landcover-grass-park", "waterway_tunnel", "waterway-other", "waterway-stream-canal", "waterway-river", "water-offset", "water", "water-pattern", "landcover-ice-shelf", "building", "building-top", "tunnel-service-track-casing", "tunnel-minor-casing", "tunnel-secondary-tertiary-casing", "tunnel-trunk-primary-casing", "tunnel-motorway-casing", "tunnel-path", "tunnel-service-track", "tunnel-minor", "tunnel-secondary-tertiary", "tunnel-trunk-primary", "tunnel-motorway", "tunnel-railway", "ferry", "aeroway-taxiway-casing", "aeroway-runway-casing", "aeroway-area", "aeroway-taxiway", "aeroway-runway", "highway-area", "highway-motorway-link-casing", "highway-link-casing", "highway-minor-casing", "highway-secondary-tertiary-casing", "highway-primary-casing", "highway-trunk-casing", "highway-motorway-casing", "highway-path", "highway-motorway-link", "highway-link", "highway-minor", "highway-secondary-tertiary", "highway-primary", "highway-trunk", "highway-motorway", "railway-transit", "railway-transit-hatching", "railway-service", "railway-service-hatching", "railway", "railway-hatching", "bridge-motorway-link-casing", "bridge-link-casing", "bridge-secondary-tertiary-casing", "bridge-trunk-primary-casing", "bridge-motorway-casing", "bridge-path-casing", "bridge-path", "bridge-motorway-link", "bridge-link", "bridge-secondary-tertiary", "bridge-trunk-primary", "bridge-motorway", "bridge-railway", "bridge-railway-hatching", "cablecar", "cablecar-dash", "boundary-land-level-4", "boundary-land-level-2", "boundary-land-disputed", "boundary-water", "waterway-name", "water-name-lakeline", "water-name-ocean", "water-name-other", "poi-level-3", "poi-level-2", "poi-level-1", "poi-railway", "road_oneway", "road_oneway_opposite", "highway-name-path", "highway-name-minor", "highway-name-major", "highway-shield", "highway-shield-us-interstate", "highway-shield-us-other", "airport-label-major", "place-other", "place-village", "place-town", "place-city", "place-city-capital", "place-country-other", "place-country-3", "place-country-2", "place-country-1", "place-continent"],

        // the default dates for the boxes
        // this won't be enforced (yet), so the names "min" and "max" are kind of a misnomer... for the moment
        mindate: "1800-01-01",
        maxdate: "2029-12-31"
    });
    MAP.addControl(MAP.CONTROLS.DATESLIDER);

    MAP.CONTROLS.HASHWATCHER = new _mbglControlUrlhash.UrlHashControl(); // hacked to support MAP.CONTROLS.DATESLIDER
    MAP.addControl(MAP.CONTROLS.HASHWATCHER);
}

function initLoadUrlState() {
    MAP.CONTROLS.HASHWATCHER.applyStateFromAddressBar();
}

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
exports.MapDateFilterControl = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _flatpickr = __webpack_require__(19);

var _flatpickr2 = _interopRequireDefault(_flatpickr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(12);

__webpack_require__(13);

var MapDateFilterControl = exports.MapDateFilterControl = function () {
    function MapDateFilterControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, MapDateFilterControl);

        // merge suppplied options with these defaults
        this.options = Object.assign({
            // the default start/end dates
            mindate: "1900-01-01",
            maxdate: "2100-12-31",
            // when dates are changed, do the following callback
            onChange: function onChange() {}
        }, options);

        // some preliminary checks on config, worth panicking to death here and now
        if (!this.validateDateFormat(this.options.mindate)) {
            throw 'MapDateFilterControl mindate must be in YYYY-M-DD format: ' + this.options.mindate;
        }
        if (!this.validateDateFormat(this.options.maxdate)) {
            throw 'MapDateFilterControl maxdate must be in YYYY-M-DD format: ' + this.options.maxdate;
        }
    }

    _createClass(MapDateFilterControl, [{
        key: 'onAdd',
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            this._container = document.createElement("div");
            this._container.className = "mapboxgl-ctrl mbgl-control-dateslider";

            this.initUIElements();

            this.options.layers.forEach(function (layerid) {
                _this.addFilteringOptionToSublayer(layerid);
            });

            // add a handler, so we re-filter when the map view changes
            // and do so at start
            this._map.on('load', function () {
                _this.applyDateFiltering();
            });
            this._map.on('moveend', function () {
                _this.applyDateFiltering();
            });
            setTimeout(function () {
                _this.applyDateFiltering();
            }, 0.25 * 1000);

            // done; hand back our UI element as expected by the framework
            return this._container;
        }
    }, {
        key: 'initUIElements',
        value: function initUIElements() {
            var _this2 = this;

            this._introtext = document.createElement('p');
            this._introtext.innerHTML = '<p>Filter the map by date range.</p>';
            this._container.appendChild(this._introtext);

            this._input_startdate = document.createElement('input');
            this._input_startdate.type = "text";
            this._input_startdate.value = this.options.mindate;
            this._container.appendChild(this._input_startdate);

            this._input_enddate = document.createElement('input');
            this._input_enddate.type = "text";
            this._input_enddate.value = this.options.maxdate;
            this._container.appendChild(this._input_enddate);

            var datepickerconfig = {
                allowInput: true
            };
            (0, _flatpickr2.default)(this._input_startdate, datepickerconfig);
            (0, _flatpickr2.default)(this._input_enddate, datepickerconfig);

            this._gobutton = document.createElement('input');
            this._gobutton.type = "button";
            this._gobutton.value = 'Apply';
            this._gobutton.addEventListener('click', function () {
                if (!_this2.validateDateFormat(_this2._input_startdate.value)) return alert("Invalid start date.");
                if (!_this2.validateDateFormat(_this2._input_enddate.value)) return alert("Invalid start date.");

                _this2.applyDateFiltering();
                _this2.options.onChange();
            });
            this._container.appendChild(this._gobutton);

            this._buttonbar = document.createElement('div');
            this._buttonbar.className = "buttonbar";
            this._container.appendChild(this._buttonbar);

            this._timebackmore = document.createElement('i');
            this._timebackmore.className = "glyphicons glyphicons-fast-backward";
            this._timebackmore.title = "Back 10 years";
            this._buttonbar.appendChild(this._timebackmore);
            this._timebackmore.addEventListener('click', function () {
                _this2.shiftDateWindowByYears(-10);
            });

            this._timebacksome = document.createElement('i');
            this._timebacksome.className = "glyphicons glyphicons-step-backward";
            this._timebacksome.title = "Back 1 year";
            this._buttonbar.appendChild(this._timebacksome);
            this._timebacksome.addEventListener('click', function () {
                _this2.shiftDateWindowByYears(-1);
            });

            this._timeaheadsome = document.createElement('i');
            this._timeaheadsome.className = "glyphicons glyphicons-step-forward";
            this._timeaheadsome.title = "Forward 1 year";
            this._buttonbar.appendChild(this._timeaheadsome);
            this._timeaheadsome.addEventListener('click', function () {
                _this2.shiftDateWindowByYears(1);
            });

            this._timeaheadmore = document.createElement('i');
            this._timeaheadmore.className = "glyphicons glyphicons-fast-forward";
            this._timeaheadmore.title = "Forward 10 years";
            this._buttonbar.appendChild(this._timeaheadmore);
            this._timeaheadmore.addEventListener('click', function () {
                _this2.shiftDateWindowByYears(10);
            });
        }
    }, {
        key: 'getDefaultPosition',
        value: function getDefaultPosition() {
            return 'top-left';
        }
    }, {
        key: 'applyDateFiltering',
        value: function applyDateFiltering() {
            var _this3 = this;

            // MBGL's filtering won't handle a function callback so we could filter against missing osm_id or date being blank or malformed or whatnot
            // so we have some roundabout work to do:
            // - go over the stated sub-layers and collect a list of data sources + layer names,
            // - so we can do a querySourceFeatures() on each source+layer combination, collecting osm_id of features fitting our date filter
            // - so we can then apply to the filter clauses which we created in addFilteringOptionToSublayer()
            // this sounds roundabout compared to specifying a single source + list of source-layers,
            // but allows us to opt-in only the specific map layers which we want to be affected by date filtering

            // the date range
            var thedates = this.getDates();
            var mindate = thedates[0];
            var maxdate = thedates[1];
            // console.debug([ `MapDateFilterControl applyDateFiltering() dates are`, mindate, maxdate ]);

            // go over the stated map layers, collecting a list of unique source + source-layer cmobinations
            var sourcelayers = [];
            {
                var sourcelayers_seen = {};
                this.options.layers.forEach(function (layerid) {
                    var layer = _this3._map.getLayer(layerid);

                    var key = layer.source + ' ' + layer.sourceLayer;
                    if (sourcelayers_seen[key]) return;
                    sourcelayers_seen[key] = true;

                    sourcelayers.push([layer.source, layer.sourceLayer]);
                });
            }
            // console.debug([ `MapDateFilterControl applyDateFiltering() sourcelayers are:`, sourcelayers ]);

            // go over the collected source + source-layer combinations, collect osm_id values for features with valid dates
            // must unique the list, or else MBGL's filters fail with obscure messages about filtering branches
            // and must not let it be zero-length, so make it [ -1 ] if 0 matches
            var collected_osm_ids = [];
            sourcelayers.forEach(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    sourcename = _ref2[0],
                    sourcelayer = _ref2[1];

                var idsfromthislayer = _this3._map.querySourceFeatures(sourcename, {
                    sourceLayer: sourcelayer,
                    filter: ['has', 'osm_id']
                }).filter(function (feature) {
                    // if the feature has no OSM ID then it's "eternal" stuff from Natural Earth of non-date-tracked stuff like Coastlines
                    if (!feature.properties.osm_id) return true;

                    // if start date and/or end date are invalid, then hide it because it's invalid
                    if (!_this3.validateDateFormat(feature.properties.start_date) || !_this3.validateDateFormat(feature.properties.end_date)) return false;

                    // if the feature ended before our window, or doesn't start until after our window, then it's out of the date range
                    if (feature.properties.end_date < mindate || feature.properties.start_date > maxdate) return false;

                    // guess it fits
                    return true;
                }).map(function (feature) {
                    return feature.properties.osm_id;
                });

                // add these IDs to the list
                collected_osm_ids = [].concat(_toConsumableArray(collected_osm_ids), _toConsumableArray(idsfromthislayer));
            });
            collected_osm_ids = collected_osm_ids.unique();
            // console.debug([ `MapDateFilterControl applyDateFiltering() collected_osm_ids are:`, collected_osm_ids ]);

            if (!collected_osm_ids.length) collected_osm_ids = [-1];

            // apply the osm_id filter
            // since we prepended these in addFilteringOptionToSublayer() we know that this is filters[1]
            // and the osm_id values would be filters[1][2]
            this.options.layers.forEach(function (layerid) {
                var oldfilters = _this3._map.getFilter(layerid);

                var newfilters = oldfilters.slice();
                newfilters[1] = ['any', ['in', 'osm_id'].concat(_toConsumableArray(collected_osm_ids)), ['!has', 'osm_id']];

                // console.debug([ `MapDateFilterControl applyDateFiltering() layer ${layerid} before/after filters are:`, oldfilters, newfilters ]);

                _this3._map.setFilter(layerid, newfilters);
            });
        }
    }, {
        key: 'validateDateFormat',
        value: function validateDateFormat(datestring) {
            // make sure the given string is YYYY-MM-DD format, ISO 8601
            var iso8601 = /^\d\d\d\d\-\d\d\-\d\d$/;
            return datestring.match(iso8601);
        }
    }, {
        key: 'addFilteringOptionToSublayer',
        value: function addFilteringOptionToSublayer(layerid) {
            // what we need is for every layer to have a "all" clause against a new filter by its osm_id
            // the list of osm_id values which match filters, is best done in the helper function applyDateFiltering()
            // as that can be smarter than MBGL's own <= >= filtering capabilities

            // the filtering on this layer could be a variety of structures...
            // how to add ALL + two date filters, is different for every one
            var oldfilters = this._map.getFilter(layerid);

            var addthisclause = ['!in', 'osm_id', -1]; // Sep 2018, deprecated "in" syntax, but new "match" expression is an unknown syntax today? works on other maps!

            if (oldfilters === undefined) {
                // no filter at all, so create one
                var newfilters = ["all", addthisclause];

                var filtername = "NoFilter";
                // console.debug([ `MapDateFilterControl ${filtername} ${layerid}`, oldfilters, newfilters ]);
                this._map.setFilter(layerid, newfilters);
            } else if (oldfilters[0] === 'all') {
                // "all" plus an array of clauses
                // we just prepend the new clause to the list of clauses
                var _newfilters = oldfilters.slice();
                _newfilters.splice(1, 0, addthisclause);

                var _filtername = "AllArray";
                // console.debug([ `MapDateFilterControl ${filtername} ${layerid}`, oldfilters, newfilters ]);
                this._map.setFilter(layerid, _newfilters);
            } else if (oldfilters[0] === 'any') {
                // "any" plus an array of clauses
                // wrap them all into a new single clause, and prepend our required
                // thus, "all" of our filter + their original "any" filter
                var _newfilters2 = ["all", addthisclause, [oldfilters]];

                var _filtername2 = "AnyArray";
                // console.debug([ `MapDateFilterControl ${filtername} ${layerid}`, oldfilters, newfilters ]);
                this._map.setFilter(layerid, _newfilters2);
            } else if (Array.isArray(oldfilters)) {
                // an array forming a single clause
                // wrap it into an array, and stick a "all" in front of it + our new filter
                var _newfilters3 = ["all", addthisclause, oldfilters];

                var _filtername3 = "SingleClauseArray";
                // console.debug([ `MapDateFilterControl ${filtername} ${layerid}`, oldfilters, newfilters ]);
                this._map.setFilter(layerid, _newfilters3);
            } else {
                // some other condition I had not expected and need to figure out
                console.error(oldfilters);
                throw 'MapDateFilterControl addFilteringOptionToSublayer() got unexpected filtering condition on layer ' + layerid;
            }
        }
    }, {
        key: 'getDates',
        value: function getDates() {
            // return the dates currently in use for filtering
            return [this._input_startdate.value, this._input_enddate.value];
        }
    }, {
        key: 'setDates',
        value: function setDates(mindate, maxdate) {
            if (!this.validateDateFormat(mindate)) {
                throw "MapDateFilterControl setDates() mindate ${mindate} is not valid";
            }
            if (!this.validateDateFormat(maxdate)) {
                throw "MapDateFilterControl setDates() maxdate ${maxdate} is not valid";
            }

            this._input_startdate.value = mindate;
            this._input_enddate.value = maxdate;

            this.applyDateFiltering();
            this.options.onChange();
        }
    }, {
        key: 'shiftDateWindowByYears',
        value: function shiftDateWindowByYears(yearshift) {
            var newstart = parseInt(this._input_startdate.value.substr(0, 4)) + yearshift + this._input_startdate.value.substr(4);
            var newend = parseInt(this._input_enddate.value.substr(0, 4)) + yearshift + this._input_enddate.value.substr(4);
            this.setDates(newstart, newend);
        }
    }]);

    return MapDateFilterControl;
}();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(14);

var GeocoderControl = exports.GeocoderControl = function () {
    function GeocoderControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, GeocoderControl);

        // merge suppplied options with these defaults
        this.options = Object.assign({
            bases: [], // list of { layer, label } objects, for base layer offerings
            labels: [] // list of { layer, label } objects, for label overlay offerings
        }, options);
    }

    _createClass(GeocoderControl, [{
        key: "onAdd",
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            this._container = document.createElement("div");
            this._container.className = "mapboxgl-ctrl mbgl-control-geocoder";

            // two parts: panel which shows content (has X to hide itself), and button to show the panel (and hide itself)
            this._showbutton = document.createElement("div");
            this._showbutton.className = "mbgl-control-geocoder-button mapboxgl-ctrl-icon";
            this._showbutton.innerHTML = '<i class="glyphicons glyphicons-globe"></i>';
            this._showbutton.addEventListener('click', function () {
                _this.openPanel();
            });

            this._thepanel = document.createElement("div");
            this._thepanel.className = "mbgl-control-geocoder-panel";

            this._closebutton = document.createElement("I");
            this._closebutton.className = 'mbgl-control-geocoder-closebutton glyphicons glyphicons-remove-circle';
            this._closebutton.addEventListener('click', function () {
                _this.closePanel();
            });
            this._thepanel.appendChild(this._closebutton);

            this._header = document.createElement("H1");
            this._header.innerHTML = 'Zoom to a Location';
            this._thepanel.appendChild(this._header);

            this._textbox = document.createElement("INPUT");
            this._textbox.type = 'text';
            this._textbox.placeholder = 'address, city, landmark';
            this._thepanel.appendChild(this._textbox);
            this._textbox.addEventListener('keyup', function (event) {
                event.preventDefault();
                if (event.keyCode !== 13) return;
                _this._gobutton.click();
            });

            this._gobutton = document.createElement("BUTTON");
            this._gobutton.innerHTML = "Search";
            this._thepanel.appendChild(this._gobutton);
            this._gobutton.addEventListener('click', function () {
                _this.performGeocode();
            });

            // done; hand back our UI element as expected by the framework
            this._container.appendChild(this._showbutton);
            this._container.appendChild(this._thepanel);
            this.closePanel();
            return this._container;
        }
    }, {
        key: "onRemove",
        value: function onRemove() {}
    }, {
        key: "getDefaultPosition",
        value: function getDefaultPosition() {
            return 'top-right';
        }
    }, {
        key: "closePanel",
        value: function closePanel() {
            this._container.classList.remove('mbgl-control-geocoder-expanded');
        }
    }, {
        key: "openPanel",
        value: function openPanel() {
            this._container.classList.add('mbgl-control-geocoder-expanded');
        }
    }, {
        key: "performGeocode",
        value: function performGeocode() {
            var _this2 = this;

            var address = this._textbox.value;
            if (!address) return;

            var params = {
                format: "json",
                q: address
            };
            var geocodeurl = "https://nominatim.openstreetmap.org/search";
            var querystring = Object.keys(params).map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');
            var url = geocodeurl + "?" + querystring;

            var request = new XMLHttpRequest();
            request.open('GET', url);
            request.onload = function () {
                var response = JSON.parse(request.response);
                var geocoded = response[0];
                _this2.handleGeocodeResult(geocoded);
            };
            request.send();
        }
    }, {
        key: "handleGeocodeResult",
        value: function handleGeocodeResult(geocoderesult) {
            // built for nominatim format
            var s = parseFloat(geocoderesult.boundingbox[0]);
            var n = parseFloat(geocoderesult.boundingbox[1]);
            var w = parseFloat(geocoderesult.boundingbox[2]);
            var e = parseFloat(geocoderesult.boundingbox[3]);
            var bounds = [[w, s], [e, n]];
            this._map.fitBounds(bounds);
        }
    }]);

    return GeocoderControl;
}();

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(15);

var GeolocationControl = exports.GeolocationControl = function () {
    function GeolocationControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, GeolocationControl);

        // merge suppplied options with these defaults
        this.options = Object.assign({
            bases: [], // list of { layer, label } objects, for base layer offerings
            labels: [] // list of { layer, label } objects, for label overlay offerings
        }, options);
    }

    _createClass(GeolocationControl, [{
        key: "onAdd",
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            this._container = document.createElement("div");
            this._container.className = "mapboxgl-ctrl mbgl-control-geolocate";

            this._thebutton = document.createElement("div");
            this._thebutton.className = "mbgl-control-geolocate-button mapboxgl-ctrl-icon";
            this._thebutton.innerHTML = '<i class="glyphicons glyphicons-map-marker"></i>';
            this._thebutton.addEventListener('click', function () {
                _this.geolocateAndZoom();
            });

            // done; hand back our UI element as expected by the framework
            this._container.appendChild(this._thebutton);
            return this._container;
        }
    }, {
        key: "onRemove",
        value: function onRemove() {}
    }, {
        key: "getDefaultPosition",
        value: function getDefaultPosition() {
            return 'top-right';
        }
    }, {
        key: "geolocateAndZoom",
        value: function geolocateAndZoom() {
            var _this2 = this;

            if (!navigator.geolocation) return alert("Geolocation is not supported by this browser.");
            navigator.geolocation.getCurrentPosition(function (position) {
                var y = position.coords.latitude;
                var x = position.coords.longitude;
                var z = 15;

                _this2._map.setZoom(z);
                _this2._map.setCenter([x, y]);
            }, function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("User denied the request for Geolocation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("The request to get user location timed out.");
                        break;
                    case error.UNKNOWN_ERROR:
                        alert("An unknown error occurred.");
                        break;
                }
            });
        }
    }]);

    return GeolocationControl;
}();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(16);

var LayerSwitcherControl = exports.LayerSwitcherControl = function () {
    function LayerSwitcherControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, LayerSwitcherControl);

        // merge suppplied options with these defaults
        this.options = Object.assign({
            bases: [], // list of { layer, label } objects, for base layer offerings
            labels: [] // list of { layer, label } objects, for label overlay offerings
        }, options);
    }

    _createClass(LayerSwitcherControl, [{
        key: "onAdd",
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            this._container = document.createElement("div");
            this._container.className = "mapboxgl-ctrl mbgl-control-layerswitcher";

            // two parts: panel which shows content (has X to hide itself), and button to show the panel (and hide itself)
            this._showbutton = document.createElement("div");
            this._showbutton.className = "mbgl-control-layerswitcher-button mapboxgl-ctrl-icon";
            this._showbutton.innerHTML = '<i class="glyphicons glyphicons-list"></i>';
            this._showbutton.addEventListener('click', function () {
                _this.openPanel();
            });

            this._thepanel = document.createElement("div");
            this._thepanel.className = "mbgl-control-layerswitcher-panel";

            this._closebutton = document.createElement("I");
            this._closebutton.className = 'mbgl-control-layerswitcher-closebutton glyphicons glyphicons-remove-circle';
            this._closebutton.addEventListener('click', function () {
                _this.closePanel();
            });
            this._thepanel.appendChild(this._closebutton);

            this._maintext = document.createElement("div");
            this._maintext.innerHTML = '<h1>Map Options</h1>';
            this._thepanel.appendChild(this._maintext);

            this._picker_basemap = document.createElement("div");
            this._picker_basemap.innerHTML = '<h2>Base Maps</h2>';
            this._maintext.appendChild(this._picker_basemap);
            var baseoptions = [{ layerid: '', label: 'None' }].concat(_toConsumableArray(this.options.bases));
            baseoptions.forEach(function (option) {
                var section = document.createElement("div");
                section.className = "mbgl-control-layerswitcher-layer";
                section.setAttribute('data-layerid', option.layerid);

                var selected = option.layerid ? '' : 'checked'; // by default, select the None option
                var checkbox = document.createElement("label");
                checkbox.innerHTML = "<input type=\"radio\" name=\"mbgl-control-layerswitcher-basemap\" value=\"" + option.layerid + "\" " + selected + "> " + option.label;
                section.appendChild(checkbox);
                checkbox.addEventListener('click', function (event) {
                    if (event.target.tagName != 'INPUT') return; // accept clicks on the label, which DO propagate to the proper checkbox
                    var layerid = event.target.getAttribute('value');
                    _this.selectBasemap(layerid);
                });

                if (option.layerid) {
                    // not for the None option
                    var slider = document.createElement("div");
                    slider.setAttribute('data-layerid', option.layerid);
                    section.appendChild(slider);
                    noUiSlider.create(slider, {
                        start: [option.opacity],
                        range: { 'min': 0, 'max': 1 }
                    });
                    slider.noUiSlider.on('change', function (values) {
                        var opacity = values[0];
                        var layerid = slider.getAttribute('data-layerid');
                        _this.setLayerOpacity(layerid, opacity);
                    });
                }

                _this._picker_basemap.appendChild(section);
            });

            this._picker_labels = document.createElement("div");
            this._picker_labels.innerHTML = '<h2>Labels</h2>';
            this._maintext.appendChild(this._picker_labels);
            var labeloptions = [{ layerid: '', label: 'None' }].concat(_toConsumableArray(this.options.labels));
            labeloptions.forEach(function (option) {
                var section = document.createElement("div");
                section.className = "mbgl-control-layerswitcher-layer";
                section.setAttribute('data-layerid', option.layerid);

                var selected = option.layerid ? '' : 'checked'; // by default, select the None option
                var checkbox = document.createElement("label");
                checkbox.innerHTML = "<input type=\"radio\" name=\"mbgl-control-layerswitcher-labels\" value=\"" + option.layerid + "\" " + selected + "> " + option.label;
                section.appendChild(checkbox);
                checkbox.addEventListener('click', function (event) {
                    if (event.target.tagName != 'INPUT') return; // accept clicks on the label, which DO propagate to the proper checkbox
                    var layerid = event.target.getAttribute('value');
                    _this.selectLabels(layerid);
                });

                if (option.layerid) {
                    // not for the None option
                    var slider = document.createElement("div");
                    slider.setAttribute('data-layerid', option.layerid);
                    section.appendChild(slider);

                    noUiSlider.create(slider, {
                        start: [option.opacity],
                        range: { 'min': 0, 'max': 1 }
                    });
                    slider.noUiSlider.on('change', function (values) {
                        var opacity = values[0];
                        var layerid = slider.getAttribute('data-layerid');
                        _this.setLayerOpacity(layerid, opacity);
                    });
                }

                _this._picker_labels.appendChild(section);
            });

            // layer picker: a synthetic "layer option" for the invalid/missing layers
            this._picker_invalidandmissing = document.createElement("div");
            this._picker_invalidandmissing.innerHTML = '<h2>Date Errors</h2>';
            this._maintext.appendChild(this._picker_invalidandmissing);

            var invalidandmissingoptions = [{ layerid: '', label: 'Hide' }, { layerid: 'invalidandmissing', label: 'Show' }];

            invalidandmissingoptions.forEach(function (option) {
                var section = document.createElement("div");
                section.className = "mbgl-control-layerswitcher-layer";
                section.setAttribute('data-layerid', option.layerid);

                var selected = option.layerid ? '' : 'checked'; // by default, select the None option
                var checkbox = document.createElement("label");
                checkbox.innerHTML = "<input type=\"radio\" name=\"mbgl-control-layerswitcher-invalidandmissing\" value=\"" + option.layerid + "\" " + selected + "> " + option.label;
                section.appendChild(checkbox);
                checkbox.addEventListener('click', function (event) {
                    if (event.target.tagName != 'INPUT') return; // accept clicks on the label, which DO propagate to the proper checkbox
                    var layerid = event.target.getAttribute('value');
                    _this.selectInvalidAndMissing(layerid);

                    if (option.layerid) {
                        // for the Show option, a custom-crafted legend
                        var legend = document.createElement("div");
                        legend.className = "mbgl-control-layerswitcher-legend";
                        legend.innerHTML = "\n                    <div class=\"mbgl-control-layerswitcher-legend-icon\" style=\"background-color: red;\"></div> Start/End Date Missing<br/>\n                    <div class=\"mbgl-control-layerswitcher-legend-icon\" style=\"background-color: orange;\"></div> Start/End Date Invalid Format<br/>\n                    ";
                        section.appendChild(legend);
                    }
                });

                _this._picker_invalidandmissing.appendChild(section);
            });

            // done; hand back our UI element as expected by the framework
            this._container.appendChild(this._showbutton);
            this._container.appendChild(this._thepanel);
            this.closePanel();
            return this._container;
        }
    }, {
        key: "onRemove",
        value: function onRemove() {}
    }, {
        key: "getDefaultPosition",
        value: function getDefaultPosition() {
            return 'top-right';
        }
    }, {
        key: "closePanel",
        value: function closePanel() {
            this._container.classList.remove('mbgl-control-layerswitcher-expanded');
        }
    }, {
        key: "openPanel",
        value: function openPanel() {
            this._container.classList.add('mbgl-control-layerswitcher-expanded');
        }
    }, {
        key: "selectBasemap",
        value: function selectBasemap(layerid) {
            var _this2 = this;

            // map layer: toggle the other options off, toggle this one on
            this.options.bases.forEach(function (option) {
                if (layerid && layerid == option.layerid) {
                    _this2._map.setLayoutProperty(option.layerid, 'visibility', 'visible');
                } else {
                    _this2._map.setLayoutProperty(option.layerid, 'visibility', 'none');
                }
            });

            // expand this one section and collapse others; and also check the radiobox
            var legendsections = this._picker_basemap.querySelectorAll("div.mbgl-control-layerswitcher-layer");
            legendsections.forEach(function (thissection) {
                var thislayerid = thissection.getAttribute('data-layerid');
                if (layerid == thislayerid) {
                    thissection.querySelector('input[type="radio"]').checked = true;
                    thissection.classList.add('mbgl-control-layerswitcher-layer-expanded');
                } else {
                    thissection.classList.remove('mbgl-control-layerswitcher-layer-expanded');
                }
            });
        }
    }, {
        key: "selectLabels",
        value: function selectLabels(layerid) {
            var _this3 = this;

            // map layer: toggle the other options off, toggle this one on
            this.options.labels.forEach(function (option) {
                if (layerid && layerid == option.layerid) {
                    _this3._map.setLayoutProperty(option.layerid, 'visibility', 'visible');
                } else {
                    _this3._map.setLayoutProperty(option.layerid, 'visibility', 'none');
                }
            });

            // expand this one section and collapse others; and also check the radiobox
            var legendsections = this._picker_labels.querySelectorAll("div.mbgl-control-layerswitcher-layer");
            legendsections.forEach(function (thissection) {
                var thislayerid = thissection.getAttribute('data-layerid');
                if (layerid == thislayerid) {
                    thissection.querySelector('input[type="radio"]').checked = true;
                    thissection.classList.add('mbgl-control-layerswitcher-layer-expanded');
                } else {
                    thissection.classList.remove('mbgl-control-layerswitcher-layer-expanded');
                }
            });
        }
    }, {
        key: "selectInvalidAndMissing",
        value: function selectInvalidAndMissing(layerid) {
            var _this4 = this;

            // only 2 options here: on and off, setting in this case a "group" of layers
            // map layers: toggle the other options off, toggle this one on
            var layers_invalid = listInvalidDateMapLayers();
            var layers_missing = listMissingDateMapLayers();
            var layers_to_toggle = [].concat(_toConsumableArray(layers_invalid), _toConsumableArray(layers_missing));

            if (layerid) {
                layers_to_toggle.forEach(function (layerid) {
                    _this4._map.setLayoutProperty(layerid, 'visibility', 'visible');
                });
            } else {
                layers_to_toggle.forEach(function (layerid) {
                    _this4._map.setLayoutProperty(layerid, 'visibility', 'none');
                });
            }

            // expand this one section and collapse others; and also check the radiobox
            var legendsections = this._picker_invalidandmissing.querySelectorAll("div.mbgl-control-layerswitcher-layer");
            legendsections.forEach(function (thissection) {
                var thislayerid = thissection.getAttribute('data-layerid');
                if (layerid == thislayerid) {
                    thissection.querySelector('input[type="radio"]').checked = true;
                    thissection.classList.add('mbgl-control-layerswitcher-layer-expanded');
                } else {
                    thissection.classList.remove('mbgl-control-layerswitcher-layer-expanded');
                }
            });
        }
    }, {
        key: "setLayerOpacity",
        value: function setLayerOpacity(layerid, opacity) {
            opacity = parseFloat(opacity);
            this._map.setPaintProperty(layerid, 'raster-opacity', opacity);
        }
    }]);

    return LayerSwitcherControl;
}();

/***/ }),
/* 7 */
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

__webpack_require__(17);

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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapHoversControl = exports.MapHoversControl = function () {
    function MapHoversControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, MapHoversControl);

        // merge suppplied options with these defaults
        this.options = Object.assign({
            labeler: function labeler(feature) {
                return '';
            }
        }, options);
    }

    _createClass(MapHoversControl, [{
        key: 'onAdd',
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            // when the map comes ready, attach the given events to all layers
            // each layer is a callback, which will be passed a feature and should return the tooltip text
            this._map.on('load', function () {
                var layers1 = listRealMapLayers();
                var layers2 = listInvalidDateMapLayers();
                var layers3 = listMissingDateMapLayers();
                var querylayers = [].concat(_toConsumableArray(layers1), _toConsumableArray(layers2), _toConsumableArray(layers3));

                querylayers.forEach(function (layerid) {
                    _this._map.on("mousemove", layerid, function (mouseevent) {
                        var feature = mouseevent.features[0];
                        if (!feature) return;

                        var tooltip = _this.options.labeler(feature);
                        if (tooltip) {
                            _this.setMapToolTip(tooltip);
                        }
                    });
                });

                _this._map.on("mouseleave", function () {
                    _this.clearMapToolTip();
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
            Object.entries(this.options.layers).forEach(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    layerid = _ref2[0],
                    callbacks = _ref2[1];

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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
        key: 'onAdd',
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            // rather than listen for various events, which quickly turns into infinite loops, just run on an interval
            this._timer = setInterval(function () {
                _this.updateUrlHashFromMap();
            }, 1000);

            // return some dummy container we won't use
            this._container = document.createElement('span');
            return this._container;
        }
    }, {
        key: 'onRemove',
        value: function onRemove() {
            // detach the event handlers
            if (this._timer) {
                clearInterval(this._timer);
            }

            // detach the map
            this._map = undefined;
        }
    }, {
        key: 'updateUrlHashFromMap',
        value: function updateUrlHashFromMap() {
            var z = this._map.getZoom().toFixed(2);
            var lat = this._map.getCenter().lat.toFixed(5);
            var lng = this._map.getCenter().lng.toFixed(5);
            var dates = this._map.CONTROLS.DATESLIDER.getDates().join(',');

            var hashstring = z + '/' + lat + '/' + lng + '/' + dates + '/';
            window.location.hash = hashstring;
        }
    }, {
        key: 'applyStateFromAddressBar',
        value: function applyStateFromAddressBar() {
            var _this2 = this;

            var hashstring = window.location.hash || "";
            if (!hashstring) return;

            var params = hashstring.replace(/^#/, '').split('/');

            var _ref = [].concat(_toConsumableArray(params)),
                z = _ref[0],
                x = _ref[1],
                y = _ref[2],
                d = _ref[3];

            if (z && x && y && z.match(/^\d+\.?\d*$/) && x.match(/^\-?\d+\.\d+$/) && y.match(/^\-?\d+\.\d+$/)) {
                // just X/Y/Z params
                this._map.setZoom(parseFloat(z));
                this._map.setCenter([parseFloat(y), parseFloat(x)]);
                this._map.fire('moveend');
            }
            if (d && d.match(/^(\d\d\d\d\-\d\d\-\d\d),(\d\d\d\d\-\d\d\-\d\d)$/)) {
                // X/Y/Z params plus startdate,enddate
                var dates = d.split(',');
                this._map.CONTROLS.DATESLIDER.setDates(dates[0], dates[1]);
                setTimeout(function () {
                    _this2._map.CONTROLS.DATESLIDER.applyDateFiltering(); // bug workaround, during initial change from no hash at all to a hash
                    _this2._map.fire('moveend');
                }, 500);
            }
        }
    }]);

    return UrlHashControl;
}();

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(18);

var WelcomePanelControl = exports.WelcomePanelControl = function () {
    function WelcomePanelControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, WelcomePanelControl);

        // merge suppplied options with these defaults
        this.options = Object.assign({
            htmltext: "" // the text to display
        }, options);
    }

    _createClass(WelcomePanelControl, [{
        key: "onAdd",
        value: function onAdd(map) {
            var _this = this;

            this._map = map;

            this._container = document.createElement("div");
            this._container.className = "mapboxgl-ctrl mbgl-control-welcomepanel";

            this._closebutton = document.createElement("I");
            this._closebutton.className = 'mbgl-control-welcomepanel-closebutton glyphicons glyphicons-remove-circle';
            this._container.appendChild(this._closebutton);
            this._closebutton.addEventListener('click', function () {
                _this.closePanel();
            });

            this._maintext = document.createElement("div");
            this._container.appendChild(this._maintext);
            this._maintext.innerHTML = this.options.htmltext;

            // done; hand back our UI element as expected by the framework
            return this._container;
        }
    }, {
        key: "onRemove",
        value: function onRemove() {}
    }, {
        key: "getDefaultPosition",
        value: function getDefaultPosition() {
            return 'top-left';
        }
    }, {
        key: "closePanel",
        value: function closePanel() {
            this._map.removeControl(this); // doesn't work!
            this._container.parentNode.removeChild(this._container);
        }
    }]);

    return WelcomePanelControl;
}();

/***/ }),
/* 11 */
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
 */

var OHM_BASE_URL = exports.OHM_BASE_URL = "https://vtiles.openhistoricalmap.org/";
var OHM_TILEJSON = exports.OHM_TILEJSON = OHM_BASE_URL + "/index.json";
var OHM_URL = exports.OHM_URL = OHM_BASE_URL + "/{z}/{x}/{y}.pbf";

var THIS_URL = exports.THIS_URL = window.location.href.split('#')[0];
var SPRITE_URL_ROOT = exports.SPRITE_URL_ROOT = THIS_URL + "styles/osm-bright-gl-style/sprite";
var FONT_URL_STRING = exports.FONT_URL_STRING = THIS_URL + "fonts/{fontstack}/{range}.pbf";

var MIN_ZOOM = exports.MIN_ZOOM = 2;
var MAX_ZOOM = exports.MAX_ZOOM = 16;
var START_ZOOM = exports.START_ZOOM = 3;
var START_CENTER = exports.START_CENTER = [-99.5, 37.9];

/*
 * This style is a direct lift of openmaptiles/osm-bright-gl-style    https://github.com/openmaptiles/osm-bright-gl-style    - GA 2018 July
 */
var GLMAP_STYLE = exports.GLMAP_STYLE = {
  "version": 8,
  "name": "openhistoricalmap",
  "sources": {
    "ohm-data": {
      "type": "vector",
      "tiles": [OHM_URL]
    },
    "osm-tiles": {
      "type": "raster",
      "tiles": ["http://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "tileSize": 256
    },
    "esri-satellite": {
      "type": "raster",
      "tiles": ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      "tileSize": 256
    },
    "positron-labels": {
      "type": "raster",
      "tiles": ["http://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", "http://b.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", "http://c.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png", "http://d.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"],
      "tileSize": 256
    }
  },
  "sprite": SPRITE_URL_ROOT,
  "glyphs": FONT_URL_STRING,
  "layers": [
  /*
   * BASEMAPS, cuz we will need reference points; see also LABELS section
   */
  {
    "id": "reference-osm",
    "type": "raster",
    "source": "osm-tiles",
    "minzoom": 0,
    "maxzoom": 22,
    "layout": {
      "visibility": "none"
    },
    "paint": {
      "raster-opacity": 0.2 // an opacity slider exists, match this value to the initial value in the LayerSwitcherControl constructor
    }
  }, {
    "id": "reference-satellite",
    "type": "raster",
    "source": "esri-satellite",
    "minzoom": 0,
    "maxzoom": 22,
    "layout": {
      "visibility": "none"
    },
    "paint": {
      "raster-opacity": 0.2 // an opacity slider exists, match this value to the initial value in the LayerSwitcherControl constructor
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
   * LABELS, cuz we will need reference points; see also BASEMAPS section
   */
  {
    "id": "reference-labels",
    "type": "raster",
    "source": "positron-labels",
    "minzoom": 0,
    "maxzoom": 22,
    "layout": {
      "visibility": "none"
    },
    "paint": {
      "raster-opacity": 0.7 // an opacity slider exists, match this value to the initial value in the LayerSwitcherControl constructor
    }
  }]
};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 13 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 14 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 15 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 16 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 17 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 18 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

/* flatpickr v4.5.2, @license MIT */
(function (global, factory) {
     true ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.flatpickr = factory());
}(this, (function () { 'use strict';

    var pad = function pad(number) {
      return ("0" + number).slice(-2);
    };
    var int = function int(bool) {
      return bool === true ? 1 : 0;
    };
    function debounce(func, wait, immediate) {
      if (immediate === void 0) {
        immediate = false;
      }

      var timeout;
      return function () {
        var context = this,
            args = arguments;
        timeout !== null && clearTimeout(timeout);
        timeout = window.setTimeout(function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
      };
    }
    var arrayify = function arrayify(obj) {
      return obj instanceof Array ? obj : [obj];
    };

    var do_nothing = function do_nothing() {
      return undefined;
    };

    var monthToStr = function monthToStr(monthNumber, shorthand, locale) {
      return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber];
    };
    var revFormat = {
      D: do_nothing,
      F: function F(dateObj, monthName, locale) {
        dateObj.setMonth(locale.months.longhand.indexOf(monthName));
      },
      G: function G(dateObj, hour) {
        dateObj.setHours(parseFloat(hour));
      },
      H: function H(dateObj, hour) {
        dateObj.setHours(parseFloat(hour));
      },
      J: function J(dateObj, day) {
        dateObj.setDate(parseFloat(day));
      },
      K: function K(dateObj, amPM, locale) {
        dateObj.setHours(dateObj.getHours() % 12 + 12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
      },
      M: function M(dateObj, shortMonth, locale) {
        dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
      },
      S: function S(dateObj, seconds) {
        dateObj.setSeconds(parseFloat(seconds));
      },
      U: function U(_, unixSeconds) {
        return new Date(parseFloat(unixSeconds) * 1000);
      },
      W: function W(dateObj, weekNum) {
        var weekNumber = parseInt(weekNum);
        return new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
      },
      Y: function Y(dateObj, year) {
        dateObj.setFullYear(parseFloat(year));
      },
      Z: function Z(_, ISODate) {
        return new Date(ISODate);
      },
      d: function d(dateObj, day) {
        dateObj.setDate(parseFloat(day));
      },
      h: function h(dateObj, hour) {
        dateObj.setHours(parseFloat(hour));
      },
      i: function i(dateObj, minutes) {
        dateObj.setMinutes(parseFloat(minutes));
      },
      j: function j(dateObj, day) {
        dateObj.setDate(parseFloat(day));
      },
      l: do_nothing,
      m: function m(dateObj, month) {
        dateObj.setMonth(parseFloat(month) - 1);
      },
      n: function n(dateObj, month) {
        dateObj.setMonth(parseFloat(month) - 1);
      },
      s: function s(dateObj, seconds) {
        dateObj.setSeconds(parseFloat(seconds));
      },
      w: do_nothing,
      y: function y(dateObj, year) {
        dateObj.setFullYear(2000 + parseFloat(year));
      }
    };
    var tokenRegex = {
      D: "(\\w+)",
      F: "(\\w+)",
      G: "(\\d\\d|\\d)",
      H: "(\\d\\d|\\d)",
      J: "(\\d\\d|\\d)\\w+",
      K: "",
      M: "(\\w+)",
      S: "(\\d\\d|\\d)",
      U: "(.+)",
      W: "(\\d\\d|\\d)",
      Y: "(\\d{4})",
      Z: "(.+)",
      d: "(\\d\\d|\\d)",
      h: "(\\d\\d|\\d)",
      i: "(\\d\\d|\\d)",
      j: "(\\d\\d|\\d)",
      l: "(\\w+)",
      m: "(\\d\\d|\\d)",
      n: "(\\d\\d|\\d)",
      s: "(\\d\\d|\\d)",
      w: "(\\d\\d|\\d)",
      y: "(\\d{2})"
    };
    var formats = {
      Z: function Z(date) {
        return date.toISOString();
      },
      D: function D(date, locale, options) {
        return locale.weekdays.shorthand[formats.w(date, locale, options)];
      },
      F: function F(date, locale, options) {
        return monthToStr(formats.n(date, locale, options) - 1, false, locale);
      },
      G: function G(date, locale, options) {
        return pad(formats.h(date, locale, options));
      },
      H: function H(date) {
        return pad(date.getHours());
      },
      J: function J(date, locale) {
        return locale.ordinal !== undefined ? date.getDate() + locale.ordinal(date.getDate()) : date.getDate();
      },
      K: function K(date, locale) {
        return locale.amPM[int(date.getHours() > 11)];
      },
      M: function M(date, locale) {
        return monthToStr(date.getMonth(), true, locale);
      },
      S: function S(date) {
        return pad(date.getSeconds());
      },
      U: function U(date) {
        return date.getTime() / 1000;
      },
      W: function W(date, _, options) {
        return options.getWeek(date);
      },
      Y: function Y(date) {
        return date.getFullYear();
      },
      d: function d(date) {
        return pad(date.getDate());
      },
      h: function h(date) {
        return date.getHours() % 12 ? date.getHours() % 12 : 12;
      },
      i: function i(date) {
        return pad(date.getMinutes());
      },
      j: function j(date) {
        return date.getDate();
      },
      l: function l(date, locale) {
        return locale.weekdays.longhand[date.getDay()];
      },
      m: function m(date) {
        return pad(date.getMonth() + 1);
      },
      n: function n(date) {
        return date.getMonth() + 1;
      },
      s: function s(date) {
        return date.getSeconds();
      },
      w: function w(date) {
        return date.getDay();
      },
      y: function y(date) {
        return String(date.getFullYear()).substring(2);
      }
    };

    var english = {
      weekdays: {
        shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        longhand: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      },
      months: {
        shorthand: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        longhand: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      },
      daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      firstDayOfWeek: 0,
      ordinal: function ordinal(nth) {
        var s = nth % 100;
        if (s > 3 && s < 21) return "th";

        switch (s % 10) {
          case 1:
            return "st";

          case 2:
            return "nd";

          case 3:
            return "rd";

          default:
            return "th";
        }
      },
      rangeSeparator: " to ",
      weekAbbreviation: "Wk",
      scrollTitle: "Scroll to increment",
      toggleTitle: "Click to toggle",
      amPM: ["AM", "PM"],
      yearAriaLabel: "Year"
    };

    var createDateFormatter = function createDateFormatter(_ref) {
      var _ref$config = _ref.config,
          config = _ref$config === void 0 ? defaults : _ref$config,
          _ref$l10n = _ref.l10n,
          l10n = _ref$l10n === void 0 ? english : _ref$l10n;
      return function (dateObj, frmt, overrideLocale) {
        var locale = overrideLocale || l10n;

        if (config.formatDate !== undefined) {
          return config.formatDate(dateObj, frmt, locale);
        }

        return frmt.split("").map(function (c, i, arr) {
          return formats[c] && arr[i - 1] !== "\\" ? formats[c](dateObj, locale, config) : c !== "\\" ? c : "";
        }).join("");
      };
    };
    var createDateParser = function createDateParser(_ref2) {
      var _ref2$config = _ref2.config,
          config = _ref2$config === void 0 ? defaults : _ref2$config,
          _ref2$l10n = _ref2.l10n,
          l10n = _ref2$l10n === void 0 ? english : _ref2$l10n;
      return function (date, givenFormat, timeless, customLocale) {
        if (date !== 0 && !date) return undefined;
        var locale = customLocale || l10n;
        var parsedDate;
        var date_orig = date;
        if (date instanceof Date) parsedDate = new Date(date.getTime());else if (typeof date !== "string" && date.toFixed !== undefined) parsedDate = new Date(date);else if (typeof date === "string") {
          var format = givenFormat || (config || defaults).dateFormat;
          var datestr = String(date).trim();

          if (datestr === "today") {
            parsedDate = new Date();
            timeless = true;
          } else if (/Z$/.test(datestr) || /GMT$/.test(datestr)) parsedDate = new Date(date);else if (config && config.parseDate) parsedDate = config.parseDate(date, format);else {
            parsedDate = !config || !config.noCalendar ? new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0) : new Date(new Date().setHours(0, 0, 0, 0));
            var matched,
                ops = [];

            for (var i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
              var token = format[i];
              var isBackSlash = token === "\\";
              var escaped = format[i - 1] === "\\" || isBackSlash;

              if (tokenRegex[token] && !escaped) {
                regexStr += tokenRegex[token];
                var match = new RegExp(regexStr).exec(date);

                if (match && (matched = true)) {
                  ops[token !== "Y" ? "push" : "unshift"]({
                    fn: revFormat[token],
                    val: match[++matchIndex]
                  });
                }
              } else if (!isBackSlash) regexStr += ".";

              ops.forEach(function (_ref3) {
                var fn = _ref3.fn,
                    val = _ref3.val;
                return parsedDate = fn(parsedDate, val, locale) || parsedDate;
              });
            }

            parsedDate = matched ? parsedDate : undefined;
          }
        }

        if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
          config.errorHandler(new Error("Invalid date provided: " + date_orig));
          return undefined;
        }

        if (timeless === true) parsedDate.setHours(0, 0, 0, 0);
        return parsedDate;
      };
    };
    function compareDates(date1, date2, timeless) {
      if (timeless === void 0) {
        timeless = true;
      }

      if (timeless !== false) {
        return new Date(date1.getTime()).setHours(0, 0, 0, 0) - new Date(date2.getTime()).setHours(0, 0, 0, 0);
      }

      return date1.getTime() - date2.getTime();
    }
    var getWeek = function getWeek(givenDate) {
      var date = new Date(givenDate.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      var week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };
    var isBetween = function isBetween(ts, ts1, ts2) {
      return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
    };
    var duration = {
      DAY: 86400000
    };

    var HOOKS = ["onChange", "onClose", "onDayCreate", "onDestroy", "onKeyDown", "onMonthChange", "onOpen", "onParseConfig", "onReady", "onValueUpdate", "onYearChange", "onPreCalendarPosition"];
    var defaults = {
      _disable: [],
      _enable: [],
      allowInput: false,
      altFormat: "F j, Y",
      altInput: false,
      altInputClass: "form-control input",
      animate: typeof window === "object" && window.navigator.userAgent.indexOf("MSIE") === -1,
      ariaDateFormat: "F j, Y",
      clickOpens: true,
      closeOnSelect: true,
      conjunction: ", ",
      dateFormat: "Y-m-d",
      defaultHour: 12,
      defaultMinute: 0,
      defaultSeconds: 0,
      disable: [],
      disableMobile: false,
      enable: [],
      enableSeconds: false,
      enableTime: false,
      errorHandler: function errorHandler(err) {
        return typeof console !== "undefined" && console.warn(err);
      },
      getWeek: getWeek,
      hourIncrement: 1,
      ignoredFocusElements: [],
      inline: false,
      locale: "default",
      minuteIncrement: 5,
      mode: "single",
      nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
      noCalendar: false,
      now: new Date(),
      onChange: [],
      onClose: [],
      onDayCreate: [],
      onDestroy: [],
      onKeyDown: [],
      onMonthChange: [],
      onOpen: [],
      onParseConfig: [],
      onReady: [],
      onValueUpdate: [],
      onYearChange: [],
      onPreCalendarPosition: [],
      plugins: [],
      position: "auto",
      positionElement: undefined,
      prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
      shorthandCurrentMonth: false,
      showMonths: 1,
      static: false,
      time_24hr: false,
      weekNumbers: false,
      wrap: false
    };

    function toggleClass(elem, className, bool) {
      if (bool === true) return elem.classList.add(className);
      elem.classList.remove(className);
    }
    function createElement(tag, className, content) {
      var e = window.document.createElement(tag);
      className = className || "";
      content = content || "";
      e.className = className;
      if (content !== undefined) e.textContent = content;
      return e;
    }
    function clearNode(node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }
    function findParent(node, condition) {
      if (condition(node)) return node;else if (node.parentNode) return findParent(node.parentNode, condition);
      return undefined;
    }
    function createNumberInput(inputClassName, opts) {
      var wrapper = createElement("div", "numInputWrapper"),
          numInput = createElement("input", "numInput " + inputClassName),
          arrowUp = createElement("span", "arrowUp"),
          arrowDown = createElement("span", "arrowDown");
      numInput.type = "text";
      numInput.pattern = "\\d*";
      if (opts !== undefined) for (var key in opts) {
        numInput.setAttribute(key, opts[key]);
      }
      wrapper.appendChild(numInput);
      wrapper.appendChild(arrowUp);
      wrapper.appendChild(arrowDown);
      return wrapper;
    }

    if (typeof Object.assign !== "function") {
      Object.assign = function (target) {
        if (!target) {
          throw TypeError("Cannot convert undefined or null to object");
        }

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var _loop = function _loop() {
          var source = args[_i];

          if (source) {
            Object.keys(source).forEach(function (key) {
              return target[key] = source[key];
            });
          }
        };

        for (var _i = 0; _i < args.length; _i++) {
          _loop();
        }

        return target;
      };
    }

    var DEBOUNCED_CHANGE_MS = 300;

    function FlatpickrInstance(element, instanceConfig) {
      var self = {
        config: Object.assign({}, flatpickr.defaultConfig),
        l10n: english
      };
      self.parseDate = createDateParser({
        config: self.config,
        l10n: self.l10n
      });
      self._handlers = [];
      self._bind = bind;
      self._setHoursFromDate = setHoursFromDate;
      self._positionCalendar = positionCalendar;
      self.changeMonth = changeMonth;
      self.changeYear = changeYear;
      self.clear = clear;
      self.close = close;
      self._createElement = createElement;
      self.destroy = destroy;
      self.isEnabled = isEnabled;
      self.jumpToDate = jumpToDate;
      self.open = open;
      self.redraw = redraw;
      self.set = set;
      self.setDate = setDate;
      self.toggle = toggle;

      function setupHelperFunctions() {
        self.utils = {
          getDaysInMonth: function getDaysInMonth(month, yr) {
            if (month === void 0) {
              month = self.currentMonth;
            }

            if (yr === void 0) {
              yr = self.currentYear;
            }

            if (month === 1 && (yr % 4 === 0 && yr % 100 !== 0 || yr % 400 === 0)) return 29;
            return self.l10n.daysInMonth[month];
          }
        };
      }

      function init() {
        self.element = self.input = element;
        self.isOpen = false;
        parseConfig();
        setupLocale();
        setupInputs();
        setupDates();
        setupHelperFunctions();
        if (!self.isMobile) build();
        bindEvents();

        if (self.selectedDates.length || self.config.noCalendar) {
          if (self.config.enableTime) {
            setHoursFromDate(self.config.noCalendar ? self.latestSelectedDateObj || self.config.minDate : undefined);
          }

          updateValue(false);
        }

        setCalendarWidth();
        self.showTimeInput = self.selectedDates.length > 0 || self.config.noCalendar;
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (!self.isMobile && isSafari) {
          positionCalendar();
        }

        triggerEvent("onReady");
      }

      function bindToInstance(fn) {
        return fn.bind(self);
      }

      function setCalendarWidth() {
        var config = self.config;
        if (config.weekNumbers === false && config.showMonths === 1) return;else if (config.noCalendar !== true) {
          window.requestAnimationFrame(function () {
            self.calendarContainer.style.visibility = "hidden";
            self.calendarContainer.style.display = "block";

            if (self.daysContainer !== undefined) {
              var daysWidth = (self.days.offsetWidth + 1) * config.showMonths;
              self.daysContainer.style.width = daysWidth + "px";
              self.calendarContainer.style.width = daysWidth + (self.weekWrapper !== undefined ? self.weekWrapper.offsetWidth : 0) + "px";
              self.calendarContainer.style.removeProperty("visibility");
              self.calendarContainer.style.removeProperty("display");
            }
          });
        }
      }

      function updateTime(e) {
        if (self.selectedDates.length === 0) return;

        if (e !== undefined && e.type !== "blur") {
          timeWrapper(e);
        }

        var prevValue = self._input.value;
        setHoursFromInputs();
        updateValue();

        if (self._input.value !== prevValue) {
          self._debouncedChange();
        }
      }

      function ampm2military(hour, amPM) {
        return hour % 12 + 12 * int(amPM === self.l10n.amPM[1]);
      }

      function military2ampm(hour) {
        switch (hour % 24) {
          case 0:
          case 12:
            return 12;

          default:
            return hour % 12;
        }
      }

      function setHoursFromInputs() {
        if (self.hourElement === undefined || self.minuteElement === undefined) return;
        var hours = (parseInt(self.hourElement.value.slice(-2), 10) || 0) % 24,
            minutes = (parseInt(self.minuteElement.value, 10) || 0) % 60,
            seconds = self.secondElement !== undefined ? (parseInt(self.secondElement.value, 10) || 0) % 60 : 0;

        if (self.amPM !== undefined) {
          hours = ampm2military(hours, self.amPM.textContent);
        }

        var limitMinHours = self.config.minTime !== undefined || self.config.minDate && self.minDateHasTime && self.latestSelectedDateObj && compareDates(self.latestSelectedDateObj, self.config.minDate, true) === 0;
        var limitMaxHours = self.config.maxTime !== undefined || self.config.maxDate && self.maxDateHasTime && self.latestSelectedDateObj && compareDates(self.latestSelectedDateObj, self.config.maxDate, true) === 0;

        if (limitMaxHours) {
          var maxTime = self.config.maxTime !== undefined ? self.config.maxTime : self.config.maxDate;
          hours = Math.min(hours, maxTime.getHours());
          if (hours === maxTime.getHours()) minutes = Math.min(minutes, maxTime.getMinutes());
          if (minutes === maxTime.getMinutes()) seconds = Math.min(seconds, maxTime.getSeconds());
        }

        if (limitMinHours) {
          var minTime = self.config.minTime !== undefined ? self.config.minTime : self.config.minDate;
          hours = Math.max(hours, minTime.getHours());
          if (hours === minTime.getHours()) minutes = Math.max(minutes, minTime.getMinutes());
          if (minutes === minTime.getMinutes()) seconds = Math.max(seconds, minTime.getSeconds());
        }

        setHours(hours, minutes, seconds);
      }

      function setHoursFromDate(dateObj) {
        var date = dateObj || self.latestSelectedDateObj;
        if (date) setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      }

      function setDefaultHours() {
        var hours = self.config.defaultHour;
        var minutes = self.config.defaultMinute;
        var seconds = self.config.defaultSeconds;

        if (self.config.minDate !== undefined) {
          var min_hr = self.config.minDate.getHours();
          var min_minutes = self.config.minDate.getMinutes();
          hours = Math.max(hours, min_hr);
          if (hours === min_hr) minutes = Math.max(min_minutes, minutes);
          if (hours === min_hr && minutes === min_minutes) seconds = self.config.minDate.getSeconds();
        }

        if (self.config.maxDate !== undefined) {
          var max_hr = self.config.maxDate.getHours();
          var max_minutes = self.config.maxDate.getMinutes();
          hours = Math.min(hours, max_hr);
          if (hours === max_hr) minutes = Math.min(max_minutes, minutes);
          if (hours === max_hr && minutes === max_minutes) seconds = self.config.maxDate.getSeconds();
        }

        setHours(hours, minutes, seconds);
      }

      function setHours(hours, minutes, seconds) {
        if (self.latestSelectedDateObj !== undefined) {
          self.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
        }

        if (!self.hourElement || !self.minuteElement || self.isMobile) return;
        self.hourElement.value = pad(!self.config.time_24hr ? (12 + hours) % 12 + 12 * int(hours % 12 === 0) : hours);
        self.minuteElement.value = pad(minutes);
        if (self.amPM !== undefined) self.amPM.textContent = self.l10n.amPM[int(hours >= 12)];
        if (self.secondElement !== undefined) self.secondElement.value = pad(seconds);
      }

      function onYearInput(event) {
        var year = parseInt(event.target.value) + (event.delta || 0);

        if (year / 1000 > 1 || event.key === "Enter" && !/[^\d]/.test(year.toString())) {
          changeYear(year);
        }
      }

      function bind(element, event, handler, options) {
        if (event instanceof Array) return event.forEach(function (ev) {
          return bind(element, ev, handler, options);
        });
        if (element instanceof Array) return element.forEach(function (el) {
          return bind(el, event, handler, options);
        });
        element.addEventListener(event, handler, options);

        self._handlers.push({
          element: element,
          event: event,
          handler: handler,
          options: options
        });
      }

      function onClick(handler) {
        return function (evt) {
          evt.which === 1 && handler(evt);
        };
      }

      function triggerChange() {
        triggerEvent("onChange");
      }

      function bindEvents() {
        if (self.config.wrap) {
          ["open", "close", "toggle", "clear"].forEach(function (evt) {
            Array.prototype.forEach.call(self.element.querySelectorAll("[data-" + evt + "]"), function (el) {
              return bind(el, "click", self[evt]);
            });
          });
        }

        if (self.isMobile) {
          setupMobile();
          return;
        }

        var debouncedResize = debounce(onResize, 50);
        self._debouncedChange = debounce(triggerChange, DEBOUNCED_CHANGE_MS);
        if (self.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent)) bind(self.daysContainer, "mouseover", function (e) {
          if (self.config.mode === "range") onMouseOver(e.target);
        });
        bind(window.document.body, "keydown", onKeyDown);
        if (!self.config.static) bind(self._input, "keydown", onKeyDown);
        if (!self.config.inline && !self.config.static) bind(window, "resize", debouncedResize);
        if (window.ontouchstart !== undefined) bind(window.document, "click", documentClick);else bind(window.document, "mousedown", onClick(documentClick));
        bind(window.document, "focus", documentClick, {
          capture: true
        });

        if (self.config.clickOpens === true) {
          bind(self._input, "focus", self.open);
          bind(self._input, "mousedown", onClick(self.open));
        }

        if (self.daysContainer !== undefined) {
          bind(self.monthNav, "mousedown", onClick(onMonthNavClick));
          bind(self.monthNav, ["keyup", "increment"], onYearInput);
          bind(self.daysContainer, "mousedown", onClick(selectDate));
        }

        if (self.timeContainer !== undefined && self.minuteElement !== undefined && self.hourElement !== undefined) {
          var selText = function selText(e) {
            return e.target.select();
          };

          bind(self.timeContainer, ["increment"], updateTime);
          bind(self.timeContainer, "blur", updateTime, {
            capture: true
          });
          bind(self.timeContainer, "mousedown", onClick(timeIncrement));
          bind([self.hourElement, self.minuteElement], ["focus", "click"], selText);
          if (self.secondElement !== undefined) bind(self.secondElement, "focus", function () {
            return self.secondElement && self.secondElement.select();
          });

          if (self.amPM !== undefined) {
            bind(self.amPM, "mousedown", onClick(function (e) {
              updateTime(e);
              triggerChange();
            }));
          }
        }
      }

      function jumpToDate(jumpDate) {
        var jumpTo = jumpDate !== undefined ? self.parseDate(jumpDate) : self.latestSelectedDateObj || (self.config.minDate && self.config.minDate > self.now ? self.config.minDate : self.config.maxDate && self.config.maxDate < self.now ? self.config.maxDate : self.now);

        try {
          if (jumpTo !== undefined) {
            self.currentYear = jumpTo.getFullYear();
            self.currentMonth = jumpTo.getMonth();
          }
        } catch (e) {
          e.message = "Invalid date supplied: " + jumpTo;
          self.config.errorHandler(e);
        }

        self.redraw();
      }

      function timeIncrement(e) {
        if (~e.target.className.indexOf("arrow")) incrementNumInput(e, e.target.classList.contains("arrowUp") ? 1 : -1);
      }

      function incrementNumInput(e, delta, inputElem) {
        var target = e && e.target;
        var input = inputElem || target && target.parentNode && target.parentNode.firstChild;
        var event = createEvent("increment");
        event.delta = delta;
        input && input.dispatchEvent(event);
      }

      function build() {
        var fragment = window.document.createDocumentFragment();
        self.calendarContainer = createElement("div", "flatpickr-calendar");
        self.calendarContainer.tabIndex = -1;

        if (!self.config.noCalendar) {
          fragment.appendChild(buildMonthNav());
          self.innerContainer = createElement("div", "flatpickr-innerContainer");

          if (self.config.weekNumbers) {
            var _buildWeeks = buildWeeks(),
                weekWrapper = _buildWeeks.weekWrapper,
                weekNumbers = _buildWeeks.weekNumbers;

            self.innerContainer.appendChild(weekWrapper);
            self.weekNumbers = weekNumbers;
            self.weekWrapper = weekWrapper;
          }

          self.rContainer = createElement("div", "flatpickr-rContainer");
          self.rContainer.appendChild(buildWeekdays());

          if (!self.daysContainer) {
            self.daysContainer = createElement("div", "flatpickr-days");
            self.daysContainer.tabIndex = -1;
          }

          buildDays();
          self.rContainer.appendChild(self.daysContainer);
          self.innerContainer.appendChild(self.rContainer);
          fragment.appendChild(self.innerContainer);
        }

        if (self.config.enableTime) {
          fragment.appendChild(buildTime());
        }

        toggleClass(self.calendarContainer, "rangeMode", self.config.mode === "range");
        toggleClass(self.calendarContainer, "animate", self.config.animate === true);
        toggleClass(self.calendarContainer, "multiMonth", self.config.showMonths > 1);
        self.calendarContainer.appendChild(fragment);
        var customAppend = self.config.appendTo !== undefined && self.config.appendTo.nodeType !== undefined;

        if (self.config.inline || self.config.static) {
          self.calendarContainer.classList.add(self.config.inline ? "inline" : "static");

          if (self.config.inline) {
            if (!customAppend && self.element.parentNode) self.element.parentNode.insertBefore(self.calendarContainer, self._input.nextSibling);else if (self.config.appendTo !== undefined) self.config.appendTo.appendChild(self.calendarContainer);
          }

          if (self.config.static) {
            var wrapper = createElement("div", "flatpickr-wrapper");
            if (self.element.parentNode) self.element.parentNode.insertBefore(wrapper, self.element);
            wrapper.appendChild(self.element);
            if (self.altInput) wrapper.appendChild(self.altInput);
            wrapper.appendChild(self.calendarContainer);
          }
        }

        if (!self.config.static && !self.config.inline) (self.config.appendTo !== undefined ? self.config.appendTo : window.document.body).appendChild(self.calendarContainer);
      }

      function createDay(className, date, dayNumber, i) {
        var dateIsEnabled = isEnabled(date, true),
            dayElement = createElement("span", "flatpickr-day " + className, date.getDate().toString());
        dayElement.dateObj = date;
        dayElement.$i = i;
        dayElement.setAttribute("aria-label", self.formatDate(date, self.config.ariaDateFormat));

        if (className.indexOf("hidden") === -1 && compareDates(date, self.now) === 0) {
          self.todayDateElem = dayElement;
          dayElement.classList.add("today");
          dayElement.setAttribute("aria-current", "date");
        }

        if (dateIsEnabled) {
          dayElement.tabIndex = -1;

          if (isDateSelected(date)) {
            dayElement.classList.add("selected");
            self.selectedDateElem = dayElement;

            if (self.config.mode === "range") {
              toggleClass(dayElement, "startRange", self.selectedDates[0] && compareDates(date, self.selectedDates[0], true) === 0);
              toggleClass(dayElement, "endRange", self.selectedDates[1] && compareDates(date, self.selectedDates[1], true) === 0);
              if (className === "nextMonthDay") dayElement.classList.add("inRange");
            }
          }
        } else {
          dayElement.classList.add("disabled");
        }

        if (self.config.mode === "range") {
          if (isDateInRange(date) && !isDateSelected(date)) dayElement.classList.add("inRange");
        }

        if (self.weekNumbers && self.config.showMonths === 1 && className !== "prevMonthDay" && dayNumber % 7 === 1) {
          self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self.config.getWeek(date) + "</span>");
        }

        triggerEvent("onDayCreate", dayElement);
        return dayElement;
      }

      function focusOnDayElem(targetNode) {
        targetNode.focus();
        if (self.config.mode === "range") onMouseOver(targetNode);
      }

      function getFirstAvailableDay(delta) {
        var startMonth = delta > 0 ? 0 : self.config.showMonths - 1;
        var endMonth = delta > 0 ? self.config.showMonths : -1;

        for (var m = startMonth; m != endMonth; m += delta) {
          var month = self.daysContainer.children[m];
          var startIndex = delta > 0 ? 0 : month.children.length - 1;
          var endIndex = delta > 0 ? month.children.length : -1;

          for (var i = startIndex; i != endIndex; i += delta) {
            var c = month.children[i];
            if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj)) return c;
          }
        }

        return undefined;
      }

      function getNextAvailableDay(current, delta) {
        var givenMonth = current.className.indexOf("Month") === -1 ? current.dateObj.getMonth() : self.currentMonth;
        var endMonth = delta > 0 ? self.config.showMonths : -1;
        var loopDelta = delta > 0 ? 1 : -1;

        for (var m = givenMonth - self.currentMonth; m != endMonth; m += loopDelta) {
          var month = self.daysContainer.children[m];
          var startIndex = givenMonth - self.currentMonth === m ? current.$i + delta : delta < 0 ? month.children.length - 1 : 0;
          var numMonthDays = month.children.length;

          for (var i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
            var c = month.children[i];
            if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj) && Math.abs(current.$i - i) >= Math.abs(delta)) return focusOnDayElem(c);
          }
        }

        self.changeMonth(loopDelta);
        focusOnDay(getFirstAvailableDay(loopDelta), 0);
        return undefined;
      }

      function focusOnDay(current, offset) {
        var dayFocused = isInView(document.activeElement || document.body);
        var startElem = current !== undefined ? current : dayFocused ? document.activeElement : self.selectedDateElem !== undefined && isInView(self.selectedDateElem) ? self.selectedDateElem : self.todayDateElem !== undefined && isInView(self.todayDateElem) ? self.todayDateElem : getFirstAvailableDay(offset > 0 ? 1 : -1);
        if (startElem === undefined) return self._input.focus();
        if (!dayFocused) return focusOnDayElem(startElem);
        getNextAvailableDay(startElem, offset);
      }

      function buildMonthDays(year, month) {
        var firstOfMonth = (new Date(year, month, 1).getDay() - self.l10n.firstDayOfWeek + 7) % 7;
        var prevMonthDays = self.utils.getDaysInMonth((month - 1 + 12) % 12);
        var daysInMonth = self.utils.getDaysInMonth(month),
            days = window.document.createDocumentFragment(),
            isMultiMonth = self.config.showMonths > 1,
            prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay",
            nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
        var dayNumber = prevMonthDays + 1 - firstOfMonth,
            dayIndex = 0;

        for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
          days.appendChild(createDay(prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
        }

        for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
          days.appendChild(createDay("", new Date(year, month, dayNumber), dayNumber, dayIndex));
        }

        for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth && (self.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
          days.appendChild(createDay(nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
        }

        var dayContainer = createElement("div", "dayContainer");
        dayContainer.appendChild(days);
        return dayContainer;
      }

      function buildDays() {
        if (self.daysContainer === undefined) {
          return;
        }

        clearNode(self.daysContainer);
        if (self.weekNumbers) clearNode(self.weekNumbers);
        var frag = document.createDocumentFragment();

        for (var i = 0; i < self.config.showMonths; i++) {
          var d = new Date(self.currentYear, self.currentMonth, 1);
          d.setMonth(self.currentMonth + i);
          frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
        }

        self.daysContainer.appendChild(frag);
        self.days = self.daysContainer.firstChild;

        if (self.config.mode === "range" && self.selectedDates.length === 1) {
          onMouseOver();
        }
      }

      function buildMonth() {
        var container = createElement("div", "flatpickr-month");
        var monthNavFragment = window.document.createDocumentFragment();
        var monthElement = createElement("span", "cur-month");
        var yearInput = createNumberInput("cur-year", {
          tabindex: "-1"
        });
        var yearElement = yearInput.getElementsByTagName("input")[0];
        yearElement.setAttribute("aria-label", self.l10n.yearAriaLabel);
        if (self.config.minDate) yearElement.setAttribute("data-min", self.config.minDate.getFullYear().toString());

        if (self.config.maxDate) {
          yearElement.setAttribute("data-max", self.config.maxDate.getFullYear().toString());
          yearElement.disabled = !!self.config.minDate && self.config.minDate.getFullYear() === self.config.maxDate.getFullYear();
        }

        var currentMonth = createElement("div", "flatpickr-current-month");
        currentMonth.appendChild(monthElement);
        currentMonth.appendChild(yearInput);
        monthNavFragment.appendChild(currentMonth);
        container.appendChild(monthNavFragment);
        return {
          container: container,
          yearElement: yearElement,
          monthElement: monthElement
        };
      }

      function buildMonths() {
        clearNode(self.monthNav);
        self.monthNav.appendChild(self.prevMonthNav);

        for (var m = self.config.showMonths; m--;) {
          var month = buildMonth();
          self.yearElements.push(month.yearElement);
          self.monthElements.push(month.monthElement);
          self.monthNav.appendChild(month.container);
        }

        self.monthNav.appendChild(self.nextMonthNav);
      }

      function buildMonthNav() {
        self.monthNav = createElement("div", "flatpickr-months");
        self.yearElements = [];
        self.monthElements = [];
        self.prevMonthNav = createElement("span", "flatpickr-prev-month");
        self.prevMonthNav.innerHTML = self.config.prevArrow;
        self.nextMonthNav = createElement("span", "flatpickr-next-month");
        self.nextMonthNav.innerHTML = self.config.nextArrow;
        buildMonths();
        Object.defineProperty(self, "_hidePrevMonthArrow", {
          get: function get() {
            return self.__hidePrevMonthArrow;
          },
          set: function set(bool) {
            if (self.__hidePrevMonthArrow !== bool) {
              toggleClass(self.prevMonthNav, "disabled", bool);
              self.__hidePrevMonthArrow = bool;
            }
          }
        });
        Object.defineProperty(self, "_hideNextMonthArrow", {
          get: function get() {
            return self.__hideNextMonthArrow;
          },
          set: function set(bool) {
            if (self.__hideNextMonthArrow !== bool) {
              toggleClass(self.nextMonthNav, "disabled", bool);
              self.__hideNextMonthArrow = bool;
            }
          }
        });
        self.currentYearElement = self.yearElements[0];
        updateNavigationCurrentMonth();
        return self.monthNav;
      }

      function buildTime() {
        self.calendarContainer.classList.add("hasTime");
        if (self.config.noCalendar) self.calendarContainer.classList.add("noCalendar");
        self.timeContainer = createElement("div", "flatpickr-time");
        self.timeContainer.tabIndex = -1;
        var separator = createElement("span", "flatpickr-time-separator", ":");
        var hourInput = createNumberInput("flatpickr-hour");
        self.hourElement = hourInput.getElementsByTagName("input")[0];
        var minuteInput = createNumberInput("flatpickr-minute");
        self.minuteElement = minuteInput.getElementsByTagName("input")[0];
        self.hourElement.tabIndex = self.minuteElement.tabIndex = -1;
        self.hourElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getHours() : self.config.time_24hr ? self.config.defaultHour : military2ampm(self.config.defaultHour));
        self.minuteElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getMinutes() : self.config.defaultMinute);
        self.hourElement.setAttribute("data-step", self.config.hourIncrement.toString());
        self.minuteElement.setAttribute("data-step", self.config.minuteIncrement.toString());
        self.hourElement.setAttribute("data-min", self.config.time_24hr ? "0" : "1");
        self.hourElement.setAttribute("data-max", self.config.time_24hr ? "23" : "12");
        self.minuteElement.setAttribute("data-min", "0");
        self.minuteElement.setAttribute("data-max", "59");
        self.timeContainer.appendChild(hourInput);
        self.timeContainer.appendChild(separator);
        self.timeContainer.appendChild(minuteInput);
        if (self.config.time_24hr) self.timeContainer.classList.add("time24hr");

        if (self.config.enableSeconds) {
          self.timeContainer.classList.add("hasSeconds");
          var secondInput = createNumberInput("flatpickr-second");
          self.secondElement = secondInput.getElementsByTagName("input")[0];
          self.secondElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getSeconds() : self.config.defaultSeconds);
          self.secondElement.setAttribute("data-step", self.minuteElement.getAttribute("data-step"));
          self.secondElement.setAttribute("data-min", self.minuteElement.getAttribute("data-min"));
          self.secondElement.setAttribute("data-max", self.minuteElement.getAttribute("data-max"));
          self.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
          self.timeContainer.appendChild(secondInput);
        }

        if (!self.config.time_24hr) {
          self.amPM = createElement("span", "flatpickr-am-pm", self.l10n.amPM[int((self.latestSelectedDateObj ? self.hourElement.value : self.config.defaultHour) > 11)]);
          self.amPM.title = self.l10n.toggleTitle;
          self.amPM.tabIndex = -1;
          self.timeContainer.appendChild(self.amPM);
        }

        return self.timeContainer;
      }

      function buildWeekdays() {
        if (!self.weekdayContainer) self.weekdayContainer = createElement("div", "flatpickr-weekdays");else clearNode(self.weekdayContainer);

        for (var i = self.config.showMonths; i--;) {
          var container = createElement("div", "flatpickr-weekdaycontainer");
          self.weekdayContainer.appendChild(container);
        }

        updateWeekdays();
        return self.weekdayContainer;
      }

      function updateWeekdays() {
        var firstDayOfWeek = self.l10n.firstDayOfWeek;
        var weekdays = self.l10n.weekdays.shorthand.concat();

        if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
          weekdays = weekdays.splice(firstDayOfWeek, weekdays.length).concat(weekdays.splice(0, firstDayOfWeek));
        }

        for (var i = self.config.showMonths; i--;) {
          self.weekdayContainer.children[i].innerHTML = "\n      <span class=flatpickr-weekday>\n        " + weekdays.join("</span><span class=flatpickr-weekday>") + "\n      </span>\n      ";
        }
      }

      function buildWeeks() {
        self.calendarContainer.classList.add("hasWeeks");
        var weekWrapper = createElement("div", "flatpickr-weekwrapper");
        weekWrapper.appendChild(createElement("span", "flatpickr-weekday", self.l10n.weekAbbreviation));
        var weekNumbers = createElement("div", "flatpickr-weeks");
        weekWrapper.appendChild(weekNumbers);
        return {
          weekWrapper: weekWrapper,
          weekNumbers: weekNumbers
        };
      }

      function changeMonth(value, is_offset) {
        if (is_offset === void 0) {
          is_offset = true;
        }

        var delta = is_offset ? value : value - self.currentMonth;
        if (delta < 0 && self._hidePrevMonthArrow === true || delta > 0 && self._hideNextMonthArrow === true) return;
        self.currentMonth += delta;

        if (self.currentMonth < 0 || self.currentMonth > 11) {
          self.currentYear += self.currentMonth > 11 ? 1 : -1;
          self.currentMonth = (self.currentMonth + 12) % 12;
          triggerEvent("onYearChange");
        }

        buildDays();
        triggerEvent("onMonthChange");
        updateNavigationCurrentMonth();
      }

      function clear(triggerChangeEvent) {
        if (triggerChangeEvent === void 0) {
          triggerChangeEvent = true;
        }

        self.input.value = "";
        if (self.altInput !== undefined) self.altInput.value = "";
        if (self.mobileInput !== undefined) self.mobileInput.value = "";
        self.selectedDates = [];
        self.latestSelectedDateObj = undefined;
        self.showTimeInput = false;

        if (self.config.enableTime === true) {
          setDefaultHours();
        }

        self.redraw();
        if (triggerChangeEvent) triggerEvent("onChange");
      }

      function close() {
        self.isOpen = false;

        if (!self.isMobile) {
          self.calendarContainer.classList.remove("open");

          self._input.classList.remove("active");
        }

        triggerEvent("onClose");
      }

      function destroy() {
        if (self.config !== undefined) triggerEvent("onDestroy");

        for (var i = self._handlers.length; i--;) {
          var h = self._handlers[i];
          h.element.removeEventListener(h.event, h.handler, h.options);
        }

        self._handlers = [];

        if (self.mobileInput) {
          if (self.mobileInput.parentNode) self.mobileInput.parentNode.removeChild(self.mobileInput);
          self.mobileInput = undefined;
        } else if (self.calendarContainer && self.calendarContainer.parentNode) {
          if (self.config.static && self.calendarContainer.parentNode) {
            var wrapper = self.calendarContainer.parentNode;
            wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);

            if (wrapper.parentNode) {
              while (wrapper.firstChild) {
                wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
              }

              wrapper.parentNode.removeChild(wrapper);
            }
          } else self.calendarContainer.parentNode.removeChild(self.calendarContainer);
        }

        if (self.altInput) {
          self.input.type = "text";
          if (self.altInput.parentNode) self.altInput.parentNode.removeChild(self.altInput);
          delete self.altInput;
        }

        if (self.input) {
          self.input.type = self.input._type;
          self.input.classList.remove("flatpickr-input");
          self.input.removeAttribute("readonly");
          self.input.value = "";
        }

        ["_showTimeInput", "latestSelectedDateObj", "_hideNextMonthArrow", "_hidePrevMonthArrow", "__hideNextMonthArrow", "__hidePrevMonthArrow", "isMobile", "isOpen", "selectedDateElem", "minDateHasTime", "maxDateHasTime", "days", "daysContainer", "_input", "_positionElement", "innerContainer", "rContainer", "monthNav", "todayDateElem", "calendarContainer", "weekdayContainer", "prevMonthNav", "nextMonthNav", "currentMonthElement", "currentYearElement", "navigationCurrentMonth", "selectedDateElem", "config"].forEach(function (k) {
          try {
            delete self[k];
          } catch (_) {}
        });
      }

      function isCalendarElem(elem) {
        if (self.config.appendTo && self.config.appendTo.contains(elem)) return true;
        return self.calendarContainer.contains(elem);
      }

      function documentClick(e) {
        if (self.isOpen && !self.config.inline) {
          var isCalendarElement = isCalendarElem(e.target);
          var isInput = e.target === self.input || e.target === self.altInput || self.element.contains(e.target) || e.path && e.path.indexOf && (~e.path.indexOf(self.input) || ~e.path.indexOf(self.altInput));
          var lostFocus = e.type === "blur" ? isInput && e.relatedTarget && !isCalendarElem(e.relatedTarget) : !isInput && !isCalendarElement;
          var isIgnored = !self.config.ignoredFocusElements.some(function (elem) {
            return elem.contains(e.target);
          });

          if (lostFocus && isIgnored) {
            self.close();

            if (self.config.mode === "range" && self.selectedDates.length === 1) {
              self.clear(false);
              self.redraw();
            }
          }
        }
      }

      function changeYear(newYear) {
        if (!newYear || self.config.minDate && newYear < self.config.minDate.getFullYear() || self.config.maxDate && newYear > self.config.maxDate.getFullYear()) return;
        var newYearNum = newYear,
            isNewYear = self.currentYear !== newYearNum;
        self.currentYear = newYearNum || self.currentYear;

        if (self.config.maxDate && self.currentYear === self.config.maxDate.getFullYear()) {
          self.currentMonth = Math.min(self.config.maxDate.getMonth(), self.currentMonth);
        } else if (self.config.minDate && self.currentYear === self.config.minDate.getFullYear()) {
          self.currentMonth = Math.max(self.config.minDate.getMonth(), self.currentMonth);
        }

        if (isNewYear) {
          self.redraw();
          triggerEvent("onYearChange");
        }
      }

      function isEnabled(date, timeless) {
        if (timeless === void 0) {
          timeless = true;
        }

        var dateToCheck = self.parseDate(date, undefined, timeless);
        if (self.config.minDate && dateToCheck && compareDates(dateToCheck, self.config.minDate, timeless !== undefined ? timeless : !self.minDateHasTime) < 0 || self.config.maxDate && dateToCheck && compareDates(dateToCheck, self.config.maxDate, timeless !== undefined ? timeless : !self.maxDateHasTime) > 0) return false;
        if (self.config.enable.length === 0 && self.config.disable.length === 0) return true;
        if (dateToCheck === undefined) return false;
        var bool = self.config.enable.length > 0,
            array = bool ? self.config.enable : self.config.disable;

        for (var i = 0, d; i < array.length; i++) {
          d = array[i];
          if (typeof d === "function" && d(dateToCheck)) return bool;else if (d instanceof Date && dateToCheck !== undefined && d.getTime() === dateToCheck.getTime()) return bool;else if (typeof d === "string" && dateToCheck !== undefined) {
            var parsed = self.parseDate(d, undefined, true);
            return parsed && parsed.getTime() === dateToCheck.getTime() ? bool : !bool;
          } else if (typeof d === "object" && dateToCheck !== undefined && d.from && d.to && dateToCheck.getTime() >= d.from.getTime() && dateToCheck.getTime() <= d.to.getTime()) return bool;
        }

        return !bool;
      }

      function isInView(elem) {
        if (self.daysContainer !== undefined) return elem.className.indexOf("hidden") === -1 && self.daysContainer.contains(elem);
        return false;
      }

      function onKeyDown(e) {
        var isInput = e.target === self._input;
        var allowInput = self.config.allowInput;
        var allowKeydown = self.isOpen && (!allowInput || !isInput);
        var allowInlineKeydown = self.config.inline && isInput && !allowInput;

        if (e.keyCode === 13 && isInput) {
          if (allowInput) {
            self.setDate(self._input.value, true, e.target === self.altInput ? self.config.altFormat : self.config.dateFormat);
            return e.target.blur();
          } else self.open();
        } else if (isCalendarElem(e.target) || allowKeydown || allowInlineKeydown) {
          var isTimeObj = !!self.timeContainer && self.timeContainer.contains(e.target);

          switch (e.keyCode) {
            case 13:
              if (isTimeObj) updateTime();else selectDate(e);
              break;

            case 27:
              e.preventDefault();
              focusAndClose();
              break;

            case 8:
            case 46:
              if (isInput && !self.config.allowInput) {
                e.preventDefault();
                self.clear();
              }

              break;

            case 37:
            case 39:
              if (!isTimeObj) {
                e.preventDefault();

                if (self.daysContainer !== undefined && (allowInput === false || isInView(document.activeElement))) {
                  var _delta = e.keyCode === 39 ? 1 : -1;

                  if (!e.ctrlKey) focusOnDay(undefined, _delta);else {
                    changeMonth(_delta);
                    focusOnDay(getFirstAvailableDay(1), 0);
                  }
                }
              } else if (self.hourElement) self.hourElement.focus();

              break;

            case 38:
            case 40:
              e.preventDefault();
              var delta = e.keyCode === 40 ? 1 : -1;

              if (self.daysContainer && e.target.$i !== undefined) {
                if (e.ctrlKey) {
                  changeYear(self.currentYear - delta);
                  focusOnDay(getFirstAvailableDay(1), 0);
                } else if (!isTimeObj) focusOnDay(undefined, delta * 7);
              } else if (self.config.enableTime) {
                if (!isTimeObj && self.hourElement) self.hourElement.focus();
                updateTime(e);

                self._debouncedChange();
              }

              break;

            case 9:
              if (!isTimeObj) {
                self.element.focus();
                break;
              }

              var elems = [self.hourElement, self.minuteElement, self.secondElement, self.amPM].filter(function (x) {
                return x;
              });
              var i = elems.indexOf(e.target);

              if (i !== -1) {
                var target = elems[i + (e.shiftKey ? -1 : 1)];

                if (target !== undefined) {
                  e.preventDefault();
                  target.focus();
                } else {
                  self.element.focus();
                }
              }

              break;

            default:
              break;
          }
        }

        if (self.amPM !== undefined && e.target === self.amPM) {
          switch (e.key) {
            case self.l10n.amPM[0].charAt(0):
            case self.l10n.amPM[0].charAt(0).toLowerCase():
              self.amPM.textContent = self.l10n.amPM[0];
              setHoursFromInputs();
              updateValue();
              break;

            case self.l10n.amPM[1].charAt(0):
            case self.l10n.amPM[1].charAt(0).toLowerCase():
              self.amPM.textContent = self.l10n.amPM[1];
              setHoursFromInputs();
              updateValue();
              break;
          }
        }

        triggerEvent("onKeyDown", e);
      }

      function onMouseOver(elem) {
        if (self.selectedDates.length !== 1 || elem && (!elem.classList.contains("flatpickr-day") || elem.classList.contains("disabled"))) return;
        var hoverDate = elem ? elem.dateObj.getTime() : self.days.firstElementChild.dateObj.getTime(),
            initialDate = self.parseDate(self.selectedDates[0], undefined, true).getTime(),
            rangeStartDate = Math.min(hoverDate, self.selectedDates[0].getTime()),
            rangeEndDate = Math.max(hoverDate, self.selectedDates[0].getTime()),
            lastDate = self.daysContainer.lastChild.lastChild.dateObj.getTime();
        var containsDisabled = false;
        var minRange = 0,
            maxRange = 0;

        for (var t = rangeStartDate; t < lastDate; t += duration.DAY) {
          if (!isEnabled(new Date(t), true)) {
            containsDisabled = containsDisabled || t > rangeStartDate && t < rangeEndDate;
            if (t < initialDate && (!minRange || t > minRange)) minRange = t;else if (t > initialDate && (!maxRange || t < maxRange)) maxRange = t;
          }
        }

        for (var m = 0; m < self.config.showMonths; m++) {
          var month = self.daysContainer.children[m];
          var prevMonth = self.daysContainer.children[m - 1];

          var _loop = function _loop(i, l) {
            var dayElem = month.children[i],
                date = dayElem.dateObj;
            var timestamp = date.getTime();
            var outOfRange = minRange > 0 && timestamp < minRange || maxRange > 0 && timestamp > maxRange;

            if (outOfRange) {
              dayElem.classList.add("notAllowed");
              ["inRange", "startRange", "endRange"].forEach(function (c) {
                dayElem.classList.remove(c);
              });
              return "continue";
            } else if (containsDisabled && !outOfRange) return "continue";

            ["startRange", "inRange", "endRange", "notAllowed"].forEach(function (c) {
              dayElem.classList.remove(c);
            });

            if (elem !== undefined) {
              elem.classList.add(hoverDate < self.selectedDates[0].getTime() ? "startRange" : "endRange");

              if (month.contains(elem) || !(m > 0 && prevMonth && prevMonth.lastChild.dateObj.getTime() >= timestamp)) {
                if (initialDate < hoverDate && timestamp === initialDate) dayElem.classList.add("startRange");else if (initialDate > hoverDate && timestamp === initialDate) dayElem.classList.add("endRange");
                if (timestamp >= minRange && (maxRange === 0 || timestamp <= maxRange) && isBetween(timestamp, initialDate, hoverDate)) dayElem.classList.add("inRange");
              }
            }
          };

          for (var i = 0, l = month.children.length; i < l; i++) {
            var _ret = _loop(i, l);

            if (_ret === "continue") continue;
          }
        }
      }

      function onResize() {
        if (self.isOpen && !self.config.static && !self.config.inline) positionCalendar();
      }

      function open(e, positionElement) {
        if (positionElement === void 0) {
          positionElement = self._positionElement;
        }

        if (self.isMobile === true) {
          if (e) {
            e.preventDefault();
            e.target && e.target.blur();
          }

          if (self.mobileInput !== undefined) {
            self.mobileInput.focus();
            self.mobileInput.click();
          }

          triggerEvent("onOpen");
          return;
        }

        if (self._input.disabled || self.config.inline) return;
        var wasOpen = self.isOpen;
        self.isOpen = true;

        if (!wasOpen) {
          self.calendarContainer.classList.add("open");

          self._input.classList.add("active");

          triggerEvent("onOpen");
          positionCalendar(positionElement);
        }

        if (self.config.enableTime === true && self.config.noCalendar === true) {
          if (self.selectedDates.length === 0) {
            self.setDate(self.config.minDate !== undefined ? new Date(self.config.minDate.getTime()) : new Date(), false);
            setDefaultHours();
            updateValue();
          }

          if (self.config.allowInput === false && (e === undefined || !self.timeContainer.contains(e.relatedTarget))) {
            setTimeout(function () {
              return self.hourElement.select();
            }, 50);
          }
        }
      }

      function minMaxDateSetter(type) {
        return function (date) {
          var dateObj = self.config["_" + type + "Date"] = self.parseDate(date, self.config.dateFormat);
          var inverseDateObj = self.config["_" + (type === "min" ? "max" : "min") + "Date"];

          if (dateObj !== undefined) {
            self[type === "min" ? "minDateHasTime" : "maxDateHasTime"] = dateObj.getHours() > 0 || dateObj.getMinutes() > 0 || dateObj.getSeconds() > 0;
          }

          if (self.selectedDates) {
            self.selectedDates = self.selectedDates.filter(function (d) {
              return isEnabled(d);
            });
            if (!self.selectedDates.length && type === "min") setHoursFromDate(dateObj);
            updateValue();
          }

          if (self.daysContainer) {
            redraw();
            if (dateObj !== undefined) self.currentYearElement[type] = dateObj.getFullYear().toString();else self.currentYearElement.removeAttribute(type);
            self.currentYearElement.disabled = !!inverseDateObj && dateObj !== undefined && inverseDateObj.getFullYear() === dateObj.getFullYear();
          }
        };
      }

      function parseConfig() {
        var boolOpts = ["wrap", "weekNumbers", "allowInput", "clickOpens", "time_24hr", "enableTime", "noCalendar", "altInput", "shorthandCurrentMonth", "inline", "static", "enableSeconds", "disableMobile"];
        var userConfig = Object.assign({}, instanceConfig, JSON.parse(JSON.stringify(element.dataset || {})));
        var formats$$1 = {};
        self.config.parseDate = userConfig.parseDate;
        self.config.formatDate = userConfig.formatDate;
        Object.defineProperty(self.config, "enable", {
          get: function get() {
            return self.config._enable;
          },
          set: function set(dates) {
            self.config._enable = parseDateRules(dates);
          }
        });
        Object.defineProperty(self.config, "disable", {
          get: function get() {
            return self.config._disable;
          },
          set: function set(dates) {
            self.config._disable = parseDateRules(dates);
          }
        });
        var timeMode = userConfig.mode === "time";

        if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
          formats$$1.dateFormat = userConfig.noCalendar || timeMode ? "H:i" + (userConfig.enableSeconds ? ":S" : "") : flatpickr.defaultConfig.dateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
        }

        if (userConfig.altInput && (userConfig.enableTime || timeMode) && !userConfig.altFormat) {
          formats$$1.altFormat = userConfig.noCalendar || timeMode ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K") : flatpickr.defaultConfig.altFormat + (" h:i" + (userConfig.enableSeconds ? ":S" : "") + " K");
        }

        Object.defineProperty(self.config, "minDate", {
          get: function get() {
            return self.config._minDate;
          },
          set: minMaxDateSetter("min")
        });
        Object.defineProperty(self.config, "maxDate", {
          get: function get() {
            return self.config._maxDate;
          },
          set: minMaxDateSetter("max")
        });

        var minMaxTimeSetter = function minMaxTimeSetter(type) {
          return function (val) {
            self.config[type === "min" ? "_minTime" : "_maxTime"] = self.parseDate(val, "H:i");
          };
        };

        Object.defineProperty(self.config, "minTime", {
          get: function get() {
            return self.config._minTime;
          },
          set: minMaxTimeSetter("min")
        });
        Object.defineProperty(self.config, "maxTime", {
          get: function get() {
            return self.config._maxTime;
          },
          set: minMaxTimeSetter("max")
        });

        if (userConfig.mode === "time") {
          self.config.noCalendar = true;
          self.config.enableTime = true;
        }

        Object.assign(self.config, formats$$1, userConfig);

        for (var i = 0; i < boolOpts.length; i++) {
          self.config[boolOpts[i]] = self.config[boolOpts[i]] === true || self.config[boolOpts[i]] === "true";
        }

        HOOKS.filter(function (hook) {
          return self.config[hook] !== undefined;
        }).forEach(function (hook) {
          self.config[hook] = arrayify(self.config[hook] || []).map(bindToInstance);
        });
        self.isMobile = !self.config.disableMobile && !self.config.inline && self.config.mode === "single" && !self.config.disable.length && !self.config.enable.length && !self.config.weekNumbers && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        for (var _i = 0; _i < self.config.plugins.length; _i++) {
          var pluginConf = self.config.plugins[_i](self) || {};

          for (var key in pluginConf) {
            if (HOOKS.indexOf(key) > -1) {
              self.config[key] = arrayify(pluginConf[key]).map(bindToInstance).concat(self.config[key]);
            } else if (typeof userConfig[key] === "undefined") self.config[key] = pluginConf[key];
          }
        }

        triggerEvent("onParseConfig");
      }

      function setupLocale() {
        if (typeof self.config.locale !== "object" && typeof flatpickr.l10ns[self.config.locale] === "undefined") self.config.errorHandler(new Error("flatpickr: invalid locale " + self.config.locale));
        self.l10n = Object.assign({}, flatpickr.l10ns.default, typeof self.config.locale === "object" ? self.config.locale : self.config.locale !== "default" ? flatpickr.l10ns[self.config.locale] : undefined);
        tokenRegex.K = "(" + self.l10n.amPM[0] + "|" + self.l10n.amPM[1] + "|" + self.l10n.amPM[0].toLowerCase() + "|" + self.l10n.amPM[1].toLowerCase() + ")";
        self.formatDate = createDateFormatter(self);
        self.parseDate = createDateParser({
          config: self.config,
          l10n: self.l10n
        });
      }

      function positionCalendar(customPositionElement) {
        if (self.calendarContainer === undefined) return;
        triggerEvent("onPreCalendarPosition");
        var positionElement = customPositionElement || self._positionElement;
        var calendarHeight = Array.prototype.reduce.call(self.calendarContainer.children, function (acc, child) {
          return acc + child.offsetHeight;
        }, 0),
            calendarWidth = self.calendarContainer.offsetWidth,
            configPos = self.config.position.split(" "),
            configPosVertical = configPos[0],
            configPosHorizontal = configPos.length > 1 ? configPos[1] : null,
            inputBounds = positionElement.getBoundingClientRect(),
            distanceFromBottom = window.innerHeight - inputBounds.bottom,
            showOnTop = configPosVertical === "above" || configPosVertical !== "below" && distanceFromBottom < calendarHeight && inputBounds.top > calendarHeight;
        var top = window.pageYOffset + inputBounds.top + (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
        toggleClass(self.calendarContainer, "arrowTop", !showOnTop);
        toggleClass(self.calendarContainer, "arrowBottom", showOnTop);
        if (self.config.inline) return;
        var left = window.pageXOffset + inputBounds.left - (configPosHorizontal != null && configPosHorizontal === "center" ? (calendarWidth - inputBounds.width) / 2 : 0);
        var right = window.document.body.offsetWidth - inputBounds.right;
        var rightMost = left + calendarWidth > window.document.body.offsetWidth;
        toggleClass(self.calendarContainer, "rightMost", rightMost);
        if (self.config.static) return;
        self.calendarContainer.style.top = top + "px";

        if (!rightMost) {
          self.calendarContainer.style.left = left + "px";
          self.calendarContainer.style.right = "auto";
        } else {
          self.calendarContainer.style.left = "auto";
          self.calendarContainer.style.right = right + "px";
        }
      }

      function redraw() {
        if (self.config.noCalendar || self.isMobile) return;
        updateNavigationCurrentMonth();
        buildDays();
      }

      function focusAndClose() {
        self._input.focus();

        if (window.navigator.userAgent.indexOf("MSIE") !== -1 || navigator.msMaxTouchPoints !== undefined) {
          setTimeout(self.close, 0);
        } else {
          self.close();
        }
      }

      function selectDate(e) {
        e.preventDefault();
        e.stopPropagation();

        var isSelectable = function isSelectable(day) {
          return day.classList && day.classList.contains("flatpickr-day") && !day.classList.contains("disabled") && !day.classList.contains("notAllowed");
        };

        var t = findParent(e.target, isSelectable);
        if (t === undefined) return;
        var target = t;
        var selectedDate = self.latestSelectedDateObj = new Date(target.dateObj.getTime());
        var shouldChangeMonth = (selectedDate.getMonth() < self.currentMonth || selectedDate.getMonth() > self.currentMonth + self.config.showMonths - 1) && self.config.mode !== "range";
        self.selectedDateElem = target;
        if (self.config.mode === "single") self.selectedDates = [selectedDate];else if (self.config.mode === "multiple") {
          var selectedIndex = isDateSelected(selectedDate);
          if (selectedIndex) self.selectedDates.splice(parseInt(selectedIndex), 1);else self.selectedDates.push(selectedDate);
        } else if (self.config.mode === "range") {
          if (self.selectedDates.length === 2) self.clear(false);
          self.selectedDates.push(selectedDate);
          if (compareDates(selectedDate, self.selectedDates[0], true) !== 0) self.selectedDates.sort(function (a, b) {
            return a.getTime() - b.getTime();
          });
        }
        setHoursFromInputs();

        if (shouldChangeMonth) {
          var isNewYear = self.currentYear !== selectedDate.getFullYear();
          self.currentYear = selectedDate.getFullYear();
          self.currentMonth = selectedDate.getMonth();
          if (isNewYear) triggerEvent("onYearChange");
          triggerEvent("onMonthChange");
        }

        updateNavigationCurrentMonth();
        buildDays();
        updateValue();
        if (self.config.enableTime) setTimeout(function () {
          return self.showTimeInput = true;
        }, 50);
        if (!shouldChangeMonth && self.config.mode !== "range" && self.config.showMonths === 1) focusOnDayElem(target);else self.selectedDateElem && self.selectedDateElem.focus();
        if (self.hourElement !== undefined) setTimeout(function () {
          return self.hourElement !== undefined && self.hourElement.select();
        }, 451);

        if (self.config.closeOnSelect) {
          var single = self.config.mode === "single" && !self.config.enableTime;
          var range = self.config.mode === "range" && self.selectedDates.length === 2 && !self.config.enableTime;

          if (single || range) {
            focusAndClose();
          }
        }

        triggerChange();
      }

      var CALLBACKS = {
        locale: [setupLocale, updateWeekdays],
        showMonths: [buildMonths, setCalendarWidth, buildWeekdays]
      };

      function set(option, value) {
        if (option !== null && typeof option === "object") Object.assign(self.config, option);else {
          self.config[option] = value;
          if (CALLBACKS[option] !== undefined) CALLBACKS[option].forEach(function (x) {
            return x();
          });else if (HOOKS.indexOf(option) > -1) self.config[option] = arrayify(value);
        }
        self.redraw();
        jumpToDate();
        updateValue(false);
      }

      function setSelectedDate(inputDate, format) {
        var dates = [];
        if (inputDate instanceof Array) dates = inputDate.map(function (d) {
          return self.parseDate(d, format);
        });else if (inputDate instanceof Date || typeof inputDate === "number") dates = [self.parseDate(inputDate, format)];else if (typeof inputDate === "string") {
          switch (self.config.mode) {
            case "single":
            case "time":
              dates = [self.parseDate(inputDate, format)];
              break;

            case "multiple":
              dates = inputDate.split(self.config.conjunction).map(function (date) {
                return self.parseDate(date, format);
              });
              break;

            case "range":
              dates = inputDate.split(self.l10n.rangeSeparator).map(function (date) {
                return self.parseDate(date, format);
              });
              break;

            default:
              break;
          }
        } else self.config.errorHandler(new Error("Invalid date supplied: " + JSON.stringify(inputDate)));
        self.selectedDates = dates.filter(function (d) {
          return d instanceof Date && isEnabled(d, false);
        });
        if (self.config.mode === "range") self.selectedDates.sort(function (a, b) {
          return a.getTime() - b.getTime();
        });
      }

      function setDate(date, triggerChange, format) {
        if (triggerChange === void 0) {
          triggerChange = false;
        }

        if (format === void 0) {
          format = self.config.dateFormat;
        }

        if (date !== 0 && !date || date instanceof Array && date.length === 0) return self.clear(triggerChange);
        setSelectedDate(date, format);
        self.showTimeInput = self.selectedDates.length > 0;
        self.latestSelectedDateObj = self.selectedDates[0];
        self.redraw();
        jumpToDate();
        setHoursFromDate();
        updateValue(triggerChange);
        if (triggerChange) triggerEvent("onChange");
      }

      function parseDateRules(arr) {
        return arr.slice().map(function (rule) {
          if (typeof rule === "string" || typeof rule === "number" || rule instanceof Date) {
            return self.parseDate(rule, undefined, true);
          } else if (rule && typeof rule === "object" && rule.from && rule.to) return {
            from: self.parseDate(rule.from, undefined),
            to: self.parseDate(rule.to, undefined)
          };

          return rule;
        }).filter(function (x) {
          return x;
        });
      }

      function setupDates() {
        self.selectedDates = [];
        self.now = self.parseDate(self.config.now) || new Date();
        var preloadedDate = self.config.defaultDate || ((self.input.nodeName === "INPUT" || self.input.nodeName === "TEXTAREA") && self.input.placeholder && self.input.value === self.input.placeholder ? null : self.input.value);
        if (preloadedDate) setSelectedDate(preloadedDate, self.config.dateFormat);
        var initialDate = self.selectedDates.length > 0 ? self.selectedDates[0] : self.config.minDate && self.config.minDate.getTime() > self.now.getTime() ? self.config.minDate : self.config.maxDate && self.config.maxDate.getTime() < self.now.getTime() ? self.config.maxDate : self.now;
        self.currentYear = initialDate.getFullYear();
        self.currentMonth = initialDate.getMonth();
        if (self.selectedDates.length > 0) self.latestSelectedDateObj = self.selectedDates[0];
        if (self.config.minTime !== undefined) self.config.minTime = self.parseDate(self.config.minTime, "H:i");
        if (self.config.maxTime !== undefined) self.config.maxTime = self.parseDate(self.config.maxTime, "H:i");
        self.minDateHasTime = !!self.config.minDate && (self.config.minDate.getHours() > 0 || self.config.minDate.getMinutes() > 0 || self.config.minDate.getSeconds() > 0);
        self.maxDateHasTime = !!self.config.maxDate && (self.config.maxDate.getHours() > 0 || self.config.maxDate.getMinutes() > 0 || self.config.maxDate.getSeconds() > 0);
        Object.defineProperty(self, "showTimeInput", {
          get: function get() {
            return self._showTimeInput;
          },
          set: function set(bool) {
            self._showTimeInput = bool;
            if (self.calendarContainer) toggleClass(self.calendarContainer, "showTimeInput", bool);
            self.isOpen && positionCalendar();
          }
        });
      }

      function setupInputs() {
        self.input = self.config.wrap ? element.querySelector("[data-input]") : element;

        if (!self.input) {
          self.config.errorHandler(new Error("Invalid input element specified"));
          return;
        }

        self.input._type = self.input.type;
        self.input.type = "text";
        self.input.classList.add("flatpickr-input");
        self._input = self.input;

        if (self.config.altInput) {
          self.altInput = createElement(self.input.nodeName, self.input.className + " " + self.config.altInputClass);
          self._input = self.altInput;
          self.altInput.placeholder = self.input.placeholder;
          self.altInput.disabled = self.input.disabled;
          self.altInput.required = self.input.required;
          self.altInput.tabIndex = self.input.tabIndex;
          self.altInput.type = "text";
          self.input.setAttribute("type", "hidden");
          if (!self.config.static && self.input.parentNode) self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
        }

        if (!self.config.allowInput) self._input.setAttribute("readonly", "readonly");
        self._positionElement = self.config.positionElement || self._input;
      }

      function setupMobile() {
        var inputType = self.config.enableTime ? self.config.noCalendar ? "time" : "datetime-local" : "date";
        self.mobileInput = createElement("input", self.input.className + " flatpickr-mobile");
        self.mobileInput.step = self.input.getAttribute("step") || "any";
        self.mobileInput.tabIndex = 1;
        self.mobileInput.type = inputType;
        self.mobileInput.disabled = self.input.disabled;
        self.mobileInput.required = self.input.required;
        self.mobileInput.placeholder = self.input.placeholder;
        self.mobileFormatStr = inputType === "datetime-local" ? "Y-m-d\\TH:i:S" : inputType === "date" ? "Y-m-d" : "H:i:S";

        if (self.selectedDates.length > 0) {
          self.mobileInput.defaultValue = self.mobileInput.value = self.formatDate(self.selectedDates[0], self.mobileFormatStr);
        }

        if (self.config.minDate) self.mobileInput.min = self.formatDate(self.config.minDate, "Y-m-d");
        if (self.config.maxDate) self.mobileInput.max = self.formatDate(self.config.maxDate, "Y-m-d");
        self.input.type = "hidden";
        if (self.altInput !== undefined) self.altInput.type = "hidden";

        try {
          if (self.input.parentNode) self.input.parentNode.insertBefore(self.mobileInput, self.input.nextSibling);
        } catch (_a) {}

        bind(self.mobileInput, "change", function (e) {
          self.setDate(e.target.value, false, self.mobileFormatStr);
          triggerEvent("onChange");
          triggerEvent("onClose");
        });
      }

      function toggle(e) {
        if (self.isOpen === true) return self.close();
        self.open(e);
      }

      function triggerEvent(event, data) {
        if (self.config === undefined) return;
        var hooks = self.config[event];

        if (hooks !== undefined && hooks.length > 0) {
          for (var i = 0; hooks[i] && i < hooks.length; i++) {
            hooks[i](self.selectedDates, self.input.value, self, data);
          }
        }

        if (event === "onChange") {
          self.input.dispatchEvent(createEvent("change"));
          self.input.dispatchEvent(createEvent("input"));
        }
      }

      function createEvent(name) {
        var e = document.createEvent("Event");
        e.initEvent(name, true, true);
        return e;
      }

      function isDateSelected(date) {
        for (var i = 0; i < self.selectedDates.length; i++) {
          if (compareDates(self.selectedDates[i], date) === 0) return "" + i;
        }

        return false;
      }

      function isDateInRange(date) {
        if (self.config.mode !== "range" || self.selectedDates.length < 2) return false;
        return compareDates(date, self.selectedDates[0]) >= 0 && compareDates(date, self.selectedDates[1]) <= 0;
      }

      function updateNavigationCurrentMonth() {
        if (self.config.noCalendar || self.isMobile || !self.monthNav) return;
        self.yearElements.forEach(function (yearElement, i) {
          var d = new Date(self.currentYear, self.currentMonth, 1);
          d.setMonth(self.currentMonth + i);
          self.monthElements[i].textContent = monthToStr(d.getMonth(), self.config.shorthandCurrentMonth, self.l10n) + " ";
          yearElement.value = d.getFullYear().toString();
        });
        self._hidePrevMonthArrow = self.config.minDate !== undefined && (self.currentYear === self.config.minDate.getFullYear() ? self.currentMonth <= self.config.minDate.getMonth() : self.currentYear < self.config.minDate.getFullYear());
        self._hideNextMonthArrow = self.config.maxDate !== undefined && (self.currentYear === self.config.maxDate.getFullYear() ? self.currentMonth + 1 > self.config.maxDate.getMonth() : self.currentYear > self.config.maxDate.getFullYear());
      }

      function getDateStr(format) {
        return self.selectedDates.map(function (dObj) {
          return self.formatDate(dObj, format);
        }).filter(function (d, i, arr) {
          return self.config.mode !== "range" || self.config.enableTime || arr.indexOf(d) === i;
        }).join(self.config.mode !== "range" ? self.config.conjunction : self.l10n.rangeSeparator);
      }

      function updateValue(triggerChange) {
        if (triggerChange === void 0) {
          triggerChange = true;
        }

        if (self.selectedDates.length === 0) return self.clear(triggerChange);

        if (self.mobileInput !== undefined && self.mobileFormatStr) {
          self.mobileInput.value = self.latestSelectedDateObj !== undefined ? self.formatDate(self.latestSelectedDateObj, self.mobileFormatStr) : "";
        }

        self.input.value = getDateStr(self.config.dateFormat);

        if (self.altInput !== undefined) {
          self.altInput.value = getDateStr(self.config.altFormat);
        }

        if (triggerChange !== false) triggerEvent("onValueUpdate");
      }

      function onMonthNavClick(e) {
        e.preventDefault();
        var isPrevMonth = self.prevMonthNav.contains(e.target);
        var isNextMonth = self.nextMonthNav.contains(e.target);

        if (isPrevMonth || isNextMonth) {
          changeMonth(isPrevMonth ? -1 : 1);
        } else if (self.yearElements.indexOf(e.target) >= 0) {
          e.target.select();
        } else if (e.target.classList.contains("arrowUp")) {
          self.changeYear(self.currentYear + 1);
        } else if (e.target.classList.contains("arrowDown")) {
          self.changeYear(self.currentYear - 1);
        }
      }

      function timeWrapper(e) {
        e.preventDefault();
        var isKeyDown = e.type === "keydown",
            input = e.target;

        if (self.amPM !== undefined && e.target === self.amPM) {
          self.amPM.textContent = self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
        }

        var min = parseFloat(input.getAttribute("data-min")),
            max = parseFloat(input.getAttribute("data-max")),
            step = parseFloat(input.getAttribute("data-step")),
            curValue = parseInt(input.value, 10),
            delta = e.delta || (isKeyDown ? e.which === 38 ? 1 : -1 : 0);
        var newValue = curValue + step * delta;

        if (typeof input.value !== "undefined" && input.value.length === 2) {
          var isHourElem = input === self.hourElement,
              isMinuteElem = input === self.minuteElement;

          if (newValue < min) {
            newValue = max + newValue + int(!isHourElem) + (int(isHourElem) && int(!self.amPM));
            if (isMinuteElem) incrementNumInput(undefined, -1, self.hourElement);
          } else if (newValue > max) {
            newValue = input === self.hourElement ? newValue - max - int(!self.amPM) : min;
            if (isMinuteElem) incrementNumInput(undefined, 1, self.hourElement);
          }

          if (self.amPM && isHourElem && (step === 1 ? newValue + curValue === 23 : Math.abs(newValue - curValue) > step)) {
            self.amPM.textContent = self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
          }

          input.value = pad(newValue);
        }
      }

      init();
      return self;
    }

    function _flatpickr(nodeList, config) {
      var nodes = Array.prototype.slice.call(nodeList);
      var instances = [];

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        try {
          if (node.getAttribute("data-fp-omit") !== null) continue;

          if (node._flatpickr !== undefined) {
            node._flatpickr.destroy();

            node._flatpickr = undefined;
          }

          node._flatpickr = FlatpickrInstance(node, config || {});
          instances.push(node._flatpickr);
        } catch (e) {
          console.error(e);
        }
      }

      return instances.length === 1 ? instances[0] : instances;
    }

    if (typeof HTMLElement !== "undefined") {
      HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function (config) {
        return _flatpickr(this, config);
      };

      HTMLElement.prototype.flatpickr = function (config) {
        return _flatpickr([this], config);
      };
    }

    var flatpickr = function flatpickr(selector, config) {
      if (selector instanceof NodeList) return _flatpickr(selector, config);else if (typeof selector === "string") return _flatpickr(window.document.querySelectorAll(selector), config);
      return _flatpickr([selector], config);
    };

    flatpickr.defaultConfig = defaults;
    flatpickr.l10ns = {
      en: Object.assign({}, english),
      default: Object.assign({}, english)
    };

    flatpickr.localize = function (l10n) {
      flatpickr.l10ns.default = Object.assign({}, flatpickr.l10ns.default, l10n);
    };

    flatpickr.setDefaults = function (config) {
      flatpickr.defaultConfig = Object.assign({}, flatpickr.defaultConfig, config);
    };

    flatpickr.parseDate = createDateParser({});
    flatpickr.formatDate = createDateFormatter({});
    flatpickr.compareDates = compareDates;

    if (typeof jQuery !== "undefined") {
      jQuery.fn.flatpickr = function (config) {
        return _flatpickr(this, config);
      };
    }

    Date.prototype.fp_incr = function (days) {
      return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
    };

    if (typeof window !== "undefined") {
      window.flatpickr = flatpickr;
    }

    return flatpickr;

})));


/***/ }),
/* 20 */
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