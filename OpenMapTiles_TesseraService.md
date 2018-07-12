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

The file `build/openmaptiles.tm2source/data.yml` is the configuration for what data services exist. It also configures global stuff like the `minzoom` and `maxzoom` If this file is changed, you will need to restart tessera: `sudo service tessera restart`

Terminology note: "Datasource" is what we normally call a "layer" or "feature group" such as buildings, lakes, or coastlines. A "Layer" is the whole data service.

This file is recompiled whenever the OpenMapTiles step `make build/openmaptiles.tm2source/data.yml` is run (which is part of `make`). So you should stow your edits someplace else.


## Custom Patches

After installing tessera, some mods are made to it.

### Data leakage

The output of `/index.json` includes the Layer configuration straight from the config file. This includes database connection params, actual SQL queries including potentially table or view names, and other pathnames.

Patch to `node_modules/tessera/lib/app.js`

Search for `app.get("/index.json"`

Add this before it:

```
// make JSON outputs prettier, and more legible
app.set('json spaces', 2);
```

The JSON output is not readily legible. Adding spacing into it would make for much nicer debugging.

Patch to `node_modules/tessera/lib/app.js`

Search for `app.get("/index.json"` then scroll down about 10 lines to the `tessera.getInfo` callback.

Add this in there, above the protocol and URL stuff:

```
// https://github.com/OpenHistoricalMap/openhistoricaltiles/issues/5
// the default output includes a lot of sensitive information e.g. DB credentials
delete info.Layer;
delete info.id;
delete info.mtime;
delete info._prefs;
```



## The Service Wrapper

The `service tessera stop` etc. commands, work because of a service wrapper script. Normally you wouldn't need to worry about that since the script is already set up. Still, if you need to do this on another server...

File **/etc/systemd/system/tessera.service**
```
[Unit]
Description=Tessera vectortile server
User=ubuntu

[Service]
ExecStart=/home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh start
ExecStop=/home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh stop

[Install]
WantedBy=multi-user.target
```

After you put the systemd file into place, `sudo systemctl daemon-reload && sudo systemctl enable tessera` to enable it as a service.

The **tessera_service.sh** file is in this repository. After you put it into place, don't forget to `chmod 755 /home/ubuntu/OPENMAPTILES/openhistoricaltiles/tessera_service.sh`
