-- database patches after the OHM data were loaded
-- add the "building" field to the buildings views, so this can be exposed into vector tiles
-- and one can see what a building is USED for, e.g. church, train station, ...

CREATE OR REPLACE VIEW osm_all_buildings AS (
         -- etldoc: osm_building_relation -> layer_building:z14_
         -- Buildings built from relations
         SELECT member AS osm_id,geometry,
                  COALESCE(nullif(as_numeric(height),-1),nullif(as_numeric(buildingheight),-1)) as height,
                  COALESCE(nullif(as_numeric(min_height),-1),nullif(as_numeric(buildingmin_height),-1)) as min_height,
                  COALESCE(nullif(as_numeric(levels),-1),nullif(as_numeric(buildinglevels),-1)) as levels,
                  COALESCE(nullif(as_numeric(min_level),-1),nullif(as_numeric(buildingmin_level),-1)) as min_level,
                  building
         FROM
         osm_building_relation WHERE building = ''
         UNION ALL

         -- etldoc: osm_building_associatedstreet -> layer_building:z14_
         -- Buildings in associatedstreet relations
         SELECT member AS osm_id,geometry,
                  COALESCE(nullif(as_numeric(height),-1),nullif(as_numeric(buildingheight),-1)) as height,
                  COALESCE(nullif(as_numeric(min_height),-1),nullif(as_numeric(buildingmin_height),-1)) as min_height,
                  COALESCE(nullif(as_numeric(levels),-1),nullif(as_numeric(buildinglevels),-1)) as levels,
                  COALESCE(nullif(as_numeric(min_level),-1),nullif(as_numeric(buildingmin_level),-1)) as min_level,
                  building
         FROM
         osm_building_associatedstreet WHERE role = 'house'
         UNION ALL
         -- etldoc: osm_building_street -> layer_building:z14_
         -- Buildings in street relations
         SELECT member AS osm_id,geometry,
                  COALESCE(nullif(as_numeric(height),-1),nullif(as_numeric(buildingheight),-1)) as height,
                  COALESCE(nullif(as_numeric(min_height),-1),nullif(as_numeric(buildingmin_height),-1)) as min_height,
                  COALESCE(nullif(as_numeric(levels),-1),nullif(as_numeric(buildinglevels),-1)) as levels,
                  COALESCE(nullif(as_numeric(min_level),-1),nullif(as_numeric(buildingmin_level),-1)) as min_level,
                  building
         FROM
         osm_building_street WHERE role = 'house'
         UNION ALL

         -- etldoc: osm_building_multipolygon -> layer_building:z14_
         -- Buildings that are inner/outer
         SELECT osm_id,geometry,
                  COALESCE(nullif(as_numeric(height),-1),nullif(as_numeric(buildingheight),-1)) as height,
                  COALESCE(nullif(as_numeric(min_height),-1),nullif(as_numeric(buildingmin_height),-1)) as min_height,
                  COALESCE(nullif(as_numeric(levels),-1),nullif(as_numeric(buildinglevels),-1)) as levels,
                  COALESCE(nullif(as_numeric(min_level),-1),nullif(as_numeric(buildingmin_level),-1)) as min_level,
                  building
         FROM
         osm_building_polygon obp WHERE EXISTS (SELECT 1 FROM osm_building_multipolygon obm WHERE obp.osm_id = obm.osm_id)
         UNION ALL
         -- etldoc: osm_building_polygon -> layer_building:z14_
         -- Standalone buildings
         SELECT osm_id,geometry,
                  COALESCE(nullif(as_numeric(height),-1),nullif(as_numeric(buildingheight),-1)) as height,
                  COALESCE(nullif(as_numeric(min_height),-1),nullif(as_numeric(buildingmin_height),-1)) as min_height,
                  COALESCE(nullif(as_numeric(levels),-1),nullif(as_numeric(buildinglevels),-1)) as levels,
                  COALESCE(nullif(as_numeric(min_level),-1),nullif(as_numeric(buildingmin_level),-1)) as min_level,
                  building
         FROM
         osm_building_polygon WHERE osm_id >= 0
);

CREATE OR REPLACE FUNCTION layer_building(bbox geometry, zoom_level int)
RETURNS TABLE(geometry geometry, osm_id bigint, render_height int, render_min_height int, building character varying) AS $$
    SELECT
        geometry,
        osm_id,
        render_height,
        render_min_height,
        CASE WHEN building = 'yes' THEN '' ELSE building END
    FROM (
        -- etldoc: osm_building_polygon_gen1 -> layer_building:z13
        SELECT
            osm_id, geometry,
            NULL::int AS render_height, NULL::int AS render_min_height,
            building
        FROM osm_building_polygon_gen1
        WHERE zoom_level = 13 AND geometry && bbox
        UNION ALL
        -- etldoc: osm_building_polygon -> layer_building:z14_
        SELECT DISTINCT ON (osm_id)
           osm_id, geometry,
           ceil( COALESCE(height, levels*3.66,5))::int AS render_height,
           floor(COALESCE(min_height, min_level*3.66,0))::int AS render_min_height,
           building
        FROM osm_all_buildings
        WHERE
            (levels IS NULL OR levels < 1000) AND
            (min_level IS NULL OR min_level < 1000) AND
            (height IS NULL OR height < 3000) AND
            (min_height IS NULL OR min_height < 3000) AND
            zoom_level >= 14 AND geometry && bbox
    ) AS zoom_levels
    ORDER BY render_height ASC, ST_YMin(geometry) DESC;
$$ LANGUAGE SQL IMMUTABLE;


