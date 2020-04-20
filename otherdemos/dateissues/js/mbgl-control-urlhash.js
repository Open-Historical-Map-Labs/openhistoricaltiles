/*
 * URL hash control for MBGL
 * watch for the page's URL hash for #Z/LAT/LNG format, example:  #15/47.6073/-122.3327
 * move the map when the hash changes
 * update the hash when the map changes
 *
 * No params and no functions other than what's built in.
 * Example:
 *     MAP.addControl(new UrlHashControl());
 */

export class UrlHashControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        // not used, but leave in place so we can add them later as the ideas come in
        this.options = Object.assign({
        }, options);
    }

    onAdd (map) {
        this._map = map;

        // effectively on load: read existing hash and apply it
        if (window.location.hash) {
            this.applyUrlHashToMap(window.location.hash);
        }

        // start listening for changes to the hash, and to the map
        this._map2hash = () => { this.updateUrlHashFromMap(); };
        this._hash2map = () => { this.readUrlHashAndApply(); };
        window.addEventListener("hashchange", this._hash2map, false);
        this._map.on("moveend", this._map2hash);

        // return some dummy container we won't use
        this._container = document.createElement('span');
        return this._container;
    }

    onRemove () {
        // detach the event handlers
        window.removeEventListener("hashchange", this._hash2map);
        this._map.off("moveend", this._map2hash);

        // detach the map
        this._map = undefined;
    }

    readUrlHashAndApply () {
        const hashstring = window.location.hash;
        this.applyUrlHashToMap(hashstring);
    }

    applyUrlHashToMap (hashstring) {
        const zxy_regex = /^\#(\d+\.?\d*)\/(\-?\d+\.\d+)\/(\-?\d+\.\d+)\//;
        const zxy = hashstring.match(zxy_regex);
        if (! zxy) return;  // not a match, maybe blank, maybe malformed?

        const z = zxy[1];
        const lat = zxy[2];
        const lng = zxy[3];

        this._map.setZoom(z);
        this._map.setCenter([ lng, lat ]);
    }

    updateUrlHashFromMap () {
        const z = this._map.getZoom().toFixed(2);
        const lat = this._map.getCenter().lat.toFixed(5);
        const lng = this._map.getCenter().lng.toFixed(5);
        const hashstring = `${z}/${lat}/${lng}/`;
        window.location.hash = hashstring;
    }
}
