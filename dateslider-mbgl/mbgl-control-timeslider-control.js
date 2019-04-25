require('./mbgl-control-timeslider-polyfills.js');
require('./mbgl-control-timeslider-control.scss');


export class TimeSliderControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        const current_year = (new Date()).getFullYear();

        this.options = Object.assign({
            sourcename: undefined,
            datespan: [ current_year - 100, current_year],
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
            <div class="mbgl-control-timeslider-currentdatereadout"></div>
            <div class="mbgl-control-timeslider-sliderbar"></div>
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
        this._datereadout   = this._container.querySelector('div.mbgl-control-timeslider-currentdatereadout');
        this._sliderbar     = this._container.querySelector('div.mbgl-control-timeslider-sliderbar');

        // add titles
        // could do this in HTML above, but kind of nice to have all the text in one area
        this._forwardbutton.title   = `Shift time forward by one year`;
        this._backbutton.title      = `Shift time backward by one year`;
        this._homebutton.title      = `Reset the time slider to ${this.options.date}`;
        this._mindateinput.title    = `Set the time range indicated by the slider, as far back as ${this.options.datelimit[0]}`;
        this._maxdateinput.title    = `Set the time range indicated by the slider, as far forward as ${this.options.datelimit[1]}`;

        // add event handlers: + - buttons, home, text inputs, ...
        this._forwardbutton.addEventListener('click', () => {
            this.yearForward();
        });
        this._backbutton.addEventListener('click', () => {
            this.yearBack();
        });
        this._homebutton.addEventListener('click', () => {
            this.setDate(this.options.date);
        });
        this._mindateinput.addEventListener('change', () => {
            this.setRangeLower(this._mindateinput.value);
        });
        this._maxdateinput.addEventListener('change', () => {
            this.setRangeUpper(this._maxdateinput.value);
        });

        // get started!
        // apply our settings to the date boxes, filling them in
        // do this both internally (non-API) so we always have values, then using our own API methods so we do UI updates
        this._mindateinput.min = this.options.datelimit[0];
        this._mindateinput.max = this.options.datelimit[1];
        this._maxdateinput.min = this.options.datelimit[0];
        this._maxdateinput.max = this.options.datelimit[1];

        this._range_limit = this.options.datelimit;
        this._current_year = this.options.date;
        this._current_range = this.options.datespan;
        this.setDate(this.options.date);
        this.setRange(this.options.datespan);

        // done; hand back our UI element as expected by the framework
        return this._container;
    }

    getDefaultPosition () {
        return 'top-right';
    }

    getDate() {
        return this._current_date;
    }

    getRange() {
        return this._current_range;
    }

    getLimit() {
        return this._range_limit;
    }

    yearForward (years=1) {
        const newyear = this._current_date + years;
        if (! this.isDateWithinLimit(newyear)) {
            console.debug(`TimeSliderControl yearBack() new date ${newyear} outside datelimit, ignoring`);
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
        this.setDate(newyear);
    }

    setDate(year) {
        // coerce strings, e.g. from input fields or whatever
        year = parseInt(year);

        // if the date is out of range, do nothing; return ourself for method chaining
        if (year < this._range_limit[0] || year > this._range_limit[1]) return this;

        // set the newly-selected date and our readout
        this._current_date = year;
        this._datereadout.textContent = year;

        // if our new date is out of range, extend our range
        if      (this._current_date > this._current_range[1]) this.setRangeUpper(year);
        else if (this._current_date < this._current_range[0]) this.setRangeLower(year);

        // recalculate the position of the current-date marker and redraw it
//GDA
console.log(this._current_date);

        // done, return ourself for method chaining
        return this;
    }

    setRange(newrange) {
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

        // sanity: if the range would no longer include our currently-selected date, extend their range for them before we apply it
        if (this._current_date < newrange[0]) {
            newrange[0] = this._current_date;
            console.debug(`TimeSliderControl setRange() extending range to include current date ${this._current_date}`);
        }
        else if (this._current_date > newrange[1]) {
            newrange[1] = this._current_date;
            console.debug(`TimeSliderControl setRange() extending range to include current date ${this._current_date}`);
        }

        // set the internal range, and the visible values in the box
        this._current_range = newrange;
        this._mindateinput.value = this._current_range[0];
        this._maxdateinput.value = this._current_range[1];

        // recalculate the position of the current-date marker and redraw it
// GDA
console.log([ this._current_range[0], this._current_range[1], this._current_date ]);

        // done, return ourself for method chaining
        return this;
    }

    setRangeUpper(newyear) {
        this.setRange([ this._current_range[0], newyear ]);

        // done, return ourself for method chaining
        return this;
    }

    setRangeLower(newyear) {
        this.setRange([ newyear, this._current_range[1] ]);

        // done, return ourself for method chaining
        return this;
    }

    isDateWithinRange(year) {
        return year >= this._current_range[0] && year <= this._current_range[1];
    }

    isDateWithinLimit(year) {
        return year >= this._range_limit[0] && year <= this._range_limit[1];
    }
}
