# OpenHistoricalTiles

This repository (OpenHistoricalTiles) has a `gh-pages` branch, which is used to create a more customized demo.  https://openhistoricalmap.github.io/openhistoricaltiles/

The tilejson URL is https://vtiles.openhistoricalmap.org/index.json and this URL will provide configuration info for vectile consumers. This is served by Tessera and an Apache proxy.

The root of that service website https://vtiles.openhistoricalmap.org/ will bring up a demo using raster tiles, but will also point to vector tile sources.


## Launching Tessera and PostgreSQL

To start and stop the services:

```
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh stop
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh start
```

```
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/postgresql_service.sh stop
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/postgresql_service.sh start
```

```
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/ohmdiffs_service.sh stop
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/ohmdiffs_service.sh start
```

The Tessera service runs on port `8080` on all interfaces, Internet and localhost. The firewall blocks the general public from accessing port `:8080` and there is an Apache proxy redirecting all website requests to `localhost:8080` so Tessera answers them. This Apache proxy provides HTTPS/SSL service.

PostgreSQL runs in a Docker container, but redirects port 5432 so it may be used like a typical, non-Dockerized PostgreSQL.

OSM diffs are consumed every 5 minutes by their service, which is a Docker wrapper over `imposm run` The output is sent to `/home/ubuntu/OPENMAPTILES/openmaptiles/data/ohmdiffs_service.log` and the logfile is cycled periodically (daily, 7 days kept). See `/etc/logrotate.d/openhistoricalmap_diffs` for the log-cycling configuration.



## PostgreSQL

You may use PostgreSQL as usual:

```
psql -U openmaptiles openmaptiles
```


## Tessera Config File

The file `openmaptiles.tm2source/data.yml` is the configuration for what data services exist. It also configures global stuff like the `minzoom` and `maxzoom` If this file is changed, you will need to restart tessera: `sudo service tessera restart`

This file is based on the *build/openmaptiles.tm2source/data.yml* file which was generated during openhistoricaltiles setup. It was then split off and modified for cleanup and additional attributes and layers.

Terminology note: "Datasource" is what we normally call a "layer" or "feature group" such as buildings, lakes, or coastlines. A "Layer" is the whole data service.

This file is recompiled whenever the OpenMapTiles step `make build/openmaptiles.tm2source/data.yml` is run (which is part of `make`). So you should stow your edits someplace else.



## Debugging Tip

Tessera performs a query against each datasource (layer) by running the defined SQL query. This means that if any of your SQL definitions don't work properly, the service won't start properly. Fortunately, it will crash with a verbose SQL error and you'll know what's going on.

In fact, while developing the datasourcelayers, you may find it useful to manually start the service without `systemctl` so you can see the error messages:

```
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh stop
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh start
```

