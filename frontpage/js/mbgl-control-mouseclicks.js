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

require('./mbgl-control-mouseclicks.scss');

export class MapClicksControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        this.options = Object.assign({
            layers: {}, /// layerid => clickevent callback
        }, options);
    }

    getDefaultPosition () {
        return 'bottom-right';
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

        // create the container: the container itself, X to close it, and the target area for results

        this._container = document.createElement("DIV");
        this._container.className = "mapboxgl-ctrl mbgl-control-mouseclicks mbgl-control-mouseclicks-closed";

        this._closebutton = document.createElement("I");
        this._closebutton.className = 'mbgl-control-mouseclicks-closebutton glyphicons glyphicons-remove-circle';
        this._container.appendChild(this._closebutton);
        this._closebutton.addEventListener('click', () => { this.closePanel(); });

        this._listing = document.createElement("DIV");
        this._listing.className = 'mbgl-control-mouseclicks-listing';
        this._container.appendChild(this._listing);

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

    displayFeatures (collected_featuregroups) {
        // first we need to uniqueify the features
        // a known effect of vectiles is that a feature can cross tiles and thus appear multiple times
        collected_featuregroups.forEach(function (featuregroup) {
            const uniques = {};
            featuregroup.features.forEach(function (feature) {
                uniques[feature.id] = feature;
            });
            featuregroup.features = Object.values(uniques);
        });

        // generate HTML
        // look over groups, skip any which are empty
        // run each feature through its template function to generate HTML
        // collect these all into one big list of HTML strings: group title, results, group title, results, ...
        const collected_html = [];
        collected_featuregroups.forEach(function (featuregroup) {
            if (! featuregroup.features.length) return;
            collected_html.push(`<h1 class="mbgl-control-mouseclicks-grouptitle">${featuregroup.title}</h1>`);

            collected_html.push(`<div class="mbgl-control-mouseclicks-featuregroup">`);

            featuregroup.features.forEach(function (feature) {
                const thishtml = featuregroup.template(feature);
                if (! thishtml) return;  // returning blank HTML = skip this feature
                collected_html.push(`<div class="mbgl-control-mouseclicks-feature">${thishtml}</div>`);
            });

            collected_html.push(`</div>`);
        });

        // if we collected nothing at all, then we have found nothing
        if (! collected_html.length) {
            this.closePanel();
            return;
        }

        // stick it into the panel
        this.openPanel();
        this._listing.innerHTML = collected_html.join('');
    }

    closePanel () {
        this._container.classList.add('mbgl-control-mouseclicks-closed');
    }

    openPanel () {
        this._container.classList.remove('mbgl-control-mouseclicks-closed');
    }
}
