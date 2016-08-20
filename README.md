# Sirius

## namespace的命名规则
<pre><code>
    与python中的变量名具有相同的规则，即：以字母、下划线开头，直接接任意的字母、下划线、数字
</code></pre>

## 使用手册

![Alt text][pod_info_image]


[pod_info_image]: readme/pod_info.png 'pod_info'


## 前端静态页面编译

<pre><code>
    # 搭建Node开发环境，Node.js (>= v6.3.0)

    # 更换npm的源以提速
    $ npm config set registry https://registry.npm.taobao.org
    
    $ npm install -g yo

    $ npm install -g generator-bfd

    $ cd Sirius/package/Aries
    
    $ rm -rf node_modules
    
    $ npm install

    # 试运行的配置 - webpack.config.js
    $ vim webpack.config.js
        取消注释该行：
            publicPath: ((isProduction ? env.basePath : '') + '/build/').replace(/\/\//, '/')
        注释该行：
            publicPath: ((isProduction ? env.basePath : '') + '/static/aries/').replace(/\/\//, '/')
    
    # 试运行的配置 - src/env.js
    $ vim src/env.js
        env.baseUrl = 'http://172.24.3.64:10087/'      // 改为一个有效的后台Django地址

    # 查看输出消息，如果没错误，则可以继续；如果发现错误，则需要根据错误消息进行调整
    $ npm start

    # 编译时的配置 - webpack.config.js
    $ vim webpack.config.js
        注释该行：
            publicPath: ((isProduction ? env.basePath : '') + '/build/').replace(/\/\//, '/')
        取消注释该行：
            publicPath: ((isProduction ? env.basePath : '') + '/static/aries/').replace(/\/\//, '/')

    $ npm run build

    # 如果编译成功，则当前目录下将会生成 build 文件夹和 index.jsp 文件
    # 回到项目根目录
    $ cd Sirus

    # 删除文件夹中的所有内容
    $ rm -rf Aries/static/aries/*

    # 将新编译的页面文件移到文件中
    $ mv package/Aries/build/* Aries/static/aries/
    $ rm -rf package/Aries/build

    # 取出 package/Aries/index.jsp 文件内最后一个script标签引用的src的js文件名（只是文件名，不包含路径）
        形如：	app.1f5c0143667220271b14.js
    # 替换到 Aries/user_auth/templates/index/index.html 文件的相同位置（只替换文件名，不替换路径）
    rm package/Aries/index.jsp
</code></pre>

## 后台服务的环境搭建、启动

#### 环境搭建
<pre><code>
    # 安装 Python == 2.7.10、virtualenv

    $ virtualenv --no-site-packages SiriusEnv
    $ source SiriusEnv/bin/activate

    $ pip install django==1.6.2

    $ pip install MySQL-python

</code></pre>

#### 修改配置

##### Aries\Aries\settings.py 文件

* k8s原生服务地址
<pre><code>
	K8S_IP = '172.24.3.150'
	K8S_PORT = 8080
</code></pre>

* BDMS数据源
<pre><code>
    DATABASES = {
        'xxx'{              # 其它数据库连接
        },
        'kd_agent_bdms': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'bdms_web',
            'USER': 'xxx',
            'PASSWORD': 'xxx',
            'HOST': 'xxx',
            'PORT': '3306',
        }
    }
</code></pre>

* Log文件路径
<pre><code>
    LOGGING = {
	    'xxx':{
        },
        'handlers':{
            'xxx':{
            },
                'kd_agent_file': {
                'level':'DEBUG',
                'class':'logging.FileHandler',
                'formatter': 'complete',
                'filename' :'/root/pan.guo/logs/kd_agent.log'.replace('\\','/')     # 修改log路径
            }
        }
        'loggers': {
            'xxx': {
            },
            'kd_agent_log': {
                'handlers':['kd_agent_file','console'],
                'propagate': False,
                'level':'DEBUG',
            },
        }
    }
</code></pre>

##### sbin/Aries.sh 文件
<pre><code>
    # 设置 uwsgi.pid 文件的路径，并保证start、reload、stop命令使用的是同一个uwsgi.pid文件

    case $1 in
    start) /opt/Python-2.7/bin/uwsgi --python-path $HOME --pidfile xxx/logs/uwsgi.pid -x $HOME/sbin/Aries.xml ;;
    reload) /opt/Python-2.7/bin/uwsgi --reload xxx/logs/uwsgi.pid;
    stop) /opt/Python-2.7/bin/uwsgi --stop xxx/logs/uwsgi.pid; rm -f xxx/logs/uwsgi.pid;;
    esac
</code><pre>

##### sbin/Aries.xml 文件
<pre><code>
    pythonpath:      xxx/Sirius/Aries            # Sirius项目的Aries后台服务项目的绝对路径
    module:          Aries.wsgi                  # Aries
    daemonize:       xxx/logs/uwsgi.log          # log文件的绝对路径
    http:            0.0.0.0:10087               # Aries项目的端口号
</code><pre>







