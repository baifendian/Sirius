/**
 * 用户会话信息，auth.user = window.user
 * auth 作为模块供其他模块使用
 */

const auth = {

  isLoggedIn() {
    return !!auth.user
  },

  register(user) {
    auth.user = user
  },

  destroy() {
    auth.user = null
  }
}

if (process.env.NODE_ENV !== 'production') {
  window.user = {
    name: '管理员',
    type: 1,
    cur_space:"test2"
  }
}

auth.register(window.user)

export default auth
