#!/bin/bash

NAME="Tessera vectortile server"
HOMEDIR="/home/ubuntu"
OMTDIR="$HOMEDIR/OPENMAPTILES/openhistoricaltiles"
TMSOURCEFOLDER="./openmaptiles.tm2source"  # relative to $OMTDIR
NODEVERSION="6.14.3"


case "$1" in
  start)
        echo "Starting $NAME"

        # run NVM to get the right Node version
        source $HOMEDIR/.nvm/nvm.sh
        nvm use $NODEVERSION

        # start the PostgerSQL docker
        docker start openmaptiles_postgres_1
        sleep 10

        # start it
        cd $OMTDIR
        $HOMEDIR/node_modules/.bin/tessera --multiprocess --processes=4 --cache-size=100 tmsource://$TMSOURCEFOLDER &
        ;;
  stop)
        echo "Stopping $NAME"

        # stop the PostgerSQL docker
        docker stop openmaptiles_postgres_1

        kill `pgrep -f tessera`
        ;;
  restart)
        $0 stop
        $0 start
        ;;
  *)
        echo "Usage: $SCRIPTNAME {start|stop|restart}" >&2
        exit 3
        ;;
esac
