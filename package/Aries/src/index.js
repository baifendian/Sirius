/**
 * 整个应用的入口，所有资源的根源
 */

import xhr from 'bfd/xhr'
import message from 'bfd/message'
import auth from 'public/auth'
import router from './router'
import env from './env'
import pace from './pace'
import './pace.less'

pace.start()

/**
 * cookie升级
 */
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * AJAX 全局配置，比如请求失败、会话过期的全局处理。参考 bfd-ui AJAX 请求组件
 */
//xhr.baseUrl = env.baseUrl + '/'
xhr.baseUrl = env.baseUrl
xhr.header = {
//  "X-CSRFToken": getCookie('csrftoken')
}
//xhr.baseUrl = 'http://172.24.3.64:10086/v1'
xhr.success = (res, option) => {
  if (typeof res !== 'object') {
    message.danger(option.url + ': response data should be JSON')
    return
  }
  switch (res.code) {
    case 200:
      option.success && option.success(res.data)
      break
    case 401:
      auth.destroy()
      router.history.replaceState({
        referrer: router.state.location.pathname
      }, '/login')
      break
    default:
      message.danger(res.data || 'unknown error')
  }
}
