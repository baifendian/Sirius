import pieSubarea from './pieSubarea'
import pie from './pie'
/*
 *echarts数据渲染工具类
 */
const EchartsUtil = {
  /*
   * 渲染echarts中的数据.
   * type: 图表类型. echartsType中的key集合
   * data: 模版中对应的值
   */
  renderOptionData(type,data){
    let tempData = "";
    switch(type.toLocaleLowerCase()){
      case "pie":
        tempData = pie.renderOption(data);
        break;
      case "piesubarea":
        tempData = pieSubarea.renderOption(data);
        break;
      default:
        console.log("不包含对应的echarts 模版数据: "+type);
    }
    return tempData;
  },
}

export default EchartsUtil;
