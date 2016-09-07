# -*- coding:utf-8 -*-
from openstack.middleware.login.login import Login,get_token
from openstack.middleware.image.image import Image
from openstack.middleware.flavor.flavor import Flavor
from common import json_data
from openstack.middleware.vm.vm import Vm_manage,Vm_control
from openstack.middleware.volume.volume import Volume,Volume_attach
from django.http import HttpResponse
import json


def json_data(json_status):
    if len(json_status)==0:
        json_status={"data":json_status,"code":400}
        json_status=json.dumps(json_status)
    else:
        json_status={"data":json_status,"code":200}
        json_status=json.dumps(json_status)
    return json_status

def packageResponse(result):
    response = HttpResponse(content_type='application/json')
    response.write(result)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
    return response
def login():
    login = Login("openstack", "baifendian2016")
    login.user_token_login()
    login.proid_login()
    login.token_login()

def volumes_create(request):
    login()
    ret={}
    volumes_name=request.POST.get('name')
    volumes_count=int(request.POST.get('count'))
    volumes_type=request.POST.get('type')
    volumes_size=request.POST.get('size')
    volumes_des=request.POST.get('desc')
    volume=Volume()
    return_data=volume.create_multiple(volumes_name,volumes_count,volumes_size,'nova',volumes_des)
    #print return_data,'.........return_data'
    if return_data != 1:
        ret[volumes_name] = True
    else:
        ret[volumes_name] = False
    #print volumes_count,volumes_name,volumes_type,volumes_size
    ret=json_data(ret)
    return ret

def volumes_delete(request):
    login()
    ret={}
    sys={}
    volume = Volume()
    print request.POST
    print request.POST.get('volumes_object')
    volumes_dic=eval(request.POST.get('volumes_object'))
    print volumes_dic
    for key,value in volumes_dic.iteritems():
        print key,value
        return_data=volume.delete(key)
        print return_data
        if return_data !=1:
            ret[value]=True
        else:
            ret[value]=False
    ret = json_data(ret)
    print ret,'11111111111ret'
    return ret




Methods={
    "GET":{
        "DELETE":'delete',
        "SHARE":'share',
    },
    "POST":{
        "CREATE":volumes_create,
        "delete":volumes_delete,
    },
    "PUT":{
        "UPSET":'upSet',
    },
    "DELETE":{
        "DELETE":'delete',
    }
}