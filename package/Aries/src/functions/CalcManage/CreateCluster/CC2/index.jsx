import React from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'
import './index.less'
import NavigationInPage from 'public/NavigationInPage'

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
      ReactDOM.findDOMNode(this.refs.mdRootDiv1).style.height = (rootDivHeight+'px')

      let BigHeight = rootDivHeight - ReactDOM.findDOMNode(this.refs.NavigationInPage).clientHeight
      ReactDOM.findDOMNode( this.refs.Big1 ).style.height = BigHeight + 'px'
    },
  render(){
    let headText = '创建集群'
    let naviTexts = [{  'url':'/',   'text':'首页'   },
                     {  'url':'/CalcManage/Overview',   'text':'计算管理'   },
                     {  'url':'/CalcManage/CreateCluster/CC1',   'text':'云中心计算集群'   }]

    for ( let i = 0 ; i < naviTexts.length ; i ++ ){
      naviTexts[i]['url'] += location.search
    }

    return (
      <div className='mdRootDiv1' ref='mdRootDiv1'>
         <NavigationInPage ref="NavigationInPage" headText={headText} naviTexts={naviTexts} />
         <div className='Big1' ref='Big1'>
           <ReactMarkdown className='mdChildDiv1' source='# Kubernetes综合使用指南
本章包含了Kubernetes101，Kubernetes201以及一个留言板的例子。但是在里面插入了更多的对于Kubernetes的相关概念的解释。

这篇文档中包含了以下Kubernetes组件的介绍：
* cluster
* nodes (and node IP)
* pods (and pod IP)
* labaels
* replication controller (RC)
* service
* deployment

我们需要一个Kubernetes集群去运行这个教程。可以使用Vargrant创建一个虚拟的CoreOs集群，参照[https://github.com/k8sp/vagrant-coreos](https://github.com/k8sp/vagrant-coreos)

## The Cluster
现在我们已经运行了一个Kubernetes集群，我们可以使用以下命令去获得集群的信息：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl cluster-info
Kubernetes master is running at https://172.17.4.101:443
Heapster is running at https://172.17.4.101:443/api/v1/proxy/namespaces/kube-system/services/heapster
KubeDNS is running at https://172.17.4.101:443/api/v1/proxy/namespaces/kube-system/services/kube-dns
```
`172.17.4.101`是运行了Kubernetes master的虚拟IP地址

## Nodes
我们可以使用 `kubectl get nodes`获得nodes信息
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get nodes
NAME           STATUS                     AGE
172.17.4.101   Ready,SchedulingDisabled   5h
172.17.4.201   Ready                      5h
```
每个node都有一个IP地址，是因为每台虚拟机都有一个IP地址。当我们创建虚拟集群时，应该在Vagrant配置中指定node的IP地址。如果Kubernetes集群是用Vagrant创建的，我们可以在主机上 `ping 172.17.4.101`或 `ping 172.17.4.201`。
请注意，node的IP地址与pod的IP地址是不一样的，为了更多的了解pod IP，让我们来创建一些pods

## Pods
我们可以通过 `kubectl create -f pod_description.yaml`这条命令去创建一个pod。这里有一个示例yaml文件[pod_nginx.yaml](https://github.com/k8sp/kubernetes/blob/master/pod_nginx.yaml)

```
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
```
通过 `pod_ngnix.yaml`创建一个pod
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl create -f pod_nginx.yaml 
pod "nginx" created
```
通常下载Docker镜像需要花费一点时间，所以pod的最初状态是`ContainerCreating`:
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pod
NAME      READY     STATUS              RESTARTS   AGE
nginx     0/1       ContainerCreating   0          3s
```
添加`-o wide`参数，可以看到pod运行在哪个node上：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pod -o wide
NAME      READY     STATUS    RESTARTS   AGE       NODE
nginx     1/1       Running   0          15s       172.17.4.201
```
要知道每个Kubernetes集群的Pod都在扁平的网络命名空间里分配了一个IP地址。从网络的角度来看，pods允许一个干净的网络模型，就像虚拟机和物理机一样。(c.f.[ https://coreos.com/kubernetes/docs/latest/kubernetes-networking.html]( https://coreos.com/kubernetes/docs/latest/kubernetes-networking.html))
我们可以使用一下命令去查询Pod的IP地址：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pod nginx -o go-template={{.status.podIP}}
10.2.75.4
```
需要注意的是，在Kubernetes集群之外，Pod的IP地址是不可见的。如果我们想访问nginx的pod，需要登录到另外一个节点。如下：
```
yi@WangYis-iMac:~/work/k8sp/vagrant-coreos/coreos-kubernetes/multi-node/vagrant (master)*$ vagrant ssh w1 -c "curl http://10.2.75.4"
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
</body>
</html>
Connection to 127.0.0.1 closed.
```
如果想在Kubernetes之外访问Pod，需要根据Pod创建一个Service，因为Service是对外暴露Pods的Kubernetes组件。但是在创建Service之前，我们需要理解labels和replication controller。

## Label
为了宽容，服务通常是由一组冗余的pods组成的。那么我们怎样去选择一个group呢？由于每一个Pod都有一个独特的名字，不能清晰的指示，所以我们引入一个labels，我们可以给很多不同的pod分配一个相同的label，然后通过label去规定他们的group。
下面的 `pod_nginx_with_label.yaml`展示了怎样去定义一个label `app：nginx`
```
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:       # <-
    app: nginx  # <-
spec:
  containers:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
```
因为 `pod_nginx_with_label.yaml`和 `pod_nginx.yaml`都定义了一个名叫nginx的pod，需要删除由 `pod_nginx.yaml` 创建的pod，再根据 `pod_nginx_with_label.yaml`创建一个名叫nginx的pod：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl delete pod nginx
pod "nginx" deleted
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl create -f pod_nginx_with_label.yaml 
pod "nginx" created
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods
NAME      READY     STATUS              RESTARTS   AGE
nginx     0/1       ContainerCreating   0          6s
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods -l app=nginx
NAME      READY     STATUS    RESTARTS   AGE
nginx     1/1       Running   0          16s
```
注意：不能创建两个名字相同的pod。
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl create -f pod_nginx.yaml 
Error from server: error when creating "pod_nginx.yaml": pods "nginx" already exists
```

## Replication Controllers
如果要创建10个运行nginx的pod，是不是要创建一个服务呢？其实我们可以手动的，one-by-one的创建不同名字的pod。但是如果用Replication Controller会更方便。
接下来我们依据 [rc_ginx.yaml](https://github.com/k8sp/kubernetes/blob/master/rc_nginx.yaml)创建一个rc：
```
apiVersion: v1
kind: ReplicationController
metadata:
    name: nginx-controller
spec:
  replicas: 2
  # selector identifies the set of Pods that this
  # replication controller is responsible for managing
  selector:
    app: nginx
  # podTemplate defines the cookie cutter used for creating
  # new pods when necessary
  template:
    metadata:
      labels:
        # Important: these labels need to match the selector above
        # The api server enforces this constraint.
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
```
`rc_nginx.yaml`创建了一个两副本的名叫 `nginx-controller`的rc，label是 `app:nginx`。注意， `rc_nginx.yaml`包含了一个定义pod的模板"template"。这个template跟 `pod_nginx.yaml`非常相似。
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods
NAME      READY     STATUS    RESTARTS   AGE
nginx     1/1       Running   0          25m
```
当创建了这个rc时，Kubernetes会运行在一个新的pod上：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl create -f rc_nginx.yaml 
replicationcontroller "nginx-controller" created
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods
NAME                     READY     STATUS              RESTARTS   AGE
nginx                    1/1       Running             0          25m
nginx-controller-58t5s   0/1       ContainerCreating   0          5s
```
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get rc
NAME               DESIRED   CURRENT   AGE
nginx-controller   2         2         36s
```
删除rc会删除两个pods，其中包含了一个由 `pod_nginx.yaml`手动创建的pod。
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl delete rc nginx-controller
replicationcontroller "nginx-controller" deleted
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods
```
## Service
最后，我们可以通过 `service_nginx.yaml`创建一个包含所有pods的服务，yaml文件如下：
```
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  ports:
  - port: 8000 # the port that this service should serve on
    # the container on each pod to connect to, can be a name
    # (e.g. www) or a number (e.g. 80)
    targetPort: 80
    protocol: TCP
  # just like the selector in the replication controller,
  # but this time it identifies the set of pods to load balance
  # traffic to.
  selector:
    app: nginx
```
我们之前已经运行了一个包含两个nginx pod的RC。这些pods的label是 `app: nginx`，根据以下命令创建一个service：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl create -f service_nginx.yaml 
service "nginx-service" created
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods
NAME                     READY     STATUS    RESTARTS   AGE
nginx-controller-0xc3c   1/1       Running   0          23m
nginx-controller-oii7h   1/1       Running   0          23m
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get rc
NAME               DESIRED   CURRENT   AGE
nginx-controller   2         2         24m
```
删除service并不影响RC和pods：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl delete service nginx-service
service "nginx-service" deleted
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods
NAME                     READY     STATUS    RESTARTS   AGE
nginx-controller-0xc3c   1/1       Running   0          24m
nginx-controller-oii7h   1/1       Running   0          24m
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get rc
NAME               DESIRED   CURRENT   AGE
nginx-controller   2         2         24m
```
如果想清空所有东西，需要删除RC，这个操作也会删除pods：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl delete rc nginx-controller
replicationcontroller "nginx-controller" deleted
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods
```
现在已经没有名叫 `app: nginx`的pods了，如果继续创建一个service，里面是不会有任何pos的：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl create -f service_nginx.yaml 
service "nginx-service" created
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get rc
```
现在可以创建service-wanted的label， `app: nginx`：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl create -f rc_nginx.yaml 
replicationcontroller "nginx-controller" created
```
检查服务：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl describe service
Name:           kubernetes
  ....
Name:           nginx-service
  ....
Endpoints:      10.2.75.4:80,10.2.75.5:80
  ....
```
注意上面有两个Endpoints。实际上是新创建的两个Pods，查看一下：
```
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pods -l app=nginx -o wide
NAME                     READY     STATUS    RESTARTS   AGE       NODE
nginx-controller-pioas   1/1       Running   0          8m        172.17.4.201
nginx-controller-s9q1l   1/1       Running   0          8m        172.17.4.201
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pod nginx-controller-pioas -o go-template={{.status.podIP}}
10.2.75.4
yi@WangYis-iMac:~/work/k8sp/kubernetes $ kubectl get pod nginx-controller-s9q1l -o go-template={{.status.podIP}}
10.2.75.5
```
## Load Balancer
现在，我们还不能在Kubernetes之外访问nginx服务。因为Kubernetes集群还没有创建load balancer，所以服务还没有对外暴露。
Load balancer是对外暴露Kubernetes的三种方式之一，其他两种分别是ClusterIP和NodePort。请参见[http://rafabene.com/2015/11/11/how-expose-kubernetes-services/](http://rafabene.com/2015/11/11/how-expose-kubernetes-services/)：
1. `ClusterIP`：默认使用集群内部IP，使用这种方式只能从集群内部访问service
1. `NodePort`：集群内部IP之上，每个节点上都会使用同一个的端口暴露服务，可以在所有NodePort地址上访问服务
1. `LoadBalancer`：集群内部IP之上，也在NodePort上暴露服务。但是在暴露服务之前会先询问云服务器
 可以通过YAML文件中的 `ServiceType`来选择上述三种方式。
 如果集群运行在GKE或者AWS上，建议选择 `LoadBalancer`这种方式。因为GKE和AWS提供load balancers。如果集群运行在Vagrant上，建议选择 `NodePort`。详情请见：[http://rafabene.com/2015/11/11/how-expose-kubernetes-services/](http://rafabene.com/2015/11/11/how-expose-kubernetes-services/)
 
## Networking
想知道node IP, pod IP, 外部IP之间是如何交互的，请参见：[https://coreos.com/kubernetes/docs/latest/kubernetes-networking.html](https://coreos.com/kubernetes/docs/latest/kubernetes-networking.html)
理解Kubernetes之间是如何通信的，才能更好的理解load balancer，以下为各组件之间的通信方式：
1. *Container-to-ContainerL*: Kubernetes给每个pod分配一个IP地址，因此Pod中的containers被标识为 `localhost` 和不同的端口
1. *Pod-to-Pod:* 每个pod都会在扁平的网络命名空间里分配一个IP地址。我们不需要明确pod之间创建的联系，也不需要处理container端口到主机端口的映射。
1. *Pod-to-Service:* Service通过分配一个虚拟IP地址被实现，这个Virtual IP可以通过透明的代理访问Pods。请求Service IP将会被运行在host上的kube层代理所拦截，kube-proxy主要负责路由到正确的Pod。
1. *External-to-Internal:* 通常通过配置指向节点的load balancer就可以从外部网络访问集群。一旦流量到达一个节点，则其通过kube的代理路由到达服务后端。
更多关于Kubernetes的网络信息请[click here](https://github.com/k8sp/kubernetes/blob/master/networking/README.md)

## Deployment
上述的例子展示了如何通过RC创建pods，和将创建的pods包成一个服务。但是在实际情况中，很少会直接使用RC去创建pods，相反，更多的是选择直接部署。因为直接部署可以更好的去控制扩容和回滚事物。

' />
        </div>
      </div>
    )
  }
})