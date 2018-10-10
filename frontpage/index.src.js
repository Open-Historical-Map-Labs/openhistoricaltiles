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
    initBadDateLayerCopies();
    initMap1();

    MAP.on('moveend', function() {
        highlightBadDatesOnMap();
    });

    MAP.on('load', function () {
        initMap2();
        initLoadUrlState();
    });
};

window.listRealMapLayers = function () {
    return GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('datemissing-') == -1 && layerinfo.id.indexOf('dateinvalid-') == -1 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });
};
window.listInvalidDateMapLayers = function () {
    return GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('dateinvalid-') == 0 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });
};
window.listMissingDateMapLayers = function () {
    return GLMAP_STYLE.layers.filter(function (layerinfo) {
        return layerinfo.id.indexOf('datemissing-') == 0 && layerinfo.source == 'ohm-data';
    }).map(function (layerinfo) {
        return layerinfo.id;
    });
};

function highlightBadDatesOnMap () {
    // see also the setup in initBadDateLayerCopies() where we created second copies of these layers, same data different style

    // step 0
    // make lists of layer IDs: the real map layers, the copied layers for drawing missing/invalid dates
    const re_iso8601 = /^\d\d\d\d\-\d\d\-\d\d$/;

    const realmaplayers = listRealMapLayers();
    const invalidlayers = listInvalidDateMapLayers();
    const missinglayers = listMissingDateMapLayers();
    // console.log([ 'Map layers to check for bad dates', realmaplayers ]);

    // step 1
    // query all features in the viewport (rendered or not),
    // and generate lists of OHM IDs for features with invalid dates and missing dates
    // lists must be unique-ified, and cannot be empty
    let osmids_invalid = [];
    let osmids_missing = [];
    let osmids_looksok = [];

    realmaplayers.forEach((layerid) => {
        const mapfeatures = MAP.querySourceFeatures('ohm-data', {
            sourceLayer: layerid,
            filter: ['has', 'osm_id'],
        });

        mapfeatures.forEach((feature) => {
            const startdate = feature.properties.start_date;
            const enddate = feature.properties.end_date;
            const osmid = feature.properties.osm_id;

            if (! startdate || ! enddate) {
                osmids_missing.push(osmid);
            }
            else if (! startdate.match(re_iso8601) || ! enddate.match(re_iso8601)) {
                osmids_invalid.push(osmid);
            }
            else {
                osmids_looksok.push(osmid);
            }
        });
    });

    osmids_invalid = osmids_invalid.unique();
    osmids_missing = osmids_missing.unique();
    osmids_looksok = osmids_looksok.unique();

    osmids_invalid.sort();
    osmids_missing.sort();
    osmids_looksok.sort();

    // console.log([ 'OSM IDs Missing dates', osmids_missing ]);
    // console.log([ 'OSM IDs Invalid dates', osmids_invalid ]);
    // console.log([ 'OSM IDs Good dates', osmids_looksok ]);

    if (! osmids_invalid.length) osmids_invalid.push(-1);
    if (! osmids_missing.length) osmids_missing.push(-1);
    if (! osmids_looksok.length) osmids_looksok.push(-1);

    // step 2
    // update those datemissing-X and dateinvalid-X map layers, asserting a new filter to those OSM IDs
    // per initBadDateLayerCopies() filter [3] is the match against osm_id being on a list
    invalidlayers.forEach(function (layerid) {
        const thesefilters = MAP.getFilter(layerid);
        thesefilters[3] = [ 'match', ['get', 'osm_id'], osmids_invalid, true, false ];
        MAP.setFilter(layerid, thesefilters);
    });
    missinglayers.forEach(function (layerid) {
        const thesefilters = MAP.getFilter(layerid);
        thesefilters[3] = [ 'match', ['get', 'osm_id'], osmids_missing, true, false ];
        MAP.setFilter(layerid, thesefilters);
    });
}

function initBadDateLayerCopies () {
    // add to the map style, the new layers datemissing-X and dateinvalid-X
    // where X is every distinct "source-layer" found in the "ohm-date" source
    // do point, line, and polygon versions for all, even if it sounds silly (a water point, a POI polygon)
    // the hover & click behaviors will look over the layer list for datemissing-X and dateinvalid-X entries and configure itself to them,
    // and the moveend handler which performs filtering, also looks over the layer list for these new layers
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
                "layout": {
                    "visibility": "none", // layers are turned off by default, see layerswitcher control for toggling these
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
                "layout": {
                    "visibility": "none", // layers are turned off by default, see layerswitcher control for toggling these
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
                "layout": {
                    "visibility": "none", // layers are turned off by default, see layerswitcher control for toggling these
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
                "layout": {
                    "visibility": "none", // layers are turned off by default, see layerswitcher control for toggling these
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
                "layout": {
                    "visibility": "none", // layers are turned off by default, see layerswitcher control for toggling these
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
                "layout": {
                    "visibility": "none", // layers are turned off by default, see layerswitcher control for toggling these
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
}

function initMap1 () {
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

    MAP.CONTROLS.GEOLOCATE = new GeolocationControl();
    MAP.addControl(MAP.CONTROLS.GEOLOCATE);

    MAP.CONTROLS.GEOCODER = new GeocoderControl();
    MAP.addControl(MAP.CONTROLS.GEOCODER);

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
}


function initMap2() {
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
