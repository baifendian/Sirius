# coding:utf-8
import urllib
import httplib
import json
import sys
ip=""
def send_request(methods, ip, port, path, params,head={},flag=0):
    try:
        #params_str = urllib.urlencode(params)
        if params:
                params_str = json.dumps(params)
        else:
                params_str = ""
        print "str=%s"%params_str
        conn = httplib.HTTPConnection("%s:%s" % (ip, port))
        #path = "%s?%s"%(path,params_str)
        if head:
            conn.request(methods, path,params_str,head)
        else:
            conn.request(methods,path,params_str)
        res = conn.getresponse()
        print res.status, res.reason
        assert res.status in [200,201,202,203,204]
        if flag:
            token_id = res.getheader("X-Subject-Token","")
            res_json = json.loads(res.read())
            res_json.update({"token_id":token_id})
        else:
            try:
                res_json = json.loads(res.read())
            except:
                res_json = ""
                pass
        # print res_json
        ret = res_json
    except Exception, err:
        import traceback
        err = traceback.format_exc()
        print err
        ret = 1
    return ret

def prints(out):
    print json.dumps(out,indent=4)

class Test_Func():
    def __init__(self):
        global ip
        self.token = ""
        self.ip = ip

    def test_login(self):
        port = "5000"
        method = "POST"
        path = "/v3/auth/tokens"
        username = "demo"
        password = "demo"
        #params = {"auth": {"identity": {"methods": ["password"],"password": {"user": {"id": "9c80675387304cd7a981d3a0afc43902","password": "demo"}}},"scope": {"project": {"id": "0a54ab42105748f4beefdcb631e9a866"}}}}
        params = {"auth": {"identity": {"methods": ["password"],"password": {"user": {"name": "openstack","domain": {"name":"default"},"password": "baifendian2016"}}}}}
        head = {"Content-Type":"application/json"}
        ret = send_request(method,self.ip,port,path,params,head)
        self.token = ret["token_id"]

    def test_list_vm(self):
        port = "8774"
        method = "GET"
        path = "/v2.1/0a54ab42105748f4beefdcb631e9a866/servers"
        params = ''
        head = {"X-Auth-Token":self.token}
        ret = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_create_vm(self):
        port = "8774"
        method = "POST"
        path = "/v2.1/0a54ab42105748f4beefdcb631e9a866/servers"
        params = {"server":{"name":"test11111","flavorRef":"1","imageRef":"ed525a0c-30eb-4199-97fa-d151b8a72368","adminPass":"123456"}}
        head = {"X-Auth-Token":self.token}
        ret  = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_get_user(self):
        port = "5000"
        method = "GET"
        path = "/v3/users"
        params = ''
        head = {"Content-Type":"application/json","X-Auth-Token":self.token}
        ret  = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_list_volumes(self):
        port = "8774"
        method = "GET"
        path = "/v2.1/0a54ab42105748f4beefdcb631e9a866/os-volumes"
        params = ''
        head = {"X-Auth-Token":self.token}
        ret = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_create_volumes(self):
        port = "8774"
        method = "POST"
        path = "/v2.1/0a54ab42105748f4beefdcb631e9a866/os-volumes"
        params = {"volume":{"size":50}}
        head = {"X-Auth-Token":self.token}
        ret = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_list_vm_detail(self):
        port = "8774"
        method = "GET"
        path = "/v2.1/98189fbdeb8d4db998a4d2eb3afa4d68/servers/detail"
        params = ""
        head = {"X-Auth-Token":self.token}
        ret = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_list_networks(self):
        port = "8774"
        method = "GET"
        path = "/v2.1/0a54ab42105748f4beefdcb631e9a866/os-networks"
        params = ''
        head = {"X-Auth-Token":self.token}
        ret = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_list_images(self):
        port = "8774"
        method = "GET"
        path = "/v2.1/0a54ab42105748f4beefdcb631e9a866/images"
        params = ''
        head = {"X-Auth-Token":self.token}
        ret = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_list_flavors(self):
        port = "8774"
        method = "GET"
        path = "/v2.1/0a54ab42105748f4beefdcb631e9a866/flavors"
        params = ''
        head = {"X-Auth-Token":self.token}
        ret = send_request(method,self.ip,port,path,params,head)
        prints(ret)

    def test_list_project(self):
        ip = "192.168.190.11"
        port = "5000"
        method = "GET"
        path = "/v3/auth/projects"
        params = ''
        #head = {"X-Auth-Token":self.token,"X-Auth-Token":self.token}
        head = {"X-Auth-Token":self.token}
        ret = send_request(method,ip,port,path,params,head)
        prints(ret)


    def no_found(self):
        """
        出错返回函数
        :return:
        """
        print "not found params"

if __name__ == "__main__":
    assert sys.argv[1], "missing params"
    test_sec = "test_%s"%sys.argv[1]
    test = Test_Func()
    test.test_login()
    test_func = getattr(test,test_sec,test.no_found)
    test_func()
