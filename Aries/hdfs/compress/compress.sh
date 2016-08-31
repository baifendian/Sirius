#!/bin/bash
#source ~/.bashrc
HADOOP_HOME=$1
shift
if [ $# -eq 1 ];then
   SOURCE=$1
   TARGET="${SOURCE}_tmp"
elif [ $# -eq 2 ]; then
   SOURCE=$1
   TARGET=$2
else
   echo "请输入需要压缩的hdfs路径"
   exit 0
fi
 
echo "hdfs 压缩前目录: ${SOURCE}"
echo "hdfs 压缩后目录: ${TARGET}"
 
if ! hadoop fs -test -d $SOURCE ;then
    echo "${SOURCE} directory is not exist! compress end"
    exit 0
fi
 
source_size=`hadoop fs -dus $SOURCE|awk '{print $1}'`
if [ "$source_size" == "0"  ];then
   echo $SOURCE" size 0 , compress end"
   exit 0
fi
if ! hadoop fs -test -d $TARGET ;then
    hadoop fs -mkdir -p $TARGET
    echo "mkdir ${TARGET} success! "
fi
 
if hadoop fs -ls $SOURCE'/*.bz2';then
   echo $SOURCE"/*.bz2 exists , compress end"
   exit 0
fi
 
per=`hadoop fs -ls $SOURCE|tail -1|awk '{print $3":"$4}'`
PWD=$(cd $(dirname $0);pwd)
JAR=$HADOOP_HOME/share/hadoop/tools/lib/hadoop-streaming-2.6.0.jar
 
hadoop version
hadoop fs -rm -R $TARGET
hadoop jar $JAR -D mapred.min.split.size=$[1024*1024*1024] \
        -D mapred.output.compress=true \
        -D mapred.output.compression.codec=org.apache.hadoop.io.compress.BZip2Codec \
        -D mapred.job.name=log_compress \
        -D mapred.reduce.tasks=0 \
        -mapper ${PWD}/line2line.pl \
        -file ${PWD}/line2line.pl \
        -input $SOURCE \
        -output $TARGET \
 
if ! hadoop fs -ls $TARGET'/_SUCCESS';then
    echo "compress fail"
    exit 1
fi
 
if [ "${SOURCE}_tmp" = "${TARGET}" ]; then
  hadoop fs -rmr ${SOURCE}
  echo "rm ${SOURCE}"
  hadoop fs -mv ${TARGET} ${SOURCE}
  echo "mv {TARGET} ${SOURCE}"
fi
hadoop fs -rmr ${SOURCE}
hadoop fs -chown -R "$per" "$TARGET"
echo "compress success!"







