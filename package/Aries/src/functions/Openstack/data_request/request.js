import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'
import { notification } from 'antd';

var Datarequest = {
	posthoststop(_this,url,data_select,host_status){
		//xhrPostData(url,)
		console.log(data_select)
		
		let host_select={}
		//let i=
       for (var i in data_select){
             host_select[data_select[i]['id']]=data_select[i]['name']
       }
       _this.setState({
        loading:true
      	})
       this.xhrPostData(_this,url,host_select,host_status)
       console.log(host_select)

	},
	xhrPostData(_this,url,data_select,host_status) {
    xhr({
      url: url,
      type: 'POST',
      data:{
      	method: host_status,
        data:data_select
      },
      success: (retu_data) => {
        	 console.log(retu_data)
        	 _this.setState({
                loading:false,
                url: "bfddashboard/instances/?"+Math.random(),
                button_status: false
            })
          // notification['info']({ message: '这是标题',description: '这是提示框的文案这是提示框示框的文案这是提示是提示框的文案这是提示框的文案',});
           //notification['info']({ message: '这是标题',description: '这是提示框的文案这是提示框示框的文案这是提示是提示框的文案这是提示框的文案',});
           //notification['info']({ message: '这是标题',description: '这是提示框的文案这是提示框示框的文案这是提示是提示框的文案这是提示框的文案',});
            let successful=''
            let error=''
            let same=''
            for (var i in retu_data){
              console.log('iiiiiiii',i)
              console.log(retu_data[i])
              if (retu_data[i]=='stopped'){
                same=same+i+'、'
              }
              if (!retu_data[i]){
                error=error+i+'、'
              }
              if (retu_data[i]==true){
                successful=successful+i+'、'
              }
            }
            if (host_status=="stop"){
            if (successful.length>0){message.success(successful+'关闭成功')}
            if (error.length>0){message.success(error+'关闭失败')}
            if (same.length>0){message.danger(same+'已经关闭')}
          }
          if (host_status=="restart"){
            if (successful.length>0){message.success(successful+'重启成功')}
            if (error.length>0){message.success(error+'重启失败')}
            if (same.length>0){message.danger(same+'已经关闭')}
          }
          if (host_status=="delete"){
            if (successful.length>0){message.success(successful+'删除成功')}
            if (error.length>0){message.success(error+'删除失败')}
          }
      	}
      })
  
 	 }
}

export default Datarequest