// demo: South Bronx
// data ranges 1873-2019, but let's start with a narrower window so the user has an excuse to stretch the range
var START_ZOOM = 14.6;
var START_CENTER = [ 40.80623, -73.91894 ];
var OHM_SOURCE = "ohm-data";
var STARTING_DATE = 1920;
var STARTING_RANGE = [ 1890, 1970 ];
var MAX_DATES = [ 1870, 2020 ];

// when the dateslider comes up, let's keep a reference to it so we can fetch/set it externally
var MAP, ohmlayer, dateslider;

document.addEventListener('DOMContentLoaded', function(event) {
    //
    // the basic map and controls
    // the map style is in mapstyle.js
    //

    MAP = L.map('map', {
    })
    .setView(START_CENTER, START_ZOOM);

    ohmlayer = L.mapboxGL({
        style: GLMAP_STYLE,
        accessToken: 'not necessary',
    })
    .addTo(MAP);

    //
    // add the TimeSliderControl to the "ohmlayer"
    //
    dateslider = new L.Control.MBGLTimeSlider({
        mbgllayer: ohmlayer,  // specify the L.mapboxGL layer to filter
        timeSliderOptions: {  // these are passed directly to the Mapbox GL TimeSlider.TimeSliderControl as-given
            sourcename: OHM_SOURCE,
            date: STARTING_DATE,
            datespan: STARTING_RANGE,
            datelimit: MAX_DATES
        },
    })
    .addTo(MAP);

    // that's it!
});
