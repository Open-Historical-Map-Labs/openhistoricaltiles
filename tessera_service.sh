#!/bin/bash

NAME="Tessera vectortile server"
HOMEDIR="/home/ubuntu"
OMTDIR="$HOMEDIR/OPENMAPTILES/openhistoricaltiles"
TMSOURCEFOLDER="./openmaptiles.tm2source"  # relative to $OMTDIR
NODEVERSION="6.14.3"

TESSERA_MORE_FLAGS="--multiprocess --processes=4 --cache-size=0"

case "$1" in
  start)
        echo "Starting $NAME"

        # run NVM to get the right Node version
        source $HOMEDIR/.nvm/nvm.sh
        nvm use $NODEVERSION

        # start it
        cd $OMTDIR
        nohup $HOMEDIR/node_modules/.bin/tessera $TESSERA_MORE_FLAGS tmsource://$TMSOURCEFOLDER >/dev/null &
        ;;
  stop)
        echo "Stopping $NAME"

        pid=`ps ax | grep tessera | grep node | grep -v grep | grep -v nvm | awk '{ print $1 }'`
        if [ "$pid" = "" ]; then
            echo "Tessera is not running"
        else
            kill $pid
        fi
        ;;
  restart)
        $0 stop
        sleep 2
        $0 start
        ;;
  *)
        echo "Usage: $SCRIPTNAME {start|stop|restart}" >&2
        exit 3
        ;;
esac
