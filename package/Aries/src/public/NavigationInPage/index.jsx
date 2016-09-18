import React from 'react'
import Toolkit from 'public/Toolkit/index.js'
import './index.less'


/**
 * this.props.headText    string
 * this.props.naviTexts   array
 * 	  它的每项都是一个object（字典类型），需要包含两个key：url、text
 *    url是将链接的页面
 *    text是将要显示的文本
 * 
   使用方法：
   export default React.createClass({
        let headText = '我的任务'
        let navigationTexts = [{
          'url':'http://www.baidu.com/',
          'text':'百度'
        },{
          'url':'http://www.google.com/',
          'text':'谷歌'
        },{
          'url':'http://www.qq.com/',
          'text':'qq'
        }]
        return (
            <div>
              <NavigationInPage headText={headText} naviTexts={navigationTexts}  />
            </div>
          );
        }
    });
*/

var NavigationInPage = React.createClass({
  
  render: function (){
    let lastPropNaviText = this.props.naviTexts[ this.props.naviTexts.length-1 ]
    let theRestPropNaviTexts = this.props.naviTexts.slice( 0,this.props.naviTexts.length-1 )
    return(
      <div className="NavigationInPageRootDiv">
        {theRestPropNaviTexts.map( (urlInfo) => {
          return (
            <div className="NaviTextDiv" key={Toolkit.generateGUID()}>
              <a href={urlInfo['url']}>{urlInfo['text']}</a>
              &nbsp;>&nbsp;
            </div>
          )
        })}
        <strong>{lastPropNaviText['text']}</strong>
      </div>
    )
  }
})

export default NavigationInPage