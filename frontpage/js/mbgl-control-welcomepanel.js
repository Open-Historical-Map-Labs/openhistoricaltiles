require('./mbgl-control-welcomepanel.scss');


export class WelcomePanelControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        this.options = Object.assign({
            htmltext: "", // the text to display
        }, options);
    }

    onAdd (map) {
        this._map = map;

        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mbgl-control-welcomepanel";

        this._closebutton = document.createElement("I");
        this._closebutton.className = 'mbgl-control-welcomepanel-closebutton glyphicons glyphicons-remove-circle';
        this._container.appendChild(this._closebutton);
        this._closebutton.addEventListener('click', () => { this.closePanel(); });

        this._maintext = document.createElement("div");
        this._container.appendChild(this._maintext);
        this._maintext.innerHTML = this.options.htmltext;

        // done; hand back our UI element as expected by the framework
        return this._container;
    }

    onRemove () {
    }

    getDefaultPosition () {
        return 'top-left';
    }

    closePanel () {
        this._map.removeControl(this); // doesn't work!
        this._container.parentNode.removeChild(this._container);
    }
}
