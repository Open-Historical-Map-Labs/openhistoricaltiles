require('./leaflet-control-mbgltimeslider-control.scss');

/*
 *
 */

L.Control.MBGLTimeSlider = L.Control.extend({
    options: {
        position: 'topright',
        mbgllayer: undefined,
        timeSliderOptions: {},
    },
    initialize: function (options) {
        L.setOptions(this, options);

        if (! this.options.mbgllayer) throw `L.Control.MBGLTimeSlider the mbgllayer option is required`;
        if (! this.options.mbgllayer._glMap) throw `L.Control.MBGLTimeSlider layer specified by mbgllayer option is not a L.mapboxGL instance`;
    },
    onAdd: function (map) {
        this._map = map;
        this._glmaplayer = this.options.mbgllayer;

        // create our container
        // no UI of our own, but we do move the MBGL TimeSlider container DIV into our own, so it properly falls into div.leaflet-control-container
        // for positioning reasons, and layer-stackig reasons (the control being inside the MBGL map, means it is in the display panes!)
        this._container = L.DomUtil.create('div', 'leaflet-control-mbgltimeslider');

        // wait for the MBGL layer to "load" (note that the layer is in fact a whole MBGL.Map)
        // then add the TimeSlider control to it
        if (! TimeSlider || ! TimeSlider.TimeSliderControl) throw `L.Control.MBGLTimeSlider could not find the MBGL TimeSlider library loaded`;

        this._glmaplayer._glMap.on('load', () => {
            this._addTimeSliderControlToMap(); 
        });

        // all done
        return this._container;
    },
    onRemove: function () {
        this._removeTimeSliderControlFromMap();
    },
    _addTimeSliderControlToMap: function () {
        // create the control and add it to the MBGL map
        this._timeslider = new TimeSlider.TimeSliderControl(this.options.timeSliderOptions);
        this._glmaplayer._glMap.addControl(this._timeslider);

        // stop mouse event propagation from the TimeSlider's DIV
        // so using the control won't also pan the map, zoom in if they double-click, etc.
        L.DomEvent.disableClickPropagation(this._timeslider._container);

        // move the MBGL slider's UI container into our own container,
        // so it will be properly positioned, and also stacked above the map content
        this._container.appendChild(this._timeslider._container);
    },
    _removeTimeSliderControlFromMap: function () {
        // remove the TimeSlider from the MBGL map
        this._glmaplayer._glMap.removeControl(this._timeslider);
    },

    //
    // MBGL TimeSlider API methods
    // the rest of these simply "pass through" to the real control, passing params as-given, so Leaflet consumers can use getDate() setRange() et al
    //
    getDate: function () {
        return this._timeslider.getDate(...arguments);
    },
    getRange: function () {
        return this._timeslider.getRange(...arguments);
    },
    getLimit: function () {
        return this._timeslider.getLimit(...arguments);
    },
    yearForward: function () {
        return this._timeslider.yearForward(...arguments);
    },
    yearBack: function () {
        return this._timeslider.yearBack(...arguments);
    },
    setDate: function () {
        return this._timeslider.setDate(...arguments);
    },
    setRange: function () {
        return this._timeslider.setRange(...arguments);
    },
    setRangeUpper: function () {
        return this._timeslider.setRangeUpper(...arguments);
    },
    setRangeLower: function () {
        return this._timeslider.setRangeLower(...arguments);
    },
    isDateWithinRange: function () {
        return this._timeslider.isDateWithinRange(...arguments);
    },
    isDateWithinLimit: function () {
        return this._timeslider.isDateWithinLimit(...arguments);
    },
});


/*
 * THE HASH READER AND WRITER
 * again, a thin wrapper over the real controls TimeSlider.UrlHashReader and TimeSlider.UrlHashWriter
 * rathr than duplicating their logic
 */

L.Control.MBGLTimeSliderUrlHashReader = L.Control.extend({
    options: {
        position: 'topright',  // not really used, there is no visible UI
        timeslidercontrol: undefined,
    },
    initialize: function (options) {
        L.setOptions(this, options);

        const isslider = this.options.timeslidercontrol instanceof L.Control.MBGLTimeSlider;
        if (! isslider) throw `L.Control.MBGLTimeSliderUrlHashWriter timeslidercontrol must point to a  L.Control.MBGLTimeSlider instance`;
    },
    onAdd: function (map) {
        this._map = map;

        // if the URL params contain /zoom/lat/lng then we DO need to apply those here to our parent map
        // if not, then the params are still parsed by the real UrlHashReader and that one layer is panned and zoomed,
        // which gets real silly the first time we pan/zoom the real map!


        const theregex = /^#(\d+\.?\d+)\/(\-?\d+\.\d+)\/(\-?\d+\.\d+)/;
        const thematch = location.hash.match(theregex);
        if (thematch) {
            const zoom = parseFloat(thematch[1]);
            const lat = parseFloat(thematch[2]);
            const lng = parseFloat(thematch[3]);
            this._map.setView([lat, lng], zoom);
        }

        // wait until the Leaflet slider control's MBGL layer has load-ed
        // create the real control (told you, this is but a thin wrapper) and add it to our real MBGL map
        const theglmap = this.options.timeslidercontrol._glmaplayer._glMap;
        theglmap.on('load', () => {
            const therealslider = this.options.timeslidercontrol._timeslider;

            this._realcontrol = new TimeSlider.UrlHashReader({
                timeslidercontrol: therealslider,
                leafletZoomLevelHack: true,
            });
            theglmap.addControl(this._realcontrol);
        });

        // we have no visible UI, but we are required to create a container DIV
        this._container = L.DomUtil.create('div', 'leaflet-control-mbgltimeslider-urlhashreader');
        return this._container;
    },
    onRemove: function () {
        this._map = undefined;

        const theglmap = this.options.timeslidercontrol._glmaplayer._glMap;
        theglmap.removeControl(this._realcontrol);
    },
});

L.Control.MBGLTimeSliderUrlHashWriter = L.Control.extend({
    options: {
        position: 'topright',  // not really used, there is no visible UI
        timeslidercontrol: undefined,
    },
    initialize: function (options) {
        L.setOptions(this, options);

        const isslider = this.options.timeslidercontrol instanceof L.Control.MBGLTimeSlider;
        if (! isslider) throw `L.Control.MBGLTimeSliderUrlHashWriter timeslidercontrol must point to a  L.Control.MBGLTimeSlider instance`;
    },
    onAdd: function (map) {
        this._map = map;

        // wait until the Leaflet slider control's MBGL layer has load-ed
        // create the real control (told you, this is but a thin wrapper) and add it to our real MBGL map
        const theglmap = this.options.timeslidercontrol._glmaplayer._glMap;
        theglmap.on('load', () => {
            const therealslider = this.options.timeslidercontrol._timeslider;

            this._realcontrol = new TimeSlider.UrlHashWriter({
                timeslidercontrol: therealslider,
                leafletZoomLevelHack: true,
            });
            theglmap.addControl(this._realcontrol);
        });

        // we have no visible UI, but we are required to create a container DIV
        this._container = L.DomUtil.create('div', 'leaflet-control-mbgltimeslider-urlhashwriter');
        return this._container;
    },
    onRemove: function () {
        this._map = undefined;

        const theglmap = this.options.timeslidercontrol._glmaplayer._glMap;
        theglmap.removeControl(this._realcontrol);
    },
});
