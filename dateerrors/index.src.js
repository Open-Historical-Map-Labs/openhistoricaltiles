let MAP = null;
let VLAYER = null;
let SCENE = null;

let MAP_START = [47.605, -122.331, 16]; // Seattle


$(document).ready(function () {
    // override MAP_START with URL hash contents
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split("/");
    if (url_hash.length == 3) {
        MAP_START = [url_hash[1], url_hash[2], url_hash[0]].map(Number);
    }

    // create the map
    MAP = L.map("map", {
        maxZoom: 18,
        minZoom: 3,
        inertia: false,
        keyboard: true
    });
    MAP.setView(MAP_START.slice(0, 2), MAP_START[2]);

    // add control: hash updater/watcher
    new L.Hash(MAP);

    // add the vector tile scene from Tangram
    VLAYER = Tangram.leafletLayer({
        scene: "scene.yaml",
        attribution: "&copy; OSM contributors"
    });
    VLAYER.addTo(MAP);

    VLAYER.scene.subscribe({
        view_complete: function() {
            console.log("scene view complete");
        }
    });
});
