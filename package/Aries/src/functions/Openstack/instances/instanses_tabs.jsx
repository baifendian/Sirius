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
  componentDidMount(){
    var myChart = echarts.init(document.getElementById('echarts1'));
    var base = +new Date(1968, 9, 3);
    var oneDay = 24 * 3600 * 1000;
    var date = [];

    var data = [Math.random() * 300];

    for (var i = 1; i < 20000; i++) {
      var now = new Date(base += oneDay);
      date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
      data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
    }
    myChart.setOption({
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        }
      },
      title: {
        left: 'center',
        text: '内存展示',
      },
      legend: {
        top: 'bottom',
        data: ['意向']
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: date
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%']
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 10
      }, {
        start: 0,
        end: 10,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }],
      series: [
        {
          name: '模拟数据',
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            normal: {
              color: 'rgb(255, 70, 131)'
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgb(255, 158, 68)'
              }, {
                offset: 1,
                color: 'rgb(255, 70, 131)'
              }])
            }
          },
          data: data
        }
      ]
    });

  },
  render(){

    return (
      <div id="echarts1" style={{height: '400px'}}>
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
        <TabPanel>
          <Echarts_s/>
        </TabPanel>
        <TabPanel>启动日志</TabPanel>
        </div>
      </Tabs>

      )
  }
})

export {Tabs_List}