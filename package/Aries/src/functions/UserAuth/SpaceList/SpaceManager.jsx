import React from 'react'
import Task from 'public/Task'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import DataTable from 'bfd-ui/lib/DataTable'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import Transfer from 'bfd-ui/lib/Transfer'
import Fetch from 'bfd-ui/lib/Fetch'
import { Select, Option } from 'bfd-ui/lib/Select2'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'

const SpaceManager = React.createClass({
  tranferChange(sdata,tdata){
    let newMember = tdata.map((item)=>{return item.id});
    this.setState({"newMember":newMember});
  },
  handleSearch(label,keyValue){
    return label.indexOf(keyValue) != -1;
  },
  saveMember(){
    let newMember = this.state.newMember;
    let space_id = this.props.cur_space;
    if(newMember.length>0){
      let addMemberUrl = this.props.getUrlData({ type : "SPACE_MEMBER_POST",
                                                 spaceId : space_id
                                                });
      xhr({type: 'POST',url: addMemberUrl,data:{"key":newMember},
        success:data =>{
          message.success("成员更新成功!", 2);
          this.modalClose();
          this.props.refreshTable();
        }
      });
    }else{
      this.modalClose();
    }
  },
  modalOpen(){
    this.refs.modal.open();
  },
  modalClose(){
    this.refs.modal.close();
  },
  addMember(){
    this.modalOpen();
  },
  updateRole(user_id,role_id){
    let space_id = this.props.cur_space;
    let updateMemberUrl = this.props.getUrlData({ type : "SPACE_MEMBER_PUT",
                                                  spaceId : space_id
    });
    console.log(`uid: ${user_id}, r_id: ${role_id}`);
    xhr({type: 'PUT',url: updateMemberUrl,data:{"key":[{"user_id":user_id,"role_id":role_id}]},
      success:data => {
        message.success("成员角色更新成功!", 2);
        this.props.refreshTable();
      }
    });
  },
  is_admin_button:{
    1:function(){return <div className="function-UserAuth-SpaceManager-Div"><Button onClick={()=>{this.addMember()}}>添加成员</Button></div>},
    0:()=>{return <div></div>}
  },
  getTransferDataSuccess(data){
    let no_user_list = data.totalList.no_user_list;
    let user_list = data.totalList.user_list;
    let sourceData=no_user_list.map((item)=>{return {"id":item.user_id,"label":item.user_name,"description":""}});
    let targetData=user_list.map((item)=>{return {"id":item.user_id,"label":item.user_name,"description":""}});
    this.setState({sourceData:sourceData,targetData:targetData});
  },
  getInitialState: function() {
    return {
      sourceData:[],
      targetData:[],
      newMember:[],
      column: [{
        title:'人员',
        key:'user_name'
      },{
        title: '当前角色',
        key: 'role_name',
      },{
        title: '操作',
        render:(item, component)=> {
          if(this.props.is_admin==1){
            return  <Select url="v1/user_auth/roles/" disabled={false} onChange={value=>{this.updateRole(item.user_id,value)}} defaultValue={item.role_id}  render={item => <Option value={item.role_id}>{item.role_name}</Option>} />
          }else{
            return  <Select url="v1/user_auth/roles/" disabled={true} onChange={value=>{this.updateRole(item.user_id,value)}} defaultValue={item.role_id}  render={item => <Option value={item.role_id}>{item.role_name}</Option>} />
          }
        },
        key: 'operation'
      }]
    };
  },
  render: function() {
    let TransferUrl = this.props.getUrlData({ type : "SPACE_MEMBER",
                                              spaceName : this.props.cur_space,
                                            });
    return  (
        <div>
          {this.is_admin_button[this.props.is_admin].call(this)}
          <div>
            <DataTable url={this.props.url} showPage="false" column={this.state.column}></DataTable>
          </div>
          <div>
            <Modal ref="modal">
              <ModalHeader>
                <h4 className="modal-title">添加成员</h4>
              </ModalHeader>
              <ModalBody>
                <div className="function-UserAuth-SpaceList-modelDiv">
                <Fetch style={{minHeight:100}} url={TransferUrl} onSuccess={this.getTransferDataSuccess}>
                  <Transfer height={200} title={"已选的用户"} onChange={this.tranferChange} sdata={this.state.sourceData} tdata={this.state.targetData} onSearch={this.handleSearch}  />
                </Fetch>
                </div>
                <div className="function-UserAuth-Button-Div">
                   <Button className="left-Button" onClick={this.saveMember}>保存</Button>
                   <Button type="primary" onClick={this.modalClose}>取消</Button>
                </div>
              </ModalBody>
            </Modal>
          </div>
        </div>
      );
    }
});
export default SpaceManager
