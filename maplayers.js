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

export const OHM_BASE_URL = "http://ec2-18-209-171-18.compute-1.amazonaws.com";
export const OHM_TILEJSON = `${OHM_BASE_URL}/index.json`;
export const OHM_URL      = `${OHM_BASE_URL}/{z}/{x}/{y}.pbf`;

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
  "sprite": "https://openmaptiles.github.io/osm-bright-gl-style/sprite",
  "glyphs": "https://free.tilehosting.com/fonts/{fontstack}/{range}.pbf?key=RiS4gsgZPZqeeMlIyxFo",
  "layers": [
    /*
     * BASEMAP OPTIONS
     */
    {
      "id": "modern-basemap-light",
      "type": "raster",
      "source": "modern-basemap-light",
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
      "id": "ohm-transportation",
      "source": "ohm-data",
      "source-layer": "transportation",
      "type": "line",
      "paint": {
        "line-color": "rgb(0, 0, 0)",
        "line-width": 3,
      }
    },
    {
      "id": "ohm-poi",
      "source": "ohm-data",
      "source-layer": "poi",
      "type": "circle",
      "paint": {
        "circle-color": "rgb(255, 0, 0)",
        "circle-radius": 10,
      }
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
      }/*,
      "layout": {
        "visibility": "none"
      }*/
    }
  ]
};
