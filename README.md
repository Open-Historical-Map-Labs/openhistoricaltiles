# OpenHistoricalTiles

First iteration of vector tiles from OHM Planet data


## Dataset

We'll be using a fork of OpenMapTiles, https://github.com/OpenHistoricalMap/openmaptiles, and then this repo will be mostly for issues related to our implementaiton, though we might also commit style JSON files and other ancillary items here when they don't belong inside our install of OpenMapTiles.

The OpenHistoricalMap planet file (as of July 9 2018) may be had from https://greeninfo.slack.com/files/UAAD2PM5Z/FBKD5RN95/ohm-20180612.osm.pbf  This link is specificaly for GIN staff.



## OMT Service and Demo

This repository (OpenHistoricalTiles) has a `gh-pages` branch, which is used to create a more customized demo.  https://openhistoricalmap.github.io/openhistoricaltiles/

The OpenMapTiles server is running at http://ec2-18-209-171-18.compute-1.amazonaws.com/ Pointing your browser at this URL will bring up a demo using raster tiles, but wil also point to vector tile sources.

The OMT server has some modifications to the data-loading process; refer to updated scripts & docs there.
