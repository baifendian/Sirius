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
import FixedTable from 'bfd/FixedTable'
import ButtonGroup from 'bfd/ButtonGroup'

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
      height: '',
      id:''
    }
  }

  /*shouldComponentUpdate(nextProps,nextState){
    注释部分代码暂时保存以后可能会用到
    if (nextProps.host_desc === this.props.host_desc){
    }else{
      this.get_count(nextProps.host_desc['id'],30)
    }
    if (nextProps.height_log !== this.props.height_log){
      this.height_log(nextProps.height_log)
    }
    return true
  }*/

  componentWillUpdate(){
    this.height_log(this.props.height_log)
  }
 /* componentWillReceiveProps(nextProps){
    if (nextProps.host_desc !== this.props.host_desc){
      //this.setState({count:30})
      this.setState({logs:'tesxaaas'})
      this.get_count(nextProps.host_desc['id'],30)
    }
  }*/

  xhrCallback(_this, executedData) {
    _this.props._self.setState({
      logs: executedData,
      logs_loading:false
    })
  }

  handleChange(value){
    this.setState({count:value.target.value})
  }

  componentWillMount(){
    this.get_all()
  }

  componentDidMount(){
    ReactDOM.findDOMNode(this.refs.textarea_t).style.width=(ReactDOM.findDOMNode(this.refs.host_width).clientWidth-10)+'px'
  }

  height_log(height_t){
    ReactDOM.findDOMNode(this.refs.textarea_t).style.height=(height_t-50)+'px'
  }

  get_count(id,count){
    this.props._self.setState({logs_loading:true})
    let host_id = this.props.host_desc['id']
    let url = OPEN.UrlList()['instances_log']+'/'+host_id+'/'+count+'/'
    OPEN.xhrGetData(this,url,this.xhrCallback)
  }

  get_all(){
    this.props._self.setState({logs_loading:true})
    let host_id = this.props.host_desc['id']
    let url = OPEN.UrlList()['instances_log']+'/'+host_id+'/000/'
    OPEN.xhrGetData(this,url,this.xhrCallback)
  }

  render(){
    let logs=this.props.logs['output']
    let host_id=this.props.host_desc['id']
    let count=this.state.count
    const { formData } = this.state
    return (
      <Spin spinning={this.props._self.state.logs_loading}>
      <div ref="host_width">
        <Row >
          <Col col="md-6">
            <span style={{margin:'10px',fontSize:'22px'}}>云主机控制台日志</span>
          </Col>
          <Col col="md-6">
            <Input placeholder="请输入日志长度" onChange={::this.handleChange}/><Button onClick={::this.get_count.bind(this,host_id,count)} >查询</Button><Button onClick={::this.get_all}>完整日志</Button>
          </Col>
        </Row>
        <textarea value={logs} style={{padding:'5px 0px 0px 15px',marginLeft:"10px"}} ref="textarea_t" >
        </textarea>
      </div>
      </Spin>
    )
  }
}

/*
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
})*/

class Host_Timeline extends Component {
  constructor(props) {
    super()
    this.state = {
      url: "/api/table",
      column: [{
        title: '序号',
        key: 'sequence'
      },{
        primary: true,
        title: 'ID',
        key: 'id',
        hide: true
      }, {
        title: '姓名',
        order: true,
      //  width: '100px',
        render: (text, item) => {
          return <a href="javascript:void(0);" onClick={this.handleClick.bind(this, item)}>{text}</a>
        },
        key: 'name'
      }, /*{
        title: '年龄',
        key: 'age',
        order: 'desc'
      }, {
        title: '国家/地区',
        key: 'country',
        width: '20%',
        render: (text, item) => {
          return item.country + "/" + item.area
        }
      },*/ {
        title: '注册日期',
        key: 'regdate',
        order: 'asc'
      }, {
        title: '操作',
        /**
         * @param item  当前数据对象
         * @param component 当前
         * @returns {XML}  返回dom对象
         */
        render: (item, component) => {
          return <a href = "javascript:void(0);" onClick = {this.handleClick.bind(this, item)}>编辑</a>
        },
        key: 'operation' //注：operation 指定为操作选项和数据库内字段毫无关联，其他key 都必须与数据库内一致
      }],
      data: [
        {id: 1, name: '张三', age: 28, gender: 'male', country: '中国', area: '北京', regdate: '2016-03-01' },
        {id: 2, name: '李四', age: 25, gender: 'female', country: '中国', area: '杭州', regdate: '2016-04-11' },
        {id: 3, name: '王五', age: 43, gender: 'male', country: '中国', area: '沈阳', regdate: '2016-05-06' },
        {id: 4, name: '赵某某', age: 30, gender: 'female', country: '中国', area: '上海', regdate: '2016-03-09' },
        {id: 5, name: '钱某某', age: 39, gender: 'male', country: '中国', area: '深圳', regdate: '2015-11-11' },
        {id: 6, name: '孙某某', age: 50, gender: 'male', country: '中国', area: '石家庄', regdate: '2016-06-01' },
        {id: 7, name: '周某某', age: 21, gender: 'female', country: '中国', area: '西安', regdate: '2016-08-13' },
        {id: 8, name: '吴某某', age: 19, gender: 'female', country: '中国', area: '天津', regdate: '2016-02-22' },
        {id: 9, name: '郑某某', age: 51, gender: 'male', country: '中国', area: '武汉', regdate: '2016-01-18' },
        {id: 10, name: '冯某某', age: 24, gender: 'male', country: '中国', area: '广州', regdate: '2016-09-20' }
      ]
    }
  }

  render() {
    return (
      <FixedTable 
        height={200}
        data={this.state.data}
        column={this.state.column}
        onRowClick={::this.handleRowClick}
        onOrder={::this.handleOrder}
        onCheckboxSelect={::this.handleCheckboxSelect}
      />
    )
  }

  handleClick(item, event) {
    event = event ? event : window.event;
    event.stopPropagation();
    console.log(item)
  }

  handleCheckboxSelect(selectedRows) {
    console.log('rows:', selectedRows)
  }

  componentWillMount(){
    
  }

  handleRowClick(row) {
    console.log('rowclick', row)
  }

  handleOrder(name, sort) {
    console.log(name, sort)
  }
}


const Echarts_s = React.createClass({
  componentWillUpdate(){
    this.initData()
    //this.initchart()
  },

  dataManage(_this,data) {
    console.log(data)
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
         // type : 'value',
         show: true,
          axisLabel : {
            formatter: this.initchart_y()[keys_d]
          }
        }
      ],
      series : series})
  },

  series_t(lineName,dataArr){
    let obj = {
      type: 'line',
      itemStyle: {normal: {areaStyle: {type: 'default'}}},    
      name: lineName,
      data: dataArr
    }
    return obj
  },

  initData(){
    let id=this.props.host_desc['id']
    return {
      'cpu_monitor': OPEN.Get_instances_cpu(this,'cpu_monitor',id,'59_minutes',this.dataManage),
      'mem_monitor': OPEN.Get_instances_cpu(this,'mem_monitor',id,'59_minutes',this.dataManage),
      'disk_iops_monitor': OPEN.Get_instances_cpu(this,'disk_iops_monitor',id,'59_minutes',this.dataManage),
      'disk_bps_monitor': OPEN.Get_instances_cpu(this,'disk_bps_monitor',id,'59_minutes',this.dataManage),
      'network_monitor_packets': OPEN.Get_instances_cpu(this,'network_monitor_packets',id,'59_minutes',this.dataManage),
      'network_monitor': OPEN.Get_instances_cpu(this,'network_monitor',id,'59_minutes',this.dataManage)
    }
  },

  initchart(){
    let legend=[]
    let xaxis=[]
    let option={}
    let series=[]
    let keys_d=''
    for (let i in this.dom_id()){
    let dom_id=echarts.init(document.getElementById(this.dom_id()[i]))
    dom_id.setOption(
    {  title: {
        text: '堆叠区域图'
    },tooltip : { trigger: 'axis' },
      legend: { data: legend },
      calculable : true,
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
          data : []
        }
      ],
      yAxis : [
        {
          type : 'value',
          boundaryGap: [0, '100%'],
            splitLine: {
              show: false
          },
          axisLabel:{
            formatter: this.initchart_y()[this.dom_id()[i]]
          }
        },
      ],
      series : series})
    }
  },

  initchart_y(){
    return{
      'cpu_monitor': (val)=>{return val+'%'},
      'mem_monitor': (val)=>{return val+'M'},
      'disk_iops_monitor':(val)=>{return val},
      'disk_bps_monitor':(val)=>{return val+'b'},
      'network_monitor':(val)=>{return val+'b'},
      'network_monitor_packets': (val)=>{return val+'b'}
    }
  },

  dom_id(){
    return {
      'CPU':'cpu_monitor',
      'Memory':'mem_monitor',
      'Disk_iops':'disk_iops_monitor',
      'Disk_bps':'disk_bps_monitor',
      'Network_bytes':'network_monitor',
      'Network_packets':'network_monitor_packets'
    }
  },

  componentDidMount(){
    this.initData()
    this.initchart()
  },

  handleChange(value,text) {
    console.log(value,text)
    let id=this.props.host_desc['id']
    OPEN.Get_instances_cpu(this,this.dom_id()[text],id,value,this.dataManage)
  },

  render(){
    let monitor_list = [
      [{ 'name':'CPU','id':'cpu_monitor'},{ 'name':'Memory','id':'mem_monitor'}],
      [{ 'name':'Disk_iops','id':'disk_iops_monitor'},{ 'name':'Disk_bps','id':'disk_bps_monitor'}],
      [{ 'name':'Network_bytes','id':'network_monitor'},{ 'name':'Network_packets','id':'network_monitor_packets'}]
    ]

    let return_monitor = monitor_list.map((keys,item)=>{
      return (
        <Row key={item}>
          {keys.map((keyss,items)=>{
            return (
              <Col col="md-6" key={items}>
                <span style={{fontSize:"23px"}}>{keyss['name']}</span>
                <ButtonGroup defaultValue="1" onChange={(value)=>this.handleChange(value,keyss['name'])} >
                  <Button value="59_minutes" style={{width:'101px',height:'20px'}}>最近一小时</Button>
                  <Button value="1_days" style={{width:'101px',height:'20px'}}>最近一天</Button>
                  <Button value="15_days" style={{width:'101px',height:'20px'}}>最近15天</Button>
                </ButtonGroup>
                <div id={keyss['id']} style={{height: '300px'}}>
                </div>
              </Col>
              )
          })}
        </Row>)
      })

    return (
      <div>
        {return_monitor}
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
  render() {
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
        <TabPanel >
          <Echarts_s host_desc={this.props.host_desc}/>
        </TabPanel>
        <TabPanel>
          <Show_log host_desc={this.props.host_desc} height_log={this.props.height_log} logs={this.props.logs} ref="show_logs" _self={this.props._this}/>
        </TabPanel>
        </div>
      </Tabs>)
  }
})

export {Tabs_List}