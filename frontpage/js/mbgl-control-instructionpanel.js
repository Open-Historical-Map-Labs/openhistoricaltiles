require('./mbgl-control-instructionpanel.scss');


export class InstructionsPanelControl {
    constructor (options={}) {
        // merge suppplied options with these defaults
        this.options = Object.assign({
            places: [], // the list of interesting places; objects with title + hashstring + description
        }, options);
    }

    onAdd (map) {
        this._map = map;

        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mbgl-control-instructionpanel";

        const title = document.createElement("h1");
        title.innerHTML = "Places and Times Of Interest";
        this._container.appendChild(title);

        // add each option: title, hashstring, description
        this.options.places.forEach((placeinfo) => {
            const thisblock = document.createElement("div");

            const link = document.createElement("a");
            link.innerHTML = placeinfo.title;
            link.href = placeinfo.hashstring;
            thisblock.appendChild(link);

            const text = document.createElement("p");
            text.innerHTML = placeinfo.description;
            thisblock.appendChild(text);

            this._container.appendChild(thisblock);
        });

        // done; hand back our UI element as expected by the framework
        return this._container;
    }

    getDefaultPosition () {
        return 'top-left';
    }
}
