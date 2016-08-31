import React from 'react'
import './index.less'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import CMDR from '../CodisCloudDataRequester/requester.js'
import Button from 'bfd-ui/lib/Button'
import message from 'bfd-ui/lib/message'

const ObjectProxy =  React.createClass({
    offflineclose(){
        this.refs.offline.close()
    },
    offlineopen(){
        this.refs.offline.open()
    },
    offlinesave() {
        CMDR.offlineProxy(this.props.proxy.addr,( executedData ) => {
            this.refs.offline.close()
            message.success(executedData, 2);
        })
    },
    render: function () {
        return (
            <div className="row">
                <Modal ref="offline">
                    <ModalHeader>
                      <h4>Mark Offline</h4>
                    </ModalHeader>
                    <ModalBody>
                    <div className="function-Codis-modelDiv">
                       <table>
                          <tr>
                              <td colSpan="5" style={{height:20}}></td>
                          </tr>
                          <tr>
                              <td colSpan="2" style={{width:100}}></td>
                              <td style={{textAlign:"end"}}>确定offline:<strong> {this.props.proxy.addr} </strong>？</td>
                              <td colSpan="2"></td>
                          </tr>
                          <tr>
                              <td colSpan="5" style={{height:20}}></td>
                          </tr>
                        </table>
                    </div>
                    <div className="function-UserAuth-Button-Div">
                        <Button className="left-Button" onClick={this.offlinesave}>确认</Button>
                        <Button type="primary" onClick={this.offflineclose}>取消</Button>
                    </div>
                    </ModalBody>
                </Modal>
                <div className="col-md-12">
                    <table className="table table-bordered ng-scope">
                        <tbody> </tbody>
                        <thead>
                            <tr>
                                <th><b>Proxy Name </b></th>
                                <th><b>Proxy Addr </b></th>
                                <th><b>Proxy DebugVars Addr </b></th>
                                <th><b>Proxy Status </b></th>
                                <th>   </th>
                            </tr>
                            <tr ng-repeat="proxy in proxies" className="ng-scope">
                                <td>
                                    <p className="ng-binding">{this.props.proxy.id}</p>
                                </td>
                                <td className="ng-binding"> {this.props.proxy.addr}  </td>
                                <td>
                                    <a href="http://{this.props.proxy.debug_var_addr}/debug/vars" target="_blank" className="ng-binding">{this.props.proxy.debug_var_addr}</a>
                                </td>
                                <td ng-switch="proxy.state">
                                    <span className="label label-success ng-binding ng-scope" ng-switch-when="online"> online </span>
                                </td>
                                <td>
                                    <button className="btn btn-default" ng-click="setStatus(proxy, 'online')">Mark Online</button>
                                    <button className="btn btn-danger" onClick={this.offlineopen}>Mark Offline</button>
                                </td>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        )
    }
})

export default ObjectProxy