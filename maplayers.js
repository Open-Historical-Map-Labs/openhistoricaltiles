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

export const VECTILES_BASE_URL = "https://ohm-demo.s3.amazonaws.com/tiles/";

export const STATES_MIN_ZOOM = 3;
export const COUNTIES_MIN_ZOOM = 6;

export const GLMAP_STYLE = {
  "version": 8,
  "name": "mandesdemo",
  "sources": {
    "states-historical": {
      "type": "vector",
      "tiles": [
        VECTILES_BASE_URL + "states-historical/{z}/{x}/{y}.pbf"
      ]
    },
    "counties-historical": {
      "type": "vector",
      "tiles": [
        VECTILES_BASE_URL + "counties-historical/{z}/{x}/{y}.pbf"
      ]
    },
    "states-modern": {
      "type": "vector",
      "tiles": [
        VECTILES_BASE_URL + "states-modern/{z}/{x}/{y}.pbf"
      ]
    },
    "counties-modern": {
      "type": "vector",
      "tiles": [
        VECTILES_BASE_URL + "counties-modern/{z}/{x}/{y}.pbf"
      ]
    },
    "basemap-light": {
      "type": "raster",
      "tiles": [
        "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
      ],
      "tileSize": 256
    },
    "basemap-labels": {
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
  "sprite": "https://openmaptiles.github.io/osm-bright-gl-style/sprite",
  "glyphs": "https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key=RiS4gsgZPZqeeMlIyxFo",
  "layers": [
    /*
     * BASEMAP OPTIONS
     */
    {
      "id": "basemap-light",
      "type": "raster",
      "source": "basemap-light",
    },

    /*
     * HISTORICAL BOUNDARIES, the real meat of the matter
     * these are likely to be broken up to form color-classifications
     */
    {
      "id": "state-boundaries-historical",
      "source": "states-historical",
      "source-layer": "states",
      "type": "fill",
      "minzoom": STATES_MIN_ZOOM,
      "paint": {
        "fill-color": "rgb(168, 74, 0)",
        "fill-outline-color": "rgb(0, 0, 0)"
      },
      "layout" : {
        "visibility": "none",
      },
      "filter": [ 'all', [ "<=", "START", "9999/12/31" ], [ ">", "END", "9999/12/31" ] ],  // filter: start date and end date clauses, drop in a year to see what had any presence during that year
    },
    {
      "id": "county-boundaries-historical",
      "source": "counties-historical",
      "source-layer": "counties",
      "type": "fill",
      "minzoom": COUNTIES_MIN_ZOOM,
      "paint": {
        "fill-color": "rgb(241, 168, 66)",
        "fill-outline-color": "rgb(0, 0, 0)"
      },
      "layout" : {
        "visibility": "none",
      },
      "filter": [ 'all', [ "<=", "START", "9999/12/31" ], [ ">", "END", "9999/12/31" ] ],  // filter: start date and end date clauses, drop in a year to see what had any presence during that year
    },

    /*
     * MODERN BOUNDARIES, for reference
     */
    {
      "id": "state-boundaries-modern-line",
      "source": "states-modern",
      "source-layer": "states",
      "type": "line",
      "minzoom": STATES_MIN_ZOOM,
      "paint": {
        "line-color": "black",
        "line-width": 4,
      },
      "layout" : {
        "visibility": "none",
      },
    },
    {
      "id": "county-boundaries-modern-line",
      "source": "counties-modern",
      "source-layer": "counties",
      "type": "line",
      "minzoom": COUNTIES_MIN_ZOOM,
      "paint": {
        "line-color": "black",
        "line-width": 2,
      },
      "layout" : {
        "visibility": "none",
      },
    },

    /*
     * HOVER EFFECTS, same state/county shapes as above, but lighter color... and with a filter to match nothing until mouse movement changes the filter
     */
    {
      "id": "county-boundaries-historical-hover",
      "source": "counties-historical",
      "source-layer": "counties",
      "type": "fill",
      "minzoom": COUNTIES_MIN_ZOOM,
      "paint": {
        "fill-color": "white",
        "fill-opacity": 0.5,
      },
      "layout" : {
        "visibility": "visible",
      },
      "filter": [ "==", "IDNUM", -1 ],  // for highlighting by this unique feature ID
    },
    {
      "id": "state-boundaries-historical-hover",
      "source": "states-historical",
      "source-layer": "states",
      "type": "fill",
      "minzoom": STATES_MIN_ZOOM,
      "paint": {
        "fill-color": "white",
        "fill-opacity": 0.5,
      },
      "layout" : {
        "visibility": "visible",
      },
      "filter": [ "==", "IDNUM", -1 ],  // for highlighting by this unique feature ID
    },

    /*
     * CLICKABLES; the historical and modern boundaries data
     * no filters, unclassified and with transparent fill
     * so the map can be clicked to get info about everything in one go
     */
    {
      "id": "counties-modern-clickable",
      "source": "counties-modern",
      "source-layer": "counties",
      "type": "fill",
      "minzoom": COUNTIES_MIN_ZOOM,
      "paint": {
        "fill-color": "transparent",
      },
      "layout" : {
        "visibility": "visible",
      },
    },
    {
      "id": "states-modern-clickable",
      "source": "states-modern",
      "source-layer": "states",
      "type": "fill",
      "minzoom": STATES_MIN_ZOOM,
      "paint": {
        "fill-color": "transparent",
      },
      "layout" : {
        "visibility": "visible",
      },
    },
    {
      "id": "counties-historical-clickable",
      "source": "counties-historical",
      "source-layer": "counties",
      "type": "fill",
      "minzoom": COUNTIES_MIN_ZOOM,
      "paint": {
        "fill-color": "transparent",
      },
      "layout" : {
        "visibility": "visible",
      },
    },
    {
      "id": "states-historical-clickable",
      "source": "states-historical",
      "source-layer": "states",
      "type": "fill",
      "minzoom": STATES_MIN_ZOOM,
      "paint": {
        "fill-color": "transparent",
      },
      "layout" : {
        "visibility": "visible",
      },
    },

    /*
     * LABELS, over top of everything else
     */
    /*
    {
      "id": "basemap-labels",
      "type": "raster",
      "source": "basemap-labels",
      "paint": {
        "raster-opacity": 0.50
      },
      "layout": {
        "visibility": "none"
      }
    }
    */
  ]
};
