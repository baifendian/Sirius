#/bin/bash
#The reserved environment variable configuration script. 2016.11.10
export JAVA_HOME=/opt/java
export HADOOP_HOME=/opt/hadoop
export HADOOP_DEV_HOME=${HADOOP_HOME}
export HADOOP_PREFIX=${HADOOP_HOME}
export PATH=$PATH:$HADOOP_DEV_HOME/bin:${JAVA_HOME}/bin:$PATH
export PATH=$PATH:$HADOOP_DEV_HOME/sbin:/bin
export HADOOP_MAPARED_HOME=${HADOOP_DEV_HOME}
export HADOOP_COMMON_HOME=${HADOOP_DEV_HOME}
export HADOOP_HDFS_HOME=${HADOOP_DEV_HOME}
export YARN_HOME=${HADOOP_DEV_HOME}
export HADOOP_YARN_HOME=${HADOOP_DEV_HOME}
export HADOOP_CLIENT_CONF_DIR=${HADOOP_DEV_HOME}/etc/hadoop
export HADOOP_CONF_DIR=${HADOOP_DEV_HOME}/etc/hadoop
export HDFS_CONF_DIR=${HADOOP_DEV_HOME}/etc/hadoop
export YARN_CONF_DIR=${HADOOP_DEV_HOME}/etc/hadoop
export CLASSPATH=".:$JAVA_HOME/lib:":$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export PATH="$JAVA_HOME/:$HADOOP_PREFIX/bin:$PATH"
export HADOOP_COMMON_LIB_NATIVE_DIR=${HADOOP_PREFIX}/lib/native
export HADOOP_VERSION=2.6.0
export HADOOP_OPTS="-Djava.library.path=$HADOOP_PREFIX/lib/native"
#export HADOOP_CLASSPATH=/opt/hadoop/tez-0.5.2/lib/*:/opt/hadoop/tez-0.5.2
