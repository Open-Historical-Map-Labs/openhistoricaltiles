--
-- "water" layer, for waterbodies
-- reads from a set of 14 views, and we would like for them to have the water's name when possible
--


CREATE OR REPLACE VIEW water_z0 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM ne_110m_ocean
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_110m_lakes
);

CREATE OR REPLACE VIEW water_z1 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM ne_110m_ocean
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_110m_lakes
);

CREATE OR REPLACE VIEW water_z2 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM ne_50m_ocean
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_50m_lakes
);

CREATE OR REPLACE VIEW water_z4 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM ne_50m_ocean
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_50m_lakes
);

CREATE OR REPLACE VIEW water_z5 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM ne_10m_ocean
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z6 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM ne_10m_ocean
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon_gen6
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z7 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM ne_10m_ocean
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon_gen5
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z8 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM osm_ocean_polygon_gen4
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon_gen4
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z9 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM osm_ocean_polygon_gen3
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon_gen3
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z10 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM osm_ocean_polygon_gen2
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon_gen2
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z11 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM osm_ocean_polygon_gen1
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon_gen1
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z12 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM osm_ocean_polygon
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z13 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM osm_ocean_polygon
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);

CREATE OR REPLACE VIEW water_z14 AS (
    SELECT geometry, 'ocean'::text AS class, ''::text AS name FROM osm_ocean_polygon
    UNION ALL
    SELECT geometry, water_class(waterway) AS class, name_en AS name FROM osm_water_polygon
    UNION ALL
    SELECT geometry, 'lake'::text AS class, name FROM ne_10m_lakes
);





--
-- now the wrapper function
--

CREATE OR REPLACE FUNCTION layer_water (bbox geometry, zoom_level int)
RETURNS TABLE(geometry geometry, class text, name text) AS $$
    SELECT geometry, class::text, name::text FROM (
        -- etldoc: water_z0 ->  layer_water:z0
        SELECT * FROM water_z0 WHERE zoom_level = 0
        UNION ALL
        -- etldoc: water_z1 ->  layer_water:z1
        SELECT * FROM water_z1 WHERE zoom_level = 1
        UNION ALL
        -- etldoc: water_z2 ->  layer_water:z2
        -- etldoc: water_z2 ->  layer_water:z3
        SELECT * FROM water_z2 WHERE zoom_level BETWEEN 2 AND 3
        UNION ALL
        -- etldoc: water_z4 ->  layer_water:z4
        SELECT * FROM water_z4 WHERE zoom_level = 4
        UNION ALL
        -- etldoc: water_z5 ->  layer_water:z5
        SELECT * FROM water_z5 WHERE zoom_level = 5
        UNION ALL
        -- etldoc: water_z6 ->  layer_water:z6
        SELECT * FROM water_z6 WHERE zoom_level = 6
        UNION ALL
        -- etldoc: water_z7 ->  layer_water:z7
        SELECT * FROM water_z7 WHERE zoom_level = 7
        UNION ALL
        -- etldoc: water_z8 ->  layer_water:z8
        SELECT * FROM water_z8 WHERE zoom_level = 8
        UNION ALL
        -- etldoc: water_z9 ->  layer_water:z9
        SELECT * FROM water_z9 WHERE zoom_level = 9
        UNION ALL
        -- etldoc: water_z10 ->  layer_water:z10
        SELECT * FROM water_z10 WHERE zoom_level = 10
        UNION ALL
        -- etldoc: water_z11 ->  layer_water:z11
        SELECT * FROM water_z11 WHERE zoom_level = 11
        UNION ALL
        -- etldoc: water_z12 ->  layer_water:z12
        SELECT * FROM water_z12 WHERE zoom_level = 12
        UNION ALL
        -- etldoc: water_z13 ->  layer_water:z13
        SELECT * FROM water_z13 WHERE zoom_level = 13
        UNION ALL
        -- etldoc: water_z14 ->  layer_water:z14_
        SELECT * FROM water_z14 WHERE zoom_level >= 14
    ) AS zoom_levels
    WHERE geometry && bbox;
$$ LANGUAGE SQL IMMUTABLE;
