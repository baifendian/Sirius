webpackJsonp([14],{10:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var r=o(5),l=a(r),n=o(6),i=a(n),s=o(1),c=a(s),p=o(4),d=a(p);o(22);var u=c["default"].createClass({displayName:"Checkbox",getInitialState:function(){return{checked:this.props.defaultChecked||this.props.checked}},componentWillReceiveProps:function(e){"checked"in e&&this.setState({checked:e.checked})},handleChange:function(e){e.stopPropagation(),this.setState({checked:e.target.checked}),this.props.onChange&&this.props.onChange(e)},render:function(){var e=this.props,t=e.className,o=e.value,a=e.disabled,r=e.block,n=e.children,s=(0,i["default"])(e,["className","value","disabled","block","children"]);return c["default"].createElement("div",(0,l["default"])({className:(0,d["default"])("bfd-checkbox",{checkbox:r,disabled:a,"checkbox-inline":!r},t)},s),c["default"].createElement("label",null,c["default"].createElement("input",{type:"checkbox",value:o,checked:this.state.checked,disabled:a,onChange:this.handleChange}),c["default"].createElement("span",{className:"status"}),n?c["default"].createElement("span",null,n):null))}});u.propTypes={value:s.PropTypes.oneOfType([s.PropTypes.string,s.PropTypes.number]),checked:s.PropTypes.bool,defaultChecked:s.PropTypes.bool,disabled:s.PropTypes.bool,onChange:s.PropTypes.func,block:s.PropTypes.bool,customProp:function(e){if("checked"in e&&!e.onChange)return new Error("You provided a `checked` prop without an `onChange` handler")}},t["default"]=u},17:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var r=o(5),l=a(r),n=o(6),i=a(n),s=o(1),c=a(s),p=o(10),d=a(p),u=o(4),f=a(u);o(23);var h=c["default"].createClass({displayName:"CheckboxGroup",getInitialState:function(){return{selects:this.props.selects||[]}},componentWillReceiveProps:function(e){e.selects&&this.setState({selects:e.selects})},update:function(e){this.setState({selects:e}),this.props.onChange&&this.props.onChange(e)},addSelect:function(e){var t=this.state.selects;t.push(e),this.update(t)},removeSelect:function(e){var t=this.state.selects;t.splice(t.indexOf(e),1),this.update(t)},toggleAll:function(e){var t=this.state.selects;e.target.checked?Array.prototype.push.apply(t,this.unSelects):t.length=0,this.update(t)},handleCheckboxChange:function(e,t){this[(t.target.checked?"add":"remove")+"Select"](e)},render:function(){var e=this,t=this.props,o=t.className,a=t.values,r=t.children,n=t.block,s=t.toggleable,p=(0,i["default"])(t,["className","values","children","block","toggleable"]),u=this.state.selects,h=[],m=void 0;return m=a?a.map(function(t,o){var a=u.indexOf(t)!==-1;return a||h.push(t),c["default"].createElement(d["default"],{key:o,value:t,checked:a,onChange:e.handleCheckboxChange.bind(e,t),block:n},t)}):c["default"].Children.map(r,function(t,o){if(t){var a=t.props,r=a.value,l=u.indexOf(r)!==-1;return l||a.disabled||h.push(r),c["default"].cloneElement(t,{key:o,checked:u.indexOf(r)!==-1,block:a.block||n,onChange:e.handleCheckboxChange.bind(e,r)})}}),this.unSelects=h,c["default"].createElement("div",(0,l["default"])({className:(0,f["default"])("bfd-checkbox-group",o)},p),s&&m&&m.length>1?c["default"].createElement(d["default"],{block:n,checked:0===h.length,onChange:this.toggleAll},"全选"):null,m)}});h.propTypes={selects:s.PropTypes.array,values:s.PropTypes.array,onChange:s.PropTypes.func,block:s.PropTypes.bool,toggleable:s.PropTypes.bool},t["default"]=h},18:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0}),t.Checkbox=t.CheckboxGroup=void 0;var r=o(17),l=a(r),n=o(10),i=a(n);t.CheckboxGroup=l["default"],t.Checkbox=i["default"]},20:function(e,t,o){t=e.exports=o(2)(),t.push([e.id,".bfd-checkbox{padding-left:0;margin:0}.bfd-checkbox.disabled>label{cursor:default}.bfd-checkbox.disabled>label:hover{color:#666}.bfd-checkbox.disabled.checkbox-inline{cursor:default}.bfd-checkbox>label{vertical-align:top;min-height:16px;line-height:30px;padding-left:16px;font-weight:400;position:relative;margin-bottom:0;cursor:pointer;width:100%}.bfd-checkbox>label:hover{color:#2196f3}.bfd-checkbox>label:hover>.status:before{border-color:#2196f3}.bfd-checkbox>label>input[type=checkbox]{display:none}.bfd-checkbox>label>input[type=checkbox]:checked+.status:before{border-color:#2196f3}.bfd-checkbox>label>input[type=checkbox]:checked+.status:after{display:block}.bfd-checkbox>label>input[type=checkbox]:checked+.status+span{color:#2196f3}.bfd-checkbox>label>input[type=checkbox]:disabled+.status:before{border-color:#eceff1}.bfd-checkbox>label>.status{pointer-events:none}.bfd-checkbox>label>.status+span{pointer-events:none;margin-left:7px}.bfd-checkbox>label>.status:before{content:'';position:absolute;background-color:#fff;left:0;top:50%;margin-top:-8px;width:16px;height:16px;border:1px solid #9e9e9e;border-radius:2px}.bfd-checkbox>label>.status:after{content:'';position:absolute;left:5px;top:50%;width:6px;height:10px;margin-top:-6px;border:2px solid #2196f3;border-top:0;border-left:0;transform:rotate(45deg);display:none;border-radius:2px}",""])},21:function(e,t,o){t=e.exports=o(2)(),t.push([e.id,".bfd-checkbox-group>.checkbox-inline{margin-right:20px}.bfd-checkbox-group>.checkbox+.checkbox{margin-top:0}",""])},22:function(e,t,o){var a=o(20);"string"==typeof a&&(a=[[e.id,a,""]]);o(3)(a,{});a.locals&&(e.exports=a.locals)},23:function(e,t,o){var a=o(21);"string"==typeof a&&(a=[[e.id,a,""]]);o(3)(a,{});a.locals&&(e.exports=a.locals)},97:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var r=o(5),l=a(r),n=o(6),i=a(n),s=o(1),c=a(s),p=o(4),d=a(p),u=o(12),f=(a(u),o(13)),h=a(f),m=o(44);a(m);o(125);var b=c["default"].createClass({displayName:"Form",getChildContext:function(){return{form:this}},componentWillMount:function(){this.items=[]},addItem:function(e){e.props.multiple&&(e.uuid=Math.random().toString(16).slice(2),this.multipleMap||(this.multipleMap={}),this.multipleMap[e.uuid]=this.items.filter(function(t){return t.props.name===e.props.name}).length),this.items.push(e)},removeItem:function(e){var t=this;e.props.multiple&&!function(){delete t.multipleMap[e.uuid];var o=e.props.name;t.items.filter(function(e){return e.props.name===o}).forEach(function(e,o){t.multipleMap[e.uuid]=o})}(),this.items.splice(this.items.indexOf(e),1)},validate:function(e){var t=this;e||(e=this.props.data);var o=!0;return this.items.forEach(function(a){var r=a.props,l=r.name,n=r.multiple;if(n){var i=t.multipleMap[a.uuid];a.validate(e[l]&&e[l][i])||(o=!1)}else a.validate(e[l])||(o=!1)}),o},handleSubmit:function(e){e.preventDefault()},save:function(e){var t=this;this.validate()&&(0,h["default"])({type:"POST",url:this.props.action,data:e||this.props.data,success:function(e){t.props.onSuccess&&t.props.onSuccess(e)}})},render:function(){var e=this.props,t=e.className,o=(e.data,e.children),a=(e.onChange,e.onSubmit,(0,i["default"])(e,["className","data","children","onChange","onSubmit"]));return c["default"].createElement("form",(0,l["default"])({onSubmit:this.handleSubmit,className:(0,d["default"])("bfd-form2",t)},a),o)}});b.childContextTypes={form:s.PropTypes.instanceOf(b)},b.defaultProps={labelWidth:100},b.propTypes={data:s.PropTypes.object,onChange:s.PropTypes.func,rules:s.PropTypes.object,labelWidth:s.PropTypes.number,action:s.PropTypes.string,onSuccess:s.PropTypes.func},t["default"]=b},98:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var r=o(5),l=a(r),n=o(6),i=a(n),s=o(1),c=a(s),p=o(4),d=a(p);o(126);var u=c["default"].createClass({displayName:"FormItem",getInitialState:function(){return{error:null}},getChildContext:function(){return{formItem:this}},componentWillMount:function(){this.context.form.addItem(this)},componentWillUnmount:function(){this.context.form.removeItem(this)},validate:function(e){var t=this.context.form.props.rules,o=t&&t[this.props.name],a=!0;if(o){var r=o(e);r&&"string"==typeof r&&(a=!1),this.setState({error:r})}return a},render:function(){var e=this.state.error,t=this.props,o=(t.name,t.multiple,t.required),a=t.help,r=t.label,n=t.className,s=t.children,p=(0,i["default"])(t,["name","multiple","required","help","label","className","children"]),u=this.context.form.props.labelWidth,f=void 0;a&&(f=c["default"].createElement("div",{className:"tip help"},c["default"].createElement("span",{className:"glyphicon glyphicon-question-sign"}),a));var h=void 0;return e&&(h=c["default"].createElement("div",{className:"tip error"},c["default"].createElement("span",{className:"glyphicon glyphicon-exclamation-sign"}),e)),c["default"].createElement("div",(0,l["default"])({className:(0,d["default"])("form-group bfd-form-item2",n,{"has-error":e})},p),r?c["default"].createElement("div",{className:(0,d["default"])("form-label",{required:o}),style:{width:u+"px"}},r,"："):null,c["default"].createElement("div",{className:"form-content",style:{marginLeft:u+"px"}},s,h?h:f))}});u.contextTypes={form:s.PropTypes.object},u.childContextTypes={formItem:s.PropTypes.instanceOf(u)},u.propTypes={label:s.PropTypes.string,name:s.PropTypes.string.isRequired,required:s.PropTypes.bool,help:s.PropTypes.string,multiple:s.PropTypes.bool},t["default"]=u},99:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0}),t.FormItem2=t.Form2=t.FormItem=t.Form=void 0;var r=o(97),l=a(r),n=o(98),i=a(n);t.Form=l["default"],t.FormItem=i["default"],t.Form2=l["default"],t.FormItem2=i["default"]},115:function(e,t,o){t=e.exports=o(2)(),t.push([e.id,".bfd-form2 .form-group>label{display:block}.bfd-form2 .form-group>.help{margin-top:5px;color:#999}.bfd-form2 .form-group>.error{margin-top:5px;color:#a94442}",""])},116:function(e,t,o){t=e.exports=o(2)(),t.push([e.id,".bfd-form-item2 .form-label{float:left;line-height:30px;height:30px;text-align:right}.bfd-form-item2 .form-label.required:before{content:'* ';color:#d9534f;font-size:14px;font-weight:700;vertical-align:middle}.bfd-form-item2 .tip{font-size:12px;margin-top:5px;display:inline-block}.bfd-form-item2 .tip>.glyphicon{margin-right:3px}.bfd-form-item2 .tip.help{color:#999}.bfd-form-item2 .tip.error{color:#cf7f7f}",""])},125:function(e,t,o){var a=o(115);"string"==typeof a&&(a=[[e.id,a,""]]);o(3)(a,{});a.locals&&(e.exports=a.locals)},126:function(e,t,o){var a=o(116);"string"==typeof a&&(a=[[e.id,a,""]]);o(3)(a,{});a.locals&&(e.exports=a.locals)},327:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var r=o(1),l=a(r),n=o(99),i=o(349),s=a(i),c=o(18),p=o(13),d=(a(p),o(137)),u=a(d);o(567),t["default"]=l["default"].createClass({displayName:"Login",contextTypes:{history:r.PropTypes.object},getInitialState:function(){return this.rules={username:function(e){if(!e)return"请输入用户名"},password:function(e){if(!e)return"请输入密码"}},{user:{}}},handleChange:function(e){this.setState({user:e})},handleLogin:function(){this.refs.form.save()},handleSuccess:function(e){u["default"].register(e);var t=this.props.location.state&&this.props.location.state.referrer||"/";this.context.history.push(t)},handleRemember:function(e){var t=this.state.user;t.remember=e.target.checked,this.setState({user:t})},render:function(){return l["default"].createElement("div",{className:"login"},l["default"].createElement("div",{className:"body"},l["default"].createElement(n.Form,{ref:"form",action:"login",onSuccess:this.handleSuccess,data:this.state.user,onChange:this.handleChange,labelWidth:0,rules:this.rules},l["default"].createElement("div",{className:"logo"},l["default"].createElement("h2",null,"百分点云中心")),l["default"].createElement(n.FormItem,{name:"username"},l["default"].createElement(s["default"],{placeholder:"ming.xiao"})),l["default"].createElement(n.FormItem,{name:"password"},l["default"].createElement(s["default"],{placeholder:"password",type:"password"})),l["default"].createElement(n.FormItem,{name:"remember"},l["default"].createElement(c.Checkbox,{onChange:this.handleRemember},"下次自动登录")),l["default"].createElement("button",{type:"submit",className:"btn btn-primary",onClick:this.handleLogin},"登录"))),l["default"].createElement("div",{className:"footer"},l["default"].createElement("a",{href:"http://www.baifendian.com",className:"pull-left logo"},"POWERED BY"),l["default"].createElement("div",{className:"pull-right"},l["default"].createElement("div",{className:"links"},l["default"].createElement("a",{href:"http://www.baifendian.com/list.php?catid=32"},"公司简介"),"  |  ",l["default"].createElement("a",{href:"http://www.baifendian.com/list.php?catid=43"},"联系我们"),"  |  ",l["default"].createElement("a",{href:""},"隐私声明"),"  |  ",l["default"].createElement("a",{href:""},"使用条款"),"  |  ",l["default"].createElement("a",{href:""},"商标")),l["default"].createElement("div",{className:"copyright"},"Copyright©2016 Baifendian Corporation All Rights Reserved.  |  京ICP备09109727号  |  京公网安备11010802010283号"))))}})},349:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var r=o(5),l=a(r),n=o(6),i=a(n),s=o(1),c=a(s),p=o(55),d=a(p),u=o(4),f=a(u),h=o(360),m=a(h);o(547);var b=c["default"].createClass({displayName:"FormInput",render:function(){var e=this.props,t=e.className,o=(e.children,e.onChange),a=(0,i["default"])(e,["className","children","onChange"]),r=(0,m["default"])(this);return a.value=r.get(),a.onChange=function(e){r.set(e),o&&o(e)},c["default"].createElement(d["default"],(0,l["default"])({className:(0,f["default"])("bfd-form-input",t)},a))}});b.contextTypes={form:s.PropTypes.object,formItem:s.PropTypes.object},t["default"]=b},360:function(e,t){"use strict";function o(e){var t=e.context,o=t.form,a=t.formItem,r=a.props.name,l=o.props.data[r];return{get:function(){return a.props.multiple?l instanceof Array?l[o.multipleMap[a.uuid]]:void 0:l},set:function(e){var t=o.props.data;a.props.multiple?(l instanceof Array||(t[r]=[]),t[r][o.multipleMap[a.uuid]]=e):t[r]=e,o.props.onChange&&o.props.onChange(o.props.data),a.validate(e)}}}Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=o},402:function(e,t,o){t=e.exports=o(2)(),t.push([e.id,".bfd-form-input{display:inline-block;width:auto;margin-right:10px}",""])},429:function(e,t,o){t=e.exports=o(2)(),t.push([e.id,".login{background-color:#333;min-height:100%;background:#333 url("+o(462)+") no-repeat;background-size:cover;position:relative}.login .body{position:relative;padding-bottom:90px;min-height:500px}.login .body .bfd-form2{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:20px;width:360px;border-radius:2px;box-shadow:1px 1px 3px rgba(0,0,0,.2);background-color:#fff}.login .body .bfd-form2 .logo{position:absolute;left:50%;top:-120px;transform:translate(-50%);text-align:center;white-space:nowrap;color:#fff}.login .body .bfd-form2 .bfd-form-input{display:block;margin-right:0}.login .body .bfd-form2 button{width:100%}.login .footer{height:90px;padding:24px 70px;position:absolute;width:100%;bottom:0;background:#2196f3}.login .footer .logo{width:160px;height:100%;background:url("+o(249)+") no-repeat bottom;text-decoration:none}.login .footer .pull-right{text-align:right}.login .footer .pull-right .links{color:#fff;margin-bottom:5px}.login .footer .pull-right .copyright{color:#ececec}.login .footer a{color:#fff}",""])},462:function(e,t,o){e.exports=o.p+"files/40ce7c17b5dbf5841176e2d2848a8f7b.jpg"},547:function(e,t,o){var a=o(402);"string"==typeof a&&(a=[[e.id,a,""]]);o(3)(a,{});a.locals&&(e.exports=a.locals)},567:function(e,t,o){var a=o(429);"string"==typeof a&&(a=[[e.id,a,""]]);o(3)(a,{});a.locals&&(e.exports=a.locals)}});