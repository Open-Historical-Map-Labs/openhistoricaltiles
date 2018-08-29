import { GLMAP_STYLE } from './mapconstants';

import { UrlHashControl } from './js/mbgl-control-urlhash';
import { MapHoversControl } from './js/mbgl-control-mousehovers';
import { MapClicksControl } from './js/mbgl-control-mouseclicks';

const MIN_ZOOM = 2;
const MAX_ZOOM = 16;
const START_ZOOM = 3;
const START_CENTER = [-99.5, 37.9];

window.MAP = undefined;

window.toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
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
                    [ 'match', ['id'], [ -1 ], true, false ],
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
                    [ 'match', ['id'], [ -1 ], true, false ],
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
                    [ 'match', ['id'], [ -1 ], true, false ],
                ],
            },
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
                    [ 'match', ['id'], [ -1 ], true, false ],
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
                    [ 'match', ['id'], [ -1 ], true, false ],
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
                    [ 'match', ['id'], [ -1 ], true, false ],
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
            const collected_feature_groups = [
                {
                    title: "Object Details",
                    features: MAP.queryRenderedFeatures(clickevent.point, {
                        // automatically compile the list of "clickable" layers in this group,
                        // by checking for datemissing-X and dateinvalid-X layers in the style
                        layers: GLMAP_STYLE.layers.filter(function (layerinfo) {
                                        return layerinfo.id.indexOf('datemissing-') == 0 || layerinfo.id.indexOf('dateinvalid-');
                                    }).map(function (layerinfo) {
                                        return layerinfo.id;
                                    })
                    }).filter(function (feature) { return feature.properties.osm_id; }),
                    template: function (feature) {
                        let infohtml = `<br/>OSM ID: ${feature.properties.osm_id}`;
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
        // step 1: collect lists of features with a missing date or an badly-formatted date
        const list_datemissing = [];
        const list_dateinvalid = [];

        const re_iso8601 = /^\d\d\d\d\-\d\d\-\d\d$/;

        MAP.queryRenderedFeatures()
        .forEach(function (feature) {
            if (! feature.properties.osm_id) return;  // not a OHM feature, so no dates and no way to fix them if there were

            if (! feature.properties.start_date || ! feature.properties.end_date) {
                list_datemissing.push(feature);
            }
            else if (! feature.properties.start_date.match(re_iso8601) || ! feature.properties.end_date.match(re_iso8601)) {
                list_dateinvalid.push(feature);
            }
        });
        // console.log([ 'no date', list_datemissing ]);
        // console.log([ 'bad date', list_dateinvalid ]);

        // step 2: apply a filter to the relevant map layers (which we dynamically created above)
        // filters[3] is the match-ID filter which we will rewrite
        // MB GL's filtering is a nuisance as far as stability: the array list must be unique AND cannot be empty
        const list_datemissing_id = list_datemissing.map(feature => feature.id).unique();
        const list_dateinvalid_id = list_dateinvalid.map(feature => feature.id).unique();
        if (! list_datemissing_id.length) list_datemissing_id.push(-1);
        if (! list_dateinvalid_id.length) list_dateinvalid_id.push(-1);

        GLMAP_STYLE.layers.forEach(function (layerinfo) {
            if (layerinfo.id.indexOf('dateinvalid-') !== 0) return;  // only to the dateissues layers

            const thesefilters = MAP.getFilter(layerinfo.id);
            thesefilters[3] = [ 'match', ['id'], list_dateinvalid_id, true, false ];
            MAP.setFilter(layerinfo.id, thesefilters);
        });

        GLMAP_STYLE.layers.forEach(function (layerinfo) {
            if (layerinfo.id.indexOf('datemissing-') !== 0) return;  // only to the dateissues layers

            const thesefilters = MAP.getFilter(layerinfo.id);
            thesefilters[3] = [ 'match', ['id'], list_datemissing_id, true, false ];
            MAP.setFilter(layerinfo.id, thesefilters);
        });
    });

    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // fire that scanner for invalid dates in the viewport
        MAP.fire('moveend');
    });
});
