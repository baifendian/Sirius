import React from 'react'
import {Menu, Dropdown as Dropdown1, Icon} from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import {Spin} from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import Openstackconf from '../Conf/Openstackconf'
import ReactDOM from 'react-dom'
import OPEN from '../data_request/request.js'


export default React.createClass({
  getInitialState: function () {
    return {
      loading: false,
      url: OPEN.UrlList()['images'],
      column: [{
        title: '镜像名称',
        order: false,
        key: 'name'
      }, {
        title: '类型',
        key: 'type_image',
        order: false
      }, {
        title: '状态',
        key: 'image_status',
        order: false
      }, {
        title: '公有',
        key: 'public',
        order: false
      }, {
        title: '格式',
        key: 'format',
        order: false,
      }, {
        title: '大小',
        key: 'size',
        order: false,
        width: "17%"
      }
      ]
    }
  },
  handleOpen(name) {
    //console.log(this.state.images_list)
  },
  componentDidMount(){
    try {
      let table_trlengt = ReactDOM.findDOMNode(this.refs.Table).childNodes[0].childNodes[1].childNodes.lengt
    }
    catch(err) {
      let tdheight = ReactDOM.findDOMNode(this.refs.Table).scrollHeight
      let height_table = (totallength) * tdheight
      let totalHeight = document.body.clientHeight
      totalHeight -= document.getElementById('header').clientHeight
      totalHeight -= document.getElementById('footer').clientHeight
      let images_nav = ReactDOM.findDOMNode(this.refs.images_nav).clientHeight
      let images_bu = ReactDOM.findDOMNode(this.refs.images_bu).clientHeight
      totalHeight = totalHeight - images_nav - images_bu - 110
      ReactDOM.findDOMNode(this.refs.Table).style.height = totalHeight + 'px'
      return
    }
    let totallength = ReactDOM.findDOMNode(this.refs.Table).childNodes[0].childNodes[1].childNodes.length
    let tdheight = ReactDOM.findDOMNode(this.refs.Table).childNodes[0].childNodes[1].childNodes[0].scrollHeight
    let height_table = (totallength) * tdheight
    let totalwidth = (ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].clientWidth - 17) / table_trlengt
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let images_nav = ReactDOM.findDOMNode(this.refs.images_nav).clientHeight
    let images_bu = ReactDOM.findDOMNode(this.refs.images_bu).clientHeight
    totalHeight = totalHeight - images_nav - images_bu - 110
    ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].style.height = totalHeight + 'px'
    if (totalHeight > height_table) {
      for (let i=0; i< ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length;i++) {
        if (i == (table_trlengt - 1)) {
          totalwidth = totalwidth + 17
          ReactDOM.findDOMNode(this.refs.Table).childNodes[0].childNodes[1].childNodes[i].style.width = totalwidth + 'px'
        } else {
          ReactDOM.findDOMNode(this.refs.Table).childNodes[0].childNodes[1].childNodes[i].style.width = totalwidth + 'px'
        }
      }
    }
  },
  requestArgs: {
    pageName: "image",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this);
    return (
      <div className="function-data-moduleA">
        <NavigationInPage ref="images_nav" headText={Openstackconf.getNavigationData({
          pageName: this.requestArgs.pageName,
          type: "headText"
        })} naviTexts={Openstackconf.getNavigationData({
          pageName: this.requestArgs.pageName,
          type: "navigationTexts",
          spaceName: spaceName
        })}/>
        <Spin spinning={this.state.loading}>
          <div ref="images_bu">
            <Button onClick={this.handleOpen.bind(this, 5)} style={{margin: '0px 10px 0px 0px'}}>刷新</Button>
          </div>
          <div className="DataTableFatherDiv_images">
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
    )
  }
})