import React from 'react'
import {Menu, Dropdown as Dropdown1, Icon} from 'antd'
import Button from 'bfd-ui/lib/Button'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import {Spin} from 'antd'
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
import xhr from 'bfd/xhr'
import DataTable from 'bfd/DataTable'

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

  shouldComponentUpdate(nextProps,nextState){
    /*注释部分代码暂时保存以后可能会用到
    if (nextProps.host_desc === this.props.host_desc){
    }else{
      this.get_count(nextProps.host_desc['id'],30)
    }*/
    if (nextProps.height_log !== this.props.height_log){
      this.height_log(nextProps.height_log)
    }
    return true
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


class Host_Timeline extends Component {
  constructor(props) {
    super()
    this.state = {
      loading: false,
      column: [{
        title: '序号',
        key: 'sequence'
      },{
        primary: false,
        title: 'ID',
        key: 'id',
        width: '300px'
      }, {
        title: '名称',
        order: false,
        width: '100px',
        render: (text, item) => {
          return <a href="javascript:void(0);" onClick={this.handleClick.bind(this, item)}>{text}</a>
        },
        key: 'name'
      }, {
        title: '描述',
        key: 'desc',
        order: false
      },{
        title: '创建时间',
        key: 'time',
        order: false
      },{
        title: '操作',
        render: (item, component) => {
          return <a href = "javascript:void(0);" onClick = {this.handleClick.bind(this, item)}>删除</a>
        },
        key: 'operation'
      }]
    }
  }

  render() {
    let data = {
      totalList: this.props.instance_backup,
      totalPageNum: 1
    }
    return (
      <Spin spinning={this.state.loading}>
      <DataTable 
        //url={this.state.url}
        data={data}
        //onPageChange={::this.onPageChange} 
        showPage="false"
        column={this.state.column} 
        howRow={10}
        //onRowClick={::this.handleRowClick}
        //onOrder={::this.handleOrder}
      /> 
      </Spin>
    )
  }

  xhrCallback(_this, executedData) {
    let data = executedData['data']
    _this.props._self.setState({instance_backup:data})
    _this.setState({loading:false})
  }

  handleClick(item, event) {
    event = event ? event : window.event;
    event.stopPropagation();
    this.setState({loading:true})
    let url=OPEN.UrlList()['instances_post']+'?name=instances_backup_delete'+'&backup_name='+item['name']+'&id='+item['vm_id']
    OPEN.xhrGetData(this,url,this.xhrCallback)  
    console.log(item)
  }
}






const Echarts_s = React.createClass({
  componentWillUpdate(nextProps){
    this.initData()
   /* if (nextProps.host_desc !== this.props.host_desc){
      this.initData()
    }
    //this.initchart()
    console.log(nextProps,'nextProps')*/
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
    dom_id.setOption({ 
      tooltip : { trigger: 'axis' },
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

  date(){
    let time=this.props.host_desc['created']
    let nowtime=new Date()
    let difftime = nowtime.getTime() - new Date(time).getTime()
    let days=Math.floor(difftime/(24*3600*1000))
    var hours=Math.floor((difftime%(24*3600*1000))/(3600*1000)) 
    var minutes=Math.floor(((difftime%(24*3600*1000))%(3600*1000))/(60*1000)) 
    return days+'天'+hours+'小时'+minutes+'分'
  },
  render(){
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
          <Col col="md-4" style={{}}>{this.date()}</Col>
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
          <Host_Timeline host_desc={this.props.host_desc} instance_backup={this.props.instance_backup} _self={this.props._this}/>
        </TabPanel>
        <TabPanel >
          <Echarts_s host_desc={this.props.host_desc}/>
        </TabPanel>
        <TabPanel>
          <Show_log host_desc={this.props.host_desc} height_log={this.props.height_log} logs={this.props.logs} ref="show_logs" _self={this.props._this} />
        </TabPanel>
        </div>
      </Tabs>)
  }
})

export {Tabs_List}