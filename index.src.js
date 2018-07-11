import { GLMAP_STYLE } from './maplayers';

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

    //  
    // startup and initial state, once the GL Map has loaded
    //
    MAP.on('load', function () {
        // read a simple location hash: #Z/LAT/LNG   example:  #15/47.6073/-122.3327
        // now at page load, then keep watching the address bar
        if (window.location.hash) {
            window.checkHashAndApply();
        }
        window.addEventListener("hashchange", function () {
            window.checkHashAndApply();
        }, false);
    });
});


window.checkHashAndApply = function () {
    const zxy_regex = /^\#(\d+)\/(\-?\d+\.\d+)\/(\-\d+\.\d+)/;
    const zxy = window.location.hash.match(zxy_regex);
    if (! zxy) return;  // not a match, maybe blank, maybe malformed?

    const z = zxy[1];
    const lat = zxy[2];
    const lng = zxy[3];

    MAP.setZoom(z);
    MAP.setCenter([ lng, lat ]);
};
