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
import {Link} from 'react-router'

export default React.createClass({
  handleSuccess(data){
    console.log(data);
    this.setState({data:data});
  },
  getInitialState: function() {
    return {
             totalNum:0,
             column:[{
              title:"id",
              key:"id",
              render:(item, component)=> {
                  let proxy_path = component.proxy_path;
                  console.log(proxy_path);
                  //取倒数第2个
                  let proxy_arr = proxy_path.split("/");
                  proxy_arr.pop();
                  let hash = proxy_arr.pop();
                  console.log(hash);
                  let url = `/HDFS/ShowShare/${hash}`;
                  return <Link to={url}>{component.id}</Link>
              },
             },{
              title:"分享链接",
              key:"proxy_path",
              render:(item, component)=> {
                let proxy_path = component.proxy_path;
                console.log(proxy_path);
                //取倒数第2个
                let proxy_arr = proxy_path.split("/");
                proxy_arr.pop();
                let hash = proxy_arr.pop();
                console.log(hash);
                let url = `/HDFS/ShowShare/${hash}?cur_space=${this.props.location.query.cur_space}`;
                return <Link to={url}>{component.proxy_path}</Link>
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
              render:(item, component)=> {
                return <TextOverflow>
                        <p style={{width: '100px'}}>{item}</p>
                      </TextOverflow>

              },
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
