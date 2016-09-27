FROM docker.baifendian.com/sjx/sirius_base
MAINTAINER jingxia.sun <jingxia.sun@baifendian.com>

ENV SIRIUS_PATH /opt/Sirius
RUN mkdir -p /opt/Sirius
ADD . /opt/Sirius
#更新hadoop客户端
RUN rm -rf /opt/hadoop && \
    tar -xzvf $SIRIUS_PATH/docker-k8s/hadoop-2.6.0.tar.gz &&\
    ls && pwd && \
    mv hadoop-2.6.0 /opt/hadoop

#编译代码
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

#添加用户
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



