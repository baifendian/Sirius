import React from 'react'
import {Menu, Dropdown as Dropdown1, Icon} from 'antd'
import Button from 'bfd-ui/lib/Button'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import {Spin} from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import OPEN from '../data_request/request.js'
import {Tabs, TabList, Tab, TabPanel} from 'bfd/Tabs'
import {Row, Col} from 'bfd/Layout'
import echarts from 'echarts'
import {Timeline} from 'antd'
import TextOverflow from 'bfd/TextOverflow'
import update from 'react-update'
import { Form, FormItem, FormSubmit, FormInput, FormSelect, Option, FormTextarea } from 'bfd/Form'
import {Component} from 'react'
import Input from 'bfd/Input'
import ReactDOM from 'react-dom'

class Show_log extends Component {
  constructor(props) {
    super()
    this.update = update.bind(this)
    this.state = {
      formData: {
        brand: 0
      },
      logs: '',
      count:'30',
      height: ''
    }
  }

  shouldComponentUpdate(nextProps,nextState){
    if (nextProps.host_desc === this.props.host_desc){
      console.log(this.props.host_desc,'gengx1')

    }else{
      console.log(this.props.host_desc,'gengx2')
      this.get_all(nextProps.host_desc['id'])
    }
    if (nextProps.height_log === this.props.height_log){
      console.log(nextProps.height_log,'gengx133')
    }else{
      console.log(nextProps.height_log,'gengx2444')
      this.height_log(nextProps.height_log)
    }


    return nextProps.host_desc === this.props.host_desc
  }

  xhrCallback(_this, executedData) {
    console.log('executedData',executedData)
    _this.setState({
      logs: executedData
    })
  }

  handleChange(value){
    console.log(value,'..value')
    console.log(value.target.value)
    this.setState({count:value.target.value})
  }

  componentWillMount(){
   // let host_id = this.props.host_desc['id']
    //let url = OPEN.UrlList()['instances_log']+'/'+host_id+'/'+1000+'/'
    //OPEN.xhrGetData(this,url,this.xhrCallback)
    this.get_count()
    
  //   ReactDOM.findDOMNode(this.refs.textarea).style.height=this.props.height_log+'px'
  }

  componentDidMount(){
    console.log(ReactDOM.findDOMNode(this.refs.textarea_t))
    this.height_log(this.props.height_log)
  }

  height_log(height_t){
    ReactDOM.findDOMNode(this.refs.textarea_t).style.height=(height_t-50)+'px'
  }

  get_count(){
    let host_id = this.props.host_desc['id']
    let url = OPEN.UrlList()['instances_log']+'/'+host_id+'/'+this.state.count+'/'
    OPEN.xhrGetData(this,url,this.xhrCallback)
  }

  get_all(id){
    let host_id = this.props.host_desc['id']
    let url = OPEN.UrlList()['instances_log']+'/'+id+'/000/'
    OPEN.xhrGetData(this,url,this.xhrCallback)
  }

  handleDateSelect(date) {
    this.update('set', 'formData.date', date)
  }

  handleSuccess(res) {
    console.log(res)
    message.success('操作成功！')
  }

  render(){
    console.log('..xhrGetData',this.state.logs)
    console.log('..xhrCallback',this.props.height_log)
    let logs=this.state.logs['output']
    const { formData } = this.state
    return (
      <div >
        <Row>
          <Col col="md-6">
            <span style={{margin:'10px',fontSize:'22px'}}>云主机控制台日志</span>
          </Col>
          <Col col="md-6">
            <Input placeholder="请输入日志长度" onChange={::this.handleChange}/><Button onClick={::this.get_count} >查询</Button><Button onClick={::this.get_all}>完整日志</Button>
          </Col>
        </Row>
        <textarea value={logs} style={{width:'1000px'}} ref="textarea_t" >
        </textarea>
      </div>
    )
  }
}


const Host_Timeline = React.createClass({
  getInitialState: function () {
    return {
      name: '11'
    }
  },
  data(){

  },
  render(){

    return (
      <div>
        <Timeline>
          <Timeline.Item>test 2016-09-21</Timeline.Item>
          <Timeline.Item>test1 2016-09-22</Timeline.Item>
          <Timeline.Item>test2 2016-09-23</Timeline.Item>
          <Timeline.Item>test3 2016-09-24</Timeline.Item>
        </Timeline>
      </div>
    )
  }
})


const Echarts_s = React.createClass({
  getInitialState: function () {
    return {
      cpu_data:{},
      mem:{},
      dom_id:['echarts_cpu','echarts_mem','echarts_disk'],
    }
  },

  dataManage(_this,data) {
    console.log(data,'...data')
    let legend=[]
    let xaxis=[]
    let option={}
    let series=[]
    let keys_d=''
    Object.keys(data).map((keys,item)=>{
      if (keys!='date'){
        for (let i in data[keys]){
          legend.push(data[keys][i]['legend'])
          let series_s=this.series_t(data[keys][i]['legend'],data[keys][i]['data'])
          series.push(series_s)
        }
        keys_d=keys
      }
    })

    let dom_id=echarts.init(document.getElementById(keys_d))
    dom_id.setOption(
    { tooltip : { trigger: 'axis' },
      legend: { data: legend },
      calculable : true,
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
          data : data['date']
        }
      ],
      yAxis : [
        {
          type : 'value',
          axisLabel : {
            formatter: '{value} k'
          }
        }
      ],
      series : series})
  },

  series_t(lineName,dataArr ){
    let obj = {
      type: 'line',
      itemStyle: {normal: {areaStyle: {type: 'default'}}},    
      name: lineName,
      data: dataArr
    }
    return obj
  },

  initData(){
    Object.keys(this.dom_id()).map((key,item)=>{
      console.log('object',key,item)
      OPEN.Get_instances_cpu(this,this.dom_id()[key],this.dataManage)
    })
    //OPEN.Get_instances_cpu(this,'cpu_monitor',this.dataManage)
  },

  dom_id(){
    return {
      'CPU':'cpu_monitor',
      'MEM':'mem_monitor'
    }
  },

  componentDidMount(){
    this.initData()
   // var echarts_cpu = echarts.init(document.getElementById('echarts_cpu'));
  //  var echarts_mem = echarts.init(document.getElementById('echarts_mem'));
    /*echarts_mem.setOption(
    {tooltip : {
        trigger: 'axis'
    },
    legend: {
        data:['邮件营销','联盟广告','视频广告','直接访问','搜索引擎']
    },
    toolbox: {
      show : true,
      eature : {
        saveAsImage : {show: true}
      }
    },
    calculable : true,
    xAxis : [
        {
            type : 'category',
            boundaryGap : false,
            data : ['周一','周二','周三','周四','周五','周六','周日']
        }
    ],
    yAxis : [
        {
            type : 'value',
            axisLabel : {
              formatter: '{value} k'
        }
      }
    ],
    series : [
        {
            name:'邮件营销',
            type:'line',
            stack: '总量',
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data:[120, 132, 101, 134, 90, 230, 210]
        },
        {
            name:'联盟广告',
            type:'line',
            stack: '总量',
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data:[220, 182, 191, 234, 290, 330, 310]
        },
        {
            name:'视频广告',
            type:'line',
            stack: '总量',
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data:[150, 232, 201, 154, 190, 330, 410]
        },
        {
            name:'直接访问',
            type:'line',
            stack: '总量',
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data:[320, 332, 301, 334, 390, 330, 320]
        },
        {
            name:'搜索引擎',
            type:'line',
            stack: '总量',
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data:[820, 932, 901, 934, 1290, 1330, 1320]
        }
    ]
    });*/
  },

  render(){
    let monitor_list = [
      [{ 'name':'cpu','id':'cpu_monitor'},{ 'name':'内存','str':'mem_monitor'}]
    ]

    let return_monitor = monitor_list.map((keys,item)=>{
      console.log(keys,'keys.........item')

    })
    return (
      <div>
        <Row>
          <Col col="md-6">
            <h4>CPU</h4>
            <div id="cpu_monitor" style={{height: '400px'}}>
            </div>
          </Col>
          <Col col="md-6">
            <h4>内存</h4>
            <div id="mem_monitor" style={{height: '400px'}}>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
})


const Host_details = React.createClass({
  getInitialState() {
    return {
      column: [{ title: 'ID', order: false, key: 'disk_id'},
              { title: '磁盘名', order: false, key: 'disk_name'},
              {  title: '盘符',   order: false , key: 'device',},
              {  title: '大小',   order: false , key: 'size',},
              {  title: '类型',   order: false , key: 'device',}],
    }
  },
  data(){
    let host_desd = this.props.host_desc[0]
    return host_desd
  },
  render(){
    //console.log(this.props.host_desc,'.........aaaa')
    const list=[1]
    const nav = this.props.host_desc['disk_list'] && this.props.host_desc['disk_list'].map((item,i)=>{
      return (
        <Row key={i}>
          <Col col="md-2" style={{}}>
            <TextOverflow>
              <p style={{width: '100px'}}>{item['disk_name']}</p>
            </TextOverflow>
          </Col>
          <Col col="md-2" style={{}}>{item['device']}</Col>
          <Col col="md-2" style={{}}>{item['size']}GB</Col>
        </Row>
      )
    })
    let host_des = this.props.host_desc
    return (
      <div>
        <div>{host_des[0]}</div>
        <Row>
          <h4>概况</h4>
        </Row>
        <Row>
          <Col col="md-2" style={{}}>名称:</Col>
          <Col col="md-2" style={{}}>{this.props.host_desc['name']}</Col>
          <Col col="md-2" style={{}}>ID</Col>
          <Col col="md-4" style={{}}>{this.props.host_desc['id']}</Col>
        </Row>
        <Row>
          <Col col="md-2" style={{}}>状态:</Col>
          <Col col="md-2" style={{}}>{this.props.host_desc['status']}</Col>
          <Col col="md-2" style={{}}>可用域:</Col>
          <Col col="md-4" style={{}}>nova</Col>
        </Row>
        <Row>
          <Col col="md-2" style={{}}>创建时间:</Col>
          <Col col="md-2" style={{}}>{this.props.host_desc['created']}</Col>
          <Col col="md-2" style={{}}>已创建:</Col>
          <Col col="md-4" style={{}}>3小时</Col>
        </Row>
        <Row>
          <span>磁盘:</span>
        </Row>
        <div>
          {this.props.host_desc['disk_list'] ? nav : <span></span>}
        </div>
      </div>
    )
  }
})

const Tabs_List = React.createClass({
  getInitialState: function () {
    return {
      id:'',
      logs:'',
    }
  },

  componentWillMount(){
    console.log('text..............textarea')
  },

  test(id){
    //this.get_all(id)

  },

  xhrCallback(_this, executedData) {
    console.log('executedData',executedData)
    _this.setState({
      logs: executedData
    })
  },

  get_all(id){
   // console.log(this.props.host_desc)
    //let host_id = this.props.host_desc['id']
    let url = OPEN.UrlList()['instances_log']+id+'/000/'
    console.log(url)
    OPEN.xhrGetData(this,url,this.xhrCallback)
  },

  render() {
    console.log('111111111......',this.state.id)
    return (
      <Tabs >
        <TabList>
          <Tab>主机详情</Tab>
          <Tab>备份</Tab>
          <Tab>监控</Tab>
          <Tab>启动日志</Tab>
        </TabList>
        <div style={{overflow:'auto'}}>
        <TabPanel>
          <Host_details host_desc={this.props.host_desc}/>
        </TabPanel>
        <TabPanel>
          <Host_Timeline/>
        </TabPanel>
        <TabPanel>
          <Echarts_s/>
        </TabPanel>
        <TabPanel>
          <Show_log host_desc={this.props.host_desc} height_log={this.props.height_log} ref="show_logs"/>
        </TabPanel>
        </div>
      </Tabs>

      )
  }
})

export {Tabs_List}