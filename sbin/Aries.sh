#!/bin/bash

HOME=`dirname $(cd "$(dirname "$0")"; pwd)`
cd $HOME
echo $HOME
#export PYTHONPATH=$PYTHONPATH:/bdms/bdms2/bdms/pylib
#export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/bdms/bdms2/bdms/pylib
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
start) /opt/Python-2.7/bin/uwsgi --python-path $HOME --pidfile /opt/pan.lu/gitsource/Sirius-patch/Sirius/log/uwsgi.pid -x $HOME/sbin/Aries.xml ;;
reload) /opt/Python-2.7/bin/uwsgi --reload /opt/pan.lu/gitsource/Sirius-patch/Sirius/log/uwsgi.pid;;
stop) /opt/Python-2.7/bin/uwsgi --stop /opt/pan.lu/gitsource/Sirius-patch/Sirius/log/uwsgi.pid; rm -f /opt/pan.lu/gitsource/Sirius-patch/Sirius/log/uwsgi.pid;;
esac
