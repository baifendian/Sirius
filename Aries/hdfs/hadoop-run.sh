#/usr/bin/bash
HADOOP_HOME=/opt/hadoop
NAMENODE_PATH="hdfs://172.24.100.44:8020"
BASE_PATH=$(pwd)
operator=$1
shift
base_command="${HADOOP_HOME}/bin/hadoop fs"
case $operator in mv|cp|rmr|ls|put|get|du|chmod|chown|compress)
target_path=$1

if [ "$operator" = "du" ] ; then
       #统计某个目录下面的所有文件或文件夹的大小
       $base_command -$operator $target_path |awk '{print $1}' |awk '{sum += $1};END {print sum}'|grep '^[0-9]'
elif [ "$operator" = "compress" ] ; then
      #启动压缩程序
      echo " merge............ "
      sh ${BASE_PATH}/merge/merge.sh $HADOOP_HOME $NAMENODE_PATH $@
      echo " merge complete! "
      echo " compress......... "
      sh ${BASE_PATH}/compress/compress.sh $HADOOP_HOME $@
      echo " compress complete! "
else
       $base_command -$operator $@
fi
esac
