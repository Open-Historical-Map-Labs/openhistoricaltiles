#!/bin/bash

NAME="OSM diffs consumer"
HOMEDIR="/home/ubuntu/OPENMAPTILES/openmaptiles"
DOCKER_CONTAINER="openmaptiles_update-osm_run_1"
LOGFILE="/home/ubuntu/OPENMAPTILES/openmaptiles/data/ohmdiffs_service.log"

case "$1" in
  start)
        echo "Starting $NAME"

        cd $HOMEDIR
        /usr/local/bin/docker-compose run --rm update-osm >> $LOGFILE &
        ;;
  stop)
        echo "Stopping $NAME"

        docker stop $DOCKER_CONTAINER
        ;;
  restart)
        $0 stop
        sleep 10
        $0 start
        ;;
  *)
        echo "Usage: $SCRIPTNAME {start|stop|restart}" >&2
        exit 3
        ;;
esac
