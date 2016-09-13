import SearchInput from 'bfd-ui/lib/SearchInput'
import React from 'react'
import './index.less'
import './extend.less'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import OPEN from '../data_request/request.js'

import { Progress, Button } from 'antd'
const ButtonGroup = Button.Group

import { Form, FormItem } from 'bfd-ui/lib/Form'
import FormInput from 'bfd-ui/lib/FormInput'
import FormTextarea from 'bfd-ui/lib/FormTextarea'
import { FormSelect, Option } from 'bfd-ui/lib/FormSelect'
import message from 'bfd-ui/lib/message'
//import React from 'react'
//import './index.less'
import Icon from 'bfd-ui/lib/Icon'
import { Row, Col } from 'bfd-ui/lib/Layout'
import xhr from 'bfd-ui/lib/xhr'
import {Spin} from 'antd'

const Extend = React.createClass({
  handleClick(value) {
    console.log(value)
    console.log(this.props._this.state.url)
    let _url=OPEN.UrlList()['search']+"?name=instances_search&keys=name&value="+value
    console.log(_url)
    this.props._this.setState({url:_url})
  },
  handleChange(value) {
    console.log("change:", value)
  },
  render() {    
    return (
    		<SearchInput className="extend_class" placeholder="请" onSearch={this.handleClick}  onChange={this.handleChange} size="lg" />
    	)
  }
})

const Create_model_disk  = React.createClass({
	getInitialState() {
		return {
			disk_counter:1,
			disk_number: 3,
			disk_list: [10],
			host_disk:['--'],
			formData: {
        		brand: 0
     		 }
		}
	},
	crate_html(){
		let html=""
	},
	create_disk(name,number,number_s){
  	if (name=='1'){
  		let arr= this.state.disk_list;
  		let disk_counters=this.state.disk_counter
      let host_diskss=this.props.disks_m.state.host_disks
  		if (this.state.disk_list.length<4){
  			let disk_numbers=this.state.disk_number-1
  			let disk_mm=this.props.disks_m.state.host_disk
  			let diks_tt
  			for (var ii=1;ii<=3;ii++){
  				let ti='disk'+ii
  				let disk_i=0
  				for ( diks_tt in arr){
  					if (ti == arr[diks_tt] ){
  						disk_i = 0
  						break
  					}else{
  						disk_i = 1
  					}
  				}
  				if (disk_i==1){
            host_diskss.push(ti)
            if (arr.length ==1 ){
               disk_mm.pop()
               disk_mm.push(0)
             
            }else{
              disk_mm.push(0)  
            }
            arr.push(ti)
  					break
  				}
  			}


  			console.log('arr',arr)
  			disk_counters=disk_counters+1
  			this.setState({
      
  				disk_list:arr,
  				disk_number:disk_numbers,
  				disk_counter:disk_counters
  				
  			});
  			this.props.disks_m.setState({
  				host_disk:disk_mm,
          host_disks:host_diskss
  			})

  		}
  }else{
  	let arr= this.state.disk_list;
  	let disk_arr=this.state.host_disk
  	let disk_mm=this.props.disks_m.state.host_disk
    let host_diskss=this.props.disks_m.state.host_disks
  	if (this.state.disk_list.length>1){
  		let disk_numbers=this.state.disk_number+1
  		arr.splice(number_s['i'],1)
      host_diskss.splice(number_s['i']-1,1)
  		delete this.refs[number['item']].context.form.props.data[number['item']]
  		disk_arr.pop();

  		disk_mm.splice(number_s['i']-1,1)
  		//console.log('disk_mm',disk_mm)
      //console.log('number_s',number_s['i'])
      //console.log(host_diskss)
  		if (arr.length==1){
  			disk_mm.pop();
  			disk_mm.push('--')
  			disk_arr.pop();
  			disk_arr.push('--')
  		}  		
//  		arr.splice(0,1)
      let disk_length={'brand':disk_arr.length}
  		this.setState({
        	formData:disk_length,
  			disk_list:arr,
  			disk_number:disk_numbers
  			});
      this.props.disks_m.setState({
          host_disk:disk_mm,
          host_disks:host_diskss
        })

  		}
  	//	console.log(this.state);
  		this.props.disks_m.setState({
  			host_disk:disk_mm
  		})
  	}
  	
  },
	render(){
		let nav = this.state.disk_list.map((item, i) => {
		let disk='disk'+i
	 	if (i==0){
	 		return (
	 				<h1 key={i}></h1>
	 			)
	 	}else{
				return (
				<div key={ i }  >
					<FormItem label="数据盘" name={item} className="disk_create" >
          				<FormInput  placeholder="10GB~1TB" ref={item} ></FormInput><Icon type=" fa-times" onClick={this.create_disk.bind(this,2,{item},{i})} />
        			</FormItem>
				</div>
			)}
		});

		return (

			<div>
				<div>{nav}</div>
        	 	<Icon type="plus-square" onClick={this.create_disk.bind(this,1)}/><span>您还可选配</span><span className="disk_span">{this.state.test_mum}</span><span>快</span>
	     	</div>    
			)
		}	
	})

const Create_model = React.createClass({
 handleOpen() {
    this.refs.modal.open()
    this.setState({
    	host_disk:['--'],
      host_disks:[]

    })
  },
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
        for (var i=0;i<self.state.host_disks.length;i++ ){
          if (self.state.host_disks[i] == "disk1"){
              disk_arr.splice(i,1,v)
          }
        }
        console.log(self.state.host_disks)
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
          for (var i=0;i<self.state.host_disks.length;i++ ){
         // console.log(i)
          //console.log(self.state.host_disks[i])
          if (self.state.host_disks[i] == "disk2"){
              disk_arr.splice(i,1,v)
          }
        }
  	  		//disk_arr.splice(1,1,v)
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
          for (var i=0;i<self.state.host_disks.length;i++ ){
          if (self.state.host_disks[i] == "disk3"){
              disk_arr.splice(i,1,v)
          }
        }
  	  		self.setState({
  				host_disk:disk_arr
  	  		})
  	  }
  	  },
      images(v){
        console.log(v)
          self.setState({
            host_image:self.state.host_images[v]
          })
      },
  	count(v){
  	  	if (!v){ return '不能为空'
          }else{
            self.setState({
              host_count:v
            })
          }
  	  },
  	type(v){
  		console.log(v)
  		xhr({
 			 type: 'POST',
 			 url: 'openstack/flavors/',
 			 data: {
          method: 'single',
    			'id': v
			 },
  			success(data) {
  				let cpu=data['cpu']
  				let men=data['ram']
  				let host=data['count']
  				self.setState({
  					host_cpu:cpu+"核",
  					host_men:men+"MB",
  					host_host:host+"台",
            host_flavor_name:data['name']
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
        brand: 0,
        method:'create'
      },
      host_cpu:'--',
      host_men:'--',
      host_host:'--',
      host_disk:['--'],
      host_images:[],
      host_flavors:[],
      host_name:'--',
      host_flavor_name:'--',
      host_image:'--',
      host_count:'--',
      host_disks:[],
      loading: true
    }
  },
  componentWillMount: function(){
      const self = this;
      xhr({
       type: 'GET',
       url: 'openstack/images/',
       success(data) {
          console.log(data)
         self.setState(
              {host_images:data['name']}
           )
       }
    }),
      xhr({
       type: 'GET',
       url: 'openstack/flavors/',
       success(data) {
          self.setState({
            host_flavors:data['name'],
            loading:false
            })
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
    this.refs.modal.close()
    this.props._this.setState({loading:true})
    console.log('1tet')
  },

  handleCancel() {
    console.log(this.state.formData)
    this.refs.modal.close()
    
    console.log('1tet')
  },
 
  handleSuccess(res) {
    console.log(res)
    this.props._this.setState({loading:false,url: "bfddashboard/instances/?"+Math.random()})
    message.success('创建成功！')
  },
  disk_value(name){
  	console.log(name)
  },

  render() {
  	let images=this.state.host_images;
    let flavor=this.state.host_flavors;
	
	let disk = this.state.host_disk.map((item,i) =>{
		return(
				<div key={i}>{item}</div>
			)
	})
	
    const { formData } = this.state

    return (
      <div style={{float: "left",margin:'0px 10px 0px 0px'}}>
        <button className="btn btn-primary" onClick={this.handleOpen}>创建</button>
        <Modal ref="modal">
          <ModalHeader>
            <h2>云主机创建</h2>
          </ModalHeader>
          <ModalBody className="create_host">
          <div >
        
          <Spin spinning={this.state.loading}>


        <div className="right_host">
        	<div style={{padding: "10px"}}>
        	<h4>信息展示</h4>
        	</div>
        <div className="border_right"></div>
          <Row style={{margin: "5px 0px 0px 0px"}}>
            <Col col="md-4" ><h5>名称</h5></Col>
            <Col col="md-8" ><h5>{this.state.host_name}</h5></Col>
          </Row>
          <Row style={{margin: "5px 0px 0px 0px"}}>
            <Col col="md-4" ><h5>数量</h5></Col>
            <Col col="md-8" ><h5>{this.state.host_count}</h5></Col>
          </Row>
          <Row style={{margin: "5px 0px 0px 0px"}}>
            <Col col="md-4" ><h5>类型</h5></Col>
            <Col col="md-8" ><h5>{this.state.host_flavor_name}</h5></Col>
          </Row>
        	<Row style={{margin: "5px 0px 0px 0px"}}>
      			<Col col="md-4" ><h5>cpu</h5></Col>
    			<Col col="md-8" ><h5>{this.state.host_cpu}</h5></Col>
   			  </Row>
   			<Row  style={{margin: "5px 0px 0px 0px"}}>
      			<Col col="md-4" ><h5>内存</h5></Col>
    			<Col col="md-8" ><h5>{this.state.host_men}</h5></Col>
   			</Row>
        <Row  style={{margin: "5px 0px 0px 0px"}}>
            <Col col="md-4" ><h5>镜像</h5></Col>
          <Col col="md-8" ><h5>{this.state.host_image}</h5></Col>
        </Row>
   			<Row style={{margin: "5px 0px 0px 0px"}}>
      			<Col col="md-4" ><h5>磁盘</h5></Col>
    			<Col col="md-8" >
    				<h5>{disk}</h5>
    			</Col>
   			</Row>
        </div>
        
     <div>
      <Form 
        ref="form" 
        action="openstack/bfddashboard/instances/" 
        data={formData} 
        rules={this.rules} 
        onSuccess={this.handleSuccess}
      >
        <FormItem label="名称" required name="name" placeholder={this.state.host_name} help="">
          <FormInput style={{width: '200px'}}></FormInput>
        </FormItem>
        <FormItem label="数量" required name="count" help="">
          <FormInput style={{width: '200px'}}></FormInput>
        </FormItem>
        <FormItem label="类型" name="type">
          <FormSelect style={{width: '200px'}} >
            <Option>请选择</Option>
            {Object.keys(flavor).map((str,i)=>{
              if (str!="totalList"){
              return (<Option value={str} key={i}>{flavor[str]}</Option>)}
              })}
          </FormSelect>
        </FormItem>
        <FormItem label="镜像" name="images">
          <FormSelect style={{width: '200px'}} ref="images_s">
            <Option>请选择</Option>
            {Object.keys(images).map((str,i)=>{
              return (<Option value={str} key={i}>{images[str]}</Option>)
            })            
          }
          </FormSelect>
        </FormItem>
        <FormItem label="磁盘" name="name" className="disk_left" style={{height:'200px', overflow: 'auto'}}>
	     	<Create_model_disk disks_m={this}/>      		
        </FormItem>
        <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>创建</button>
        <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleCancel}>取消</button>
      </Form>
      </div>
      
      </Spin>

      </div>


          </ModalBody>
        </Modal>
      </div>
    )
  }
})

const Progress_model=React.createClass({
  getInitialState() {
    return {
      percent: 0,
      status:'',
    };
  },

  increase() {
    let percent = this.state.percent + 10;
    if (percent > 100) {
      percent = 100;
    }
    this.setState({ percent });
  },
  decline() {
    let percent = this.state.percent - 10;
    if (percent < 0) {
      percent = 0;
    }
    this.setState({ percent });
  },
  render() {
  
    return (
      <div>
        <Progress percent={this.state.percent} /><span>正在创建</span>
      </div>
    );
  },
})

export {Extend,Create_model,Progress_model}