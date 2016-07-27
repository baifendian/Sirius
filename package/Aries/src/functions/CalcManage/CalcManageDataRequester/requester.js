import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd/message'
import Toolkit from 'public/Toolkit/index.js'

xhr.baseUrl = 'http://172.24.5.69:8000/'
xhr.timeout = 5000
xhr.onTimeout = (option) => {
  option.error && option.error({
    code: 0,
    msg: 'call option.error occur timeout'
  })
}
xhr.error = (res, option) => {
  option.error && option.error({
    code: 0,
    msg: 'call option.error occur error'
  })
}
xhr.success = (res, option) => {
  let retu_data = JSON.parse(res)
  if (typeof retu_data === 'object') {
    if (retu_data.code && retu_data.code === 1) {
      option.success && option.success(retu_data)
    } else {
      option.error && option.error(retu_data)
    }
  } else {
    option.error && option.error({
      code: 0,
      msg: 'unknown error'
    })
  }
}



var CalcManageDataRequester = {
  /*
  getIPAddr(){
    return 'http://172.24.3.150:8080'
  },*/
  getCurNameSpace( _this ) {
    return 'default'
    //return _this.props.location.query.cur_space
  },
  getUrlForm() {
    return {
      'podlist': 'api/v1/namespaces/{nameSpace}/pods',
      'serviceList': 'api/v1/namespaces/{nameSpace}/services',
      'rclist': 'api/v1/namespaces/{nameSpace}/replicationcontrollers',
      'mytasklist': 'api/v1/namespaces/mytasklist',

    }
  },

  getMytaskList(_this, callback) {
    let url = this.getUrlForm()['mytasklist']
    this.xhrGetData(url, _this, callback)

  },
  getPodList(_this, callback) {
    let url = Toolkit.strFormatter.formatString(this.getUrlForm()['podlist'], {
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
        callback(_this, retu_data.data)
      },
      error: (retu_data) => {
        message.danger(retu_data.msg || 'unknown error')
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
