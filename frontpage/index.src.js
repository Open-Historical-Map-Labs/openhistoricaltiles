import { GLMAP_STYLE } from './mapconstants';
import { MIN_ZOOM, MAX_ZOOM, START_ZOOM, START_CENTER } from './mapconstants';

import { UrlHashControl } from './js/mbgl-control-urlhash';
import { MapHoversControl } from './js/mbgl-control-mousehovers';
import { MapClicksControl } from './js/mbgl-control-mouseclicks';
import { MapDateFilterControl } from './js/mbgl-control-dateslider';
import { WelcomePanelControl } from './js/mbgl-control-welcomepanel';
import { LayerSwitcherControl } from './js/mbgl-control-layerswitcher';
import { GeocoderControl } from './js/mbgl-control-geocoder';
import { GeolocationControl } from './js/mbgl-control-geolocate';

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
    initSetup1();

    MAP.on('load', function () {
        initSetup2();
        initLoadUrlState();
    });
};

function initSetup1 () {
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

    MAP.CONTROLS.WELCOMEPANEL = new WelcomePanelControl({
        htmltext: `
            <h1>Welcome to OpenHistoricalMap!</h1>

            <p>OpenHistoricalMap is a project designed to store and display map data throughout the history of the world. This is a work in progress, we'll be playing around with many new features as we time-enable the site. We encourage you to start playing around and editing data, too.</p>

            <div class="center bold" style="margin-top: 1em;">
                <a href="http://www.openhistoricalmap.org/about">Learn More</a>
                &bull;
                <a href="http://www.openhistoricalmap.org/user/new">Start Mapping</a>
            </div>
        `,
    });
    MAP.addControl(MAP.CONTROLS.WELCOMEPANEL);

    MAP.CONTROLS.LAYERSWITCHER = new LayerSwitcherControl({
        bases: [
            { layerid: 'reference-osm', label: "OSM Basemap", opacity: 0.2 },
            { layerid: 'reference-satellite', label: "Satellite Basemap", opacity: 0.2 },
        ],
        labels: [
            { layerid: 'reference-labels', label: "Streets and Labels", opacity: 0.7 },
        ],
    });
    MAP.addControl(MAP.CONTROLS.LAYERSWITCHER);

    MAP.CONTROLS.GEOCODER = new GeocoderControl();
    MAP.addControl(MAP.CONTROLS.GEOCODER);

    MAP.CONTROLS.GEOLOCATE = new GeolocationControl();
    MAP.addControl(MAP.CONTROLS.GEOLOCATE);
}


function initSetup2() {
    MAP.CONTROLS.DATESLIDER = new MapDateFilterControl({
        // which layers get a date filter prepended to whatever filters are already in place?
        // for us, all of them
        // NOTE that this will change the filters on the layers, prepending a "all" and the start_date/end_date filter
        // and wrapping your other filters into a list starting as element 3
        // e.g. "all", [ "<=", "start_date", "XXXX" ], [ ">=" "end_date", "XXXX" ], [ your other filters here ]
        layers: [
            "landcover-glacier",
            "landuse-residential",
            "landuse-commercial",
            "landuse-industrial",
            "park",
            "park-outline",
            "landuse-cemetery",
            "landuse-hospital",
            "landuse-school",
            "landuse-railway",
            "landcover-wood",
            "landcover-grass",
            "landcover-grass-park",
            "waterway_tunnel",
            "waterway-other",
            "waterway-stream-canal",
            "waterway-river",
            "water-offset",
            "water",
            "water-pattern",
            "landcover-ice-shelf",
            "building",
            "building-top",
            "tunnel-service-track-casing",
            "tunnel-minor-casing",
            "tunnel-secondary-tertiary-casing",
            "tunnel-trunk-primary-casing",
            "tunnel-motorway-casing",
            "tunnel-path",
            "tunnel-service-track",
            "tunnel-minor",
            "tunnel-secondary-tertiary",
            "tunnel-trunk-primary",
            "tunnel-motorway",
            "tunnel-railway",
            "ferry",
            "aeroway-taxiway-casing",
            "aeroway-runway-casing",
            "aeroway-area",
            "aeroway-taxiway",
            "aeroway-runway",
            "highway-area",
            "highway-motorway-link-casing",
            "highway-link-casing",
            "highway-minor-casing",
            "highway-secondary-tertiary-casing",
            "highway-primary-casing",
            "highway-trunk-casing",
            "highway-motorway-casing",
            "highway-path",
            "highway-motorway-link",
            "highway-link",
            "highway-minor",
            "highway-secondary-tertiary",
            "highway-primary",
            "highway-trunk",
            "highway-motorway",
            "railway-transit",
            "railway-transit-hatching",
            "railway-service",
            "railway-service-hatching",
            "railway",
            "railway-hatching",
            "bridge-motorway-link-casing",
            "bridge-link-casing",
            "bridge-secondary-tertiary-casing",
            "bridge-trunk-primary-casing",
            "bridge-motorway-casing",
            "bridge-path-casing",
            "bridge-path",
            "bridge-motorway-link",
            "bridge-link",
            "bridge-secondary-tertiary",
            "bridge-trunk-primary",
            "bridge-motorway",
            "bridge-railway",
            "bridge-railway-hatching",
            "cablecar",
            "cablecar-dash",
            "boundary-land-level-4",
            "boundary-land-level-2",
            "boundary-land-disputed",
            "boundary-water",
            "waterway-name",
            "water-name-lakeline",
            "water-name-ocean",
            "water-name-other",
            "poi-level-3",
            "poi-level-2",
            "poi-level-1",
            "poi-railway",
            "road_oneway",
            "road_oneway_opposite",
            "highway-name-path",
            "highway-name-minor",
            "highway-name-major",
            "highway-shield",
            "highway-shield-us-interstate",
            "highway-shield-us-other",
            "airport-label-major",
            "place-other",
            "place-village",
            "place-town",
            "place-city",
            "place-city-capital",
            "place-country-other",
            "place-country-3",
            "place-country-2",
            "place-country-1",
            "place-continent",
        ],

        // the default dates for the boxes
        // this won't be enforced (yet), so the names "min" and "max" are kind of a misnomer... for the moment
        mindate: "1800-01-01",
        maxdate: "2029-12-31",
    });
    MAP.addControl(MAP.CONTROLS.DATESLIDER);

    MAP.CONTROLS.HASHWATCHER = new UrlHashControl(); // hacked to support MAP.CONTROLS.DATESLIDER
    MAP.addControl(MAP.CONTROLS.HASHWATCHER);
}


function initLoadUrlState() {
    MAP.CONTROLS.HASHWATCHER.applyStateFromAddressBar();
}
