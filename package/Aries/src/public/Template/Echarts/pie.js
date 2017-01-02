import common from './common'
import echarts from 'echarts'
// echarts 百分比饼图模版数据
const pie = {
  getOption(){
    return {
       legend: {
           orient: 'vertical',
           left: 'left',
       },
       series : [
           {
               type: 'pie',
               radius : ['50%', '80%'],
               center: ['50%','50%'],
               hoverAnimation:false,
               label: {
                 normal: {
                   show: true,
                   formatter: function(params){return params.percent.toFixed(0)+"%"},
                 }
               },
               itemStyle: {
                 normal: {
                   borderColor: "#ddd",
                   borderWidth: 2,
                   color :
                     new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [{
                             offset: 0.6, color: 'red' // 0% 处的颜色
                           }, {
                             offset: 1, color: 'red' // 100% 处的颜色
                           }], false
                         )

                 }
               },
               data:[
                   {
                       value:"${used}",
                       label: {
                           normal: {
                               position: "center",
                               textStyle: {
                                   color: 'red',
                                   fontSize: 25,
                                   fontStyle: 'normal',
                                   fontWeight: 'bold',
                                   fontFamily: "Helvetica Neue"

                               }
                           }
                       }
                   },
                   {
                       value:"${nonUsed}",
                       tooltip: {
                           show: false
                       },
                       itemStyle: {
                           normal: {
                               color: '#fff'
                           }
                       },
                   }
               ]
           }
       ]
     }
  },
  //渲染option的函数
  renderOption(data){
    if(data.nonUsed == 0 && data.used == 0){
      data.nonUsed = 1;
    }
    let option = common.tempPreHandler(this.getOption(),data);
    return option;
  }
}

export default pie;
