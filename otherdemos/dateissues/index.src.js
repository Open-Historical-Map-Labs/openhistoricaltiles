import { GLMAP_STYLE } from './mapconstants';

import { UrlHashControl } from './js/mbgl-control-urlhash';
import { MapHoversControl } from './js/mbgl-control-mousehovers';
import { MapClicksControl } from './js/mbgl-control-mouseclicks';

const MIN_ZOOM = 2;
const MAX_ZOOM = 18;
const START_ZOOM = 3;
const START_CENTER = [-99.5, 37.9];

window.MAP = undefined;

window.toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

window.makeOHMUrl = function (feature) {
    // if it's a line or polygon w/ a positive osm_id, it's a way
    // if it's a point w/ a positive osm_id, it's a node
    // if it's a line or polygon w/ a negative osm_id, it's a relation

    let osmtype = 'way';
    if (feature.geometry.type  == 'Point') {
        osmtype = 'node';
    }
    else if (feature.properties.osm_id < 0) {
        osmtype = 'relation';
    }

    const url = `http://www.openhistoricalmap.org/${osmtype}/${feature.properties.osm_id}`;
    return url;
};

window.checkMapForDateIssues = function () {
    // prep work
    // make lists of layer IDs: the real map layers, missing and invalid layers, ...
    const realmaplayers = GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('datemissing-') == -1 && layerinfo.id.indexOf('dateinvalid-') == -1 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });

    const invalidlayers = GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('dateinvalid-') == 0 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });

    const missinglayers = GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('datemissing-') == 0 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });

    // step 1
    // query all rendered features in the viewport, and generate lists of OHM IDs for features with invalid dates and missing dates
    const allvisiblefeatures = MAP.queryRenderedFeatures({
        layers: realmaplayers,
    });

    const re_iso8601 = /^\d\d\d\d\-\d\d\-\d\d$/;

    const features_datemissing = allvisiblefeatures.filter(function (feature) {
        return feature.properties.osm_id && ! feature.properties.start_date && ! feature.properties.end_date;
    });
    const osmid_datemissing = features_datemissing.map(function (feature) { return feature.properties.osm_id; }).unique();
    osmid_datemissing.sort();

    const features_dateinvalid = allvisiblefeatures.filter(function (feature) {
        if (! feature.properties.osm_id) return false;
        if (! feature.properties.start_date && ! feature.properties.end_date) return false;
        if (! feature.properties.start_date.match(re_iso8601)) return true;
        if (! feature.properties.end_date.match(re_iso8601)) return true;
        return false;
    });
    const osmid_dateinvalid = features_dateinvalid.map(function (feature) { return feature.properties.osm_id; }).unique();
    osmid_dateinvalid.sort();

    const features_datelooksok = allvisiblefeatures.filter(function (feature) {
        return feature.properties.osm_id && feature.properties.start_date && feature.properties.end_date && feature.properties.start_date.match(re_iso8601) && feature.properties.end_date.match(re_iso8601);
    });
    const osmid_datelooksok = features_datelooksok.map(function (feature) { return feature.properties.osm_id; }).unique();
    osmid_datelooksok.sort();

    const features_datemissing_unique = []; const seen_missing = {};
    const features_dateinvalid_unique = []; const seen_invalid = {};
    const features_datelooksok_unique = []; const seen_looksok = {};

    features_datemissing.forEach(function (feature) {
        // seen it? skip it. no? we have now
        if (seen_missing[feature.properties.osm_id]) return;
        seen_missing[feature.properties.osm_id] = true;
        features_datemissing_unique.push(feature);
    });
    features_dateinvalid.forEach(function (feature) {
        // seen it? skip it. no? we have now
        if (seen_invalid[feature.properties.osm_id]) return;
        seen_invalid[feature.properties.osm_id] = true;
        features_dateinvalid_unique.push(feature);
    });
    features_datelooksok.forEach(function (feature) {
        // seen it? skip it. no? we have now
        if (seen_looksok[feature.properties.osm_id]) return;
        seen_looksok[feature.properties.osm_id] = true;
        features_datelooksok_unique.push(feature);
    });
    features_datemissing_unique.sort(function (p, q) {
        return p.properties.osm_id < q.properties.osm_id ? -1 : 1;
    });
    features_dateinvalid_unique.sort(function (p, q) {
        return p.properties.osm_id < q.properties.osm_id ? -1 : 1;
    });
    features_datelooksok_unique.sort(function (p, q) {
        return p.properties.osm_id < q.properties.osm_id ? -1 : 1;
    });

    // console.log([ 'OSM IDs Missing dates', osmid_datemissing ]);
    // console.log([ 'OSM IDs Invalid dates', osmid_dateinvalid ]);
    // console.log([ 'OSM IDs Good dates', osmid_datelooksok ]);

    // step 2
    // update those datemissing-X and dateinvalid-X map layers, asserting a new filter to those OSM IDs
    // filter [3] is the 'match' against IDs, and we replace it here
    invalidlayers.forEach(function (layerid) {
        const matchids = osmid_dateinvalid.length ? osmid_dateinvalid : [ -1 ];  // what a nuisance, it can't accept empty lists

        const thesefilters = MAP.getFilter(layerid);
        thesefilters[3] = [ 'match', ['get', 'osm_id'], matchids, true, false ];
        MAP.setFilter(layerid, thesefilters);
    });
    missinglayers.forEach(function (layerid) {
        const matchids = osmid_datemissing.length ? osmid_datemissing : [ -1 ];  // what a nuisance, it can't accept empty lists

        const thesefilters = MAP.getFilter(layerid);
        thesefilters[3] = [ 'match', ['get', 'osm_id'], matchids, true, false ];
        MAP.setFilter(layerid, thesefilters);
    });

    // step 3
    // go through those features with missing/invalid/looksok dates, and load them into the sidebar
    // 
    const howmany = features_datemissing_unique.length + features_dateinvalid_unique.length;
    $('#sidebar-count').text(`${howmany} features`);

    const $readout = $('#sidebar-listing').empty();

    features_dateinvalid_unique.forEach(function (feature) {
        var $div = $('<div class="entry entry-dateinvalid"></div>').appendTo($readout);

        const ohmlink = makeOHMUrl(feature);
        $(`<div class="icon"></div> <a href="${ohmlink}" target="_blank">${feature.properties.osm_id}</a>`).appendTo($div);

        $(`<p>Name: ${feature.properties.name}</p>`).appendTo($div);
        $(`<p>Start Date: ${feature.properties.start_date}</p>`).appendTo($div);
        $(`<p>End Date: ${feature.properties.end_date}</p>`).appendTo($div);
    });
    features_datemissing_unique.forEach(function (feature) {
        var $div = $('<div class="entry entry-datemissing"></div>').appendTo($readout);

        const ohmlink = makeOHMUrl(feature);
        $(`<div class="icon"></div> <a href="${ohmlink}" target="_blank">${feature.properties.osm_id}</a>`).appendTo($div);

        $(`<p>Name: ${feature.properties.name}</p>`).appendTo($div);
        $(`<p>Start Date: ${feature.properties.start_date}</p>`).appendTo($div);
        $(`<p>End Date: ${feature.properties.end_date}</p>`).appendTo($div);
    });
    features_datelooksok_unique.forEach(function (feature) {
        var $div = $('<div class="entry entry-datelooksok"></div>').appendTo($readout);

        const ohmlink = makeOHMUrl(feature);
        $(`<div class="icon"></div> <a href="${ohmlink}" target="_blank">${feature.properties.osm_id}</a>`).appendTo($div);

        $(`<p>Name: ${feature.properties.name}</p>`).appendTo($div);
        $(`<p>Start Date: ${feature.properties.start_date}</p>`).appendTo($div);
        $(`<p>End Date: ${feature.properties.end_date}</p>`).appendTo($div);
    });
};

Array.prototype.unique = function () {
    var result = [], val, ridx;
    outer:
    for (var i = 0, length = this.length; i < length; i++) {
        val = this[i];
        ridx = result.length;
        while (ridx--) {
          if (val === result[ridx]) continue outer;
        }
        result.push(val);
    }
    return result;
};

$(document).ready(function () {
    //
    // add to the map style, the new layers datemissing-X and dateinvalid-X
    // where X is every distinct "source-layer" found in the "ohm-date" source
    // do point, line, and polygon versions for all, even if it sounds silly (a water point, a POI polygon)
    // the hover & click behaviors will look over the layer list for datemissing-X and dateinvalid-X entries and configure itself to them,
    // and the moveend handler which performs filtering, also looks over the layer list for these new layers
    //
    const dateissue_layers = GLMAP_STYLE.layers.map(function (layerinfo) { return layerinfo['source-layer']; }).filter(function (lid) { return lid; }).unique();
    dateissue_layers.forEach(function (sourcelayername) {
        GLMAP_STYLE.layers.push(...[
            {
                "id": `datemissing-${sourcelayername}-polygon`,
                "source": "ohm-data", "source-layer": sourcelayername,
                "type": "fill",
                "paint": {
                    "fill-color": "red"
                },
                "filter": [
                    'all',
                    [ '==', ['geometry-type'], "Polygon" ],
                    [ 'has', 'osm_id' ],
                    [ 'match', ['get', 'osm_id'], [ -1 ], true, false ],
                ],
            },
            {
                "id": `datemissing-${sourcelayername}-line`,
                "source": "ohm-data", "source-layer": sourcelayername,
                "type": "line",
                "paint": {
                    "line-color": "red"
                },
                "filter": [
                    'all',
                    [ '==', ['geometry-type'], "LineString" ],
                    [ 'has', 'osm_id' ],
                    [ 'match', ['get', 'osm_id'], [ -1 ], true, false ],
                ],
            },
            {
                "id": `datemissing-${sourcelayername}-point`,
                "source": "ohm-data", "source-layer": sourcelayername,
                "type": "circle",
                "paint": {
                    "circle-color": "red",
                    "circle-radius": 5,
                },
                "filter": [
                    'all',
                    [ '==', ['geometry-type'], "Point" ],
                    [ 'has', 'osm_id' ],
                    [ 'match', ['get', 'osm_id'], [ -1 ], true, false ],
                ],
            },
            {
                "id": `dateinvalid-${sourcelayername}-polygon`,
                "source": "ohm-data", "source-layer": sourcelayername,
                "type": "fill",
                "paint": {
                    "fill-color": "orange"
                },
                "filter": [
                    'all',
                    [ '==', ['geometry-type'], "Polygon" ],
                    [ 'has', 'osm_id' ],
                    [ 'match', ['get', 'osm_id'], [ -1 ], true, false ],
                ],
            },
            {
                "id": `dateinvalid-${sourcelayername}-line`,
                "source": "ohm-data", "source-layer": sourcelayername,
                "type": "line",
                "paint": {
                    "line-color": "orange"
                },
                "filter": [
                    'all',
                    [ '==', ['geometry-type'], "LineString" ],
                    [ 'has', 'osm_id' ],
                    [ 'match', ['get', 'osm_id'], [ -1 ], true, false ],
                ],
            },
            {
                "id": `dateinvalid-${sourcelayername}-point`,
                "source": "ohm-data", "source-layer": sourcelayername,
                "type": "circle",
                "paint": {
                    "circle-color": "orange",
                    "circle-radius": 5,
                },
                "filter": [
                    'all',
                    [ '==', ['geometry-type'], "Point" ],
                    [ 'has', 'osm_id' ],
                    [ 'match', ['get', 'osm_id'], [ -1 ], true, false ],
                ],
            },
        ]);
    });

    //
    // basic map
    //
    MAP = new mapboxgl.Map({
        container: "map",
        style: GLMAP_STYLE,
        zoom: START_ZOOM,
        center: START_CENTER,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
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

    const hovercallbacks = {};
    GLMAP_STYLE.layers.forEach(function (layerinfo) {
        if (layerinfo.id.indexOf('datemissing-') < 0 && layerinfo.id.indexOf('dateinvalid-') < 0) return;
        hovercallbacks[layerinfo.id] = function (feature) {
            return `${feature.layer.id} :: ${feature.properties.name}`;
        };
    });
    MAP.HOVERS = new MapHoversControl({
        layers: hovercallbacks,
    });
    MAP.addControl(MAP.HOVERS);


    MAP.CLICKS = new MapClicksControl({
        click: (clickevent) => {
            // collect a set of resultssets by drilling down through the stated layers in the stated sequence
            // each resultset is:
            // - "title" for that set, e.g. Water Features
            // - "features" list of features to be displayed, e.g. from MAP.queryRenderedFeatures()
            // - "template" function to return a HTML string for each feature (function, means can contain conditionals, etc)
            //    tip: return a empty string to effectively skip this feature
            // here, we use only one feature group: Where You Clicked

            // automatically compile the list of "clickable" layers in that group,
            // by checking for datemissing-X and dateinvalid-X layers in the style
            const clicklayers = GLMAP_STYLE.layers.filter(function (layerinfo) {
                return layerinfo.id.indexOf('datemissing-') == -1 && layerinfo.id.indexOf('dateinvalid-') == -1 && layerinfo.source == 'ohm-data';
            })
            .map(function (layerinfo) {
                return layerinfo.id;
            });
            const clicked_objectdetails = MAP.queryRenderedFeatures(clickevent.point, {
                layers: clicklayers,
            })
            .filter(function (feature) {
                return feature.properties.osm_id;
            });

            const collected_feature_groups = [
                {
                    title: "Where You Clicked",
                    features: clicked_objectdetails,
                    template: function (feature) {
                        const ohmlink = makeOHMUrl(feature);

                        let infohtml = `<br/>OSM ID: <a href="${ohmlink}" target="_blank">${feature.properties.osm_id}</a>`;
                        infohtml += `<br/>Name: ${feature.properties.name}`;
                        infohtml += `<br/>Start Date: ${feature.properties.start_date}`;
                        infohtml += `<br/>End Date: ${feature.properties.end_date}`;
                        infohtml += `<br/>Map Layer: ${feature.layer.id}`;

                        return infohtml;
                    },
                },
            ];

            // ready; hand off
            MAP.CLICKS.displayFeatures(collected_feature_groups);
        },
    });
    MAP.addControl(MAP.CLICKS);

    MAP.HASHWATCHER = new UrlHashControl();
    MAP.addControl(MAP.HASHWATCHER);

    // the heart of this app
    // whenever the map is moved, get all the rendered features and examine their start_date and end_date
    // and collect lists of those features where either date is not in YYYY-MM-DD format (ISO 8601)
    MAP.on('moveend', function() {
        checkMapForDateIssues();
    });

    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // fire that scanner for invalid dates in the viewport
        checkMapForDateIssues();
    });
});
