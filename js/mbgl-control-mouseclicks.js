/*
 * Map click control for MBGL
 *
 * Params:
 * layers -- an object mapping layer-ID onto a callback when a feature in that layer is clicked
 * Example:
 *     new MapClicksControl({
 *         layers: {
 *             'state-boundaries-historical': function (clickevent) {
 *             },
 *             'county-boundaries-historical': function (clickevent) {
 *             },
 *         }
 * OR
 * click -- a callback when the map is clicked
 *     new MapClicksControl({
 *         click: function (clickevent) {
 *         },
 *     });
 */

export class MapClicksControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        this.options = Object.assign({
            layers: {}, /// layerid => clickevent callback
        }, options);
    }

    onAdd (map) {
        this._map = map;

        // when the map comes ready, attach these events
        this._map.on('load', () => {
            if (this.options.layers) {
                Object.entries(this.options.layers).forEach( ([layerid, callback]) => {
                    this._map.on("click", layerid, callback);
                });
            }
            if (this.options.click) {
                this._map.on("click", this.options.click);
            }
        });

        // return some dummy container we won't use
        this._container = document.createElement('span');
        return this._container;
    }

    onRemove () {
        // detach the event handlers
        if (this.options.layers) {
            Object.entries(this.options.layers).forEach( ([layerid, callback]) => {
                this._map.off("click", layerid, callback);
            });
        }
        if (this.options.click) {
            this._map.off("click", this.options.click);
        }

        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

    onMouseClick (event) {
        console.log([ 'onMouseClick()', event ]);
    }
}
