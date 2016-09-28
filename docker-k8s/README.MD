
1. k8s_config目录包含三个文件，分别用于创建svc以及rc、ingress
    k8s使用：
```Bash
    kubectl create -f sirius-svc.yaml
    kubectl create -f sirius-rc.yaml
    kubectl create -f sirius-ingress.yaml
```

2. hadoop-2.6.0.tar.gz为hadoop客户端，默认的是鲁谷hadoop客户端。
  如果需要在别处使用，则需要相应的客户端来替换掉此文件。
  要求：
    2.1 tar.gz文件名字为hadoop-2.6.0.tar.gz
    2.2 解压之后文件为hadoop-2.6.0

3. hosts对应的是hadoop集群的host信息，默认是鲁谷namenode信息。
  如果需要在别处部署，则需要换成相应的hosts文件。

4. script目录包含两个文件，分别是changejs.sh以及start_script.sh

  1. changejs.sh是编译时需要的文件，无需修改。

  2. start_script.sh是启动脚本，无需修改。

5. 需要修改的文件如下：
  1. Sirius/sbin目录下Aries.xml文件
      ```Bash
        删除该行: <daemonize>UWSGI_LOG_DIR</daemonize>
      ```

  2. Sirius/package/Aries目录下webpack.config.js文件
      ```Bash
        注释掉该行： publicPath: ((isProduction ? env.basePath : '') + '/build/').replace(/\/\//, '/')
        取消该行注释：publicPath: ((isProduction ? env.basePath : '') + '/static/aries/').replace(/\/\//, '/')
      ```

6. docker镜像制作

      ```Bash
      $ docker build -t docker.baifendian.com/sjx/sirius:1 .
       $ docker push docker.baifendian.com/sjx/sirius_lugu:latest
      ```

7. 访问
```Bash
浏览器访问 sirius.bfdcloud.com
```
