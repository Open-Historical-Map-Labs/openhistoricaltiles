import { GLMAP_STYLE } from './mapconstants';
import { MIN_ZOOM, MAX_ZOOM, START_ZOOM, START_CENTER } from './mapconstants';

import { UrlHashControl } from './js/mbgl-control-urlhash';
import { MapHoversControl } from './js/mbgl-control-mousehovers';
import { MapClicksControl } from './js/mbgl-control-mouseclicks';
import { MapDateFilterControl } from './js/mbgl-control-dateslider';
import { InstructionsPanelControl } from './js/mbgl-control-instructionpanel';

window.MAP = undefined; // this will be THE map

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

window.onload = function() {
    //
    // basic map
    // and a container for those custom controls, which we may need to refer to later
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

    MAP.CONTROLS = {};

    MAP.CONTROLS.HOVERS = new MapHoversControl({
        layers: {
            //
            // buildings; no name, but a type
            //
            'building': function (feature) {
                return feature.properties.name;
            },
            //
            // water (bodies); has a proper name field
            //
            'water': function (feature) {
                return feature.properties.name;
            },

            //
            // waterways; have a name field
            //
            'waterway_tunnel': function (feature) {
                return feature.properties.name;
            },
            'waterway-other': function (feature) {
                return feature.properties.name;
            },
            'waterway-stream-canal': function (feature) {
                return feature.properties.name;
            },
            'waterway-river': function (feature) {
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
    MAP.addControl(MAP.CONTROLS.HOVERS);

    MAP.CONTROLS.CLICKS = new MapClicksControl({
        click: (clickevent) => {
            // collect a set of resultssets by drilling down through the stated layers in the stated sequence
            // each resultset is:
            // - "title" for that set, e.g. Water Features
            // - "features" list of features to be displayed, e.g. from MAP.queryRenderedFeatures()
            // - "template" function to return a HTML string for each feature (function, means can contain conditionals, etc)
            //    tip: return a empty string to effectively skip this feature
            const collected_feature_groups = [
                {
                    title: "Roads, Rails, and Routes",
                    features: MAP.queryRenderedFeatures(clickevent.point, {
                        layers: [
                            'highway-primary',
                            'highway-trunk',
                            'highway-secondary-tertiary',
                            'highway-motorway',
                            'highway-minor',
                            'highway-motorway-link',
                            'highway-link',
                            'bridge-motorway-link',
                            'bridge-link',
                            'bridge-secondary-tertiary',
                            'bridge-trunk-primary',
                            'bridge-motorway',
                            'railway-transit',
                            'railway-service',
                            'railway',
                            'bridge-railway',
                            'tunnel-path',
                            'tunnel-service-track',
                            'tunnel-minor',
                            'tunnel-secondary-tertiary',
                            'tunnel-trunk-primary',
                            'tunnel-motorway',
                            'tunnel-railway',
                            'ferry',
                            'cablecar',
                            'road_oneway',
                            'road_oneway_opposite',
                        ],
                    }),
                    template: function (feature) {
                        let infohtml = `${feature.properties.name}`;

                        // add date info, if we have any
                        if (feature.properties.start_date && feature.properties.end_date) {
                            infohtml += `<br/>From ${feature.properties.start_date} to ${feature.properties.end_date}`;
                        }
                        else if (feature.properties.start_date) {
                            infohtml += `<br/>Starting ${feature.properties.start_date}`;
                        }
                        else if (feature.properties.end_date) {
                            infohtml += `<br/>Until ${feature.properties.end_date}`;
                        }

                        // add OSM ID, if it has one
                        if (feature.properties.osm_id) {
                            const ohmlink = makeOHMUrl(feature);
                            infohtml += `<br/>OSM ID: <a target="_blank" href="${ohmlink}">${feature.properties.osm_id}</a>`;
                        }

                        // add the layer ID where this was found, to aid in debugging what's what
                        infohtml += `<br/>Layer: ${feature.layer.id}`;

                        return infohtml;
                    },
                },
                {
                    title: "Water Features",
                    features: MAP.queryRenderedFeatures(clickevent.point, {
                        layers: [
                            'water',
                            'waterway_tunnel',
                            'waterway-other',
                            'waterway-stream-canal',
                            'waterway-river',
                        ],
                    }),
                    template: function (feature) {
                        let infohtml = `${feature.properties.name}`;

                        // add date info, if we have any
                        if (feature.properties.start_date && feature.properties.end_date) {
                            infohtml += `<br/>From ${feature.properties.start_date} to ${feature.properties.end_date}`;
                        }
                        else if (feature.properties.start_date) {
                            infohtml += `<br/>Starting ${feature.properties.start_date}`;
                        }
                        else if (feature.properties.end_date) {
                            infohtml += `<br/>Until ${feature.properties.end_date}`;
                        }

                        // add OSM ID, if it has one
                        if (feature.properties.osm_id) {
                            const ohmlink = makeOHMUrl(feature);
                            infohtml += `<br/>OSM ID: <a target="_blank" href="${ohmlink}">${feature.properties.osm_id}</a>`;
                        }

                        // add the layer ID where this was found, to aid in debugging what's what
                        infohtml += `<br/>Layer: ${feature.layer.id}`;

                        return infohtml;
                    },
                },
                {
                    title: "Points of Interest",
                    features: MAP.queryRenderedFeatures(clickevent.point, {
                        layers: [
                            'poi-level-3',
                            'poi-level-2',
                            'poi-level-1',
                            'poi-railway',
                            'building',
                        ],
                    }),
                    template: function (feature) {
                        let infohtml = `${feature.properties.name}`;

                        // add date info, if we have any
                        if (feature.properties.start_date && feature.properties.end_date) {
                            infohtml += `<br/>From ${feature.properties.start_date} to ${feature.properties.end_date}`;
                        }
                        else if (feature.properties.start_date) {
                            infohtml += `<br/>Starting ${feature.properties.start_date}`;
                        }
                        else if (feature.properties.end_date) {
                            infohtml += `<br/>Until ${feature.properties.end_date}`;
                        }

                        // add OSM ID, if it has one
                        if (feature.properties.osm_id) {
                            const ohmlink = makeOHMUrl(feature);
                            infohtml += `<br/>OSM ID: <a target="_blank" href="${ohmlink}">${feature.properties.osm_id}</a>`;
                        }

                        // add the layer ID where this was found, to aid in debugging what's what
                        infohtml += `<br/>Layer: ${feature.layer.id}`;

                        return infohtml;
                    },
                },
            ];

            // ready; hand off
            MAP.CONTROLS.CLICKS.displayFeatures(collected_feature_groups);
        },
    });
    MAP.addControl(MAP.CONTROLS.CLICKS);
};
