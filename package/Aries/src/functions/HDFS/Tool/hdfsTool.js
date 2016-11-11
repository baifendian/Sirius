import xhr from 'bfd-ui/lib/xhr'

const hdfsTool = {
  /**
    xhr 代理.
  **/
  xhrProxy(type,url,dataParam,_callback,_beforeSend,_afterSend){
    //请求前回调
    _beforeSend();
    xhr({
      type: type,
      url:url,
      data:dataParam,
      success:data => {
        //成功的回调
        _callback(data);
      },
      complete:data =>{
        //完成后回调
        _afterSend();

      }
    })
  },
}

export default hdfsTool;
