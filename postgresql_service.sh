#!/bin/bash

NAME="PostgreSQL in Docker"
DOCKER_CONTAINER="openmaptiles_postgres_1"

case "$1" in
  start)
        echo "Starting $NAME"

        docker start $DOCKER_CONTAINER
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
