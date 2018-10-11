export class MapHoversControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        this.options = Object.assign({
            labeler: function (feature) { return ''; },
        }, options);
    }

    onAdd (map) {
        this._map = map;

        // when the map comes ready, attach the given events to all layers
        // each layer is a callback, which will be passed a feature and should return the tooltip text
        this._map.on('load', () => {
                const layers1 = listRealMapLayers();
                const layers2 = listInvalidDateMapLayers();
                const layers3 = listMissingDateMapLayers();
                const querylayers = [ ...layers1, ...layers2, ...layers3 ];

                querylayers.forEach((layerid) => {
                    this._map.on("mousemove", layerid, (mouseevent) => {
                        const feature = mouseevent.features[0];
                        if (! feature) return;

                        const tooltip = this.options.labeler(feature);
                        if (tooltip) {
                            this.setMapToolTip(tooltip);
                        }
                    });
                });

                this._map.on("mouseleave", () => {
                    this.clearMapToolTip();
                });
        });

        // return some dummy container we won't use
        this._container = document.createElement('span');
        return this._container;
    }

    onRemove () {
        // detach events
        Object.entries(this.options.layers).forEach( ([layerid, callbacks]) => {
                this._map.off("mousemove", layerid, callbacks.enter);
                this._map.off("mouseleave", layerid, callbacks.leave);
        });

        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

    setMapToolTip (tooltip) {
        if (! tooltip) {
            return this.clearMapToolTip();  // setting a blank = they meant to clear it
        }

//GDA clean up DIV name, auto-detection
        document.getElementById('map').title = tooltip;
        this._map.getCanvas().style.cursor = 'crosshair';
    }

    clearMapToolTip () {
//GDA clean up DIV name, auto-detection
        document.getElementById('map').title = '';
        this._map.getCanvas().style.cursor = 'inherit';
    }

}
