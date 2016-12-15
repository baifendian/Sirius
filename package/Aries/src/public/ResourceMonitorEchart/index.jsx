import React from 'react'
import ReactDOM from 'react-dom'
import echarts from 'echarts'
import Percentage from 'bfd-ui/lib/Percentage'
import Button from 'bfd-ui/lib/Button'
import ButtonGroup from 'bfd-ui/lib/ButtonGroup'

import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'

import './index.less'


var ResourceMonitorEchart = React.createClass({

  componentDidMount(){
    this.initUserData()
    this.initCharts()

    this.reloadEchartData()
  },

  reloadEchartData(){
    this.onTimeRangeChanged( this.props.dataRangeMinutes[0]['value'] )
  },

  resizeEchart(){
    this.userData['echartObj'] && this.userData['echartObj'].resize()
  },

  initUserData(){
    this.userData = {
      'echartState':{'loading':false},
      'echartTitleText':this.props.echartTitle,
      'echartObj':undefined,
    }

    this.userData['requestMonitorDataCallBackFunc'] = ( value )=>{
      if (this.props.requestMonitorDataCallBackFunc){
        this.props.requestMonitorDataCallBackFunc(value,(executedData)=>{
          this.insertDataToChart( executedData )
        })
      }
    }

    this.userData['echartTooltipFormatterFunc'] = ( params, ticket, callback ) => {
      let info = this.props.echartToolTipFormatterInfo

      let templateStr = this.generateTooltipFormatterStr(info['seriesNumber'])
      let base = info['base']
      let unitArr = info['unitArr']
      let significantFractionBit = info['significantFractionBit']

      let dataObj = {}
      dataObj['time'] = params[0]['name']
      for ( let i = 0 ; i < params.length ; i ++ ){
        dataObj['seriesName'+i] = params[i]['seriesName']
        dataObj['seriesValue'+i] = Toolkit.unitConversion( params[i]['value'],base,unitArr,significantFractionBit )
      }
      return Toolkit.strFormatter.formatString( templateStr,dataObj)
    }

    this.userData['echartyAxisLabelFormatterFunc'] = (value,index) => {
      let info = this.props.echartToolTipFormatterInfo
      return Toolkit.unitConversion( value,info['base'],info['unitArr'],0 )
    }

    // 绘制集群信息图表的时候，将从以下颜色池中选择颜色
    this.userData['colorPoll'] = [{
      'line':'rgb(229,115,115)',
      'area':'rgba(229,115,115,0.1)'
    },{
      'line':'rgb(126,87,194)',
      'area':'rgba(126,87,194,0.1)'
    },{
      'line':'rgb(77,208,225)',
      'area':'rgba(77,208,225,0.1)'
    },{      
      'line':'rgb(121,134,203)',
      'area':'rgba(121,134,203,0.1)'
    },{
      'line':'rgb(212,225,87)',
      'area':'rgba(212,225,87,0.1)'
    },{
      'line':'rgb(38,166,154)',
      'area':'rgba(38,166,154,0.1)'
    },{
      'line':'rgb(253,216,53)',
      'area':'rgba(253,216,53,0.1)'
    },{
      'line':'rgb(255,138,101)',
      'area':'rgba(255,138,101,0.1)'
    },{
      'line':'rgb(66,165,245)',
      'area':'rgba(66,165,245,0.1)'
    },{
      'line':'rgb(102,187,106)',
      'area':'rgba(102,187,106,0.1)'
    }]
  },

  insertDataToChart( executedData ){
    this.echartHideLoading()

    let series = []
    let legend = []
    for ( let i = 0 ; i < executedData.series.length ; i ++ ){
      legend.push( executedData['series'][i]['legend'] )

      let seriesDataObj = this.generateLineSeriesObj( executedData['series'][i]['legend'],executedData['series'][i]['data'] )
      seriesDataObj['itemStyle']['normal']['lineStyle']['color'] = this.userData['colorPoll'][i]['line']        // 线颜色
      seriesDataObj['itemStyle']['normal']['areaStyle']['color'] = this.userData['colorPoll'][i]['area']        // 区域颜色
      series.push( seriesDataObj )
    }

    this.userData['echartObj'].setOption({
      'legend': { 
        'data':legend
      },
      'xAxis': {
        'type' : 'category',
        'position' : 'bottom',
        'boundaryGap': false,
        'data': executedData['xaxis']
      },
      'series': series
    })
  },

  generateLineSeriesObj( lineName,dataArr ){
    let obj = {
      type: 'line',
      itemStyle: {
        normal: {
          lineStyle:{  color: 'rgba(255,0,0)'   },
          areaStyle:{  color: 'rgba(255,0,0,0.1)' , type: 'default'  }
        }
      },    
      name: lineName,
      data: dataArr
    }
    return obj
  },

  // 生成用于显示tooltip的html文本结构
  generateTooltipFormatterStr( seriesNumber ){
    let templateStr = '<tr><td colspan="3">{time}</td></tr>'
    for ( let i = 0 ; i < seriesNumber ; i ++ ){
      templateStr += '<tr>'
      templateStr += '<td>{seriesName'+i+'}</td>'
      templateStr += '<td class="SpaceTdDistraction"></td>'
      templateStr += '<td>{seriesValue'+i+'}</td>'
      templateStr += '</tr>'
    }
    return '<table class="TooltipTable"><tbody>' + templateStr + '</tbody></table>'
  },

  initCharts(){
    // 在没有加载到数据的时候，先显示出来空白的图标，这样会比较好看
    let initOptions = {
      'title': { 
        'text': this.userData['echartTitleText']
      },
      'tooltip' : {
        'trigger': 'axis',
        'formatter': this.userData['echartTooltipFormatterFunc']
      },
      'xAxis': [{
        'type' : 'category',
        'data': []
      }],
      'yAxis':{
        'axisLabel':{
          'show':true,
          'formatter':this.userData['echartyAxisLabelFormatterFunc']
        }
      },
    }
    this.userData['echartObj'] = echarts.init(document.getElementById( this.props.echartDivID ))
    this.userData['echartObj'].setOption(initOptions)
  },

  onTimeRangeChanged( value ){
    // 由于发现当点击ButtonGroup右侧的时候，也会回调onClick、onChange函数，因此这里需要判断value是否是需要的值
    if ( typeof(value) === typeof(0) ){
      if ( this.userData['echartState']['loading'] === false ){
        this.echartShowLoading()
        this.userData['requestMonitorDataCallBackFunc']( value )
      }
    }
  },

  echartShowLoading(){  this.echartDisLoadingIcon( true ) },
  echartHideLoading(){  this.echartDisLoadingIcon( false )  },

  echartDisLoadingIcon( showLoadingIcon = true ){
    this.userData['echartState']['loading'] = showLoadingIcon    
    let echartObj = this.userData['echartObj']
    showLoadingIcon ? echartObj.showLoading() : echartObj.hideLoading()

    let buttonGroupObj = ReactDOM.findDOMNode(this.refs.TimeRangeButtonGroup)
    for ( let i = 0 ; i < buttonGroupObj.childNodes.length ; i ++ ){
      buttonGroupObj.childNodes[i].disabled = showLoadingIcon
    }    
  },

  render: function() {
    return (
      <table className='ResourceMonitorEchart'>
        <tbody>
          <tr>
            <td>
              <ButtonGroup ref='TimeRangeButtonGroup'
                           defaultValue={this.props.dataRangeMinutes[0]['value']}
                           onClick={this.onTimeRangeChanged}  
                           onChange={this.onTimeRangeChanged}>
                {this.props.dataRangeMinutes.map( (dataRangeMinute)=>{
                  return (
                    <Button value={dataRangeMinute['value']} size="sm" >
                        {dataRangeMinute['disStr']}
                    </Button>
                  )
                } )}
              </ButtonGroup>
            </td>
          </tr>
          <tr>
            <td>
              <div ref='ResorceMonitorEchartDiv' id={this.props.echartDivID} />
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
});


export default ResourceMonitorEchart;