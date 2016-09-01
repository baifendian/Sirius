/**
 * 开发环境、线上环境的不同配置
 */

var env = {}

if (process.env.NODE_ENV === 'production') {

  /**
   * 线上环境
   */

  // 数据接口基础 URL ajax
  env.baseUrl = '/'

  // 页面根路径  地址栏
  env.basePath = '/'

} else {

  /**
   * 开发环境
   */

  // 数据接口基础 URL
  env.baseUrl = 'http://172.24.3.64:10011/';

  // 页面根路径
  env.basePath = '/'

}

module.exports = env
