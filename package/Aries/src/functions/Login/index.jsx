import React, { PropTypes } from 'react'
import { Form, FormItem } from 'bfd/Form2'
import FormInput from 'bfd/FormInput'
import { Checkbox } from 'bfd/Checkbox'
import xhr from 'bfd/xhr'
import auth from 'public/auth'
import './index.less'

export default React.createClass({

  contextTypes: {
    history: PropTypes.object
  },

  getInitialState() {
    this.rules = {
      username(v) {
        if (!v) return '请输入用户名'
      },
      password(v) {
        if (!v) return '请输入密码'
      }
    }
    return {
      user: {}
    }
  },

  handleChange(user) {
    this.setState({ user })
  },

  handleLogin() {
    this.refs.form.save()
  },

  handleSuccess(user) {
    auth.register(user)
    let referrer = this.props.location.state && this.props.location.state.referrer || '/'
    this.context.history.push(referrer)
  },

  handleRemember(e) {
    const user = this.state.user
    user.remember = e.target.checked
    this.setState({ user })
  },

  render() {
    return (
      <div className="login">
        <div className="body">
          <Form ref="form" action="login" onSuccess={this.handleSuccess} data={this.state.user} onChange={this.handleChange} labelWidth={0} rules={this.rules}>
            <div className="logo">
              <h2>百分点云中心</h2>
            </div>
            <FormItem name="username">
              <FormInput placeholder="ming.xiao"></FormInput>
            </FormItem>
            <FormItem name="password">
              <FormInput placeholder="password" type="password"></FormInput>
            </FormItem>
            <FormItem name="remember">
              <Checkbox onChange={this.handleRemember}>下次自动登录</Checkbox>
            </FormItem>
            <button type="submit" className="btn btn-primary" onClick={this.handleLogin}>登录</button>
          </Form>
        </div>
        <div className="footer">
          <a href="http://www.baifendian.com" className="pull-left logo">POWERED BY</a>
          <div className="pull-right">
            <div className="links">
              <a href="http://www.baifendian.com/list.php?catid=32">公司简介</a>&nbsp;&nbsp;|&nbsp;&nbsp;
              <a href="http://www.baifendian.com/list.php?catid=43">联系我们</a>&nbsp;&nbsp;|&nbsp;&nbsp;
              <a href="">隐私声明</a>&nbsp;&nbsp;|&nbsp;&nbsp;
              <a href="">使用条款</a>&nbsp;&nbsp;|&nbsp;&nbsp;
              <a href="">商标</a>
            </div>
            <div className="copyright">Copyright©2016 Baifendian Corporation All Rights Reserved.&nbsp;&nbsp;|&nbsp;&nbsp;京ICP备09109727号&nbsp;&nbsp;|&nbsp;&nbsp;京公网安备11010802010283号</div>
          </div>
        </div>
      </div>
    )
  }
})
