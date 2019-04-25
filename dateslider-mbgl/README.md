# Open Historical Map: Time Slider Control for Mabox GL JS API

The `demo/` folder contains a working demo of a OpenHistoricalMap basemap working with this timeslider control.



## Usage

1. Create a MBGL map as usual.

2. Include the SCRIPT and LINK tags for the control:
```
<script src="dist/mbgl-control-timeslider.js"></script>
<link rel="stylesheet" href="dist/mbgl-control-timeslider.css" />
```

3. Add the control to your MBGL map, configuring which data source should have its layers filtered. That is, specify which of the `sources` in your map style, is the OpenHistoricaMap's vector tile service at https://vtiles.openhistoricalmap.org/. This should be done after your map's `load` event has fired, like this:
```
var dateslider;

MAP.on('load', function () {
    dateslider = new TimeSlider({
        sourcename: "ohm-data",     // required
        date: 1850,
        datespan: [1800, 2000],
        datelimit: [1600, 2100],
        onDateSelect: function (newdate) {
            console.log([ 'date changed', newdate ]);
        },
        onRangeChange: function (newrange) {
            console.log([ 'range changed', newrange[0], newrange[1] ]);
        }
    });
    MAP.addControl(dateslider);
});
```


## Config Options

`sourcename` -- **Required.** The name of the data source, as defined in your map style's `sources`, which should have its layers filtered by this timeslider. All layers from this source will be presumed to be OpenHistoricalMap (or to be compatible, by virtue of all features having `start_date` and `end_date` properties) and will be filtered.)

`date` -- The initially-selected date when the timeslider UI first appears. This should probably be within the range specified by `datespan`.

`datespan` -- The initial span of dates offered by the timeslider UI when it first appears. This is provides as an array of two numbers, e.g. `[1800, 2000]` If omitted, the range will be set to the last 100 years from the current date (that is, `[ currentyear-100, currentyear]`).

`datelimit` -- A hard limit on the minimum and maximum dates to which the UI may be adjusted. If omitted, this defaults to the same as `datespan` so changing the span is effectively disabled. The `datespan` really should fall wholly within this `datelimit`.

`onDateSelect` -- A callback function which will be called when the date selection changes. The newly-selected date will be passed as a param. Within the callback function, `this` will refer to the timeslider control.

`onRangeChange` -- A callback function which will be called when the date range changes. The newly-available range will be passed as a param. Within the callback function, `this` will refer to the timeslider control.



## Methods

* `getDate()` -- Get the currently-selected date. Returns the date, e.g. `2025`

* `setDate(year)` -- Set the slider to the given date and perform filtering. If the date is outside of the current range, the range will be extended

* `getRange()` -- Get the currently visible date range in the UI. Returns a two-item array of dates, e.g. `[1850, 1950]`

* `setRange([ year, year ])` -- Set the slider's new range. This will respect the `datelimit` limitations.

* `setRangeUpper(year)` -- A convenience function, to call `setRange()` specifying only the upper end of the new range. The lower end will be kept at the current setting.

* `setRangeLower(year)` -- A convenience function, to call `setRange()` specifying only the lower end of the new range. The lower end will be kept at the current setting.

* `isDateWithinRange(year)` -- Return true or false, indicating whether the given date is within the currently offered range in the UI.

* `isDateWithinLimit(year)` -- Return true or false, indicating whether the given date is within the `datelimit` limitations and thus could be legal for `setDate()` et al.



## For Developers

Babel, SASS/SCSS, Webpack.

Most edits would be made to these files:
* `mbgl-control-timeslider-control.js` -- the widget's JavaScript source code3
* `mbgl-control-timeslider-control.scss` -- the widget's SASS stylesheet
* `mbgl-control-timeslider-polyfills.js` -- some additional JavaScript polyfills to add missing functionality
* `mbgl-control-timeslider-entrypoint.js` -- Webpack's entry point which tells it to load the files mentioned above

Commands of note:
* `nvm install && nvm use && yarn install` -- first-time project setup to set up the proper version of Node and the dependencies; you probably only need to do this the first time you set up, after you `git clone` the repo
* `nvm use && npm run serve` -- select the right Node, then start up the Webpack dev server and open a new browser window; use this for your day-to-day work
* `npm run build` -- compile the control for distribution and use in other browsers and sites; output goes into the `dist/` folder

The `dist/` folder is kept in version control, so the ready-to-use control will be readily available on Github.
