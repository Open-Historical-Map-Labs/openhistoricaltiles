// a custom-crafted Leaflet control for that legend
// styling is in the map's .css file
L.Control.Legend = L.Control.extend({
	options: {
		position: 'bottomright'
	},
	initialize: function(options) {
		L.setOptions(this,options);
	},
	onAdd: function (map) {
		this._map = map;
		var myself = this;

		// create our container
		this.container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-legend-control leaflet-legend-collapsed');
		this.content_collapsed = L.DomUtil.create('div', 'leaflet-legend-content-collapsed', this.container);
		this.content_expanded = L.DomUtil.create('div', 'leaflet-legend-content-expanded', this.container);

		this.content_collapsed.innerHTML = '<img src="images/legend.svg" >';

		// the legend items here are contrived to match those 
		this.content_expanded.innerHTML = '';
		this.content_expanded.innerHTML += '<h4>OHM Features With Data Problems</h4>';
		this.content_expanded.innerHTML += '<div class="legend"><div class="swatch swatch-circle swatch-date-missing"></div> Start &amp; End Date Missing</div>';
		this.content_expanded.innerHTML += '<div class="legend"><div class="swatch swatch-circle swatch-date-malformed"></div> Start/End Date Malformed</div>';

		// click to toggle... and stop propagation to the map
		L.DomEvent
		.addListener(this.container, 'mousedown', L.DomEvent.stopPropagation)
		.addListener(this.container, 'click', L.DomEvent.stopPropagation)
		.addListener(this.container, 'dblclick', L.DomEvent.stopPropagation)
		.addListener(this.content_collapsed, 'click', function () {
			myself.expand();
		})
		.addListener(this.content_expanded, 'click', function () {
			myself.collapse();
		});

		// all done
		return this.container;
	},
	expand: function (html) {
		L.DomUtil.addClass(this.container, 'leaflet-legend-expanded');
			L.DomUtil.removeClass(this.container, 'leaflet-legend-collapsed');
	},
	collapse: function (html) {
		L.DomUtil.removeClass(this.container, 'leaflet-legend-expanded');
		L.DomUtil.addClass(this.container, 'leaflet-legend-collapsed');
	}
});