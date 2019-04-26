var TimeSlider =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
 * Polyfill: Array.unique()
 */

if (!Array.prototype.unique) {
    Array.prototype.unique = function () {
        var result = [],
            val,
            ridx;
        outer: for (var i = 0, length = this.length; i < length; i++) {
            val = this[i];
            ridx = result.length;
            while (ridx--) {
                if (val === result[ridx]) continue outer;
            }
            result.push(val);
        }
        return result;
    };
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(0);
__webpack_require__(1);

var TimeSliderControl = exports.TimeSliderControl = function () {
    function TimeSliderControl() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, TimeSliderControl);

        // merge suppplied options with these defaults
        var current_year = new Date().getFullYear();

        this.options = Object.assign({
            sourcename: undefined,
            datespan: [current_year - 100, current_year],
            autoExpandRange: true,
            // date derieved from datespan
            // datelimit derived from datespan
            onDateSelect: function onDateSelect() {},
            onRangeChange: function onRangeChange() {}
        }, options);

        if (!this.options.date) {
            this.options.date = this.options.datespan[0];
        }
        if (!this.options.datelimit) {
            this.options.datelimit = this.options.datespan.slice();
        }

        // preliminary sanity checks
        if (!this.options.sourcename) throw 'TimeSliderControl missing required option: sourcename';
        if (!Number.isInteger(this.options.date)) throw 'TimeSliderControl option date is not an integer';
        if (!Number.isInteger(this.options.datespan[0])) throw 'TimeSliderControl option datespan is not two integers';
        if (!Number.isInteger(this.options.datespan[1])) throw 'TimeSliderControl option datespan is not two integers';
        if (!Number.isInteger(this.options.datelimit[0])) throw 'TimeSliderControl option datelimit is not two integers';
        if (!Number.isInteger(this.options.datelimit[1])) throw 'TimeSliderControl option datelimit is not two integers';
        if (this.options.datelimit[0] >= this.options.datelimit[1]) throw 'TimeSliderControl option datelimit max year must be greater than min year';
        if (this.options.datespan[0] >= this.options.datespan[1]) throw 'TimeSliderControl option datespan max year must be greater than min year';
    }

    _createClass(TimeSliderControl, [{
        key: 'onAdd',
        value: function onAdd(map) {
            var _this = this;

            // keep a reference to our map, and create our basic control DIV
            this._map = map;
            this._container = document.createElement("DIV");
            this._container.className = "mapboxgl-ctrl mbgl-control-timeslider";

            // set up the UI buttons as raw HTML, then fetch references to them via querySelector()
            this._container.innerHTML = '\n        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous" />\n        <div class="mbgl-control-timeslider-section-lhs">\n            <div class="mbgl-control-timeslider-buttonset">\n                <i class="mbgl-control-timeslider-forwardbutton fa fa-plus"></i>\n                <i class="mbgl-control-timeslider-backbutton fa fa-minus"></i>\n                <i class="mbgl-control-timeslider-homebutton fa fa-home"></i>\n            </div>\n            <input type="number" step="1" min="" max="" class="mbgl-control-timeslider-dateinput mbgl-control-timeslider-dateinput-min" />\n        </div>\n        <div class="mbgl-control-timeslider-section-cnt">\n            <input type="number" step="1" min="" max="" class="mbgl-control-timeslider-dateinput mbgl-control-timeslider-dateinput-current" />\n            <input type="range" min="" max="" value="" step="1" class="mbgl-control-timeslider-sliderbar" />\n        </div>\n        <div class="mbgl-control-timeslider-section-rhs">\n            <div class="mbgl-control-timeslider-buttonset">\n                &nbsp;\n            </div>\n            <input type="number" step="1" min="" max="" class="mbgl-control-timeslider-dateinput mbgl-control-timeslider-dateinput-max" />\n        </div>\n        ';

            this._forwardbutton = this._container.querySelector('i.mbgl-control-timeslider-forwardbutton');
            this._backbutton = this._container.querySelector('i.mbgl-control-timeslider-backbutton');
            this._homebutton = this._container.querySelector('i.mbgl-control-timeslider-homebutton');
            this._mindateinput = this._container.querySelector('input.mbgl-control-timeslider-dateinput-min');
            this._maxdateinput = this._container.querySelector('input.mbgl-control-timeslider-dateinput-max');
            this._datereadout = this._container.querySelector('input.mbgl-control-timeslider-dateinput-current');
            this._sliderbar = this._container.querySelector('input.mbgl-control-timeslider-sliderbar');

            // add titles
            // could do this in HTML above, but kind of nice to have all the text in one area
            this._forwardbutton.title = 'Shift time forward by one year';
            this._backbutton.title = 'Shift time backward by one year';
            this._homebutton.title = 'Reset the time slider to ' + this.options.date;
            this._mindateinput.title = 'Set the range and resolution of the slider, as far back as ' + this.options.datelimit[0];
            this._maxdateinput.title = 'Set the range and resolution of the slider, as far forward as ' + this.options.datelimit[1];
            this._datereadout.title = 'Manually enter a year to set the date filtering';
            this._sliderbar.title = 'Adjust the slider to set the date filtering';

            // add event handlers: + - buttons, home, text inputs, ...
            this._forwardbutton.addEventListener('click', function (event) {
                event.stopPropagation();
                event.preventDefault();
                _this.yearForward();
            });
            this._backbutton.addEventListener('click', function (event) {
                event.stopPropagation();
                event.preventDefault();
                _this.yearBack();
            });
            this._homebutton.addEventListener('click', function (event) {
                event.stopPropagation();
                event.preventDefault();
                _this.setDate(_this.options.date);
            });
            this._sliderbar.addEventListener('input', function () {
                _this.setDate(_this._sliderbar.value);
            });
            this._datereadout.addEventListener('input', function () {
                _this.setDate(_this._datereadout.value);
            });
            this._mindateinput.addEventListener('change', function () {
                _this.setRangeLower(_this._mindateinput.value);
            });
            this._maxdateinput.addEventListener('change', function () {
                _this.setRangeUpper(_this._maxdateinput.value);
            });

            // get started!
            // apply our settings to the date boxes, filling them in
            // do this internally so we don't have to work around undefined conditons during startup
            // then call our API methods once we're ready, to do UI updates and apply filtering
            this._range_limit = this.options.datelimit;
            this._current_year = this.options.date;
            this._current_range = this.options.datespan;

            this._sliderbar.min = this._range_limit[0];
            this._sliderbar.max = this._range_limit[1];
            this._sliderbar.value = this._current_year;

            this._mindateinput.min = this._range_limit[0];
            this._maxdateinput.min = this._range_limit[0];
            this._mindateinput.max = this._range_limit[1];
            this._maxdateinput.max = this._range_limit[1];

            setTimeout(function () {
                _this._setupDateFiltersForLayers();
                _this.setDate(_this.options.date);
                _this.setRange(_this.options.datespan);
            }, 0.25 * 1000);

            // done; hand back our UI element as expected by the framework
            return this._container;
        }
    }, {
        key: 'getDefaultPosition',
        value: function getDefaultPosition() {
            return 'top-right';
        }
    }, {
        key: 'getDate',
        value: function getDate() {
            return this._current_date;
        }
    }, {
        key: 'getRange',
        value: function getRange() {
            return this._current_range;
        }
    }, {
        key: 'getLimit',
        value: function getLimit() {
            return this._range_limit;
        }
    }, {
        key: 'yearForward',
        value: function yearForward() {
            var years = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            var newyear = this._current_date + years;

            if (!this.isDateWithinLimit(newyear)) {
                console.debug('TimeSliderControl yearForward() new date ' + newyear + ' outside datelimit, ignoring');
                return this;
            }

            if (!this.options.autoExpandRange && !this.isDateWithinRange(newyear)) {
                console.debug('TimeSliderControl yearForward() new date ' + newyear + ' outside range and autoExpandRange is false, ignoring');
                return this;
            }

            this.setDate(newyear);
        }
    }, {
        key: 'yearBack',
        value: function yearBack() {
            var years = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            var newyear = this._current_date - years;

            if (!this.isDateWithinLimit(newyear)) {
                console.debug('TimeSliderControl yearBack() new date ' + newyear + ' outside datelimit, ignoring');
                return this;
            }

            if (!this.options.autoExpandRange && !this.isDateWithinRange(newyear)) {
                console.debug('TimeSliderControl yearBack() new date ' + newyear + ' outside range and autoExpandRange is false, ignoring');
                return this;
            }

            this.setDate(newyear);
        }
    }, {
        key: 'setDate',
        value: function setDate(year) {
            // coerce strings, e.g. from input fields or whatever
            year = parseInt(year);

            // if the date is out of limit, do nothing; return ourself for method chaining
            if (year < this._range_limit[0] || year > this._range_limit[1]) return this;

            // if our new date is out of range, extend our range... or else force the date to be within range
            if (this.options.autoExpandRange) {
                if (year > this._current_range[1]) this.setRangeUpper(year);else if (year < this._current_range[0]) this.setRangeLower(year);
            } else if (!this.isDateWithinRange(year)) {
                if (year > this._current_range[1]) year = this._current_range[1];else if (year < this._current_range[0]) year = this._current_range[0];
            }

            // go ahead
            // set the newly-selected date and our readout
            this._current_date = year;
            this._datereadout.value = year;

            // adjust the slider to show the new date
            this._sliderbar.value = this._current_date;

            // oh yeah, we should filter the MBGL features
            this._applyDateFilterToLayers();

            // call the onDateSelect callback
            this.options.onDateSelect.call(this, this.getDate());

            // done, return ourself for method chaining
            return this;
        }
    }, {
        key: 'setRange',
        value: function setRange(newrange) {
            // coerce strings, e.g. from input fields or whatever
            newrange[0] = parseInt(newrange[0]);
            newrange[1] = parseInt(newrange[1]);

            // clip the range to fit the range limit, if necessary
            if (newrange[0] < this._range_limit[0]) {
                newrange[0] = this._range_limit[0];
                console.debug('TimeSliderControl setRange() range exceeds datelimit setting, adjusting min date');
            }
            if (newrange[1] > this._range_limit[1]) {
                newrange[1] = this._range_limit[1];
                console.debug('TimeSliderControl setRange() range exceeds datelimit setting, adjusting max date');
            }

            // sanity: min must <= max, or else ignore it
            if (newrange[1] <= newrange[0]) {
                console.debug('TimeSliderControl setRange() max date must be greater than min date');
            }

            // if the range would no longer include our currently-selected date, extend their range for them so the current date is still valid, before we apply it
            if (this._current_date < newrange[0]) {
                newrange[0] = this._current_date;
                console.debug('TimeSliderControl setRange() extending range to include current date ' + this._current_date);
            } else if (this._current_date > newrange[1]) {
                newrange[1] = this._current_date;
                console.debug('TimeSliderControl setRange() extending range to include current date ' + this._current_date);
            }

            // set the internal range, and the visible values in the box
            // if we disallow auto-expanding of the range, then also set these min/max in some input widgets
            this._current_range = newrange;

            this._mindateinput.value = this._current_range[0];
            this._maxdateinput.value = this._current_range[1];

            if (!this.options.autoExpandRange) {
                this._datereadout.min = this._current_range[0];
                this._datereadout.max = this._current_range[1];
            }

            // adjust the slider to show the new range
            this._sliderbar.min = this._current_range[0];
            this._sliderbar.max = this._current_range[1];

            // call the onRangeChange callback
            this.options.onRangeChange.call(this, this.getRange());

            // done, return ourself for method chaining
            return this;
        }
    }, {
        key: 'setRangeUpper',
        value: function setRangeUpper(newyear) {
            this.setRange([this._current_range[0], newyear]);

            // done, return ourself for method chaining
            return this;
        }
    }, {
        key: 'setRangeLower',
        value: function setRangeLower(newyear) {
            this.setRange([newyear, this._current_range[1]]);

            // done, return ourself for method chaining
            return this;
        }
    }, {
        key: 'isDateWithinRange',
        value: function isDateWithinRange(year) {
            return year >= this._current_range[0] && year <= this._current_range[1];
        }
    }, {
        key: 'isDateWithinLimit',
        value: function isDateWithinLimit(year) {
            return year >= this._range_limit[0] && year <= this._range_limit[1];
        }
    }, {
        key: '_getFilteredMapLayers',
        value: function _getFilteredMapLayers() {
            var _this2 = this;

            var mapstyle = this._map.getStyle();
            if (!mapstyle.sources[this.options.sourcename]) {
                console.debug('TimeSliderControl map has no source named ' + this.options.sourcename);
                return;
            }

            var filterlayers = mapstyle.layers.filter(function (layer) {
                return layer.source == _this2.options.sourcename;
            });
            return filterlayers;
        }
    }, {
        key: '_setupDateFiltersForLayers',
        value: function _setupDateFiltersForLayers() {
            var _this3 = this;

            // filtering by date has two parts:
            // OHM features which lack a OSM ID are "eternal" such as coastlines and mountain ranges; they will lack dates but should always match all date filters
            // OHM features which have a OSM ID, should be on the list of OSM IDs which _applyDateFilterToLayers() will figure out when the time comes
            //
            // strategy here:
            // we inject the osmfilteringclause, ensuring it falls into sequence as filters[1]
            // this osmfilteringclause will be rewritten by _applyDateFilterToLayers() to accmmodate both date-filtered features and eternal features
            //
            // warning: we are mutating someone else's map style in-place, and they may not be expecting that
            // if they go and apply their own filters later, it could get weird

            var layers = this._getFilteredMapLayers();

            layers.forEach(function (layer) {
                // the OSM ID filter which we will prepend to the layer's own filters
                // the filter here is that OSM ID is missing, indicating features lacking a OSM ID, meaning "eternal" features such as coastline
                //
                // TODO: Sep 2018, deprecated "in" syntax; see about new "match" expression type
                var osmfilteringclause = ['any', ['!has', 'osm_id']];

                var oldfilters = _this3._map.getFilter(layer.id);

                var newfilters = void 0;
                if (oldfilters === undefined) {
                    // no filter at all, so create one
                    newfilters = ["all", osmfilteringclause];
                    // console.debug([ `TimeSliderControl _setupDateFiltersForLayers() NoFilter ${layer.id}`, oldfilters, newfilters ]);
                } else if (oldfilters[0] === 'all') {
                    // all clause; we can just insert our clause into position as filters[1]
                    newfilters = oldfilters.slice();
                    newfilters.splice(1, 0, osmfilteringclause);
                    // console.debug([ `TimeSliderControl _setupDateFiltersForLayers() AllFilter ${layer.id}`, oldfilters, newfilters ]);
                } else if (oldfilters[0] === 'any') {
                    // any clause; wrap theirs into a giant clause, prepend ours with an all
                    newfilters = ["all", osmfilteringclause, [oldfilters]];
                    // console.debug([ `TimeSliderControl _setupDateFiltersForLayers() AnyFilter ${layer.id}`, oldfilters, newfilters ]);
                } else if (Array.isArray(oldfilters)) {
                    // an array forming a single, simple-style filtering clause; rewrap as an "all"
                    newfilters = ["all", osmfilteringclause, oldfilters];
                    // console.debug([ `TimeSliderControl _setupDateFiltersForLayers() ArrayFilter ${layer.id}`, oldfilters, newfilters ]);
                } else {
                    // some other condition I had not expected and need to figure out
                    console.error(oldfilters);
                    throw 'TimeSliderControl _setupDateFiltersForLayers() got unexpected filtering condition on layer ' + layerid + ' for the developer to figure out';
                }

                // apply the new filter, with the placeholder "eternal features" filter now prepended
                _this3._map.setFilter(layer.id, newfilters);
            });
        }
    }, {
        key: '_applyDateFilterToLayers',
        value: function _applyDateFilterToLayers() {
            var _this4 = this;

            // sadly, we can't just use a function callback as a filter; that would be powerful and easy; instead we have to collect OSM IDs and tweak our filter clauses
            // back in _setupDateFiltersForLayers() we prepended a filtering clause as filters[1]
            // with the expctation that here in _applyDateFilterToLayers() we will collect OSM IDs matching a date filter, and add them to the "any" collection
            // thus, we change the sub-query for dated features, and leave the sub-query for eternal features alone

            var layers = this._getFilteredMapLayers();

            layers.forEach(function (layer) {
                // filter to all features which have a OSM ID and a start_date and end_date
                // then filter them here to collect OSM IDs of features matching our date filter
                // ideally we would be simple >= and <= filters, but fact is the filter system isn't very bright and misses details eg. dates with invalid format
                var matchosmids = _this4._map.querySourceFeatures(layer.source, {
                    sourceLayer: layer.id,
                    filter: ['all', ['has', 'osm_id'], ['has', 'start_date'], ['!=', 'start_date', ''], ['has', 'end_date'], ['!=', 'end_date', '']]
                }).filter(function (feature) {
                    var starts = parseInt(feature.properties.start_date.substr(0, 4));
                    var ending = parseInt(feature.properties.end_date.substr(0, 4));
                    return _this4._current_date >= starts && _this4._current_date <= ending;
                }).map(function (feature) {
                    return feature.properties.osm_id;
                });

                // apply the filter, by replacing/appending the "or OSM ID is in..." sub-clause in filters[1][2]
                var newfilters = _this4._map.getFilter(layer.id).slice();
                newfilters[1][2] = ['in', 'osm_id'].concat(_toConsumableArray(matchosmids));
                // console.debug([ `TimeSliderControl _applyDateFilterToLayers() ${layer.id} filters is now:`, newfilters ]);
                _this4._map.setFilter(layer.id, newfilters);
            });
        }
    }]);

    return TimeSliderControl;
}();

/***/ })
/******/ ]);
//# sourceMappingURL=mbgl-control-timeslider.js.map