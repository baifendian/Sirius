import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'
import {notification} from 'antd';

var Datarequest = {
  UrlList() {
    return {
      'instances': 'v1/openstack/bfddashboard/instances/',
      'images': 'v1/openstack/images/',
      'volumes': 'v1/openstack/volumes/',
      'flavors': 'v1/openstack/flavors/',
      'volumes_post': 'v1/openstack/volumes_post/',
      'project': 'v1/openstack/project/',
      'search': 'v1/openstack/search/',
      'instances_post': 'v1/openstack/instances_post/',
      'instances_log': 'v1/openstack/instances_log/',
      'monitor': 'v1/openstack/monitor/',
    }
  },
  open_vnc(_this, select_host, fun){
    let url = this.UrlList()['instances']
    let host_id = {"host_id": select_host}
    this.xhrPostData(_this, url, host_id, 'vnc', fun)
  },
  Get_vmdisk(_this,vm_id,fun){
    let url=this.UrlList()['instances_post']+"?name=vmdisk_show&id="+vm_id
    this.xhrGetData(_this,url,fun)
  },
  Get_instances(_this, fun){
    let url = this.UrlList()['volumes_post'] + "?name=instances"
    this.xhrGetData(_this, url, fun)
  },

  Get_instances_cpu(_this,name,id,date,fun){
    let url = this.UrlList()['monitor']+"?name="+name+"&id="+id+'&date='+date
    this.xhrGetData(_this,url,fun)
  },

  Get_project(_this, fun){
    let url = this.UrlList()['project']
    this.xhrGetData(_this, url, fun)
  },
  Get_volumes_backup(_this, fun){
    let url = this.UrlList()['volumes_post'] + "?name=backup"
    this.xhrGetData(_this, url, fun)
  },
  return_data(_this, return_data){
    return return_data
  },
  posthoststop(_this, url, data_select, host_status){
    let host_select = {}
    let _url = this.UrlList()[url]
    for (var i in data_select) {
      host_select[data_select[i]['id']] = data_select[i]['name']
    }
    _this.setState({loading: true})
    this.xhrPostData(_this, _url, host_select, host_status, this.dispose_data)
  },
  update_url(_this, url, self){
    let _url = this.UrlList()[url]
    _this.setState({url: _url + '?' + Math.random(),})
  },
  dispose_data(_this, retu_data, host_status, url, self){
    _this.setState({
      loading: false,
      button_status: true,
      button_statuss: true
    })
    _this.setState({url: url + '?' + Math.random(),})
    let successful = ''
    let error = ''
    let same = ''
    for (var i in retu_data) {
      if (retu_data[i] == 'stopped') {
        same = same + i + '、'
      }
      if (!retu_data[i]) {
        error = error + i + '、'
      }
      if (retu_data[i] == true) {
        successful = successful + i + '、'
      }
    }
    if (host_status == "start") {
      if (successful.length > 0) {
        notification['success']({message: '虚拟机启动', description: successful + '启动成功',});
      }
      if (error.length > 0) {
        notification['error']({message: '虚拟机启动', description: error + '启动失败',});
      }
      if (same.length > 0) {
        notification['warning']({message: '虚拟机启动', description: same + '已经启动',});
      }
    }
    if (host_status == "stop") {
      if (successful.length > 0) {
        notification['success']({message: '虚拟机关闭', description: successful + '关闭成功',});
      }
      if (error.length > 0) {
        notification['error']({message: '虚拟机关闭', description: error + '关闭失败',});
      }
      if (same.length > 0) {
        notification['warning']({message: '虚拟机关闭', description: same + '已经关闭',});
      }
    }
    if (host_status == "restart") {
      if (successful.length > 0) notification['success']({message: '虚拟机重启', description: successful + '重启成功',})
      if (error.length > 0) {
        notification['success']({message: '虚拟机重启', description: successful + '重启失败',});
      }
      if (same.length > 0) {
        message.danger(same + '已经关闭')

      }
    }
    if (host_status == "delete") {
      if (successful.length > 0) {
        notification['success']({message: '虚拟机删除', description: successful + '删除成功',})
      }
      if (error.length > 0) {
        notification['success']({message: '虚拟机删除', description: successful + '删除失败',});
      }
    }
  },
  Get_image(_this, fun){
    this.xhrGetData(_this, "v1/openstack/images/", fun)
  },
  volumes_data(_this, url, data_select, method, fun){
    console.log(url, data_select, method, fun)
  },
  xhrPostData(_this, url, data_select, host_status, fun) {
    let self = this
    xhr({
        url: url,
        type: 'POST',
        data: {
          method: host_status,
          data: data_select
        },
        success: (retu_data) => {
          fun(_this, retu_data, host_status, url, self)
      },
      error:() => {
        message.danger('API异常！')
      }
  })
  },
  xhrGetData(_this, url, fun){
    xhr({
        url: url,
        type: 'GET',
        success: (retu_data) => {
        fun(_this, retu_data)
      }
    })
  }
}

export default Datarequest