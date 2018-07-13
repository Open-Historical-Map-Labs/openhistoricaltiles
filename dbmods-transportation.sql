--
-- "transportation" layer, add the name of the roadway
--

-- these matviews didn't include the name; redo them

DROP MATERIALIZED VIEW osm_transportation_merge_linestring_gen7;
DROP MATERIALIZED VIEW osm_transportation_merge_linestring_gen6;
DROP MATERIALIZED VIEW osm_transportation_merge_linestring_gen5;
DROP MATERIALIZED VIEW osm_transportation_merge_linestring_gen4;
DROP MATERIALIZED VIEW osm_transportation_merge_linestring_gen3;
DROP MATERIALIZED VIEW osm_transportation_merge_linestring;

CREATE MATERIALIZED VIEW osm_transportation_merge_linestring AS (
    SELECT
        (ST_Dump(geometry)).geom AS geometry,
        NULL::bigint AS osm_id,
        name,
        highway,
        z_order
    FROM (
      SELECT
          ST_LineMerge(ST_Collect(geometry)) AS geometry,
          name,
          highway,
          min(z_order) AS z_order
      FROM osm_highway_linestring
      WHERE highway IN ('motorway','trunk', 'primary') AND ST_IsValid(geometry)
      group by highway, name
    ) AS highway_union
);

CREATE MATERIALIZED VIEW osm_transportation_merge_linestring_gen3 AS (
    SELECT ST_Simplify(geometry, 120) AS geometry, osm_id, name, highway, z_order
    FROM osm_transportation_merge_linestring
    WHERE highway IN ('motorway','trunk', 'primary')
);

CREATE MATERIALIZED VIEW osm_transportation_merge_linestring_gen4 AS (
    SELECT ST_Simplify(geometry, 200) AS geometry, osm_id, name, highway, z_order
    FROM osm_transportation_merge_linestring_gen3
    WHERE highway IN ('motorway','trunk', 'primary') AND ST_Length(geometry) > 50
);

CREATE MATERIALIZED VIEW osm_transportation_merge_linestring_gen5 AS (
    SELECT ST_Simplify(geometry, 500) AS geometry, osm_id, name, highway, z_order
    FROM osm_transportation_merge_linestring_gen4
    WHERE highway IN ('motorway','trunk') AND ST_Length(geometry) > 100
);

CREATE MATERIALIZED VIEW osm_transportation_merge_linestring_gen6 AS (
    SELECT ST_Simplify(geometry, 1000) AS geometry, osm_id, name, highway, z_order
    FROM osm_transportation_merge_linestring_gen5
    WHERE highway IN ('motorway','trunk') AND ST_Length(geometry) > 500
);

CREATE MATERIALIZED VIEW osm_transportation_merge_linestring_gen7 AS (
    SELECT ST_Simplify(geometry, 2000) AS geometry, osm_id, name, highway, z_order
    FROM osm_transportation_merge_linestring_gen6
    WHERE highway IN ('motorway') AND ST_Length(geometry) > 1000
);


CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_geometry_idx ON osm_transportation_merge_linestring USING gist(geometry);
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_highway_partial_idx ON osm_transportation_merge_linestring(highway) WHERE highway IN ('motorway','trunk', 'primary');
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen3_geometry_idx ON osm_transportation_merge_linestring_gen3 USING gist(geometry);
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen3_highway_partial_idx ON osm_transportation_merge_linestring_gen3(highway) WHERE highway IN ('motorway','trunk', 'primary');
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen4_geometry_idx ON osm_transportation_merge_linestring_gen4 USING gist(geometry);
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen4_highway_partial_idx ON osm_transportation_merge_linestring_gen4(highway) WHERE highway IN ('motorway','trunk', 'primary');
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen5_geometry_idx ON osm_transportation_merge_linestring_gen5 USING gist(geometry);
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen5_highway_partial_idx ON osm_transportation_merge_linestring_gen5(highway) WHERE highway IN ('motorway', 'trunk');
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen6_geometry_idx ON osm_transportation_merge_linestring_gen6 USING gist(geometry);
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen6_highway_partial_idx ON osm_transportation_merge_linestring_gen6(highway) WHERE highway IN ('motorway','trunk');
CREATE INDEX IF NOT EXISTS osm_transportation_merge_linestring_gen7_geometry_idx ON osm_transportation_merge_linestring_gen7 USING gist(geometry);



--
-- now the wrapper function, to include the new name field present in all tables
-- except osm_highway_polygon where we just use "" instead)
--


CREATE OR REPLACE FUNCTION layer_transportation(bbox geometry, zoom_level int)
RETURNS TABLE(osm_id bigint, geometry geometry, name character varying, class text, subclass text, ramp int, oneway int, brunnel TEXT, service TEXT, layer INT, level INT, indoor INT) AS $$
    SELECT
        osm_id, geometry, name,
        CASE
            WHEN highway IS NOT NULL OR public_transport IS NOT NULL THEN highway_class(highway, public_transport)
            WHEN railway IS NOT NULL THEN railway_class(railway)
            WHEN aerialway IS NOT NULL THEN aerialway
            WHEN shipway IS NOT NULL THEN shipway
        END AS class,
        CASE
            WHEN railway IS NOT NULL THEN railway
            WHEN (highway IS NOT NULL OR public_transport IS NOT NULL)
                AND highway_class(highway, public_transport) = 'path'
                THEN COALESCE(NULLIF(public_transport, ''), highway)
            ELSE NULL
        END AS subclass,
        -- All links are considered as ramps as well
        CASE WHEN highway_is_link(highway) OR highway = 'steps'
             THEN 1 ELSE is_ramp::int END AS ramp,
        is_oneway::int AS oneway,
        brunnel(is_bridge, is_tunnel, is_ford) AS brunnel,
        NULLIF(service, '') AS service,
        NULLIF(layer, 0) AS layer,
        "level",
        CASE WHEN indoor=TRUE THEN 1 ELSE NULL END as indoor
    FROM (
        -- etldoc: osm_transportation_merge_linestring_gen7 -> layer_transportation:z4
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, NULL AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            NULL::int AS layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_transportation_merge_linestring_gen7
        WHERE zoom_level = 4
        UNION ALL

        -- etldoc: osm_transportation_merge_linestring_gen6 -> layer_transportation:z5
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, NULL AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            NULL::int AS layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_transportation_merge_linestring_gen6
        WHERE zoom_level = 5
        UNION ALL

        -- etldoc: osm_transportation_merge_linestring_gen5 -> layer_transportation:z6
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, NULL AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            NULL::int AS layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_transportation_merge_linestring_gen5
        WHERE zoom_level = 6
        UNION ALL

        -- etldoc: osm_transportation_merge_linestring_gen4  ->  layer_transportation:z7
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, NULL AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            NULL::int AS layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_transportation_merge_linestring_gen4
        WHERE zoom_level = 7
        UNION ALL

        -- etldoc: osm_transportation_merge_linestring_gen3  ->  layer_transportation:z8
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, NULL AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            NULL::int AS layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_transportation_merge_linestring_gen3
        WHERE zoom_level = 8
        UNION ALL

        -- etldoc: osm_highway_linestring_gen2  ->  layer_transportation:z9
        -- etldoc: osm_highway_linestring_gen2  ->  layer_transportation:z10
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, NULL AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_highway_linestring_gen2
        WHERE zoom_level BETWEEN 9 AND 10
          AND st_length(geometry)>zres(11)
        UNION ALL

        -- etldoc: osm_highway_linestring_gen1  ->  layer_transportation:z11
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, NULL AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_highway_linestring_gen1
        WHERE zoom_level = 11
          AND st_length(geometry)>zres(12)
        UNION ALL

        -- etldoc: osm_highway_linestring       ->  layer_transportation:z12
        -- etldoc: osm_highway_linestring       ->  layer_transportation:z13
        -- etldoc: osm_highway_linestring       ->  layer_transportation:z14_
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer,
            CASE WHEN highway IN ('footway', 'steps') THEN "level"
                ELSE NULL::int
            END AS "level",
            CASE WHEN highway IN ('footway', 'steps') THEN indoor
                ELSE NULL::boolean
            END AS indoor,
            z_order
        FROM osm_highway_linestring
        WHERE NOT is_area AND (
            zoom_level = 12 AND (
                highway_class(highway, public_transport) NOT IN ('track', 'path', 'minor')
                OR highway IN ('unclassified', 'residential')
            )
            OR zoom_level = 13
                AND highway_class(highway, public_transport) NOT IN ('track', 'path')
            OR zoom_level >= 14
        )
        UNION ALL

        -- etldoc: osm_railway_linestring_gen5  ->  layer_transportation:z8
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, service_value(service) AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            NULL::int AS layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_railway_linestring_gen5
        WHERE zoom_level = 8
            AND railway='rail' AND service = '' and usage='main'
        UNION ALL

        -- etldoc: osm_railway_linestring_gen4  ->  layer_transportation:z9
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, service_value(service) AS service,
            NULL::boolean AS is_bridge, NULL::boolean AS is_tunnel,
            NULL::boolean AS is_ford,
            NULL::boolean AS is_ramp, NULL::int AS is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_railway_linestring_gen4
        WHERE zoom_level = 9
            AND railway='rail' AND service = '' and usage='main'
        UNION ALL

        -- etldoc: osm_railway_linestring_gen3  ->  layer_transportation:z10
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_railway_linestring_gen3
        WHERE zoom_level = 10
            AND railway IN ('rail', 'narrow_gauge') AND service = ''
        UNION ALL

        -- etldoc: osm_railway_linestring_gen2  ->  layer_transportation:z11
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_railway_linestring_gen2
        WHERE zoom_level = 11
            AND railway IN ('rail', 'narrow_gauge', 'light_rail') AND service = ''
        UNION ALL

        -- etldoc: osm_railway_linestring_gen1  ->  layer_transportation:z12
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_railway_linestring_gen1
        WHERE zoom_level = 12
            AND railway IN ('rail', 'narrow_gauge', 'light_rail') AND service = ''
        UNION ALL

        -- etldoc: osm_railway_linestring       ->  layer_transportation:z13
        -- etldoc: osm_railway_linestring       ->  layer_transportation:z14_
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, railway, NULL AS aerialway, NULL AS shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_railway_linestring
        WHERE zoom_level = 13
                AND railway IN ('rail', 'narrow_gauge', 'light_rail') AND service = ''
            OR zoom_Level >= 14
        UNION ALL

        -- etldoc: osm_aerialway_linestring_gen1  ->  layer_transportation:z12
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, NULL as railway, aerialway, NULL AS shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_aerialway_linestring_gen1
        WHERE zoom_level = 12
        UNION ALL

        -- etldoc: osm_aerialway_linestring       ->  layer_transportation:z13
        -- etldoc: osm_aerialway_linestring       ->  layer_transportation:z14_
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, NULL as railway, aerialway, NULL AS shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_aerialway_linestring
        WHERE zoom_level >= 13
        UNION ALL

        -- etldoc: osm_shipway_linestring_gen2  ->  layer_transportation:z11
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, NULL AS railway, NULL AS aerialway, shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_shipway_linestring_gen2
        WHERE zoom_level = 11
        UNION ALL

        -- etldoc: osm_shipway_linestring_gen1  ->  layer_transportation:z12
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, NULL AS railway, NULL AS aerialway, shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_shipway_linestring_gen1
        WHERE zoom_level = 12
        UNION ALL

        -- etldoc: osm_shipway_linestring       ->  layer_transportation:z13
        -- etldoc: osm_shipway_linestring       ->  layer_transportation:z14_
        SELECT
            osm_id, geometry, COALESCE(name, '') AS name,
            NULL AS highway, NULL AS railway, NULL AS aerialway, shipway,
            NULL AS public_transport, service_value(service) AS service,
            is_bridge, is_tunnel, is_ford, is_ramp, is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_shipway_linestring
        WHERE zoom_level >= 13
        UNION ALL

        -- NOTE: We limit the selection of polys because we need to be
        -- careful to net get false positives here because
        -- it is possible that closed linestrings appear both as
        -- highway linestrings and as polygon
        -- etldoc: osm_highway_polygon          ->  layer_transportation:z13
        -- etldoc: osm_highway_polygon          ->  layer_transportation:z14_
        SELECT
            osm_id, geometry, '' AS name,
            highway, NULL AS railway, NULL AS aerialway, NULL AS shipway,
            public_transport, NULL AS service,
            CASE WHEN man_made IN ('bridge') THEN TRUE
                ELSE FALSE
            END AS is_bridge, FALSE AS is_tunnel, FALSE AS is_ford,
            FALSE AS is_ramp, FALSE::int AS is_oneway,
            layer, NULL::int AS level, NULL::boolean AS indoor,
            z_order
        FROM osm_highway_polygon
        -- We do not want underground pedestrian areas for now
        WHERE zoom_level >= 13
            AND (
                  man_made IN ('bridge')
                  OR (is_area AND COALESCE(layer, 0) >= 0)
            )
    ) AS zoom_levels
    WHERE geometry && bbox
    ORDER BY z_order ASC;
$$ LANGUAGE SQL IMMUTABLE;

