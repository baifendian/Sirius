# Sirius

## k8s-dashboard-agent

* 将k8s的API返回的复杂数据的处理放到后端进行
* 避免出现跨域请求拒绝的问题，方便 dashboard 的开发工作

### 开发环境
<pre>
<code>
    Python == 2.7.10
    Django == 1.6.2
    MySQL-python
</code>
</pre>

### 配置（修改 **Aries\Aries\settings.py**）
1. k8s原生服务地址

<pre><code>
        K8S_IP = '172.24.3.150'
        K8S_PORT = 8080
</code></pre>

2. BDMS数据源

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






