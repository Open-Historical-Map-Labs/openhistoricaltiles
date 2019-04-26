// demo: South Bronx
// data ranges 1873-2019, but let's start with a narrower window so the user has an excuse to stretch the range
var START_ZOOM = 14.6;
var START_CENTER = [-73.91894, 40.80623];
var OHM_SOURCE = "ohm-data";
var STARTING_DATE = 1920;
var STARTING_RANGE = [ 1890, 1970 ];
var MAX_DATES = [ 1870, 2020 ];

// when the dateslider comes up, let's keep a reference to it so we can fetch/set it externally
var dateslider;

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
        dateslider = new TimeSlider.TimeSliderControl({
            sourcename: OHM_SOURCE,
            date: STARTING_DATE,
            datespan: STARTING_RANGE,
            datelimit: MAX_DATES,
            autoExpandRange: true,
            onDateSelect: function (newdate) {
                console.log([ 'date changed', newdate ]);
            },
            onRangeChange: function (newrange) {
                console.log([ 'range changed', newrange[0], newrange[1] ]);
            }
        });
        MAP.addControl(dateslider);
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

        dateslider.setDate(year).setRange([ min, max ]);
    }

    document.querySelector('#whenami button').addEventListener('click', applyExternalYear);

    document.querySelector('#whenami input').addEventListener('keydown', function (event) {
        if (event.keyCode == 13) document.querySelector('#whenami button').click();
    });

    // that's it!
});
