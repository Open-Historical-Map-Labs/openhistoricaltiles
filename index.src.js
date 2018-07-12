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
            'highway-area': function (feature) {
                return 'street';
            },
            'highway-path': function (feature) {
                return 'Street';
            },
            'highway-motorway-link': function (feature) {
                return 'Street';
            },
            'highway-link': function (feature) {
                return 'Street';
            },
            'highway-minor': function (feature) {
                return 'Street';
            },
            'highway-secondary-tertiary': function (feature) {
                return 'Street';
            },
            'highway-primary': function (feature) {
                return 'Street';
            },
            'highway-trunk': function (feature) {
                return 'Street';
            },
            'waterway-other': function (feature) {
                return 'Water';
            },
            'waterway-stream-canal': function (feature) {
                return 'Water';
            },
            'waterway-river': function (feature) {
                return 'Water';
            },
            'water-pattern': function (feature) {
                return 'Water';
            },
            'highway-name-path': function (feature) {
                return feature.properties.name;
            },
            'highway-name-minor': function (feature) {
                return feature.properties.name;
            },
            'highway-name-major': function (feature) {
                return feature.properties.name;
            },
            'waterway-name': function (feature) {
                return feature.properties.name;
            },
            'water-name-lakeline': function (feature) {
                return feature.properties.name;
            },
            'water-name-ocean': function (feature) {
                return feature.properties.name;
            },
            'water-name-other': function (feature) {
                return feature.properties.name;
            },
            'highway-motorway': function (feature) {
                return 'Street';
            },
            'railway-transit': function (feature) {
                return 'Railway';
            },
            'railway-service': function (feature) {
                return 'Railway';
            },
            'railway': function (feature) {
                return 'Railway';
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
