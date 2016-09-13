#-*- coding: UTF-8 -*-
import json
from openstack.middleware.login.login import Login
from middleware.image.image import Image
from middleware.flavor.flavor import Flavor
#from common import json_data
from openstack.middleware.vm.vm import Vm_manage

def json_data(json_status):
    if len(json_status)==0:
        json_status={"data":json_status,"code":400}
        json_status=json.dumps(json_status)
    else:
        json_status={"data":json_status,"code":200}
        json_status=json.dumps(json_status)
    return json_status

class OpenAPI(object):
    def __init__(self):
        pass
    def Login(self):
        login = Login("openstack", "baifendian2016")
        login.user_token_login()
        login.proid_login()
        login.token_login()
    def instances(self):
        ret={}
        host_list = Vm_manage().list_detail({})
        ret['totalList'] = []
        test_list = []
        for host in host_list['servers']:
            sys = {}
            sys['id'] = host['id']
            sys['name'] = host['name']
            sys['image'] = host['image']['id']
            sys['flavor'] = host['flavor']['id']
            sys['created'] = host['created']
            sys['status'] = host['OS-EXT-STS:vm_state']
            for key, value in host['addresses'].items():
                for ip in value:
                    for keys, values in ip.items():
                        if keys == "addr":
                            sys['ip'] = values

            ret['totalList'].append(sys)
            test_list.append(sys)