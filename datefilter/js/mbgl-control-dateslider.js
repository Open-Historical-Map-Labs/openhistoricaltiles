import flatpickr from "flatpickr";
require('flatpickr/dist/flatpickr.min.css');

require('./mbgl-control-dateslider.scss');


export class MapDateFilterControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        this.options = Object.assign({
            // the default start/end dates
            mindate: "1900-01-01",
            maxdate: "2100-12-31",
            // when dates are changed, do the following callback
            onChange: function () {
            },
        }, options);

        // some preliminary checks on config, worth panicking to death here and now
        if (! this.validateDateFormat(this.options.mindate)) {
            throw `MapDateFilterControl mindate now in YYYY-M-DD format: ${this.options.mindate}`;
        }
        if (! this.validateDateFormat(this.options.maxdate)) {
            throw `MapDateFilterControl maxdate now in YYYY-M-DD format: ${this.options.maxdate}`;
        }
    }

    onAdd (map) {
        this._map = map;

        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mbgl-control-dateslider";

        this.initUIElements();

        this.options.layers.forEach((layerid) => {
            this.addFilteringOptionToSublayer(layerid);
        });

        // apply our filter to whatever is the initial state
        // and re-filter every time the map is moved
        this.applyDateFiltering();

        // done; hand back our UI element as expected by the framework
        return this._container;
    }

    initUIElements () {
        this._introtext = document.createElement('p');
        this._introtext.innerHTML = '<p>Filter the map by date range.</p>';
        this._container.appendChild(this._introtext);

        this._input_startdate = document.createElement('input');
        this._input_startdate.type = "text";
        this._input_startdate.value = this.options.mindate;
        this._container.appendChild(this._input_startdate);
        this._input_startdate.addEventListener('change', () => {
            if (! this.validateDateFormat(this._input_startdate.value)) {
                return alert("Invalid start date.");
            }
            this.applyDateFiltering();
            this.options.onChange();
        });

        this._input_enddate = document.createElement('input');
        this._input_enddate.type = "text";
        this._input_enddate.value = this.options.maxdate;
        this._container.appendChild(this._input_enddate);
        this._input_enddate.addEventListener('change', () => {
            if (! this.validateDateFormat(this._input_enddate.value)) {
                return alert("Invalid end date.");
            }
            this.applyDateFiltering();
            this.options.onChange();
        });

        const datepickerconfig = {
            allowInput: true,
        };
        flatpickr(this._input_startdate, datepickerconfig);
        flatpickr(this._input_enddate, datepickerconfig);

        this._gobutton = document.createElement('input'); // doesn't really DO anything except prompt the user to blur the text inputs
        this._gobutton.type = "button";
        this._gobutton.value = 'Apply';
        this._container.appendChild(this._gobutton);
    }

    getDefaultPosition () {
        return 'top-left';
    }

    applyDateFiltering () {
        // MBGL's filtering won't handle a function callback so we could filter against missing osm_id or date being blank or malformed or whatnot
        // so we have some roundabout work to do:
        // - go over the stated sub-layers and collect a list of data sources + layer names,
        // - so we can do a querySourceFeatures() on each source+layer combination, collecting osm_id of features fitting our date filter
        // - so we can then apply to the filter clauses which we created in addFilteringOptionToSublayer()
        // this sounds roundabout compared to specifying a single source + list of source-layers,
        // but allows us to opt-in only the specific map layers which we want to be affected by date filtering

        // the date range
        const thedates = this.getDates();
        const mindate = thedates[0];
        const maxdate = thedates[1];
        // console.debug([ `MapDateFilterControl applyDateFiltering() dates are`, mindate, maxdate ]);

        // go over the stated map layers, collecting a list of unique source + source-layer cmobinations
        const sourcelayers = [];
        {
            const sourcelayers_seen = {};
            this.options.layers.forEach((layerid) => {
                const layer = MAP.getLayer(layerid);

                const key = `${layer.source} ${layer.sourceLayer}`;
                if (sourcelayers_seen[key]) return;
                sourcelayers_seen[key] = true;

                sourcelayers.push([ layer.source, layer.sourceLayer ]);
            });
        }
        // console.debug([ `MapDateFilterControl applyDateFiltering() sourcelayers are:`, sourcelayers ]);

        // go over the collected source + source-layer combinations, collect osm_id values for features with valid dates
        // must unique the list, or else MBGL's filters fail with obscure messages about filtering branches
        // and must not let it be zero-length, so make it [ -1 ] if 0 matches
        let collected_osm_ids = [];
        sourcelayers.forEach(([sourcename, sourcelayer]) => {
            const idsfromthislayer = MAP.querySourceFeatures(sourcename, {
                sourceLayer: sourcelayer,
                filter: ['has', 'osm_id']
            })
            .filter((feature) => {
                // if the feature has no OSM ID then it's "eternal" stuff from Natural Earth of non-date-tracked stuff like Coastlines
                if (! feature.properties.osm_id) return true;

                // if start date and/or end date are invalid, then hide it because it's invalid
                if (! this.validateDateFormat(feature.properties.start_date) || ! this.validateDateFormat(feature.properties.end_date)) return false;

                // if the feature ended before our window, or doesn't start until after our window, then it's out of the date range
                if (feature.properties.end_date < mindate || feature.properties.start_date > maxdate) return false;

                // guess it fits
                return true;
            })
            .map((feature) => {
                return feature.properties.osm_id;
            });

            // add these IDs to the list
            collected_osm_ids = [ ...collected_osm_ids, ...idsfromthislayer ];
        });
        collected_osm_ids = collected_osm_ids.unique();
        // console.debug([ `MapDateFilterControl applyDateFiltering() collected_osm_ids are:`, collected_osm_ids ]);

        if (! collected_osm_ids.length) collected_osm_ids = [ -1 ];

        // apply the osm_id filter
        // since we prepended these in addFilteringOptionToSublayer() we know that this is filters[1]
        // and the osm_id values would be filters[1][2]
        this.options.layers.forEach(function (layerid) {
            const oldfilters = MAP.getFilter(layerid);

            const newfilters = oldfilters.slice();
            newfilters[1] = [ 'in', 'osm_id', ...collected_osm_ids ];

            // console.debug([ `MapDateFilterControl applyDateFiltering() layer ${layerid} before/after filters are:`, oldfilters, newfilters ]);

            MAP.setFilter(layerid, newfilters);
        });
    }

    validateDateFormat (datestring) {
        // make sure the given string is YYYY-MM-DD format, ISO 8601
        const iso8601 = /^\d\d\d\d\-\d\d\-\d\d$/;
        return datestring.match(iso8601);
    }

    addFilteringOptionToSublayer (layerid) {
        // what we need is for every layer to have a "all" clause against a new filter by its osm_id
        // the list of osm_id values which match filters, is best done in the helper function applyDateFiltering()
        // as that can be smarter than MBGL's own <= >= filtering capabilities

        // the filtering on this layer could be a variety of structures...
        // how to add ALL + two date filters, is different for every one
        const oldfilters = this._map.getFilter(layerid);

        const addthisclause = [ '!in', 'osm_id', -1 ];  // Sep 2018, deprecated "in" syntax, but new "match" expression is an unknown syntax today? works on other maps!

        if (oldfilters === undefined) {
            // no filter at all, so create one
            const newfilters = [
                "all",
                addthisclause,
            ];

            const filtername = "NoFilter";
            // console.debug([ `MapDateFilterControl ${filtername} ${layerid}`, oldfilters, newfilters ]);
            this._map.setFilter(layerid, newfilters);
        }
        else if (oldfilters[0] === 'all') {
            // "all" plus an array of clauses
            // we just prepend the new clause to the list of clauses
            const newfilters = oldfilters.slice();
            newfilters.splice(1, 0, addthisclause);

            const filtername = "AllArray";
            // console.debug([ `MapDateFilterControl ${filtername} ${layerid}`, oldfilters, newfilters ]);
            this._map.setFilter(layerid, newfilters);
        }
        else if (oldfilters[0] === 'any') {
            // "any" plus an array of clauses
            // wrap them all into a new single clause, and prepend our required
            // thus, "all" of our filter + their original "any" filter
            const newfilters = [
                "all",
                addthisclause,
                [ oldfilters ],
            ];

            const filtername = "AnyArray";
            // console.debug([ `MapDateFilterControl ${filtername} ${layerid}`, oldfilters, newfilters ]);
            this._map.setFilter(layerid, newfilters);
        }
        else if (Array.isArray(oldfilters)) {
            // an array forming a single clause
            // wrap it into an array, and stick a "all" in front of it + our new filter
            const newfilters = [
                "all",
                addthisclause,
                oldfilters
            ];

            const filtername = "SingleClauseArray";
            // console.debug([ `MapDateFilterControl ${filtername} ${layerid}`, oldfilters, newfilters ]);
            this._map.setFilter(layerid, newfilters);
        }
        else {
            // some other condition I had not expected and need to figure out
            console.error(oldfilters);
            throw `MapDateFilterControl addFilteringOptionToSublayer() got unexpected filtering condition on layer ${layerid}`;
        }
    }

    getDates () {
        // return the dates currently in use for filtering
        return [ this._input_startdate.value, this._input_enddate.value ];
    }

    setDates (mindate, maxdate) {
        if (! this.validateDateFormat(mindate)) {
            throw "MapDateFilterControl setDates() mindate ${mindate} is not valid";
        }
        if (! this.validateDateFormat(maxdate)) {
            throw "MapDateFilterControl setDates() maxdate ${maxdate} is not valid";
        }

        this._input_startdate.value = mindate;
        this._input_enddate.value = maxdate;

        this.applyDateFiltering();
        this.options.onChange();
    }
}
