import React from 'react'
import ReactMarkdown from 'react-markdown'


export default React.createClass({
  render(){
  	var kubectl_command = '# 下载kubectl命令 \n * 下载kubectl命令'
    var kube_config = '# 配置.kube/config以访问集群 '
    var hello_world = '# 提交一个Hello World web应用'
    var coded = '```\n kubectl get pods \n kubectl get nodes \n ```'
    var foo = '*More infomation is on [GitHub](//github.com/k8sp)*'
    return (
      <div>
         <ReactMarkdown source={kubectl_command} /> 
         <ReactMarkdown source={kube_config} />
         <ReactMarkdown source={hello_world} />
         <ReactMarkdown source={coded} />
         <ReactMarkdown  source={foo} />

      </div>
    )
  }
})