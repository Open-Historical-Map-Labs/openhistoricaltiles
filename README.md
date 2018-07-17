# Open Historical Map: Phase 1-B Demonstration

A simple vector-tiles map which displays OpenHistoricalMap data from the OpenMapTiles/Tessera service.

http://openhistoricalmap.github.io/openhistoricaltiles

There are two separate but very similar maps here. One is meant to look good, the other is intended to point out issues of malformed dates. Both have the same development process: build tools, etc.

The `dateerrors` map is described in more deails in https://github.com/OpenHistoricalMap/openhistoricaltiles/issues/3 which describes the need to visualize features with malformed/missing dates.


## Tech Stack

* Tile server: Tessera serving OSM data from a Amazon EC2
* Database: Dockerized PostgreSQL loaded with a OHM dump in OSM.PBF format
* Map client: Mapbox GL JS API
* Client-side programming language: jQuery



## For Developers

Babel, SASS/SCSS, Webpack.

Upon initial setup on your system, run `nvm use` and `yarn install` to set up build tools.

Then, your edits would be made to **index.src.html** **index.src.scss** **index.src.js** as the main files, and to **webpack.entrypoint.js** as the entry point which lists assets to include.

Running `npm run build` will compile the browser-side "deliverables" **index.html** **index.css** **index.js** via webpack. Note that these outputs **are** included in version control, so they may be hosted via Github Pages without us needing to work in additional tooling.

`npm run serve` will run a HTTP server, as well as watching and rebuilding (below). The vector tiles are considered data from a cross-origin perspective, and XHR won't work over `file://` URLs, so this is important.

`npm run watch` will watch for changes and recompile and reload when changes are made. *This is not a replacement* for a final `npm run build` for deployment.

