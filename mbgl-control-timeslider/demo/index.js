// demo: South Bronx
// data ranges 1873-2019, but let's start with a narrower window so the user has an excuse to stretch the range
var START_ZOOM = 14.6;
var START_CENTER = [-73.91894, 40.80623];
var OHM_SOURCE = "ohm-data";
var STARTING_DATE = 1920;
var STARTING_RANGE = [ 1890, 1970 ];
var MAX_DATES = [ 1870, 2020 ];

// when the timeslider comes up, let's keep a reference to it so we can fetch/set it externally
var MAP, timeslider;

document.addEventListener('DOMContentLoaded', function(event) {
    //
    // the basic map and controls
    // the map style is in mapstyle.js
    //

    MAP = new mapboxgl.Map({
        container: "map",
        style: GLMAP_STYLE,
        zoom: START_ZOOM,
        center: START_CENTER
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

    //
    // add our date slider in the map's load event
    //

    MAP.on('load', function () {
        timeslider = new TimeSlider.TimeSliderControl({
            // set the data source to define which layers will be filtered
            sourcename: OHM_SOURCE,
            // set the initial slider range and date filter, and the maximum range of dates the slider may be adjusted
            date: STARTING_DATE,
            datespan: STARTING_RANGE,
            datelimit: MAX_DATES,
            // load an alternative CSS stylesheet and icons for the buttons
            //loadIconStyleSheet: "https://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap-glyphicons.css",
            //iconClassForward: "glyphicon glyphicon-chevron-right",
            //iconClassBack: "glyphicon glyphicon-chevron-left",
            //iconClassHome: "glyphicon glyphicon-repeat",
            // this calling page can also take actions when the date or range are changed
            onDateSelect: function (newdate) {
                console.log([ 'date changed', newdate ]);
            },
            onRangeChange: function (newrange) {
                console.log([ 'range changed', newrange[0], newrange[1] ]);
            }
        });
        MAP.addControl(timeslider);
    });

    //
    // example of a custom UI which can affect the TimeSliderControl
    //

    function applyExternalYear () {
        var year = document.querySelector('#whenami input').value;
        if (! year) return;

        year = parseInt(year);
        var min = year - 10;
        var max = year + 10;

        timeslider.setDate(year).setRange([ min, max ]);
    }

    document.querySelector('#whenami button').addEventListener('click', applyExternalYear);

    document.querySelector('#whenami input').addEventListener('keydown', function (event) {
        if (event.keyCode == 13) document.querySelector('#whenami button').click();
    });

    // that's it!
});
