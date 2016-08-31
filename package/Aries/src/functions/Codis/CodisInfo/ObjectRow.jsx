import React from 'react'
import './index.less'

const ObjectRow =  React.createClass({

  render: function(){
    var server = this.props.serverlist.servers
    var doms = [];
    for (var i = 0; i < server.length; i++) {
        doms.push(
          <tr ng-repeat="server in group.servers | orderBy:'type'" ng-controller="redisCtl" className="ng-scope">
              <td className="ng-binding"> {server[i].addr}  </td>
              <td className="ng-binding"> {server[i].type}  </td>
              <td className="ng-binding"> {server[i].used_mem} / {server[i].maxmemory}  </td>
              <td className="ng-binding"> {server[i].key_info} </td>
              <td> <div className="btn-group btn-group-sm pull-right"> </div>    </td>
          </tr>
        );
    }
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
              <b className="ng-binding">group_{this.props.serverlist.id}</b>
          </div>
          <div className="panel-body">
              <table className="table table-bordered ng-scope" >
                  <thead>
                      <tr>
                          <th> <b>Addr</b> </th>
                          <th> <b>Type</b>  </th>
                          <th> <b>Mem Used</b>  </th>
                          <th> <b>Keys</b>  </th>
                          <th>    </th>
                      </tr>
                  </thead>
                  <tbody>
                  {doms}
                  </tbody>
              </table>
          </div>
        </div>
    )
  }
})

export default ObjectRow