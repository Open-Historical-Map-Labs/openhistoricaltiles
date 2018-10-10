require('./mbgl-control-geolocate.scss');

export class GeolocationControl {
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
        this._container.className = "mapboxgl-ctrl mbgl-control-geolocate";

        this._thebutton = document.createElement("div");
        this._thebutton.className = "mbgl-control-geolocate-button mapboxgl-ctrl-icon";
        this._thebutton.innerHTML = '<i class="glyphicons glyphicons-map-marker"></i>';
        this._thebutton.addEventListener('click', () => { this.geolocateAndZoom(); });

        // done; hand back our UI element as expected by the framework
        this._container.appendChild(this._thebutton);
        return this._container;
    }

    onRemove () {
    }

    getDefaultPosition () {
        return 'top-right';
    }

    geolocateAndZoom () {
        if (! navigator.geolocation) return alert("Geolocation is not supported by this browser.");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const y = position.coords.latitude;
                const x = position.coords.longitude;
                const z = 15;

                this._map.setZoom(z);
                this._map.setCenter([x, y]);
            },
            (error) => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        alert("User denied the request for Geolocation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("The request to get user location timed out.");
                        break;
                    case error.UNKNOWN_ERROR:
                        alert("An unknown error occurred.");
                        break;
                }
            }
        );
    }
}

