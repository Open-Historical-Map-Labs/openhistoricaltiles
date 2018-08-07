# OpenHistoricalTiles

First iteration of vector tiles from OHM Planet data


## Dataset

We'll be using a fork of OpenMapTiles, https://github.com/OpenHistoricalMap/openmaptiles, and then this repo will be mostly for issues related to our implementation, though we might also commit style JSON files and other ancillary items here when they don't belong inside our install of OpenMapTiles.

The OpenHistoricalMap planet file (as of July 9 2018) may be had from https://greeninfo.slack.com/files/UAAD2PM5Z/FBKD5RN95/ohm-20180612.osm.pbf  This link is specificaly for GIN staff.



## OMT Service and Demo

This repository (OpenHistoricalTiles) has a `gh-pages` branch, which is used to create a more customized demo.  https://openhistoricalmap.github.io/openhistoricaltiles/

The tilejson URL is https://vtiles.openhistoricalmap.org/index.json and this URL will provide configuration info for vectile consumers. This is served by Tessera and an Apache proxy.

The root of that service website https://vtiles.openhistoricalmap.org/ will bring up a demo using raster tiles, but will also point to vector tile sources.

See also: the documentation in our fork of OpenMapTiles

See also: Tessera service documentation in this repository

