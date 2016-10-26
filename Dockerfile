FROM docker.baifendian.com/sjx/sirius_base
MAINTAINER jingxia.sun <jingxia.sun@baifendian.com>

ENV SIRIUS_PATH /opt/Sirius
RUN mkdir -p /opt/Sirius
ADD . /opt/Sirius

RUN rm -rf /opt/hadoop/etc/hadoop
ADD ./hadoop /opt/hadoop/etc/

RUN mkdir -p /opt/bfdhadoop/tmp/data && \
    mkdir /opt/bfdhadoop/dfs.namenode.dir && \
    mkdir /opt/bfdhadoop/dfs.datanode.dir && \
    mkdir /opt/bfdhadoop/journal && \
    mkdir -p /opt/bfdhadoop/yarn_dir/local-dirs && \
    mkdir -p /opt/bfdhadoop/yarn_dir/log-dirs && \
    mkdir -p /opt/bfdhadoop/yarn_dir/log-aggregation && \
    mkdir -p /tmp/mr_history/tmp /tmp/mr_history/done && \
    cd /root && \
    source /etc/profile

RUN cd $SIRIUS_PATH/package/Aries && \
    rm -rf node_modules && \
    npm install && \
    npm run build && \
    cd $SIRIUS_PATH && \
    cp -r package/Aries/build/* Aries/static/aries/ && \
    rm -rf package/Aries/build && \
    chmod +x $SIRIUS_PATH/docker-k8s/script/changejs.sh &&\
    sh $SIRIUS_PATH/docker-k8s/script/changejs.sh 

RUN mkdir -p $SIRIUS_PATH/log &&\
    mkdir -p $SIRIUS_PATH/download  

RUN adduser hadoop && \
    adduser bre && \
    adduser bae

VOLUME  ["/opt/Sirius/log"]
VOLUME  ["/opt/Sirius/download"]
RUN chmod +x $SIRIUS_PATH/sbin/Aries.sh &&\
    chmod +x $SIRIUS_PATH/docker-k8s/script/start_script.sh   
EXPOSE 10086
#CMD /opt/Sirius/sbin/Aries.sh start >>/opt/Sirius/log/uwsgi.log
CMD sh $SIRIUS_PATH/docker-k8s/script/start_script.sh



