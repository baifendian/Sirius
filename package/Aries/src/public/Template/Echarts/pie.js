import common from './common'
import echarts from 'echarts'
const pie = {
  option: {
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
},
  //渲染option的函数
  renderOption(data){
    //let tempOption = {id:1,name:{ n1:"${args.t1}", n2:{nn2:"${args.date.month}",nn3:"${args.date.day}"}}};
    //let args = {t1:1,date:{ month:2, day:3}}
    //let option = common.tempPreHandler(tempOption,args);
    let option = common.tempPreHandler(this.option,data);
    console.log(option);
    return option;
  }
}

export default pie;
