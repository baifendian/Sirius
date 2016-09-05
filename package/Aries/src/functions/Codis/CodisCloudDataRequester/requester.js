import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd/message'
import Toolkit from 'public/Toolkit/index.js'

var CalcManageDataRequester = {
  getCurNameSpace( _this ) {
    return _this.props.location.query.cur_space
  },
  getUrlForm() {
    return {
      'codisList': 'v1/codis/codis/',
      'hostList': 'v1/codis/hosts/',
      'serviceList': 'k8s/api/v1/namespaces/{nameSpace}/services',
      'rclist': 'k8s/api/v1/namespaces/{nameSpace}/replicationcontrollers',
      'mytasklist': 'k8s/api/v1/namespaces/mytasklist',
      'getproxydata':'v1/codis/proxyinfo/',
      'getserverdata':'v1/codis/serverinfo/',
      'getpicdata':'v1/codis/getallcodisinfo/',
      'getlogdata':'v1/codis/codislog/',
      'offlineproxy':'v1/codis/deleteproxy/'
    }
  },

  getLogData( codis_id, callback ) {
    let url = this.getUrlForm()['getlogdata']
    let data = {
      product_id:codis_id
    }
    this.xhrPostData(url, data, callback)
  },

  offlineProxy( proxy_addr, callback ) {
    let url = this.getUrlForm()['offlineproxy']
    let data = {
      proxy_addr:proxy_addr
    }
    this.xhrPostData(url, data, callback)
  },

  getProxyData( codis_id, callback ) {
    let url = this.getUrlForm()['getproxydata']
    let data = {
      codis_id:codis_id
    }
    this.xhrPostData(url, data, callback)
  },

  getServerData( codis_id, callback ) {
    let url = this.getUrlForm()['getserverdata']
    let data = {
      codis_id:codis_id
    }
    this.xhrPostData(url, data, callback)
  },

  getPicData( codis_id, callback ) {
    let url = this.getUrlForm()['getpicdata']
    let data = {
      codis_id:codis_id
    }
    this.xhrPostData(url, data, callback)
  },

  getMytaskList(_this, callback) {
    let url = this.getUrlForm()['mytasklist']
    this.xhrGetData(url, _this, callback)

  },
  getCodisList(_this, callback) {
    let url = Toolkit.strFormatter.formatString(this.getUrlForm()['codisList'], {
      'nameSpace': this.getCurNameSpace( _this )
    })
    this.xhrGetData(url, _this, callback)
  },
  getHostList(_this, callback) {
    let url = Toolkit.strFormatter.formatString(this.getUrlForm()['hostList'], {
      'nameSpace': this.getCurNameSpace( _this )
    })
    this.xhrGetData(url, _this, callback)
  },
  getServiceList(_this, callback) {
    let url = Toolkit.strFormatter.formatString(this.getUrlForm()['serviceList'], {
      'nameSpace': this.getCurNameSpace( _this )
    })
    this.xhrGetData(url, _this, callback)
  },

  getRCList(_this, callback) {
    let url = Toolkit.strFormatter.formatString(this.getUrlForm()['rclist'], {
      'nameSpace': this.getCurNameSpace( _this )
    })
    this.xhrGetData(url, _this, callback)
  },

  xhrGetData(url, _this, callback) {
    xhr({
      url: url,
      type: 'GET',
      success: (retu_data) => {
        callback(_this, retu_data)
      }
    })

  },

  xhrPostData(url, data, callback) {
    xhr({
      url: url,
      type: 'POST',
      data: data,
      success: (retu_data) => {
        callback( retu_data)
      }
    })
  },


  generate_temp_point(i) {
    let temp = []
    for (let j = 0; j < i; j++) {
      temp.push({
        user: Toolkit.getRandomNum(100, 1000),
        sales: Toolkit.getRandomNum(1000, 2000),
        date: j + 10
      })
    }
    return temp
  },

  // 修改这里，定时获取数据并显示
  generateRandomData() {
    let data = {}
    data['pod_total'] = Toolkit.getRandomNum(200, 1000)
    data['pod_used'] = Toolkit.getRandomNum(200, data['pod_total'])
    data['task_total'] = Toolkit.getRandomNum(200, 1000)
    data['task_used'] = Toolkit.getRandomNum(200, data['task_total'])
    data['memory_total'] = Toolkit.getRandomNum(200, 1000)
    data['memory_used'] = Toolkit.getRandomNum(200, data['memory_total'])
    data['load_data_points'] = this.generate_temp_point(10)
    data['flowrate_data_points'] = this.generate_temp_point(10)
    return data
  }

}

export default CalcManageDataRequester
