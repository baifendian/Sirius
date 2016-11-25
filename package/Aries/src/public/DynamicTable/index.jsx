import React from 'react'
import Toolkit from 'public/Toolkit/index.js'
import './index.less'


var DynamicTableLine = React.createClass({
  render: function (){
    let restTdNumber = this.props.maxTdNumberInOneline - this.props.oneLineKeys.length
    if (restTdNumber < 0){
      restTdNumber = 0
    }
    for (let i = 0 ; i < restTdNumber ; i ++){
      this.props.oneLineKeys.push( '' )
    }
    return(
      <tr>
        {this.props.oneLineKeys.map( (lineText) => {
          // 首先计算空格的个数
          let spaceNumber = 0
          for ( let i = 0 ; i < lineText.length ; i ++ ){
            if (lineText[i] !== ' ')
              break
            spaceNumber += 1
          }

          // 然后根据每个空格向右偏移 15px ，即可渲染出来较为方便查看的显示
          return (
            <td key={Toolkit.generateGUID()}  >
              <div style={{ 'marginLeft':spaceNumber*15+'px' }}>
                {lineText}
              </div>
            </td>
          )
        })}
      </tr>
    )
  }
})


/**
 * 动态生成table
 * 如：
 * dynamicTableTextArray = [
 *   [1,2,3],
 *   [4,5],
 *   [6]   
 * ]
 * 它将生成以下节点：
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>1</td>
 *       <td>2</td>
 *       <td>3</td>
 *     </tr>
 *     <tr>
 *       <td>4</td>
 *       <td>5</td>
 *       <td></td>
 *     </tr>
 *     <tr>
 *       <td>6</td>
 *       <td></td>
 *       <td></td>
 *     </tr>
 *   </tbody>
 * </table>
 * 注意，它会保证每行的td个数相同，没有提供数据的会以 <td></td> 填充
 * 
 * */
var DynamicTable = React.createClass({
  render:function (){
    let maxTdNumberInOneline = 0
    for (let i = 0 ; i < this.props.dynamicTableTextArray.length ; i ++){
      let l = this.props.dynamicTableTextArray[i].length
      if (maxTdNumberInOneline < l){
        maxTdNumberInOneline = l
      }
    }

    let styleDict = {}
    this.props.dynamicTableHeight && (styleDict['height'] = this.props.dynamicTableHeight+'px')

    return (
      <div className="DynamicTableClass" style={styleDict}>
	      <table>
          <tbody>
            {this.props.dynamicTableTextArray.map((keysInOneLine) => {
              return <DynamicTableLine maxTdNumberInOneline={maxTdNumberInOneline} 
                                       oneLineKeys={keysInOneLine} 
                                       key={Toolkit.generateGUID()} />
            })}
          </tbody>
        </table>
      </div>
    )
  }
})

export default DynamicTable

