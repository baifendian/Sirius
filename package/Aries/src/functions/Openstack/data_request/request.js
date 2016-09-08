import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'
import { notification } from 'antd';

var Datarequest = {
  UrlList() {
    return {
      'instances':'openstack/bfddashboard/instances/',
      'images':'openstack/images/',
      'volumes':'openstack/volumes/',
      'flavors':'openstack/flavors/',
      'volumes_post':'openstack/volumes_post/'
    }
  },
  open_vnc(_this,select_host,fun){
    let url=this.UrlList()['instances']
    let host_id={"host_id":select_host}
    //console.log('url',url,host_id,'vnc',fun)
    this.xhrPostData(_this,url,host_id,'vnc',fun)
  },
	posthoststop(_this,url,data_select,host_status){
	  let host_select={}
    for (var i in data_select){
      host_select[data_select[i]['id']]=data_select[i]['name']
    }
    _this.setState({loading:true})
    this.xhrPostData(_this,url,host_select,host_status,this.dispose_data)
	},
  update_url(_this,url,self){
    let _url=this.UrlList()[url]
    _this.setState({url: _url+'?'+Math.random(),})
  },
  dispose_data(_this,retu_data,host_status,url,self){
    _this.setState({
      loading:false,
      button_status: true,
      button_statuss:true
    })
    self.update_url(_this,url)
    let successful=''
    let error=''
    let same=''
    for (var i in retu_data){
      if (retu_data[i]=='stopped'){same=same+i+'、'}
      if (!retu_data[i]){error=error+i+'、'}
      if (retu_data[i]==true){successful=successful+i+'、'}
    }
    if (host_status=="start"){
      if (successful.length>0){notification['success']({ message: '虚拟机启动',description: successful+'启动成功',});}
      if (error.length>0){notification['error']({ message: '虚拟机启动',description: error+'启动失败',});}
      if (same.length>0){notification['warning']({ message: '虚拟机启动',description: same+'已经启动',});}
    }
    if (host_status=="stop"){
      if (successful.length>0){notification['success']({ message: '虚拟机关闭',description: successful+'关闭成功',});}
      if (error.length>0){notification['error']({ message: '虚拟机关闭',description: error+'关闭失败',});}
      if (same.length>0){notification['warning']({ message: '虚拟机关闭',description: same+'已经关闭',});}
    }
    if (host_status=="restart"){
      if (successful.length>0) message.success(successful+'重启成功')
      if (error.length>0){message.success(error+'重启失败')}
      if (same.length>0){message.danger(same+'已经关闭')}
    }
    if (host_status=="delete"){
      if (successful.length>0){message.success(successful+'删除成功')}
      if (error.length>0){message.success(error+'删除失败')}
    }
  },
  Get_image(_this,fun){
    this.xhrGetData(_this,"openstack/images/",fun)
  },
  volumes_data(_this,url,data_select,method,fun){
      console.log(url,data_select,method,fun)
  },
	xhrPostData(_this,url,data_select,host_status,fun) {
    let self=this
    xhr({
      url: url,
      type: 'POST',
      data:{
      	method: host_status,
        data:data_select
      },
      success: (retu_data) => {
        fun(_this,retu_data,host_status,url,self)
      }
    })
 	 },
  xhrGetData(_this,url,fun){
    xhr({
      url: url,
      type: 'GET',
      success: (retu_data) => {
        fun(_this,retu_data)
      }
    })
  }
}

export default Datarequest