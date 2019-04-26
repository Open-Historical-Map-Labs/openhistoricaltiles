require('./leaflet-control-mbgltimeslider-control.scss');

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
    }
});
