/*
 * A MB Style object, used as-is by the Mapbox GL map define layers, styles, basemap options, etc
 * Broken into a separate file for more modular version control, so design folks can mess with it with fewer merge conflicts
 * This file being a JSON-like structure, but not a JSON document, we have certain liberties such as commenting and variable interpolation.
 *
 * While this structure can be READ at startup to create UI etc,
 * the official source of truth once the map is running would be MAP.getStyle().layers
 * which would reflect the actual state of the layers at that time: changed visibility, style & filters, ...
 * and it's the LayerPickerControl which will change the visibility of these layers (that's why they're all "none" right now)
 */

/*
 * This style is intended to highlight date issues, where the start_date and/or end_date are blank or otherwise not in YYYY-MM-DD format
 */

export const OHM_BASE_URL = "http://ec2-18-209-171-18.compute-1.amazonaws.com";
export const OHM_TILEJSON = `${OHM_BASE_URL}/index.json`;
export const OHM_URL      = `${OHM_BASE_URL}/{z}/{x}/{y}.pbf`;

export const SPRITE_URL_ROOT = "http://localhost:9000/" + "styles/osm-bright-gl-style/sprite";

export const GLMAP_STYLE = {
  "version": 8,
  "name": "mandesdemo",
  "sources": {
    "ohm-data": {
      "type": "vector",
      "tiles": [
        OHM_URL
      ]
    },
    "modern-basemap-light": {
      "type": "raster",
      "tiles": [
        "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
      ],
      "tileSize": 256
    },
    "modern-basemap-labels": {
      "type": "raster",
      "tiles": [
        "https://a.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png",
        "https://b.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png",
        "https://c.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png",
        "https://d.tiles.mapbox.com/v3/greeninfo.map-qwnj26en/{z}/{x}/{y}.png"
      ],
      "tileSize": 256
    }
  },
  "sprite": SPRITE_URL_ROOT,
  "glyphs": "https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key=RiS4gsgZPZqeeMlIyxFo",
  "layers": [
    /*
     * BASEMAP OPTIONS
     */
    {
      "id": "modern-basemap-light",
      "type": "raster",
      "source": "modern-basemap-light",
      "layout": {
        "visibility": "visible"
      }
    },

    /*
     * THE OHM LAYER, the real meat of the matter
     * Layer list of of July 12 2018:
     * water
     * waterway
     * landcover
     * landuse
     * mountain_peak
     * park
     * boundary
     * aeroway
     * transportation
     * building
     * water_name
     * transportation_name
     * place
     * housenumber
     * poi
     * aerodrome_label
     */

    {
      "id": "dateerror-water",
      "source-layer": "water",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "Polygon"],
          //GDA bad date filter here
      ],
      "type": "fill",
      "paint": {
        "fill-color": "red",
      },
    },
    {
      "id": "dateerror-waterway",
      "source-layer": "waterway",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "LineString"],
          //GDA bad date filter here
      ],
      "type": "line",
      "paint": {
        "line-color": "red",
        "line-width": 3,
      },
    },
    {
      "id": "dateerror-landcover",
      "source-layer": "landcover",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "Polygon"],
          //GDA bad date filter here
      ],
      "type": "fill",
      "paint": {
        "fill-color": "red",
      },
    },
    {
      "id": "dateerror-landuse",
      "source-layer": "landuse",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "Polygon"],
          //GDA bad date filter here
      ],
      "type": "fill",
      "paint": {
        "fill-color": "red",
      },
    },
    {
      "id": "dateerror-park",
      "source-layer": "park",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "Polygon"],
          //GDA bad date filter here
      ],
      "type": "fill",
      "paint": {
        "fill-color": "red",
      },
    },
    {
      "id": "dateerror-boundary",
      "source-layer": "boundary",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "LineString"],
          //GDA bad date filter here
      ],
      "type": "line",
      "paint": {
        "line-color": "red",
      },
    },
    {
      "id": "dateerror-aeroway-polygon",
      "source-layer": "aeroway",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "Polygon"],
          //GDA bad date filter here
      ],
      "type": "fill",
      "paint": {
        "fill-color": "red",
      },
    },
    {
      "id": "dateerror-aeroway-linstring",
      "source-layer": "aeroway",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "LineString"],
          //GDA bad date filter here
      ],
      "type": "line",
      "paint": {
        "line-color": "red",
      },
    },
    {
      "id": "dateerror-transportation-polygon",
      "source-layer": "transportation",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "Polygon"],
          //GDA bad date filter here
      ],
      "type": "fill",
      "paint": {
        "fill-color": "red",
      },
    },
    {
      "id": "dateerror-transportation-linestring",
      "source-layer": "transportation",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "LineString"],
          //GDA bad date filter here
      ],
      "type": "line",
      "paint": {
        "line-color": "red",
      },
    },
    {
      "id": "dateerror-building",
      "source-layer": "building",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "Polygon"],
          //GDA bad date filter here
      ],
      "type": "fill",
      "paint": {
        "fill-color": "red",
      },
    },
    {
      "id": "dateerror-poi",
      "source-layer": "poi",
      "source": "ohm-data",
      "filter": [
          "all",
          ["==", "$type", "Point"],
          //GDA bad date filter here
      ],
      "type": "circle",
      "paint": {
        "circle-color": "red",
        "circle-radius": 5,
      },
    },

    /*
     * MODERN LABELS, over top of everything else
     */
    {
      "id": "modern-basemap-labels",
      "type": "raster",
      "source": "modern-basemap-labels",
      "paint": {
        "raster-opacity": 0.50
      },
      "layout": {
        "visibility": "visible"
      }
    }
  ]
};
