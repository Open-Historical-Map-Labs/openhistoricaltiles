import { GLMAP_STYLE } from './maplayers';

import { UrlHashControl } from './js/mbgl-control-urlhash';
import { MapHoversControl } from './js/mbgl-control-mousehovers';
import { MapClicksControl } from './js/mbgl-control-mouseclicks';
import { InspectorPanelControl } from './js/mbgl-control-inspectorpanel';

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

/*
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
*/

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


/*
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
*/

    MAP.HASHWATCHER = new UrlHashControl();
    MAP.addControl(MAP.HASHWATCHER);


    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // nothing to do here; most behaviors are implemented as Controls
    });
});
