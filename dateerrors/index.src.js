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

    // add control: GreenInfo credits
    new L.controlCredits({
        image: 'images/greeninfo.png',
        link: 'http://www.greeninfo.org/',
        text: 'Interactive mapping<br/>by GreenInfo Network',
        position: 'bottomright'
    }).addTo(MAP);

    // add control: simple read-only legend
    new L.Control.Legend({
        position: 'topright',
    }).addTo(MAP).expand();

    // add control: hash updater/watcher
    new L.Hash(MAP);

    // add the vector tile scene from Tangram
    // reference https://tangrams.readthedocs.io/en/latest/
    // reference https://github.com/tangrams/tangram
    VLAYER = Tangram.leafletLayer({
        scene: "scene.yaml",
        attribution: "&copy; OSM contributors",
        events: {
            hover: handleMouseHover,
            click: handleMouseClick,
        }
    });
    VLAYER.addTo(MAP);

    VLAYER.scene.subscribe({
        view_complete: function() {
            console.log("scene view complete");
        }
    });
});


window.handleMouseHover = function (selection) {
    if (! selection.feature) {
        $('#map').removeClass('crosshair').prop('title', "");
        return;
    }

console.log(selection.feature);
    let tooltip = `${selection.feature.source_layer}`;

    if (selection.feature.properties.name) {
        tooltip += ` :: ${selection.feature.properties.name}`;
    }
    if (selection.feature.properties.osm_id) {
        tooltip += ` :: OSM ID ${selection.feature.properties.osm_id}`;
    }

    $('#map').addClass('crosshair').prop('title', tooltip);
};


window.handleMouseClick = function (selection) {
    if (! selection.feature) {
        return;
    }

    // compose HTML
    let html = `Layer: ${selection.feature.source_layer}`;

    if (selection.feature.properties.osm_id) {
        html += `<br/>OSM ID: ${selection.feature.properties.osm_id}`;
    }
    if (selection.feature.properties.name) {
        html += `<br/>Name: ${selection.feature.properties.name}`;
    }

    if (selection.feature.properties.start_date && selection.feature.properties.start_date.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
        html += `<br/>Start Date: ${selection.feature.properties.start_date} -- OK`;
    }
    else if (selection.feature.properties.start_date) {
        html += `<br/>Start Date: ${selection.feature.properties.start_date} -- INVALID`;
    }
    else {
        html += `<br/>Start Date missing`;
    }

    if (selection.feature.properties.end_date && selection.feature.properties.end_date.match(/^\d\d\d\d\-\d\d\-\d\d$/)) {
        html += `<br/>End Date: ${selection.feature.properties.end_date} -- OK`;
    }
    else if (selection.feature.properties.end_date) {
        html += `<br/>End Date: ${selection.feature.properties.end_date} -- INVALID`;
    }
    else {
        html += `<br/>End Date missing`;
    }

    // open popup
    const latlng = selection.leaflet_event.latlng;
    MAP.openPopup(html, latlng);
};
