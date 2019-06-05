// demo: South Bronx
// data ranges 1873-2019, but let's start with a narrower window so the user has an excuse to stretch the range
var START_ZOOM = 14.6;
var START_CENTER = [-73.91894, 40.80623];
var OHM_SOURCE = "ohm-data";
var STARTING_DATE = 1920;
var DATE_RANGE = [ -4000, (new Date()).getFullYear() - 1 ];

// when the timeslider comes up, let's keep a reference to it so we can fetch/set it externally
var MAP, timeslider;

document.addEventListener('DOMContentLoaded', function(event) {
    //
    // read the hash from the URL and see if we should override the zoom and center, dates and range
    // UrlHashReader does this too, but AFTER the map has loaded... causing a "flash" of the starting view
    //

    var theregex = /^#(\d+\.?\d+)\/(\-?\d+\.\d+)\/(\-?\d+\.\d+)\//;
    var thematch = location.hash.match(theregex);
    if (thematch) {
        START_ZOOM = parseFloat(thematch[1]);
        START_CENTER = [ parseFloat(thematch[3]), parseFloat(thematch[2]) ];
    }

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
            // set the initial slider range and date selection
            date: STARTING_DATE,
            range: DATE_RANGE,
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

        //
        // and the controls which handle URL hashes
        // one to read the URL hash and apply it to the map, and that's all it does
        // one to keep reading the timeslider and the map, and update the URL hash
        //

        const urlreader = new TimeSlider.UrlHashReader({
            timeslidercontrol: timeslider,
        });
        MAP.addControl(urlreader);

        const urlwriter = new TimeSlider.UrlHashWriter({
            timeslidercontrol: timeslider,
        });
        MAP.addControl(urlwriter);
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
