require('./mbgl-control-timeslider-polyfills.js');
require('./mbgl-control-timeslider-control.scss');


export class TimeSliderControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        const current_year = (new Date()).getFullYear();

        this.options = Object.assign({
            sourcename: undefined,
            datespan: [ current_year - 100, current_year],
            autoExpandRange: true,
            // date derieved from datespan
            // datelimit derived from datespan
            onDateSelect: function () {},
            onRangeChange: function () {}
        }, options);

        if (! this.options.date) {
            this.options.date = this.options.datespan[0];
        }
        if (! this.options.datelimit) {
            this.options.datelimit = this.options.datespan.slice();
        }

        // preliminary sanity checks
        if (! this.options.sourcename) throw `TimeSliderControl missing required option: sourcename`;
        if (! Number.isInteger(this.options.date)) throw `TimeSliderControl option date is not an integer`;
        if (! Number.isInteger(this.options.datespan[0])) throw `TimeSliderControl option datespan is not two integers`;
        if (! Number.isInteger(this.options.datespan[1])) throw `TimeSliderControl option datespan is not two integers`;
        if (! Number.isInteger(this.options.datelimit[0])) throw `TimeSliderControl option datelimit is not two integers`;
        if (! Number.isInteger(this.options.datelimit[1])) throw `TimeSliderControl option datelimit is not two integers`;
        if (this.options.datelimit[0] >= this.options.datelimit[1]) throw `TimeSliderControl option datelimit max year must be greater than min year`;
        if (this.options.datespan[0] >= this.options.datespan[1]) throw `TimeSliderControl option datespan max year must be greater than min year`;
    }

    onAdd (map) {
        // keep a reference to our map, and create our basic control DIV
        this._map = map;
        this._container = document.createElement("DIV");
        this._container.className = "mapboxgl-ctrl mbgl-control-timeslider";

        // set up the UI buttons as raw HTML, then fetch references to them via querySelector()
        this._container.innerHTML = `
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous" />
        <div class="mbgl-control-timeslider-section-lhs">
            <div class="mbgl-control-timeslider-buttonset">
                <i class="mbgl-control-timeslider-forwardbutton fa fa-plus"></i>
                <i class="mbgl-control-timeslider-backbutton fa fa-minus"></i>
                <i class="mbgl-control-timeslider-homebutton fa fa-home"></i>
            </div>
            <input type="number" step="1" min="" max="" class="mbgl-control-timeslider-dateinput mbgl-control-timeslider-dateinput-min" />
        </div>
        <div class="mbgl-control-timeslider-section-cnt">
            <input type="number" step="1" min="" max="" class="mbgl-control-timeslider-dateinput mbgl-control-timeslider-dateinput-current" />
            <input type="range" min="" max="" value="" step="1" class="mbgl-control-timeslider-sliderbar" />
        </div>
        <div class="mbgl-control-timeslider-section-rhs">
            <div class="mbgl-control-timeslider-buttonset">
                &nbsp;
            </div>
            <input type="number" step="1" min="" max="" class="mbgl-control-timeslider-dateinput mbgl-control-timeslider-dateinput-max" />
        </div>
        `;

        this._forwardbutton = this._container.querySelector('i.mbgl-control-timeslider-forwardbutton');
        this._backbutton    = this._container.querySelector('i.mbgl-control-timeslider-backbutton');
        this._homebutton    = this._container.querySelector('i.mbgl-control-timeslider-homebutton');
        this._mindateinput  = this._container.querySelector('input.mbgl-control-timeslider-dateinput-min');
        this._maxdateinput  = this._container.querySelector('input.mbgl-control-timeslider-dateinput-max');
        this._datereadout   = this._container.querySelector('input.mbgl-control-timeslider-dateinput-current');
        this._sliderbar     = this._container.querySelector('input.mbgl-control-timeslider-sliderbar');

        // add titles
        // could do this in HTML above, but kind of nice to have all the text in one area
        this._forwardbutton.title   = `Shift time forward by one year`;
        this._backbutton.title      = `Shift time backward by one year`;
        this._homebutton.title      = `Reset the time slider to ${this.options.date}`;
        this._mindateinput.title    = `Set the range and resolution of the slider, as far back as ${this.options.datelimit[0]}`;
        this._maxdateinput.title    = `Set the range and resolution of the slider, as far forward as ${this.options.datelimit[1]}`;
        this._datereadout.title     = `Manually enter a year to set the date filtering`;
        this._sliderbar.title       = `Adjust the slider to set the date filtering`;

        // add event handlers: + - buttons, home, text inputs, ...
        this._forwardbutton.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.yearForward();
        });
        this._backbutton.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.yearBack();
        });
        this._homebutton.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.setDate(this.options.date);
        });
        this._sliderbar.addEventListener('input', () => {
            this.setDate(this._sliderbar.value);
        });
        this._datereadout.addEventListener('input', () => {
            this.setDate(this._datereadout.value);
        });
        this._mindateinput.addEventListener('change', () => {
            this.setRangeLower(this._mindateinput.value);
        });
        this._maxdateinput.addEventListener('change', () => {
            this.setRangeUpper(this._maxdateinput.value);
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

        setTimeout(() => {
            this._setupDateFiltersForLayers();
            this.setDate(this.options.date);
            this.setRange(this.options.datespan);
        }, 0.25 * 1000);

        // done; hand back our UI element as expected by the framework
        return this._container;
    }

    getDefaultPosition () {
        return 'top-right';
    }

    getDate () {
        return this._current_date;
    }

    getRange () {
        return this._current_range;
    }

    getLimit () {
        return this._range_limit;
    }

    yearForward (years=1) {
        const newyear = this._current_date + years;

        if (! this.isDateWithinLimit(newyear)) {
            console.debug(`TimeSliderControl yearForward() new date ${newyear} outside datelimit, ignoring`);
            return this;
        }

        if (! this.options.autoExpandRange && ! this.isDateWithinRange(newyear)) {
            console.debug(`TimeSliderControl yearForward() new date ${newyear} outside range and autoExpandRange is false, ignoring`);
            return this;
        }

        this.setDate(newyear);
    }

    yearBack (years=1) {
        const newyear = this._current_date - years;

        if (! this.isDateWithinLimit(newyear)) {
            console.debug(`TimeSliderControl yearBack() new date ${newyear} outside datelimit, ignoring`);
            return this;
        }

        if (! this.options.autoExpandRange && ! this.isDateWithinRange(newyear)) {
            console.debug(`TimeSliderControl yearBack() new date ${newyear} outside range and autoExpandRange is false, ignoring`);
            return this;
        }

        this.setDate(newyear);
    }

    setDate (year) {
        // coerce strings, e.g. from input fields or whatever
        year = parseInt(year);

        // if the date is out of limit, do nothing; return ourself for method chaining
        if (year < this._range_limit[0] || year > this._range_limit[1]) return this;

        // if our new date is out of range, extend our range... or else force the date to be within range
        if (this.options.autoExpandRange) {
            if      (year > this._current_range[1]) this.setRangeUpper(year);
            else if (year < this._current_range[0]) this.setRangeLower(year);
        }
        else if (! this.isDateWithinRange(year)) {
            if      (year > this._current_range[1]) year = this._current_range[1];
            else if (year < this._current_range[0]) year = this._current_range[0];
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

    setRange (newrange) {
        // coerce strings, e.g. from input fields or whatever
        newrange[0] = parseInt(newrange[0]);
        newrange[1] = parseInt(newrange[1]);

        // clip the range to fit the range limit, if necessary
        if (newrange[0] < this._range_limit[0]) {
            newrange[0] = this._range_limit[0];
            console.debug(`TimeSliderControl setRange() range exceeds datelimit setting, adjusting min date`);
        }
        if (newrange[1] > this._range_limit[1]) {
            newrange[1] = this._range_limit[1];
            console.debug(`TimeSliderControl setRange() range exceeds datelimit setting, adjusting max date`);
        }

        // sanity: min must <= max, or else ignore it
        if (newrange[1] <= newrange[0]) {
            console.debug(`TimeSliderControl setRange() max date must be greater than min date`);
        }

        // if the range would no longer include our currently-selected date, extend their range for them so the current date is still valid, before we apply it
        if (this._current_date < newrange[0]) {
            newrange[0] = this._current_date;
            console.debug(`TimeSliderControl setRange() extending range to include current date ${this._current_date}`);
        }
        else if (this._current_date > newrange[1]) {
            newrange[1] = this._current_date;
            console.debug(`TimeSliderControl setRange() extending range to include current date ${this._current_date}`);
        }

        // set the internal range, and the visible values in the box
        // if we disallow auto-expanding of the range, then also set these min/max in some input widgets
        this._current_range = newrange;

        this._mindateinput.value = this._current_range[0];
        this._maxdateinput.value = this._current_range[1];

        if (! this.options.autoExpandRange) {
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

    setRangeUpper (newyear) {
        this.setRange([ this._current_range[0], newyear ]);

        // done, return ourself for method chaining
        return this;
    }

    setRangeLower (newyear) {
        this.setRange([ newyear, this._current_range[1] ]);

        // done, return ourself for method chaining
        return this;
    }

    isDateWithinRange (year) {
        return year >= this._current_range[0] && year <= this._current_range[1];
    }

    isDateWithinLimit (year) {
        return year >= this._range_limit[0] && year <= this._range_limit[1];
    }

    _getFilteredMapLayers () {
        const mapstyle = this._map.getStyle();
        if (! mapstyle.sources[this.options.sourcename]) {
            console.debug(`TimeSliderControl map has no source named ${this.options.sourcename}`);
            return;
        }

        const filterlayers = mapstyle.layers.filter((layer) => layer.source == this.options.sourcename);
        return filterlayers;
    }

    _setupDateFiltersForLayers () {
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

        const layers = this._getFilteredMapLayers();

        layers.forEach((layer) => {
            // the OSM ID filter which we will prepend to the layer's own filters
            // the filter here is that OSM ID is missing, indicating features lacking a OSM ID, meaning "eternal" features such as coastline
            //
            // TODO: Sep 2018, deprecated "in" syntax; see about new "match" expression type
            const osmfilteringclause = [ 'any', ['!has', 'osm_id'] ];

            const oldfilters = this._map.getFilter(layer.id);

            let newfilters;
            if (oldfilters === undefined) {  // no filter at all, so create one
                newfilters = [
                    "all",
                    osmfilteringclause,
                ];
                // console.debug([ `TimeSliderControl _setupDateFiltersForLayers() NoFilter ${layer.id}`, oldfilters, newfilters ]);
            }
            else if (oldfilters[0] === 'all') {  // all clause; we can just insert our clause into position as filters[1]
                newfilters = oldfilters.slice();
                newfilters.splice(1, 0, osmfilteringclause);
                // console.debug([ `TimeSliderControl _setupDateFiltersForLayers() AllFilter ${layer.id}`, oldfilters, newfilters ]);
            }
            else if (oldfilters[0] === 'any') {  // any clause; wrap theirs into a giant clause, prepend ours with an all
                newfilters = [
                    "all",
                    osmfilteringclause,
                    [ oldfilters ],
                ];
                // console.debug([ `TimeSliderControl _setupDateFiltersForLayers() AnyFilter ${layer.id}`, oldfilters, newfilters ]);
            }
            else if (Array.isArray(oldfilters)) {  // an array forming a single, simple-style filtering clause; rewrap as an "all"
                newfilters = [
                    "all",
                    osmfilteringclause,
                    oldfilters
                ];
                // console.debug([ `TimeSliderControl _setupDateFiltersForLayers() ArrayFilter ${layer.id}`, oldfilters, newfilters ]);
            }
            else {
                // some other condition I had not expected and need to figure out
                console.error(oldfilters);
                throw `TimeSliderControl _setupDateFiltersForLayers() got unexpected filtering condition on layer ${layerid} for the developer to figure out`;
            }

            // apply the new filter, with the placeholder "eternal features" filter now prepended
            this._map.setFilter(layer.id, newfilters);
        });
    }

    _applyDateFilterToLayers () {
        // back in _setupDateFiltersForLayers() we prepended a filtering clause as filters[1] which filters for "eternal" features lacking a OSM ID
        // here in _applyDateFilterToLayers() we add a second part to that, for features with a start_date and end_date fitting our date

        const layers = this._getFilteredMapLayers();

        const date1 = `${this._current_date}-01-01`;
        const date2 = `${this._current_date}-12-31`;

        const datesubfilter = [
            'all',
            ['has', 'osm_id'],
            ['has', 'start_date'], ['!=', 'start_date', ''], ['<=', 'start_date', date1],
            ['has', 'end_date'], ['!=', 'end_date', ''], ['>=', 'end_date', date2],
        ];

        layers.forEach((layer) => {
            const newfilters = this._map.getFilter(layer.id).slice();
            newfilters[1][2] = datesubfilter.slice();
            this._map.setFilter(layer.id, newfilters);
            // console.debug([ `TimeSliderControl _applyDateFilterToLayers() ${layer.id} filters is now:`, newfilters ]);
        });
    }
}
