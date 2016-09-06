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

def volumes_create(request):
    ret={}
    volumes_name=request.POST.get('name')
    volumes_count=request.POST.get('count')
    volumes_type=request.POST.get('type')
    volumes_size=request.POST.get('size')
    volumes_des=request.POST.get('desc')
    volume=Volume()
    return_data=volume.create(volumes_size,"nova",volumes_name,volumes_des)
    if return_data != 1:
        ret[volumes_name] = False
    else:
        ret[volumes_name] = True
    #print volumes_count,volumes_name,volumes_type,volumes_size
    ret=json_data(ret)
    return ret





Methods={
    "GET":{
        "DELETE":'delete',
        "SHARE":'share',
    },
    "POST":{
        "CREATE":volumes_create,
    },
    "PUT":{
        "UPSET":'upSet',
    },
    "DELETE":{
        "DELETE":'delete',
    }
}