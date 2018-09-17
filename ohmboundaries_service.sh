#!/bin/bash
# not really a service; just a enable/disable wrapper for the cronjob
# so we have a consistent method of knowing that our various services & tasks are enabled/disabled
# see also  /etc/cron.daily/ohmborders

NAME="OHM Boundaries Replacement"
LOCKFILE="/tmp/ohmborders_import.ok"
HOMEDIR="/home/ubuntu/OPENMAPTILES/openmaptiles"
LOGFILE="/home/ubuntu/OPENMAPTILES/openmaptiles/data/ohmborders_cronjob.log"

# after running the OSM Borders import tasks, run this to create the views used for vectiles
SQLPOSTFILE="/home/ubuntu/OPENMAPTILES/openmaptiles/layers/boundary/boundary.sql"

case "$1" in
  start)
        echo "Enabling $NAME cronjob"
        touch LOCKFILE
        ;;
  stop)
        echo "Disabling $NAME cronjob"
        rm -f LOCKFILE
        ;;
  run)
        # this is called via cronjob, and bails if our file isn't found
        if [ ! -f LOCKFILE ]; then
            echo "$NAME Aborting: $LOCKFILE not found"
            exit 1
        fi

        cd $HOMEDIR

        echo "`date` starting makecsv-osmborder task" >> $LOGFILE
        /usr/local/bin/docker-compose run --rm makecsv-osmborder >> $LOGFILE

        echo "`date` starting import-osmborder task" >> $LOGFILE
        /usr/local/bin/docker-compose run --rm import-osmborder >> $LOGFILE

        echo "`date` re-creating boundary_zX views" >> $LOGFILE
        psql -h 127.0.0.1 -U openmaptiles -f $SQLPOSTFILE

        echo "`date` finished all tasks" >> $LOGFILE
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
