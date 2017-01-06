import React from 'react'
import {Menu, Dropdown as Dropdown1, Icon} from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import {Spin} from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import Openstackconf from '../Conf/Openstackconf'
import TextOverflow from 'bfd-ui/lib/TextOverflow'
import ReactDOM from 'react-dom'
import OPEN from '../data_request/request.js'


export default React.createClass({
  getInitialState: function () {
    return {
      loading: false,
      url: OPEN.UrlList()['flavors'],
      column: [{
        title: '名称',
        order: false,
        key: 'name'
      }, {
        title: 'vCPU',
        key: 'vcpus',
        order: false
      }, {
        title: 'RAM',
        key: 'ram',
        order: false,
        render: (text, item) => {
          let text1 = parseInt(text) / 1024
          return (
            <div>
              <TextOverflow><p style={{width: '204px'}}>{text1}GB</p>
              </TextOverflow>
            </div>)
        }
      }, {
        title: '根大小',
        key: 'disk',
        order: false,
        render: (text, item) => {
          return (
            <div>
              <TextOverflow><p style={{width: '204px'}}>{text}GB</p>
              </TextOverflow>
            </div>)
        }
      }, {
        title: '公有',
        key: 'public',
        order: false,
      }
      ],
      width_t: ""
    }
  },
  handleOpen(name) {
    //console.log(this.state.flavors_list)
  },
  componentDidMount(){
    try{
      let table_trlengt = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    }
    catch (err){
      let tdheight = ReactDOM.findDOMNode(this.refs.Table).scrollHeight
      let height_table = (totallength) * tdheight
      let totalHeight = document.body.clientHeight
      totalHeight -= document.getElementById('header').clientHeight
      totalHeight -= document.getElementById('footer').clientHeight
      let flavors_nav = ReactDOM.findDOMNode(this.refs.flavors_nav).clientHeight
      let flavors_bu = ReactDOM.findDOMNode(this.refs.flavors_bu).clientHeight
      totalHeight = totalHeight - flavors_nav - flavors_bu - 110
      ReactDOM.findDOMNode(this.refs.Table).style.height = totalHeight + 'px'
      return
    }
    let totallength = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].childNodes.length
    let tdheight = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].scrollHeight
    let height_table = (totallength) * tdheight
    let totalwidth = (ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].clientWidth - 17) / table_trlengt
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let flavors_nav = ReactDOM.findDOMNode(this.refs.flavors_nav).clientHeight
    let flavors_bu = ReactDOM.findDOMNode(this.refs.flavors_bu).clientHeight
    totalHeight = totalHeight - flavors_nav - flavors_bu - 110
    ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].style.height = totalHeight + 'px'
    if (totalHeight < height_table) {
      for (let i = 0; i < ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length; i++) {
        if (i == (table_trlengt - 1)) {
          totalwidth = totalwidth + 17
          ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width = totalwidth + 'px'
        } else {
          ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width = totalwidth + 'px'
        }
      }
    }
  },
  requestArgs: {
    pageName: "flavors",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this);
    return (
      <div className="function-data-moduleA">
        <div>
          <NavigationInPage ref="flavors_nav" headText={Openstackconf.getNavigationData({
            pageName: this.requestArgs.pageName,
            type: "headText"
          })} naviTexts={Openstackconf.getNavigationData({
            pageName: this.requestArgs.pageName,
            type: "navigationTexts",
            spaceName: spaceName
          })}/>
          <Spin spinning={this.state.loading}>
            <div ref="flavors_bu">
              <Button onClick={this.handleOpen.bind(this, 5)} style={{margin: '0px 10px 0px 0px'}}>刷新</Button>
            </div>
            <div className="DataTableFatherDiv_flavors">
              <DataTable
                url={this.state.url}
                showPage="false"
                column={this.state.column}
                howRow={10}
                onOrder={this.handleOrder}
                onCheckboxSelect={this.handleCheckboxSelect} ref="Table">
              </DataTable>
            </div>
          </Spin>
        </div>
      </div>
    )
  }
})