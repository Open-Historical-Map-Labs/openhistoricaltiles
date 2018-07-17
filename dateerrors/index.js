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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var MAP = null;
var VLAYER = null;
var SCENE = null;

var MAP_START = [47.605, -122.331, 16]; // Seattle


$(document).ready(function () {
    // override MAP_START with URL hash contents
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split("/");
    if (url_hash.length == 3) {
        MAP_START = [url_hash[1], url_hash[2], url_hash[0]].map(Number);
    }

    // create the map
    MAP = L.map("map", {
        maxZoom: 18,
        minZoom: 3,
        inertia: false,
        keyboard: true
    });
    MAP.setView(MAP_START.slice(0, 2), MAP_START[2]);

    // add control: GreenInfo credits
    new L.controlCredits({
        image: 'images/greeninfo.png',
        link: 'http://www.greeninfo.org/',
        text: 'Interactive mapping<br/>by GreenInfo Network',
        position: 'bottomright'
    }).addTo(MAP);

    // add control: simple read-only legend
    new L.Control.Legend({
        position: 'topright'
    }).addTo(MAP).expand();

    // add control: hash updater/watcher
    new L.Hash(MAP);

    // add the vector tile scene from Tangram
    // reference https://tangrams.readthedocs.io/en/latest/
    // reference https://github.com/tangrams/tangram
    VLAYER = Tangram.leafletLayer({
        scene: "scene.yaml",
        attribution: "&copy; OSM contributors",
        events: {
            hover: handleMouseHover,
            click: handleMouseClick
        }
    });
    VLAYER.addTo(MAP);

    VLAYER.scene.subscribe({
        view_complete: function view_complete() {
            console.log("scene view complete");
        }
    });
});

window.handleMouseHover = function (selection) {
    if (!selection.feature) {
        $('#map').removeClass('crosshair').prop('title', "");
        return;
    }

    console.log(selection.feature);
    var tooltip = "" + selection.feature.source_layer;

    if (selection.feature.properties.name) {
        tooltip += " :: " + selection.feature.properties.name;
    }
    if (selection.feature.properties.osm_id) {
        tooltip += " :: OSM ID " + selection.feature.properties.osm_id;
    }

    $('#map').addClass('crosshair').prop('title', tooltip);
};

window.handleMouseClick = function (selection) {
    if (!selection.feature) {
        return;
    }

    // compose HTML
    var html = "Layer: " + selection.feature.source_layer;

    if (selection.feature.properties.osm_id) {
        html += "<br/>OSM ID: " + selection.feature.properties.osm_id;
    }
    if (selection.feature.properties.name) {
        html += "<br/>Name: " + selection.feature.properties.name;
    }

    if (selection.feature.properties.start_date && selection.feature.properties.start_date.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
        html += "<br/>Start Date: " + selection.feature.properties.start_date + " -- OK";
    } else if (selection.feature.properties.start_date) {
        html += "<br/>Start Date: " + selection.feature.properties.start_date + " -- INVALID";
    } else {
        html += "<br/>Start Date missing";
    }

    if (selection.feature.properties.end_date && selection.feature.properties.end_date.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
        html += "<br/>End Date: " + selection.feature.properties.end_date + " -- OK";
    } else if (selection.feature.properties.end_date) {
        html += "<br/>End Date: " + selection.feature.properties.end_date + " -- INVALID";
    } else {
        html += "<br/>End Date missing";
    }

    // open popup
    var latlng = selection.leaflet_event.latlng;
    MAP.openPopup(html, latlng);
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// a simple control to display a logo and credits in the corner of the map, with some neat interactive behavior
// in Leaflet tradition, a shortcut method is also provided, so you may use either version:
//     new L.CreditsControl(options)
//     L.controlCredits(options)
L.controlCredits = function (options) {
    return new L.CreditsControl(options);
};

L.CreditsControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },
    initialize: function initialize(options) {
        if (!options.text) throw "L.CreditsControl missing required option: text";
        if (!options.image) throw "L.CreditsControl missing required option: image";
        if (!options.link) throw "L.CreditsControl missing required option: link";

        L.setOptions(this, options);
    },
    onAdd: function onAdd(map) {
        this._map = map;

        // create our container, and set the background image
        var container = L.DomUtil.create('div', 'leaflet-credits-control', container);
        container.style.backgroundImage = 'url(' + this.options.image + ')';
        if (this.options.width) container.style.paddingRight = this.options.width + 'px';
        if (this.options.height) container.style.height = this.options.height + 'px';

        // generate the hyperlink to the left-hand side
        var link = L.DomUtil.create('a', '', container);
        link.target = '_blank';
        link.href = this.options.link;
        link.innerHTML = this.options.text;

        // create a linkage between this control and the hyperlink bit, since we will be toggling CSS for that hyperlink section
        container.link = link;

        // clicking the control (the image bit) expands the left-hand hyperlink/text bit
        L.DomEvent.addListener(container, 'mousedown', L.DomEvent.stopPropagation).addListener(container, 'click', L.DomEvent.stopPropagation).addListener(container, 'dblclick', L.DomEvent.stopPropagation).addListener(container, 'click', function () {
            var link = this.link;
            if (L.DomUtil.hasClass(link, 'leaflet-credits-showlink')) {
                L.DomUtil.removeClass(link, 'leaflet-credits-showlink');
            } else {
                L.DomUtil.addClass(link, 'leaflet-credits-showlink');
            }
        });

        // afterthought keep a reference to our container and to the link,
        // in case we need to change their content later via setText() et al
        this._container = container;
        this._link = link;

        // all done
        return container;
    },
    setText: function setText(html) {
        this._link.innerHTML = html;
    }
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// a custom-crafted Leaflet control for that legend
// styling is in the map's .css file
L.Control.Legend = L.Control.extend({
	options: {
		position: 'bottomright'
	},
	initialize: function initialize(options) {
		L.setOptions(this, options);
	},
	onAdd: function onAdd(map) {
		this._map = map;
		var myself = this;

		// create our container
		this.container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-legend-control leaflet-legend-collapsed');
		this.content_collapsed = L.DomUtil.create('div', 'leaflet-legend-content-collapsed', this.container);
		this.content_expanded = L.DomUtil.create('div', 'leaflet-legend-content-expanded', this.container);

		this.content_collapsed.innerHTML = '<img src="images/legend.svg" >';

		// the legend items here are contrived to match those 
		this.content_expanded.innerHTML = '';
		this.content_expanded.innerHTML += '<h4>OHM Features With Data Problems</h4>';
		this.content_expanded.innerHTML += '<div class="legend"><div class="swatch swatch-circle swatch-date-missing"></div> Start &amp; End Date Missing</div>';
		this.content_expanded.innerHTML += '<div class="legend"><div class="swatch swatch-circle swatch-date-malformed"></div> Start/End Date Malformed</div>';

		// click to toggle... and stop propagation to the map
		L.DomEvent.addListener(this.container, 'mousedown', L.DomEvent.stopPropagation).addListener(this.container, 'click', L.DomEvent.stopPropagation).addListener(this.container, 'dblclick', L.DomEvent.stopPropagation).addListener(this.content_collapsed, 'click', function () {
			myself.expand();
		}).addListener(this.content_expanded, 'click', function () {
			myself.collapse();
		});

		// all done
		return this.container;
	},
	expand: function expand(html) {
		L.DomUtil.addClass(this.container, 'leaflet-legend-expanded');
		L.DomUtil.removeClass(this.container, 'leaflet-legend-collapsed');
	},
	collapse: function collapse(html) {
		L.DomUtil.removeClass(this.container, 'leaflet-legend-expanded');
		L.DomUtil.addClass(this.container, 'leaflet-legend-collapsed');
	}
});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 4 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "index.html";

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// webpack entry point
// list JS files to include, CSS and SASS files to include, HTML templates to have [hash] replacement, etc.

__webpack_require__(6);
__webpack_require__(0);
__webpack_require__(5);

// bundle libraries
__webpack_require__(1);
__webpack_require__(3);
__webpack_require__(2);
__webpack_require__(4);

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map