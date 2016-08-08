#/usr/bin/bash
operator=$1
shift
base_command="/opt/hadoop/hadoop/bin/hadoop fs"
case $operator in mv|cp|rmr|ls|put|get|du|chmod|chown|rmr)
target_path=$1
if [ "$operator" = "du" ] ; then
       #统计某个目录下面的所有文件或文件夹的大小
       $base_command -$operator $target_path |awk '{print $1}' |awk '{sum += $1};END {print sum}'|grep '^[0-9]'
else
       $base_command -$operator $@
fi
esac
