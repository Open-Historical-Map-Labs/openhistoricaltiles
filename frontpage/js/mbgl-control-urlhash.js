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

        // rather than listen for various events, which quickly turns into infinite loops, just run on an interval
        this._timer = setInterval(() => { this.updateUrlHashFromMap(); }, 1000);

        // return some dummy container we won't use
        this._container = document.createElement('span');
        return this._container;
    }

    onRemove () {
        // detach the event handlers
        if (this._timer) {
            clearInterval(this._timer);
        }

        // detach the map
        this._map = undefined;
    }

    updateUrlHashFromMap () {
        const z = this._map.getZoom().toFixed(2);
        const lat = this._map.getCenter().lat.toFixed(5);
        const lng = this._map.getCenter().lng.toFixed(5);
        const dates = this._map.CONTROLS.DATESLIDER.getDates().join(',');

        const hashstring = `${z}/${lat}/${lng}/${dates}/`;
        window.location.hash = hashstring;
    }

    applyStateFromAddressBar () {
        const hashstring = window.location.hash || "";
        if (! hashstring) return;

        const params = hashstring.replace(/^#/, '').split('/');
        const [ z, x, y, d ] = [  ...params ];

        if (z && x && y && z.match(/^\d+\.?\d*$/) && x.match(/^\-?\d+\.\d+$/) && y.match(/^\-?\d+\.\d+$/)) { // just X/Y/Z params
            this._map.setZoom( parseFloat(z) );
            this._map.setCenter([ parseFloat(y), parseFloat(x) ]);
            this._map.fire('moveend');
        }
        if (d && d.match(/^(\d\d\d\d\-\d\d\-\d\d),(\d\d\d\d\-\d\d\-\d\d)$/)) { // X/Y/Z params plus startdate,enddate
            const dates = d.split(',');
            this._map.CONTROLS.DATESLIDER.setDates(dates[0], dates[1]);
            setTimeout(() => {
                this._map.CONTROLS.DATESLIDER.applyDateFiltering();  // bug workaround, during initial change from no hash at all to a hash
                this._map.fire('moveend');
            }, 500);
        }
    }
}
