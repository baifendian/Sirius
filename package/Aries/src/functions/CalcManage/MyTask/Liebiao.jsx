import React from 'react'
import DataTable from 'bfd-ui/lib/DataTable'
import GroupBoxWithDynamicTable from 'public/GroupBoxWithDynamicTable'
import './Liebiao.less'

import CMDR from '../CalcManageDataRequester/requester.js'
import './index.less'

const TabLiebiao = React.createClass({
	getInitialState: function () {
    setTimeout( () => { CMDR.getMytaskList( this,this.xhrCallback ) }, 0);
    this.oriData = []

    let state_dict = {
      // 表格信息
      column: [{ title:'任务名称',  key:'task',			  order:true }, 
               { title:'类型',      key:'category',			  order:true }, 
               { title:'准备时间',  key:'ready_time',	  order:true }, 
               { title:'开始时间',  key:'running_time',  order:true },
               { title:'完成时间',  key:'leave_time',	order:true },
               { title:'执行状态',  key:'status',		  order:true },
               { title:'执行结果',  key:'result',		  order:true }],
      showPage:'false',
      data:{"totalList": [],"totalPageNum":0},

    }
    return state_dict
  },

  xhrCallback:(_this,executedData) => {
    _this.setState ( { 
      'data': {
        "totalList": executedData,
        "totalPageNum":executedData.length
      }
    })
    _this.oriData = executedData
  },  

  /**(loadData:function(){
    function GetRandomNum(Min,Max)
    {   
      var Range = Max - Min;   
      var Rand = Math.random();   
      return(Min + Math.round(Rand * Range));   
    }   
    let t1 = this.state.data
    for (let i = 0 ; i < 10 ; i ++){
      t1['totalList'].push({
        name:'job' + i,
        type:i % 2 == 0 ? '自动' : '手动',
        pretime:'2016-07-04 17:25:00',
        starttime:'2016-07-04 17:25:00',
        finishtime:'None',
        state:i % 2 == 0 ? 'ture' : 'false',
        result:i %2 == 0 ? '成功 过程' : '失败 过程' ,
      })
    }
    t1['totalPageNum'] = t1['totalList'].length
    this.setState({ data:t1 })
  },**/

  render: function() {
    return  <div className="RootDiv">
              <div className='DataTableDiv'>
                <DataTable data={this.state.data} showPage={this.state.showPage} 
              	           column= { this.state.column } ></DataTable>
              </div>
            </div>
	}
});
export default TabLiebiao