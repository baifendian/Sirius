#/usr/bin/bash
HADOOP_HOME=/opt/hadoop/hadoop
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
      echo " compress......... "
      sh compress/compress.sh $HADOOP_HOME $@
      echo " compress complete! "
      echo " merge............ "
      sh merge/merge.sh $HADOOP_HOME $@
      echo " merge complete! "
else
       $base_command -$operator $@
fi
esac
