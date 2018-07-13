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



## Adding Fields to Vector Tile Output

Short version:

See attached `dbmods-XXXX.sql` files for a set of changes made to the OpenMapTiles data after it is loaded. These enable some features beyond OSM standard, but which are requested, e.g. adding names to parks and streets, so these are exposed via click and hover/tooltip behaviors.

Long version:

Tessera's `table` definitions use a set of wrapper functions defined as part of the OSM loading process, e.g. `layer_building()` which is not a table but a function which returns a table-like structure. In reality, the data are preprocessed into a whole bunch of sub-tables, views, and more virtual-table functions based on zoom level.

Depending on the whim of whoever wrote these scripts, and on the data collected in OSM/OHM, many of these tables lack any attributes beyond the geometry.

Example: `layer_building()` is a function which performs a UNION against the following:
* `osm_building_polygon_gen1` -- a table, has a `building` field indicating its usage
* `osm_all_buildings` -- a view filtering and joining the tables `osm_building_relation`, `osm_building_associatedstreet`, `osm_building_street`, and `osm_building_polygon`
* The total attributes here do *not* include a field for name/label/address, but does include fields for number of levels and total height of the building

Example: `layer_water()` is a function which performs a UNION of a dozen views named `water_z0` through `water_z14`
* each of these views is different as to what it uses:
  * `water_z0` pulls only the geometry from the `ne_110m_ocean` and `ne_110m_lakes` tables, which lack any identifying information such as the name of the ocean
  * `water_z14` pulls from tables `osm_ocean_polygon` and `osm_water_polygon`; the `osm_water_polygon` table does name name fields
  * `water_z6` pulls from `ne_10m_ocean` and `osm_water_polygon_gen6`; the `osm_water_polygon_gen6` table does name name fields
* as such, it would theoreticaly be possible to modify **some of** these water views, to incorporate the name fields and to modify `layer_water()` to include them

On the other hand, `layer_water_name()` uses completely different tables, than are used by either the `layer_water()` or `layer_waterway()` functions:
* `osm_water_lakeline`, `osm_water_point`, and `osm_marine_point`




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

*For more complete information, see the **OpenMapTiles_Service** document. This is a quick introduction.*

The file `build/openmaptiles.tm2source/data.yml` is the configuration for what data services exist. It also configures global stuff like the `minzoom` and `maxzoom`

To configure your Node version and launch the service, you would do the following:
```
cd
nvm use
cd ~/OPENMAPTILES/openmaptiles
~/node_modules/.bin/tessera tmsource://./build/openmaptiles.tm2source
```

The site would then be available as http://ec2-18-209-171-18.compute-1.amazonaws.com/vectortiles/
