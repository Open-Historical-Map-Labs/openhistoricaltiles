# The Tessera Vector Tile Service

Tessera is a service which reads from the PostGIS database and generates PBF vector tiles. This is what produces the visible OpenHistoricalMap vector tiles for use in maps.

Demonstration map:
http://ec2-18-209-171-18.compute-1.amazonaws.com/

TileJSON service config document:
http://ec2-18-209-171-18.compute-1.amazonaws.com/index.json


## Launching Tessera and PostgreSQL

Use systemctl to start/stop the Tessera service:
```
sudo systemctl start tessera
sudo systemctl stop tessera
sudo systemctl restart tessera
sudo systemctl status tessera
```

The Tessera service runs on port `8080` on all interfaces, Internet and localhost. The firewall blocks the general public from accessing port `:8080` and there is an Apache proxy simply proxying all website requests to `localhost:8080` so Tessera answers them.

Use `docker` to start/stop the PostgreSQL container:
```
docker start openmaptiles_postgres_1
docker stop openmaptiles_postgres_1
docker ps
```



## Tessera Config File

The file `openmaptiles.tm2source/data.yml` is the configuration for what data services exist. It also configures global stuff like the `minzoom` and `maxzoom` If this file is changed, you will need to restart tessera: `sudo service tessera restart`

This file is based on the *build/openmaptiles.tm2source/data.yml* file which was generated during openhistoricaltiles setup. It was then split off and modified for cleanup and additional attributes and layers.

Terminology note: "Datasource" is what we normally call a "layer" or "feature group" such as buildings, lakes, or coastlines. A "Layer" is the whole data service.

This file is recompiled whenever the OpenMapTiles step `make build/openmaptiles.tm2source/data.yml` is run (which is part of `make`). So you should stow your edits someplace else.



## Debugging Tip

Tessera performs a query against each datasource (layer) b running its SQL. This means that if any of your SQL definitions don't work properly, the service won't start properly. Fortunately, it will crash with a verbose SQL error and you'll know what's going on.

In fact, while developing the datasourcelayers, you may find it useful to manually start the service without `systemctl` so you can see the error messages:

```
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh stop
/home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh start
```

