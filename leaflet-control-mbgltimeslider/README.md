# Open Historical Map: Time Slider Control for Mapbox GL Leaflet

This Leaflet plugin provides a `L.Control.MBGLTimeSlider` interface, to the TimeSlider control for Mapbox GL.

The intended use case is a Leaflet map with a [L.mapboxGL](https://github.com/mapbox/mapbox-gl-leaflet) layer displaying OpenHistoricalMap data.

References:
* [Mapbox GL Leaflet extension for Leaflet](https://github.com/mapbox/mapbox-gl-leaflet)
* [TimeSlider control for Mapbox GL](https://github.com/OpenHistoricalMap/openhistoricaltiles/tree/gh-pages/mbgl-control-timeslider)

The `demo/` folder contains a working demo of a Leaflet map, filtering an OpenHistoricalMap Mapbox GL layer.



## Usage

1. Create a Leaflet map containing a Mapbox GL layer as usual.

2. Include the SCRIPT and LINK tags for _both_ the MBGL TimeSlider control and this Leaflet wrapper:
```
<script src="https://open-historical-map-labs.github.io/openhistoricaltiles/mbgl-control-timeslider/dist/mbgl-control-timeslider.js"></script>
<link href="https://open-historical-map-labs.github.io/openhistoricaltiles/mbgl-control-timeslider/dist/mbgl-control-timeslider.css" rel="stylesheet" />

<script src="dist/leaflet-control-mbgltimeslider.js"></script>
<link rel="stylesheet" href="dist/leaflet-control-mbgltimeslider.css" />
```

3. Add the control to your Leaflet map, configuring which `L.mapboxGL` layer is to be filtered data source should have its layers filtered, and passing other parameters to the `TimeSlider.TimeSliderControl` Be sure to do this on the Mapbox layer's `load` event, like this:
```
var MAP, ohmlayer, dateslider;

MAP = L.map('map', {})
.setView([ 40.80623, -73.91894 ], 14.6);

ohmlayer = L.mapboxGL({
    ... MBGL layer options here, such as API key, style object or URL, et cetera ...
})
.addTo(MAP);

// add the TimeSliderControl tied to the ohmlayer
dateslider = new L.Control.MBGLTimeSlider({
    mbgllayer: ohmlayer,  // specify the L.mapboxGL layer to filter
    timeSliderOptions: {  // these are passed directly to the Mapbox GL TimeSlider.TimeSliderControl as-given
        sourcename: "ohm-data",     // required
        date: 1850,
        range: [1800, 2000],
        datelimit: [1600, 2100],
        onDateSelect: function (newdate) {
            console.log([ 'date changed', newdate ]);
        },
        onRangeChange: function (newrange) {
            console.log([ 'range changed', newrange[0], newrange[1] ]);
        }
    },
})
.addTo(MAP);
```



## Config Options

`mbgllayer` -- The `L.mapboxGL` layer to be filtered

`timeSliderOptions` -- A set of options to be passed to the Mapbox GL `TimeSlider.TimeSliderControl` These are passed as-is. See the [documentation for the TimeSliderControl](https://github.com/OpenHistoricalMap/openhistoricaltiles/tree/gh-pages/mbgl-control-timeslider) for details.

`position` -- Set the Leaflet Control Position for the control, e.g. `bottomright`. Use this instead of `timeSliderOptions.position`


## Methods

All `L.Control.TimeSliderControl` methods are simply those of the Mapbox GL `TimeSlider.TimeSliderControl` and all arguments are passed to the underlying control as-is. See the [documentation for the TimeSliderControl](https://github.com/OpenHistoricalMap/openhistoricaltiles/tree/gh-pages/mbgl-control-timeslider) for details.


## Additional Tools: URLHashReader and URLHashWriter

People have become accustomed to having the map state reflected in the URL hash as they change it, and for page loading to implicitly include loading the URL hash into the starting map view.

To facilitate this behavior in your application, we provide `L.Control.MBGLTimeSliderUrlHashReader` and `L.Control.MBGLTimeSliderUrlHashWriter`

### MBGLTimeSliderUrlHashReader

The `L.Control.MBGLTimeSliderUrlHashReader` control, when added to your map, will do one thing: read and apply the URL hash params.

The expected URL hash would be structured like this example: `#16.6/40.8217108/-73.9119449/1980,1970-2000`
* The zoom level, which may be integer or fractional.
* The latitude of the starting map view's center.
* The longitude of the starting map view's center.
* The MBGLTimeSlider settings: the selected date, then the range.

The MBGLTimeSliderUrlHashReader has only one constructor option: `timeslidercontrol` which points to the MBGLTimeSlider that it should set.

```
const urlreader = new L.Control.MBGLTimeSliderUrlHashReader({
    timeslidercontrol: timeslider,
});
MAP.addControl(urlreader);
```

After it has set the map view and MBGLTimeSlider date and range, the `TimeSlider.URLHashReader` control has no other effect, and has no visible user interface.

### MBGLTimeSliderUrlHashWriter

The `L.Control.MBGLTimeSliderUrlHashWriter` control continuously tracks changes to the map view and/or to the MBGLTimeSlider settings, and updates the URL hash in the address bar. When used in conjunction with `MBGLTimeSliderUrlHashReader`, the effect is that one may reload the page and automagically have their previous view applied on page load.

The MBGLTimeSliderUrlHashWriter has only one constructor option: `timeslidercontrol` which points to the MBGLTimeSlider that it should be tracking.

```
const urlwriter = new TimeSlider.L.Control.MBGLTimeSliderUrlHashWriter({
    timeslidercontrol: timeslider,
});
MAP.addControl(urlwriter);
```

The MBGLTimeSliderUrlHashWriter has no visible UI control. It will stop updating the URL if it is removed from the map via `MAP.removeControl()`


## For Developers

Again, note that this is just a wrapper for the Mapbox GL `TimeSlider.TimeSliderControl` so if you're trying to alter functionality or styling of the time slider, you should probably be making edits to that code instead.

Babel, SASS/SCSS, Webpack.

Most edits would be made to these files:
* `leaflet-control-mbgltimeslider-control.js` -- the widget's JavaScript source code
* `leaflet-control-mbgltimeslider-control.scss` -- the widget's SASS stylesheet

Commands of note:
* `nvm install && nvm use && yarn install` -- first-time project setup to set up the proper version of Node and the dependencies; you probably only need to do this the first time you set up, after you `git clone` the repo
* `nvm use && npm run serve` -- select the right Node, then start up a web server and a new browser window; use this in conjunction with `npm run watch` for your day-to-day work
* `npm run build` -- compile the control for distribution and use in other browsers and sites; output goes into the `dist/` folder
* `npm run watch` -- watches for changes to the files listed above, automagically running `npm run build` for you when they are changed

The `dist/` folder is kept in version control, so the ready-to-use control will be readily available on Github.
