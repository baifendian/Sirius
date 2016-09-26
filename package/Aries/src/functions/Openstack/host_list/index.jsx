import React from 'react'
import {Checkbox} from 'bfd/Checkbox'
//import './index.less'
import {Row, Col} from 'bfd-ui/lib/Layout'
import xhr from 'bfd-ui/lib/xhr'
import {Form, FormItem} from 'bfd-ui/lib/Form'
import FormInput from 'bfd-ui/lib/FormInput'

export default React.createClass({
  getInitialState: function () {
    //let test11=test1(),
    return {
      test: 'test11',
      aa: ['--']
    }
  },
  componentWillMount: function () {
    //console.log('test')
    let aa1 = "bbdefb"
    const self = this;
    //this.state.aa=a
    xhr({
      type: 'GET',
      url: 'test/',
      success(data) {
        // console.log(data['totalList'])
        self.setState(
          {aa: data['totalList']}
        )
        //console.log(self.state.aa)
        // console.log(data.length)
        // for (var i=0;i<data['totalList'].length;i++){
        //   console.log(data['totalList'][i])
        // console.log(i)
        //}
      }
    })
  },
  render() {
    //	console.log('test')
    //console.log( this.props.params.id)
    // 	console.log(this.state.aa)
    let nav = this.state.aa;
    return (
      <div>
        <h1>详情展示</h1>
        <div>
          <h2>概况</h2>
          <Row>
            {nav.map((item, i) => {
              return (
                <div key={ i }>
                  <h1>{i}</h1>
                  <div>{Object.keys(item).map((str)=> {
                    //console.log(item[str])
                    return (//<h1>{str}{item[str]}</h1>
                      <Row>
                        <Col col="md-4" style={{backgroundColor: '#e3f2fd'}}> {str}</Col>
                        <Col col="md-8" style={{backgroundColor: '#bbdefb'}}>{item[str]}</Col>
                      </Row>
                    )
                  })}</div>
                </div>
              )
            })
            }

          </Row>
        </div>
        <div>
          <h2>规格</h2>
        </div>
        <div>
          <h2>IP地址</h2>
        </div>
        <div>
          <h2>元数据</h2>
        </div>
        <div>
          <h2>云硬盘已连接</h2>
        </div>
      </div>
    )
  }
})