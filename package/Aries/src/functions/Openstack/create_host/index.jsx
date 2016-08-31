import { Form, FormItem } from 'bfd-ui/lib/Form'
import FormInput from 'bfd-ui/lib/FormInput'
import FormTextarea from 'bfd-ui/lib/FormTextarea'
import { FormSelect, Option } from 'bfd-ui/lib/FormSelect'
import message from 'bfd-ui/lib/message'
import React from 'react'
import './index.less'
import Icon from 'bfd-ui/lib/Icon'

import { Row, Col } from 'bfd-ui/lib/Layout'
import xhr from 'bfd-ui/lib/xhr'

import {Spin} from 'antd'

//const Nav = React.createClass();
export default React.createClass({
	

  getInitialState() {
  	const self = this;

    this.rules = {
      name(v) {
        if (!v){ return '名称不能为空'}else{
          console.log(v)
          self.setState({
              host_name:v
          })
        }
      },
  	  disk1(v){
  	  	if (!v) {return '不能为空'
  	  }else{
  	  	v=v+"GB"
  	  	let disk_arr=self.state.host_disk
  	  	disk_arr.splice(0,1,v)
  	  	self.setState({
  			host_disk:disk_arr
  	  	})
  	}
  	  },
  	disk2(v){
  	  	if (!v){ 
  	  		return '不能为空'
  	  	}else{
  	  		v=v+"GB"
  	  		let disk_arr=self.state.host_disk
  	  		disk_arr.splice(1,1,v)
  	  		self.setState({
  				host_disk:disk_arr
  	  		})
  	  	}
  	  },
  	disk3(v){
  	  	if (!v){ return '不能为空'
  	  }else{
  	  		v=v+"GB"
  	  		let disk_arr=self.state.host_disk
  	  		disk_arr.splice(2,1,v)
  	  		self.setState({
  				host_disk:disk_arr
  	  		})
  	  }
  	  },
  	count(v){
  	  	if (!v) return '不能为空'
  	  },
  	type(v){
  		console.log(v)
  		//console.log(self.state.test_1)
  		xhr({
 			 type: 'POST',
 			 url: 'flavors/',
 			 data: {
    			'id': v
			 },
  			success(data) {
  				let cpu=data['cpu']
  				let men=data['ram']
  				let host=data['count']
  				self.setState({
  					host_cpu:cpu+"核",
  					host_men:men+"MB",
  					host_host:host+"台"
  				});
  				console.log(self.state.host_men)
  				console.log(self.state.host_cpu)
 			} 
 	
		})

  	},
      date(v) {
        if (!v) return '日期不能为空'
      }
    }

    return {
      formData: {
        brand: 0
      },
      host_name:'',
      host_count:'',
      test_1: ['1'],
      test_mum: 3,
      host_cpu:'--',
      host_men:'--',
      host_host:'--',
      host_disk:['--'],
      host_images:[],
      host_flavors:[],
      loading: true
    }
  },
  componentWillMount: function(){
      //console.log('test')
     // let aa1="bbdefb"
      const self = this;
      //this.state.aa=a
      xhr({
       type: 'GET',
       url: 'images/',
       success(data) {
          console.log(data)
         self.setState(
              {host_images:data}
           )
       //  self.refs.spinObj.setState({ loading: false }
         console.log(data.length)
        // for (var i=0;i<data['totalList'].length;i++){
         //   console.log(data['totalList'][i])
           // console.log(i)
         //}
       }
    }),
      xhr({
       type: 'GET',
       url: 'flavors/',
       success(data) {
          console.log(data)
          self.setState({
            host_flavors:data,
            loading:false
            })
        //  console.log(self.refs.spinObj)
         // self.refs.spinObj.setState({spinning: true})
        
       //  console.log(data.length)
        // for (var i=0;i<data['totalList'].length;i++){
         //   console.log(data['totalList'][i])
           // console.log(i)
         //}
       }
    })

    },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({ formData })
    console.log('test')
  },


  handleSave() {
    console.log(this.state.formData)
    this.refs.form.save()
  },
  create_disk(name,number){
  	//console.log('test_1111')
  	if (name=='1'){
  	let arr= this.state.test_1;
  	if (this.state.test_1.length<4){
  		let test_arr=this.state.test_mum-1
  		let disk_arr=this.state.host_disk
  		if (this.state.test_1.length==1){
  			disk_arr.pop()
  			disk_arr.push(0)
  		}else{
  			//self.refs.disk1.focus()
  			disk_arr.push(0)
  		}
  		arr.push('1');
      let disk_length={'brand':disk_arr.length}
  		this.setState({
        formData:disk_length,
  			test_1:arr,
  			test_mum:test_arr,
  			host_disk:disk_arr
  		});
  	}
  }else{
  	console.log(number['i'])
  	let arr= this.state.test_1;
  	let disk_arr=this.state.host_disk
  	if (this.state.test_1.length>1){
  		let test_arr=this.state.test_mum+1
  		arr.pop();
  		disk_arr.pop();
  		if (arr==1){
  			disk_arr.pop();
  			disk_arr.push('--')
  		}  		
//  		arr.splice(0,1)
      let disk_length={'brand':disk_arr.length}
  		this.setState({
        formData:disk_length,
  			test_1:arr,
  			test_mum:test_arr
  		});
  	}
  }
  	
  },
  handleSuccess(res) {
    console.log(res)
    console.log('test')
    message.success('保存成功！')
  },
  disk_value(name){
  	console.log(name)
  },

  render() {
  	/*let nav1 = this.props.test_1.map((item, i) => {
  		return (
  				<h1>{item}<h1>
  			)
  	});	
    let nav = this.state.test_1.map((item, i) => {
	return (
		<div key={ i }  >
			<FormItem label="数据盘" name="name" className="disk_create">
          		<FormInput  placeholder="2BG"></FormInput>
        	</FormItem>
		</div>
		)
	});*/

  let images=this.state.host_images;
  let flavor=this.state.host_flavors;
	let nav = this.state.test_1.map((item, i) => {
		let disk='disk'+i
    //let disk_brand={'brand':i}
   // _this.setState({formData:disk_brand})
    console.log(this.state.formData['brand'])
		//console.log(disk)
	 	if (i==0){
	 		return (
	 				<h1 key={i}></h1>
	 			)
	 	}else{
	return (
		<div key={ i }  >
			<FormItem label="数据盘" name={disk} className="disk_create" >
          		<FormInput  placeholder="2BG" ref={disk} ></FormInput><Icon type=" fa-times" onClick={this.create_disk.bind(this,2,{i})} />
        	</FormItem>
		</div>
		)
		}
	});
	let disk = this.state.host_disk.map((item,i) =>{
		return(
				<div key={i}>{item}</div>
			)
	})
	
    const { formData } = this.state
    return (
    <div >
        
          <Spin ref="spinObj" spinning={this.state.loading}>
         

        <h1>云主机创建</h1>
        <div className="right_host">
        	<div style={{padding: "10px"}}>
        	<h4>信息展示</h4>
        	</div>
        	<div className="border_right"></div>
        	<Row style={{margin: "5px 0px 0px 0px"}}>
      			<Col col="md-4" style={{backgroundColor: '#e3f2fd'}}><h4>cpu</h4></Col>
    			<Col col="md-8" style={{backgroundColor: '#bbdefb'}}><h4>{this.state.host_cpu}</h4></Col>
   			</Row>
   			<Row  style={{margin: "5px 0px 0px 0px"}}>
      			<Col col="md-4" style={{backgroundColor: '#e3f2fd'}}><h4>内存</h4></Col>
    			<Col col="md-8" style={{backgroundColor: '#bbdefb'}}><h4>{this.state.host_men}</h4></Col>
   			</Row>
   			<Row style={{margin: "5px 0px 0px 0px"}}>
      			<Col col="md-4" style={{backgroundColor: '#e3f2fd'}}><h4>磁盘</h4></Col>
    			<Col col="md-8" style={{backgroundColor: '#bbdefb'}}>
    				<h4>{disk}</h4>
    			</Col>
   			</Row>
   			<Row style={{margin: "5px 0px 0px 0px"}}>
      			<Col col="md-4" style={{backgroundColor: '#e3f2fd'}}><h4>物理机</h4></Col>
    			<Col col="md-8" style={{backgroundColor: '#bbdefb'}}>
    				<h4>{this.state.host_host}</h4>
    			</Col>
   			</Row>
        </div>
        
     <div>
      <Form 
        ref="form" 
        action="bfddashboard/instances/" 
        data={formData} 
        rules={this.rules} 
        onSuccess={this.handleSuccess}
      >
        <FormItem label="名称" required name="name" placeholder={this.state.host_name} help="">
          <FormInput style={{width: '200px'}}></FormInput>
        </FormItem>
        <FormItem label="台数" required name="count" help="">
          <FormInput style={{width: '200px'}}></FormInput>
        </FormItem>
        <FormItem label="类型" name="type">
          <FormSelect style={{width: '200px'}} >
            <Option>请选择</Option>
            {Object.keys(flavor).map((str,i)=>{
              return (<Option value={str} key={i}>{flavor[str]}</Option>)
              })}
          </FormSelect>
        </FormItem>
         <FormItem label="cpu" name="type2">
          		<FormInput style={{width: '200px'}} disabled placeholder={this.state.host_cpu}></FormInput>
        </FormItem>
        <FormItem label="内存" name="type1" >
          		<FormInput style={{width: '200px'}} disabled placeholder={this.state.host_men}></FormInput>
        </FormItem>
        <FormItem label="镜像" name="images">
          <FormSelect style={{width: '200px'}}>
            <Option>请选择</Option>
            {Object.keys(images).map((str,i)=>{
              return (<Option value={str} key={i}>{images[str]}</Option>)
            })            
          }
          </FormSelect>
        </FormItem>
        <FormItem label="磁盘" name="name" className="disk_left" style={{height:'200px', overflow: 'auto'}}>
        	<div>{nav}</div> 
        	<div>
        	 <Icon type="plus-square" onClick={this.create_disk.bind(this,1)}/><span>您还可选配</span><span className="disk_span">{this.state.test_mum}</span><span>快</span>
	     		</div>       		
        </FormItem>
        <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>创建</button>
      </Form>
      </div>
      
      </Spin>

      </div>
    )
  }
})
