#coding:utf-8
from middleware.common.common import  send_request,IP_nova,PORT_nova, dlog,plog
from middleware.login.login import get_token,get_proid
import urllib

class Image:
    def __init__(self):
        self.token = get_token()
        self.project_id = get_proid()

    @plog("Image.list")
    def list(self,query_dict={}):
        assert self.token != "","not login"
        path = "/v2.1/%s/images"%self.project_id
        if query_dict:
            query_str = urllib.urlencode(query_dict)
            path = "%s?%s" % (path, query_str)
        method = "GET"
        head = {"Content-Type":"application/json","X-Auth-Token":self.token}
        params = ''
        ret = send_request(method,IP_nova,PORT_nova,path,params,head)
        assert ret != 1,"send_request error"
        return ret

    @plog("Image.list_detail")
    def list_detail(self):
        ret = 0
        assert self.token != "","not login"
        path = "/v2.1/%s/images/detail"%self.project_id
        method = "GET"
        head = {"Content-Type":"application/json","X-Auth-Token":self.token}
        params = ''
        ret = send_request(method,IP_nova,PORT_nova,path,params,head)
        assert ret != 1,"send_request error"
        return ret

    @plog("Image.show_detail")
    def show_detail(self,image_id):
        ret = 0
        assert self.token != "","not login"
        path = "/v2.1/%s/images/%s"%(self.project_id,image_id)
        method = "GET"
        head = {"Content-Type":"application/json","X-Auth-Token":self.token}
        params = ''
        ret = send_request(method,IP_nova,PORT_nova,path,params,head)
        assert ret != 1,"send_request error"
        return ret

    @plog("Image.delete")
    def delete(self,image_id):
        ret = 0
        assert self.token != "","not login"
        path = "/v2.1/%s/images/%s"%(self.project_id,image_id)
        method = "DELETE"
        head = {"Content-Type":"application/json","X-Auth-Token":self.token}
        params = ''
        ret = send_request(method,IP_nova,PORT_nova,path,params,head)
        assert ret != 1,"send_request error"
        return ret

class Image_metadata:
    def __init__(self):
        self.token = get_token()
