import React from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'
import '../index.less'
import NavigationInPage from 'public/NavigationInPage'
import CalcManageConf from '../../UrlConf'

export default React.createClass({
   //动态计算组件高度
    componentDidMount(){
      this.calcDesiredHeight()
      window.onresize = ()=>{ this.onWindowResize() }
    },

    onWindowResize(){
      window.onresize = undefined
      this.calcDesiredHeight()
      window.onresize = ()=>{ this.onWindowResize() }
    },

    calcRootDivHeight(){
      let totalHeight = document.body.clientHeight
      totalHeight -= document.getElementById('header').clientHeight
      totalHeight -= document.getElementById('footer').clientHeight
      totalHeight -= 20*2               // 去掉设置的子页面padding
      return totalHeight
    },
    calcDesiredHeight(){
      let rootDivHeight = this.calcRootDivHeight()
      ReactDOM.findDOMNode(this.refs.mdRootDiv).style.height = (rootDivHeight+'px')
      let BigHeight = rootDivHeight - ReactDOM.findDOMNode(this.refs.NavigationInPage).clientHeight
      ReactDOM.findDOMNode( this.refs.Big ).style.height = BigHeight + 'px'
    },

  render(){
    var source = ['# 入门',
'云中心计算服务，是基于kubernetes的通用计算平台。可以轻松的调度Web服务，计算框架如storm, hadoop, tensorflow，中间件如redis, memcache, mongodb。任意可以作为docker镜像运行的程序或应用都可以调度在kubernetes之上，享受强大通用计算集群的能力。',
'本文档将快速引导云中心计算服务的使用方法，并指导用户如何快速的在云端启动一个Hello World的Web应用。',
'## 准备环境',
'### 下载kubectl客户端',
'可以选择从以下链接下载对应的版本',
'#### OSX',
'  * [官方v1.2.4](https://storage.googleapis.com/kubernetes-release/release/v1.2.4/bin/darwin/amd64/kubectl)',
'  * [百分点镜像v1.2.4](http://172.24.100.40:10086/k8s/download/?sys=osx)',
'#### Linux',
'  * [官方v1.2.4](https://storage.googleapis.com/kubernetes-release/release/v1.2.4/bin/linux/amd64/kubectl)',
'  * [百分点镜像v1.2.4](http://172.24.100.40:10086/k8s/download/?sys=linux)',
'### 配置kubectl客户端',
'* 替换 ${MASTER_HOST} 到百分点云中心的kubernetes服务地址:```k8s.bfdcloud.com```',
'* 和管理员申请分配一个你自己的帐号，并获取对应的key文件，包括ca.pem, user-key.pem和user.pem',
'* 替换 ${CA_CERT} 为获取到的ca.pem文件的绝对路径，如```/home/core/.kube/ca.pem```',
'* 替换 ${ADMIN_KEY} 为获取到的user-key.pem的路径，如```/home/core/.kube/admin-key.pem```',
'* 替换 ${ADMIN_CERT} 为获取到的user.pem的路径，如```/home/core/.kube/admin.pem```',
'* 替换 ${NAMESPACE} 为管理员分配给你的namespace（字符串）',
'\n',
'然后执行下面的命令完成对kubectl客户端的配置：',
'```',
'$ kubectl config set-cluster default-cluster --server=https://${MASTER_HOST} --certificate-authority=${CA_CERT}',
'$ kubectl config set-credentials default-admin --certificate-authority=${CA_CERT} --client-key=${ADMIN_KEY} --client-certificate=${ADMIN_CERT}',
'$ kubectl config set-context default-system --cluster=default-cluster --user=default-admin --namespace=${NAMESPACE}',
'$ kubectl config use-context default-system',
'```',
'### 测试kubectl客户端可用',
'执行下面的命令，观察返回结果是否正常，判断是否已经完成客户端的正确配置：',
'```',
'$ kubectl get po',
'NAME                             READY     STATUS    RESTARTS   AGE',
'my-test-server-rkvw7             1/1       Running   5          2d',
'```',
'如果返回异常可以联系管理员帮助排查和解决。',
'',
'## 启动一个Hello World Nginx服务',
'通过下面的命令，将一个Hello world web应用提交到kubernetes集群，并可以通过外网访问。',
'```shell',
'git clone https://github.com/k8sp/bigdata.git',
'cd bigdata/webapp',
'kubectl create -f rc-hello.yaml:',
'kubectl create -f service-hello.yaml',
'kubectl create -f ingress.yaml',
'```',
'其中此web应用的代码在```bigdata/webapp/hello```中可以查看',
'如果要查看提交的Hello world web应用的运行状态（ReplicationController, Pod, Service, ingress）可以通过下面的命令查看，或直接通过"容器云"下的界面查看',
'```shell',
'kubectl get rc',
'kubectl get po',
'kubectl get svc',
'kubectl get ing',
'```',
'等待执行成功，就可以通过访问[http://hellos.bfdcloud.com](http://hellos.bfdcloud.com)看到结果。',
'## 运行更多的应用',
'参考：[https://github.com/k8sp/bigdata](https://github.com/k8sp/bigdata) 中的实例可以在自己的namespace下使用各种应用。']
    let str = ''
    for ( let i = 0 ; i < source.length ; i ++ ){
      str += source[i] + '\n'
    }
    let spaceName = CalcManageConf.getCurSpace(this);
    return (
      <div className='mdRootDiv' ref='mdRootDiv'>
        <NavigationInPage ref='NavigationInPage'
                          headText={CalcManageConf.getNavigationData({
                            moduleName:'UserDoc',
                            pageName:'CC1',
                            type : 'headText'
                          })} 
                          naviTexts={CalcManageConf.getNavigationData({
                            moduleName:'UserDoc',
                            pageName:'CC1',
                            type:'navigationTexts',
                            spaceName:spaceName
                          })} />
         <div className='Big' ref='Big' >
           <ReactMarkdown className='mdChildDiv' source = {str} />
         </div>
      </div>
    )
  }
})
