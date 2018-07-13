import { GLMAP_STYLE } from './maplayers';

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
            //
            // buildings; no name, but a type
            //
            'building': function (feature) {
                return toTitleCase(feature.properties.building.replace(/_/g, ' '));
            },
            //
            // water; has a proper name field
            //
            'water': function (feature) {
                return feature.properties.name;
            },
            //
            // POIs; no name, but a type
            //
            'poi-level-3': function (feature) {
                return feature.properties.name;
            },
            'poi-level-2': function (feature) {
                return feature.properties.name;
            },
            'poi-level-1': function (feature) {
                return feature.properties.name;
            },
            'poi-railway': function (feature) {
                return feature.properties.name;
            },
            //
            // Roads etc; have a name
            //
            'tunnel-path': function (feature) {
                return feature.properties.name;
            },
            'tunnel-service-track': function (feature) {
                return feature.properties.name;
            },
            'tunnel-minor': function (feature) {
                return feature.properties.name;
            },
            'tunnel-secondary-tertiary': function (feature) {
                return feature.properties.name;
            },
            'tunnel-trunk-primary': function (feature) {
                return feature.properties.name;
            },
            'tunnel-motorway': function (feature) {
                return feature.properties.name;
            },
            'tunnel-railway': function (feature) {
                return feature.properties.name;
            },
            'ferry': function (feature) {
                return feature.properties.name;
            },
            'highway-area': function (feature) {
                return feature.properties.name;
            },
            'highway-path': function (feature) {
                return feature.properties.name;
            },
            'highway-motorway-link': function (feature) {
                return feature.properties.name;
            },
            'highway-link': function (feature) {
                return feature.properties.name;
            },
            'highway-minor': function (feature) {
                return feature.properties.name;
            },
            'highway-secondary-tertiary': function (feature) {
                return feature.properties.name;
            },
            'highway-primary': function (feature) {
                return feature.properties.name;
            },
            'highway-trunk': function (feature) {
                return feature.properties.name;
            },
            'highway-motorway': function (feature) {
                return feature.properties.name;
            },
            'railway-transit': function (feature) {
                return feature.properties.name;
            },
            'railway-service': function (feature) {
                return feature.properties.name;
            },
            'railway': function (feature) {
                return feature.properties.name;
            },
            'bridge-path': function (feature) {
                return feature.properties.name;
            },
            'bridge-motorway-link': function (feature) {
                return feature.properties.name;
            },
            'bridge-link': function (feature) {
                return feature.properties.name;
            },
            'bridge-secondary-tertiary': function (feature) {
                return feature.properties.name;
            },
            'bridge-trunk-primary': function (feature) {
                return feature.properties.name;
            },
            'bridge-motorway': function (feature) {
                return feature.properties.name;
            },
            'bridge-railway': function (feature) {
                return feature.properties.name;
            },
            'cablecar': function (feature) {
                return feature.properties.name;
            },
            'road_oneway': function (feature) {
                return feature.properties.name;
            },
            'road_oneway_opposite': function (feature) {
                return feature.properties.name;
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
                /*
                {
                    title: "Buildings",
                    features: MAP.queryRenderedFeatures(clickevent.point, { layers: [ 'building' ] }),
                    template: function (feature) {
                        console.log([ 'building', feature.properties ]);
                        return `${feature.properties.class}`;
                    },
                },
                */
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
