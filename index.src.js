import { GLMAP_STYLE } from './maplayers';

import { UrlHashControl } from './js/mbgl-control-urlhash';
import { MapHoversControl } from './js/mbgl-control-mousehovers';
import { MapClicksControl } from './js/mbgl-control-mouseclicks';

const MIN_ZOOM = 2;
const MAX_ZOOM = 16;
const START_ZOOM = 3;
const START_CENTER = [-99.5, 37.9];

window.MAP = undefined;

$(document).ready(function () {
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

    MAP.HOVERS = new MapHoversControl({
        layers: {
            'ohm-transportation': {
                enter: (mouseevent) => {
                    // console.log(mouseevent.features[0].properties);
                    const tooltip = `Transportation: ${mouseevent.features[0].properties.class}`;
                    MAP.HOVERS.setMapToolTip(tooltip);
                },
                leave: (mouseevent) => {
                    MAP.HOVERS.clearMapToolTip();
                },
            },
            'ohm-poi': {
                enter: (mouseevent) => {
                    // console.log(mouseevent.features[0].properties);
                    const tooltip = `POI: ${mouseevent.features[0].properties.name}`;
                    MAP.HOVERS.setMapToolTip(tooltip);
                },
                leave: (mouseevent) => {
                    MAP.HOVERS.clearMapToolTip();
                },
            },
        }
    });
    MAP.addControl(MAP.HOVERS);


    MAP.CLICKS = new MapClicksControl({
        click: (clickevent) => {
            // collect a set of resultssets by drilling down through the stated layers in the stated sequence
            // each resultset is:
            // - "title" for that set, e.g. Water Features
            // - "features" list of features to be displayed, e.g. from MAP.queryRenderedFeatures()
            // - "template" function to return a HTML string for each feature (function, means can contain conditionals, etc)
            const collected_feature_groups = [
                {
                    title: "Transportation",
                    features: MAP.queryRenderedFeatures(clickevent.point, { layers: [ 'ohm-transportation' ] }),
                    template: function (feature) {
                        return `${feature.properties.class}`;
                    },
                },
                {
                    title: "POIs",
                    features: MAP.queryRenderedFeatures(clickevent.point, { layers: [ 'ohm-poi' ] }),
                    template: function (feature) {
                        return `${feature.properties.name}`;
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


    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // nothing to do here; most behaviors are implemented as Controls
    });
});
