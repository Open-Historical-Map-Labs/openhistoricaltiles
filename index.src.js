import { STATES_MIN_ZOOM, COUNTIES_MIN_ZOOM } from './maplayers';
import { GLMAP_STYLE } from './maplayers';

import { TimeSliderControl } from './js/mbgl-control-timeslider';
import { LayerPickerControl } from './js/mbgl-control-layerpicker';
import { MapHoversControl } from './js/mbgl-control-mousehovers';
import { MapClicksControl } from './js/mbgl-control-mouseclicks';
import { InspectorPanelControl } from './js/mbgl-control-inspectorpanel';

const MIN_ZOOM = 3;
const MAX_ZOOM = 10;
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

    // for this demo, the Newberry data
    // 1629 is the Plymouth land grant, the first county/township
    // 1783 is the Treaty of Paris, where US states became legit (despite the US saying they were legit in 1776)
    MAP.TIMESLIDER = new TimeSliderControl({
        year: 1783,
        min: 1630,
        max: 2000,
        step: 1,
        play_years: 5,
        maplayerids: [ 'state-boundaries-historical', 'county-boundaries-historical' ],
    });
    MAP.addControl(MAP.TIMESLIDER);

    MAP.LAYERPICKER = new LayerPickerControl();
    MAP.addControl(MAP.LAYERPICKER);

    MAP.INSPECTORPANEL = new InspectorPanelControl({
        templates: {
            'states-modern': function (feature) {
                return `${feature.properties.STATE_NAME}`;
            },
            'counties-modern': function (feature) {
                return `${feature.properties.NAME} County`;
            },
            'states-historical': function (feature) {
                return `
                    <b>${feature.properties.NAME}, ${feature.properties.START} - ${feature.properties.END != '9999/12/31' ? feature.properties.END : 'Present'}</b>
                    <br/>
                    <div class="small">${feature.properties.CHANGE} ${feature.properties.CITATION}</div>
                `;
            },
            'counties-historical': function (feature) {
                return `
                    <b>${feature.properties.NAME}, ${feature.properties.START} - ${feature.properties.END != '9999/12/31' ? feature.properties.END : 'Present'}</b>
                    <br/>
                    <div class="small">${feature.properties.CHANGE} ${feature.properties.CITATION}</div>
                `;
            },
        }
    });
    MAP.addControl(MAP.INSPECTORPANEL);

    MAP.HOVERS = new MapHoversControl({
        layers: {
            'state-boundaries-historical': {
                enter: function (mouseevent) {
                    // there's a highlight layer: same data as state boundaries, but alternative style to be shown in conjunction with the visible one
                    const featureid = mouseevent.features[0].properties.IDNUM;
                    const tooltip = mouseevent.features[0].properties.NAME;
                    MAP.setFilter('state-boundaries-historical-hover', [ "==", "IDNUM", featureid ]);
                    document.getElementById('map').title = tooltip;
                    MAP.getCanvas().style.cursor = 'crosshair';
                },
                leave: function (mouseevent) {
                    MAP.setFilter('state-boundaries-historical-hover', [ "==", "IDNUM", -1 ]);
                    document.getElementById('map').title = "";
                    MAP.getCanvas().style.cursor = 'inherit';
                },
            },
            'county-boundaries-historical': {
                enter: function (mouseevent) {
                    // there's a highlight layer: same data as county boundaries, but alternative style to be shown in conjunction with the visible one
                    const featureid = mouseevent.features[0].properties.IDNUM;
                    const tooltip = mouseevent.features[0].properties.NAME;
                    MAP.setFilter('county-boundaries-historical-hover', [ "==", "IDNUM", featureid ]);
                    document.getElementById('map').title = tooltip;
                    MAP.getCanvas().style.cursor = 'crosshair';
                },
                leave: function (mouseevent) {
                    MAP.setFilter('county-boundaries-historical-hover', [ "==", "IDNUM", -1 ]);
                    document.getElementById('map').title = "";
                    MAP.getCanvas().style.cursor = 'inherit';
                },
            },
        }
    });
    MAP.addControl(MAP.HOVERS);

    MAP.CLICKS = new MapClicksControl({
        click: function (clickevent) {
            // one layer at a time, compile the history of thisd point location
            // past state/territory status and modern state
            // past county/township status and modern county
            // the inspector panel expects a list of result sets, with a title and a list of results and a spec as to which layout template to use
            //
            // warning: a known "feature" of vector tile querying like this, is that it ONLY OPERATES ON WHAT'S VISIBLE IN THE VIEWPORT
            // e.g. no counties until you've zoomed in
            const collected_feature_groups = [
                {
                    title: "Present Day",
                    template: 'states-modern',
                    features: MAP.queryRenderedFeatures(clickevent.point, { layers: [ 'states-modern-clickable' ] }),
                },
                {
                    title: "Present County/Township",
                    template: 'counties-modern',
                    features: MAP.queryRenderedFeatures(clickevent.point, { layers: [ 'counties-modern-clickable' ] }),
                },
                {
                    title: "Historical State/Territory",
                    template: 'states-historical',
                    features: MAP.queryRenderedFeatures(clickevent.point, { layers: [ 'states-historical-clickable' ] }),
                },
                {
                    title: "Historical County/Township",
                    template: 'counties-historical',
                    features: MAP.queryRenderedFeatures(clickevent.point, { layers: [ 'counties-historical-clickable' ] }),
                },
            ];

            // unique-ify each set of features by its IDNUM; MBGL is documented to return duplicates when features span tiles
            // the modern datasets lack an IDNUM which is okay: there will only be one feature (if any), with a key of undefined, so we still end up with 1 feature afterward (if any)
            collected_feature_groups.forEach(function (featuregroup) {
                const uniques = {};
                featuregroup.features.forEach(function (feature) {
                    uniques[feature.properties.IDNUM] = feature;
                });
                featuregroup.features = Object.values(uniques);
            });
            collected_feature_groups.forEach(function (featuregroup) {
                switch (featuregroup.template) {
                    case 'counties-historical':
                    case 'states-historical':
                        featuregroup.features.sort(function (p, q) {
                            return p.properties.START < q.properties.START ? 1 : -1;
                        });
                        break;
                }
            });

            // ready; hand off
            MAP.INSPECTORPANEL.loadFeatures(collected_feature_groups);
        },
    });
    MAP.addControl(MAP.CLICKS);

    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // nothing else to do here; controls all have their own map.load handlers to fire up their dynamic actions
        // this is where one would load a querystring/hash to set up initial state: filtering and layer visibility, etc.
    });
});
