
import React from 'react';

/**
 * 为了尽可能地提供较多的特性，heightProp 这个字符串包含了较多含义。它可能是以下值：
 * 'Const'          该组件的高度固定
 * 'Const_xxx'      该组件的高度固定为 xxx 个像素
 * 'Var'            该组件的高度需要动态赋值（值为：总高度 - 所有Const的高度）
 *                    要求只存在一个可变高度的 AutoLayoutChildDiv 
 *                    注意 Var 与 Var_1 等价
 * 'Var_xxx'        该组件的高度需要动态赋值，但与 'Var' 不同的是，
 *                    如果存在多个可变高度的 AutoLayoutChildDiv 
 *                    它们将会根据 xxx 所代表的比例，来分割剩余的高度（剩余的高度：总高度-所有Const的高度）
 */

function layoutInfoGenerator( id,isRoot,heightProp,heightChangedCallback ){
  let infoDict = {
    id:id,
    isRoot:isRoot,
    heightProp:heightProp,
    heightChangedCallback:heightChangedCallback
  }
  return infoDict
}

var AutoLayoutDiv = React.createClass({

  componentWillMount(){
    this.userData = {}
    this.userData['elementIDHeightReference'] = {}
  },

  componentDidMount(){
    this.calcDesiredSize()
    window.onresize = ()=>{ this.onWindowResize() }
  },

  componentDidUpdate(){
    this.calcDesiredSize()
  },

  onWindowResize(){
    window.onresize = undefined
    this.calcDesiredSize()
    window.onresize = ()=>{ this.onWindowResize() }
  },

  calcRootDivSize(){
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    totalHeight -= 20*2               // 去掉设置的子页面padding

    let totalWidth = document.getElementById('body').childNodes[1].clientWidth
    totalWidth -= 20*2

    return { 'width':totalWidth,'height':totalHeight }
  },

  getRootNodeInfo(){
    for ( let index = 0 ; index < this.props.layoutInfos.length ; index ++ ){
      let curNode = this.props.layoutInfos[index]
      if ( curNode['isRoot'] == true ){
        return curNode
      }
    }
  },

  getChildNodeInfos(){
    let childNodes = []
    for ( let index = 0 ; index < this.props.layoutInfos.length ; index ++ ){
      let curNode = this.props.layoutInfos[index]
      if ( curNode['isRoot'] == false ){
        childNodes.push(curNode)
      }
    }
    return childNodes
  },

  checkNeedToCallHeightChangedCallback( id,newHeight,heightChangedCallback ){
    if ( this.userData['elementIDHeightReference'][id] !== newHeight ){
      this.userData['elementIDHeightReference'][id] = newHeight
      return true
    } else {
      return false
    }
  },

  calcDesiredSize(){
    let rootDivSize = this.calcRootDivSize()
    let rootDivWidth = rootDivSize['width']
    let rootDivHeight = rootDivSize['height']
    document.getElementById(this.getRootNodeInfo()['id']).style.height = (rootDivHeight+'px')

    this.analyseHeightProp( rootDivHeight )
  },

  analyseHeightProp( rootDivHeight ){
    let varNodeCache = []
    let totalProportion = 0

    let childNodes = this.getChildNodeInfos()
    for ( let index = 0 ; index < childNodes.length ; index ++ ){
      let { id,heightProp,heightChangedCallback } = childNodes[index]
      let curNode = document.getElementById( id )

      let hpSplitedArr = heightProp.split('_')
      if ( hpSplitedArr[0] === 'Const' ){
        let h = (hpSplitedArr[1] === undefined) ? curNode.clientHeight : parseInt( hpSplitedArr[1] )
        rootDivHeight -= h
      } else if ( hpSplitedArr[0] === 'Var' ){
        let proportion = (hpSplitedArr[1] === undefined) ? 1 : parseInt( hpSplitedArr[1] )
        totalProportion += proportion
        varNodeCache.push( [ id,curNode,proportion,heightChangedCallback ] )
      } else {
        curNode.style.display = 'none'
      }
    }

    for ( let index = 0 ; index < varNodeCache.length  ; index += 1 ){
      let [id,curNode,proportion,heightChangedCallback] = varNodeCache[index]
      let newHeight = parseInt(rootDivHeight * proportion / totalProportion)
      curNode.style.height = newHeight+'px'

      if ( this.checkNeedToCallHeightChangedCallback( id,newHeight,heightChangedCallback ) && heightChangedCallback ){
        heightChangedCallback( newHeight )
      }
    }
  },

  render: function(){
    return <div />
  }
})

export { AutoLayoutDiv , layoutInfoGenerator }

// 在其它文件中使用时：
// import { AutoLayoutDiv , layoutInfoGenerator } from 'public/AutoLayout'
