require('./mbgl-control-geocoder.scss');

export class GeocoderControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        this.options = Object.assign({
            bases: [], // list of { layer, label } objects, for base layer offerings
            labels: [], // list of { layer, label } objects, for label overlay offerings
        }, options);
    }

    onAdd (map) {
        this._map = map;

        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mbgl-control-geocoder";

        // two parts: panel which shows content (has X to hide itself), and button to show the panel (and hide itself)
        this._showbutton = document.createElement("div");
        this._showbutton.className = "mbgl-control-geocoder-button mapboxgl-ctrl-icon";
        this._showbutton.innerHTML = '<i class="glyphicons glyphicons-globe"></i>';
        this._showbutton.addEventListener('click', () => { this.openPanel(); });

        this._thepanel = document.createElement("div");
        this._thepanel.className = "mbgl-control-geocoder-panel";

        this._closebutton = document.createElement("I");
        this._closebutton.className = 'mbgl-control-geocoder-closebutton glyphicons glyphicons-remove-circle';
        this._closebutton.addEventListener('click', () => { this.closePanel(); });
        this._thepanel.appendChild(this._closebutton);

        this._header = document.createElement("H1");
        this._header.innerHTML = 'Zoom to a Location';
        this._thepanel.appendChild(this._header);

        this._textbox = document.createElement("INPUT");
        this._textbox.type = 'text';
        this._textbox.placeholder = 'address, city, landmark';
        this._thepanel.appendChild(this._textbox);
        this._textbox.addEventListener('keyup', (event) => {
            event.preventDefault();
            if (event.keyCode !== 13) return;
            this._gobutton.click();
        });

        this._gobutton = document.createElement("BUTTON");
        this._gobutton.innerHTML = "Search";
        this._thepanel.appendChild(this._gobutton);
        this._gobutton.addEventListener('click', () => { this.performGeocode(); });

        // done; hand back our UI element as expected by the framework
        this._container.appendChild(this._showbutton);
        this._container.appendChild(this._thepanel);
        this.closePanel();
        return this._container;
    }

    onRemove () {
    }

    getDefaultPosition () {
        return 'top-right';
    }

    closePanel () {
        this._container.classList.remove('mbgl-control-geocoder-expanded');
    }

    openPanel () {
        this._container.classList.add('mbgl-control-geocoder-expanded');
    }

    performGeocode () {
        const address = this._textbox.value;
        if (! address) return;

        const params = {
            format: "json",
            q: address,
        };
        const geocodeurl = "https://nominatim.openstreetmap.org/search";
        const querystring = Object.keys(params).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
        const url = `${geocodeurl}?${querystring}`;

        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onload = () => {
            const response = JSON.parse(request.response);
            const geocoded = response[0];
            this.handleGeocodeResult(geocoded);
        };
        request.send();
    }

    handleGeocodeResult (geocoderesult) {
        // built for nominatim format
        const s = parseFloat(geocoderesult.boundingbox[0]);
        const n = parseFloat(geocoderesult.boundingbox[1]);
        const w = parseFloat(geocoderesult.boundingbox[2]);
        const e = parseFloat(geocoderesult.boundingbox[3]);
        const bounds = [ [w, s], [e, n] ];
        this._map.fitBounds(bounds);
    }
}
