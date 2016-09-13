#!/bin/bash
rm -rf /tmp/Aries/download/
mkdir -p /tmp/Aries/download/
LOG_BASE_DIR="/tmp/sirius"
mkdir -p $LOG_BASE_DIR
echo "$LOG_BASE_DIR/uwsgi.log"
HOME=`dirname $(cd "$(dirname "$0")"; pwd)`
PYTHON_PATH="$HOME/Aries"
UWSGI_LOG="$LOG_BASE_DIR/uwsgi.log"
sed -i "s#PYTHON_PATH_XML#$PYTHON_PATH#g"  $HOME/sbin/Aries.xml
sed -i "s#UWSGI_LOG_DIR#$UWSGI_LOG#g"  $HOME/sbin/Aries.xml
cd $HOME
echo $HOME
while getopts "h" Option
do
case $Option in
h) echo "Version: `cat $HOME/VERSION`"
   echo "Usage: $0 <start|reload|stop>"
   exit
   ;;
esac
done
shift $(($OPTIND - 1))

case $1 in
start) /opt/Python-2.7/bin/uwsgi --python-path $HOME --pidfile $LOG_BASE_DIR/uwsgi.pid -x $HOME/sbin/Aries.xml ;;
reload) /opt/Python-2.7/bin/uwsgi --reload $LOG_BASE_DIR/uwsgi.pid;;
stop) /opt/Python-2.7/bin/uwsgi --stop $LOG_BASE_DIR/uwsgi.pid; rm -f $LOG_BASE_DIR/uwsgi.pid;;
esac
