Setting up OpenMapTiles Server

http://ec2-18-209-171-18.compute-1.amazonaws.com:8080/#18/47.60501/-122.33514

The process for setting up the OMT system is documented on the OHM-OMT page at https://github.com/OpenHistoricalMap/openmaptiles

However, this documents some errata for our idiosyncracies.


## Code Patches Relevant to PostgreSQL

There were two patches to the code, working around Docker's usual behavior of generating a random port number for the PostgreSQL service. After applying these two patches, the Dockerized PostgreSQL will listen on TCP port 5432 on all interfaces (local and Internet).

This means that you will be able to log in to the database:
```
psql -h localhost -U openmaptiles openmaptiles
```

The patches are as follows:

```
diff --git i/Makefile w/Makefile
index 56f9ac0..b1c0945 100644
--- i/Makefile
+++ w/Makefile
@@ -39,7 +39,8 @@ help:
 .PHONY: build/openmaptiles.tm2source/data.yml
 
 build/openmaptiles.tm2source/data.yml:
-    mkdir -p build/openmaptiles.tm2source && generate-tm2source openmaptiles.yaml --host="postgres" --port=5432 --database="openmaptiles" --user="openmaptiles" --password="openmaptiles" > build/openmaptiles.tm2source/data.yml
+    mkdir -p build/openmaptiles.tm2source && generate-tm2source openmaptiles.yaml --host="localhost" --port=5432 --database="openmaptiles" --user="openmaptiles" --password="openmaptiles" > build/openmaptiles.tm2source/data.yml
 
 build/mapping.yaml: openmaptiles.yaml
     mkdir -p build && generate-imposm3 $< > $@
```

```
diff --git i/docker-compose.yml w/docker-compose.yml
index f064f58..ae931f8 100644
--- i/docker-compose.yml
+++ w/docker-compose.yml
@@ -10,7 +10,7 @@ services:
     networks:
     - postgres_conn
     ports:
-     - "5432"
+     - "5432:5432"
     env_file: .env
   import-natural-earth:
     image: "openmaptiles/import-natural-earth:1.4"
@@ -133,4 +133,4 @@ services:
 
 networks:
   postgres_conn:
-    driver: bridge
+    # driver: bridge
```



## Using NVM and a Less-Ancient Node

The version of Node with ubuntu is really old and we need a newer one (6.14.3). Use NVM instead.

There is a `.nvmrc` file in the homedir, so upon logging in your first action would usually be:
```
nvm use
```

If you forget, you may also do this at any time:
```
nvm use `cat ~/.nvmrc`
```



## Skip The MBTiles Generation

One of the steps of the process, is `docker-compose run generate-vectortiles` which would generate a MBTiles file `./data/tiles.mbtiles`


But for our uses, we don't care for that an would prefer to serve tiles dynamically from the database using Tessera.


## Setting Up Tessera

Tessera is a service which reads from the PostGIS database and generates PBF vector tiles.

### Launching It

The instructions for starting Tessera aren't quite complete, and should read:

```
cd ~/OPENMAPTILES/openhistoricaltiles
~/node_modules/.bin/tessera tmsource://./build/openmaptiles.tm2source
```

This runs a service on port `8080` on all interfaces, Internet and localhost. The firewall blocks the general public from accessing port `:8080` so there is an Apache proxy so these services are visible as `http://ec2-18-209-171-18.compute-1.amazonaws.com/vectortiles/`

### Configuration

The file `build/openmaptiles.tm2source/data.yml` is the configuration for what data services exist.

it also configures global stuff like the `minzoom` and `maxzoom`

Terminology note: "Datasource" is what we normally call a "layer" or "feature group" such as buildings, lakes, or coastlines. A "Layer" is the whole data service.



