
1. k8s_config目录包含三个文件，分别用于创建svc以及rc、ingress
    k8s使用：
```Bash
    kubectl create -f sirius-svc.yaml
    kubectl create -f sirius-rc.yaml
    kubectl create -f sirius-ingress.yaml
```


2. 需要修改的文件如下：
  1. Sirius/sbin目录下Aries.xml文件
      ```Bash
        删除该行: <daemonize>UWSGI_LOG_DIR</daemonize>
      ```

  2. Sirius/package/Aries目录下webpack.config.js文件
      ```Bash
        注释掉该行： publicPath: ((isProduction ? env.basePath : '') + '/build/').replace(/\/\//, '/')
        取消该行注释：publicPath: ((isProduction ? env.basePath : '') + '/static/aries/').replace(/\/\//, '/')
      ```
  3.Sirius/sbin/目录下，将Aries.yaml文件替换成Aries.yaml.k8s(k8s专用配置文件)

3. docker镜像制作

      ```Bash
      $ docker build -t docker.baifendian.com/sjx/sirius:1 .
       $ docker push docker.baifendian.com/sjx/sirius_lugu:latest
      ```

4. 访问
```Bash
浏览器访问 sirius.bfdcloud.com
```
