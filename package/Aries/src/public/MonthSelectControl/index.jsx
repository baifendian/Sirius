
import React from 'react'
import ReactDOM from 'react-dom'

import { Dropdown, DropdownToggle, DropdownMenu } from 'bfd/Dropdown'
import { Select, Option } from 'bfd/Select'
import Input from 'bfd/Input'
import Button from 'bfd/Button'

import './index.less'

/*
月份选择控件：
输入：
  years           年份数组，比如 [2015,2016,2017] ，如果不传，则将会默认展示过去四年的年份
  defaultValue    默认年月，比如 '2016-11' ，如果不传，则使用当前的年月
  onChange        当用户更改日期的时候的回调函数
输出：
  可以通过该组建的 ref 来调用 getValue 函数，即可返回用户选择的年月，返回的格式为： 2016-12（字符串） 
  也可以通过该组建的 ref 来调用 getDate 函数，即可返回用户选择的年月所对应的Date对象（该年月第一天的凌晨）

*/

var MonthSelectControl = React.createClass({

  getInitialState(){
    return {
      'dropdownOpenState':false,
      'hasBindButtonCallBack':false,
      'inputValue':'',
    }
  },

  executePropInfo( propYears,propDefaultDateStr ){

    let years = []
    if ( propYears ){
      years = propYears
    } else {
      let curYear = ( new Date() ).getFullYear()
      for ( let i = 3 ; i >= 0 ; i -- ){
        years.push( curYear-i )
      }
    }

    let defaultDate = propDefaultDateStr ? (new Date(propDefaultDateStr)) : (new Date())
    let defaultYear = defaultDate.getFullYear()
    if ( years.indexOf( defaultYear ) == -1 ){
      defaultYear = years[years.length-1]
    }
    
    return { 
      'years':years,
      'defaultYear':defaultYear,
      'defaultMonth':defaultDate.getMonth()+1
    }
  },

  componentWillMount(){
    this.userData = {}

    this.userData['monthInfoList'] = [
      ['01','02','03','04'],
      ['05','06','07','08'],
      ['09','10','11','12']
    ]

    this.userData['executedPropInfos'] = this.executePropInfo(this.props.years,this.props.defaultValue)
    this.state.inputValue = this.combineDateInfo( 
      this.userData['executedPropInfos']['defaultYear'], 
      this.userData['executedPropInfos']['defaultMonth']
    )

    this.userData['selectInfos'] = {
      'selectedYear':undefined,
      'selectedMonth':undefined,
    }
  },

  componentDidMount(){
    ReactDOM.findDOMNode( this.refs.InputRef ).addEventListener( 'click',()=>{
      this.refs.PleaseSelectMonthControlDropDownRef.setState({ 'dropdownOpenState':true })

      // js是单线程的，因此setState之后并不会马上进入setState的回调函数中，因此这里过500ms再进行绑定
      setTimeout( ()=>{ this.bindButtonClickCallBack() },500 );
    } )
  },

  // 由于在 componentDidMount 函数中不能保证 DropdownMenu 的内容已经被渲染到页面上（lazy渲染），因此需要存储月份按钮是否绑定click事件的状态
  bindButtonClickCallBack(){
    if ( this.userData['hasBindButtonCallBack'] != true ){
      this.userData['monthInfoList'].map( (curLine)=>{
        curLine.map( (monthIndex)=>{
          ReactDOM.findDOMNode( this.refs['MonthButtonRef'+monthIndex] ).addEventListener( 'click',()=>{
            this.onMonthButtonClicked( monthIndex )
          } )
        } )
      } )
      this.userData['hasBindButtonCallBack'] = true
    }
  },

  onMonthButtonClicked(month){
    this.userData['selectedMonth'] = month
    this.refreshInputValue()
  },

  onYearSelectValueChanged(year){
    this.userData['selectedYear'] = year
    this.refreshInputValue()
  },

  refreshInputValue(){
    let dateStr = this.getValue()
    this.setState({'inputValue':dateStr})
    this.props.onChange && this.props.onChange( dateStr )
  },

  combineDateInfo(year,month){
    year = Number(year)
    month = Number(month)
    month = (month < 10) ? '0'+month : ''+month
    return year+'-'+month
  },

  getValue(){
    return this.combineDateInfo(
      this.userData['selectedYear'] ? this.userData['selectedYear'] : this.userData['executedPropInfos']['defaultYear'],
      this.userData['selectedMonth'] ? this.userData['selectedMonth'] : this.userData['executedPropInfos']['defaultMonth']
    )
  },
  getDate(){
    return this.getValue() + '-01 00:00:00'
  },

  render:function (){

    return (
      <div className="MonthSelectControlRootDiv">
        <Dropdown ref="PleaseSelectMonthControlDropDownRef" 
                  open={this.state.dropdownOpenState}
                  aligned={false}>
          <DropdownToggle>
            <Input ref="InputRef" value={this.state.inputValue} readOnly='true' />
          </DropdownToggle>
          <DropdownMenu >
            <table className="MonthSelectTable">
              <tbody>
                <tr>
                  <td colSpan="3">
                    <Select defaultValue={this.userData['executedPropInfos']['defaultYear']} onChange={this.onYearSelectValueChanged}>
                        {this.userData['executedPropInfos']['years'].map( (y)=>{
                          return <Option value={y} key={y}>{y}</Option>
                        } )}
                    </Select>
                  </td>
                </tr>
                {this.userData['monthInfoList'].map( (curLine)=>{
                  return (
                    <tr key={curLine.join('-')}>
                      {curLine.map( (curMonthNumber)=>{
                        return (
                          <td key={curMonthNumber}>
                            <div ref={"MonthButtonRef"+curMonthNumber} className="MonthButton">{curMonthNumber}</div>
                          </td>
                        )
                      })}
                    </tr>
                  )                
                })}
              </tbody>
            </table>
          </DropdownMenu>
        </Dropdown>
      </div>

    )
  }
})

export default MonthSelectControl

