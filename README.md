# Sirius

## 页面编译、部署

#### 编译
<pre><code>
    $ cd package/Aries
    
    # 更换npm的源以提速
    $ npm config set registry https://registry.npm.taobao.org

    $ rm -rf node_modules
    
    $ npm install
    
    # 查看输出消息，如果没错误，则可以继续；如果发现错误，则需要根据错误消息进行调整
    $ npm start

    $ vim webpack.config.js
        注释该行：
            publicPath: ((isProduction ? env.basePath : '') + '/build/').replace(/\/\//, '/')
        取消注释该行：
            publicPath: ((isProduction ? env.basePath : '') + '/static/aries/').replace(/\/\//, '/')

    $ npm run build

    # 如果编译成功，则当前目录下将会生成 build 文件夹和 index.jsp 文件
</code></pre>

#### 部署
<pre><code>
    # 回到项目根目录
    $ cd Sirus

    # 删除文件夹中的所有内容
    $ rm -rf Aries/static/aries/*

    # 将新编译的页面文件移到文件中
    $ mv package/Aries/build/* Aries/static/aries/

    # 取出 package/Aries/index.jsp 文件内最后一个script标签引用的src的js文件名（只是文件名，不包含路径）
        格式如：	app.1f5c0143667220271b14.js
    # 替换到 Aries/user_auth/templates/index/index.html 文件的相同位置（只替换文件名，不替换路径）
</code></pre>

## k8s-dashboard-agent
* 将k8s的API返回的复杂数据的处理放到后端进行
* 避免出现跨域请求拒绝的问题，方便 dashboard 的开发工作

#### 开发环境
<pre><code>
    Python == 2.7.10
    Django == 1.6.2
    MySQL-python
</code></pre>

#### 配置（修改 **Aries\Aries\settings.py**）
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


