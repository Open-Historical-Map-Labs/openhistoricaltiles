require('./mbgl-control-layerswitcher.scss');


export class LayerSwitcherControl {
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
        this._container.className = "mapboxgl-ctrl mbgl-control-layerswitcher";

        // two parts: panel which shows content (has X to hide itself), and button to show the panel (and hide itself)
        this._showbutton = document.createElement("div");
        this._showbutton.className = "mbgl-control-layerswitcher-button mapboxgl-ctrl-icon";
        this._showbutton.innerHTML = '<i class="glyphicons glyphicons-list"></i>';
        this._showbutton.addEventListener('click', () => { this.openPanel(); });

        this._thepanel = document.createElement("div");
        this._thepanel.className = "mbgl-control-layerswitcher-panel";

        this._closebutton = document.createElement("I");
        this._closebutton.className = 'mbgl-control-layerswitcher-closebutton glyphicons glyphicons-remove-circle';
        this._closebutton.addEventListener('click', () => { this.closePanel(); });
        this._thepanel.appendChild(this._closebutton);

        this._maintext = document.createElement("div");
        this._maintext.innerHTML = '<h1>Reference Options</h1>';
        this._thepanel.appendChild(this._maintext);

        this._picker_basemap = document.createElement("div");
        this._picker_basemap.innerHTML = '<h2>Base Maps</h2>';
        this._maintext.appendChild(this._picker_basemap);
        const baseoptions = [ { layerid: '', label: 'None' }, ...this.options.bases];
        baseoptions.forEach((option) => {
            const section = document.createElement("div");
            section.setAttribute('data-layerid', option.layerid);

            const selected = option.layerid ? '' : 'checked'; // by default, select the None option
            const checkbox = document.createElement("label");
            checkbox.innerHTML = `<input type="radio" name="mbgl-control-layerswitcher-basemap" value="${option.layerid}" ${selected}> ${option.label}`;
            section.appendChild(checkbox);
            checkbox.addEventListener('click', (event) => {
                if (event.target.tagName != 'INPUT') return; // accept clicks on the label, which DO propagate to the proper checkbox
                const layerid = event.target.getAttribute('value');
                this.selectBasemap(layerid);
            });

            this._picker_basemap.appendChild(section);
        });

        this._picker_labels = document.createElement("div");
        this._picker_labels.innerHTML = '<h2>Labels</h2>';
        this._maintext.appendChild(this._picker_labels);
        const labeloptions = [ { layerid: '', label: 'None' }, ...this.options.labels];
        labeloptions.forEach((option) => {
            const section = document.createElement("div");
            section.setAttribute('data-layerid', option.layerid);

            const selected = option.layerid ? '' : 'checked'; // by default, select the None option
            const checkbox = document.createElement("label");
            checkbox.innerHTML = `<input type="radio" name="mbgl-control-layerswitcher-labels" value="${option.layerid}" ${selected}> ${option.label}`;
            section.appendChild(checkbox);
            checkbox.addEventListener('click', (event) => {
                if (event.target.tagName != 'INPUT') return; // accept clicks on the label, which DO propagate to the proper checkbox
                const layerid = event.target.getAttribute('value');
                this.selectLabels(layerid);
            });

            this._picker_labels.appendChild(section);
        });

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
        this._container.classList.remove('mbgl-control-layerswitcher-expanded');
    }

    openPanel () {
        this._container.classList.add('mbgl-control-layerswitcher-expanded');
    }

    selectBasemap (layerid) {
        // find the section, check the box
        const section = this._picker_basemap.querySelector(`div[data-layerid="${layerid}"]`);
        section.querySelector('input[type="radio"]').checked = true;

        // map layer: toggle the other options off, toggle this one on
        this.options.bases.forEach((option) => {
            if (layerid && layerid == option.layerid) {
                this._map.setLayoutProperty(option.layerid, 'visibility', 'visible');
            }
            else {
                this._map.setLayoutProperty(option.layerid, 'visibility', 'none');
            }
        });
    }

    selectLabels (layerid) {
        // find the section, check the box
        const section = this._picker_labels.querySelector(`div[data-layerid="${layerid}"]`);
        section.querySelector('input[type="radio"]').checked = true;

        // map layer: toggle the other options off, toggle this one on
        this.options.labels.forEach((option) => {
            if (layerid && layerid == option.layerid) {
                this._map.setLayoutProperty(option.layerid, 'visibility', 'visible');
            }
            else {
                this._map.setLayoutProperty(option.layerid, 'visibility', 'none');
            }
        });
    }

}
