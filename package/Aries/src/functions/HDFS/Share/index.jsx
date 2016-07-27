import React from 'react'
import Task from 'public/Task'
import './index.less'
import DataTable from 'bfd-ui/lib/DataTable'
import confirm from 'bfd-ui/lib/confirm'
import Fetch from 'bfd-ui/lib/Fetch'
import { Select, Option } from 'bfd-ui/lib/Select2'
import TextOverflow from 'bfd-ui/lib/TextOverflow'
import Icon from 'bfd-ui/lib/Icon'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'

export default React.createClass({
  confirm_handler(id,confirm_str,func,component){
    confirm(<TextOverflow><p style={{width: '250px'}}>{confirm_str}</p></TextOverflow>,()=>{
        func(id,component);
    });
  },
  handleSuccess(data){
    console.log(data);
    this.setState({data:data});
  },
  trash(id,component){
    let url = `v1/hdfs///?op=SHARE&share_id=${id}`;
    xhr({ type: 'DELETE',url:url,
        success: data =>{
          let dataTable = this.state.data;
          let totalList = this.state.data.totalList;
          let index = totalList.indexOf(component);
          totalList.splice(index,1);
          dataTable.totalList = totalList;
          this.setState({data:dataTable});
          message.success(data,2);
        }
    });

  },
  getInitialState: function() {
    return {
             totalNum:0,
             column:[{
              title:"id",
              key:"id",
             },{
              title:"分享路径",
              key:"proxy_path",
              render:(item, component)=> {
                return <TextOverflow>
                        <p style={{width: '100px'}}>{component.proxy_path}</p>
                      </TextOverflow>
              },
             },{
              title:"原路径",
              key:"source_path",
              render:(item, component)=> {
                return <TextOverflow>
                        <p style={{width: '100px'}}>{component.source_path}</p>
                      </TextOverflow>
              },
             },{
              title:"分享时间",
              key:"share_time",
             },{
              title: '分享人',
              key: 'share_user',
             },{
              title: '描述',
              key: 'desc',
             },{
              title: '操作',
              render:(item, component)=> {
                return <a href="javascript:" style={{marginRight: '20px'}} onClick={()=>{this.confirm_handler(item.id,`你确定删除 ${item.id} 吗?`,this.trash,item)}}>
                        <Icon type="trash" />
                       </a>
              },
              key: 'operation'
            }]
            };
  },
  render() {
    return (
        <div>
          <Fetch style={{minHeight:0}} url={`v1/hdfs///?space_name=${this.props.location.query.cur_space}&op=SHARE`} onSuccess={this.handleSuccess}>
            <DataTable data={this.state.data} column={this.state.column}></DataTable>
          </Fetch>
        </div>
    )
  }
})
