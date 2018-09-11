import { GLMAP_STYLE } from './mapconstants';

import { UrlHashControl } from './js/mbgl-control-urlhash';
import { MapHoversControl } from './js/mbgl-control-mousehovers';
import { MapClicksControl } from './js/mbgl-control-mouseclicks';
import { MapDateFilterControl } from './js/mbgl-control-dateslider';

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

    MAP.HOVERS = new MapHoversControl({
        layers: {
            //
            // buildings; no name, but a type
            //
            'building': function (feature) {
                return toTitleCase(feature.properties.building.replace(/_/g, ' '));
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
                            infohtml += `<br/>OSM ID: ${feature.properties.osm_id}`;
                        }

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
                            infohtml += `<br/>OSM ID: ${feature.properties.osm_id}`;
                        }

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
                        let infohtml = "";
                        switch (feature.layer.id) {
                            case 'building':
                                infohtml = toTitleCase(feature.properties.building.replace(/_/g, ' '));
                                break;
                            default:
                                infohtml = `${feature.properties.name}`;
                                break;
                        }

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
                            infohtml += `<br/>OSM ID: ${feature.properties.osm_id}`;
                        }

                        return infohtml;
                    },
                },
            ];

            // ready; hand off
            MAP.CLICKS.displayFeatures(collected_feature_groups);
        },
    });
    MAP.addControl(MAP.CLICKS);

    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // the date slider does involve mutating the filters, and that's most safely done after the layers are clearly loaded onto the map
        MAP.DATESLIDER = new MapDateFilterControl({
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
            mindate: "2008-01-01",
            maxdate: "2010-12-31",

            // a few custom hooks whenever the dates change
            onChange: function () {
                MAP.HASHWATCHER.updateUrlHashFromMap();
            },
        });
        MAP.addControl(MAP.DATESLIDER);

        // now that we're ready, apply the hash which will in turn trigger the dateslider control
        MAP.HASHWATCHER = new UrlHashControl(); // hacked to include MapDateFilterControl as a param
        MAP.addControl(MAP.HASHWATCHER);

        // this hack shouldn't be necessary, but MBGL is buggy so here it is...
        setTimeout(function () {
            MAP.DATESLIDER.applyDateFiltering();
        }, 1000);
    });
});
