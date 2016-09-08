# -*- coding:utf-8 -*-
from openstack.middleware.login.login import Login,get_token
from openstack.middleware.image.image import Image
from openstack.middleware.flavor.flavor import Flavor
from common import json_data
from openstack.middleware.vm.vm import Vm_manage,Vm_control
from openstack.middleware.volume.volume import Volume,Volume_attach,Volume_snaps
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

def volumes_amend(request):
    #login()
    print request.POST
    size=request.POST.get('count')
    volumes_id=eval(request.POST.get('data'))['id']
    print size,volumes_id
    pass

def instances(request):
    ret={}
    login()
    vm_manage=Vm_manage()
#    print vm_manage.list()
#    print json.dumps(vm_manage.list(),indent=4)
    for i in vm_manage.list()['servers']:
        ret[i['name']]=i['id']
    ret = json_data(ret)
    return ret

def volumes_host(request):
    print request.POST
    ret={}
    host_id=request.POST.get('host_id')
    host_name=request.POST.get('host_name')
    data=request.POST.get('data')
    volumes_id=eval(data)['id']
    volumes_name=eval(data)['name']
    volume_attach=Volume_attach()
    return_data=volume_attach.attach(host_id,volumes_id)
    print return_data
    if return_data !=1:
        ret['vm']=host_name
        ret['status']=True
        ret['volumes']=volumes_name
    else:
        ret['vm']=host_name
        ret['status']=False
        ret['volumes']=volumes_name
    ret = json_data(ret)
    return ret
    #print host_id,host_name,volumes_id,volumes_name

    pass
def volumes_uninstall(request):
    login()
    ret={}
    data=eval(request.POST.get('data'))
    print data
    host_id=data['host_id']
    host_name=data['host_name']
    volumes_id=data['id']
    volumes_name=data['name']
    volume_attach=Volume_attach()
    return_data=volume_attach.delete(host_id,volumes_id)
    print return_data
    if return_data != 1:
        ret['host_name']=host_name
        ret['status']=True
        ret['volumes_name']=volumes_name
    else:
        ret['host_name'] = host_name
        ret['status'] = False
        ret['volumes_name'] = volumes_name
    ret = json_data(ret)
    return ret
 #   print host_id,host_name,volumes_id,volumes_name
    pass
def volumes_backup(request):
    ret={}
    name = request.POST.get('name')
    volumes_id = eval(request.POST.get('data'))['id']
    volumes_name=eval(request.POST.get('data'))['name']
    desc=request.POST.get('desc')
    volume_snaps=Volume_snaps()
    return_data=volume_snaps.create(volumes_id,name,desc)
    print return_data
    if return_data !=1:
        ret['volumes_name']=volumes_name
        ret['status']=True
        ret['name']=name
    else:
        ret['volumes_name'] = volumes_name
        ret['status'] = False
        ret['name'] = name
    ret = json_data(ret)
    return ret
def volumes_backup(request):
    ret={}

    login()
    volume_snaps = Volume_snaps()
    volume=Volume()
    print json.dumps(volume_snaps.list_detail(),indent=4)
    ret['totalList']=[]
    for i in volume_snaps.list_detail()['snapshots']:
        sys = {}
        sys['displayName']=i['displayName']
        sys['displayDescription']=i['displayDescription']
        sys['size']=i['size']
        sys['status']=i['status']
        sys['volume_name']=volume.show_detail(i['volumeId'])['volume']['displayName']
     #   print volume.show_detail(i['volumeId'])
     #   print i
        ret['totalList'].append(sys)
   # ret['totalList']=volume_snaps.list_detail()['snapshots']
    ret = json_data(ret)
    print ret
    return ret
    pass

Methods={
    "GET":{
        "instances":instances,
        "backup":volumes_backup,
    },
    "POST":{
        "CREATE":volumes_create,
        "delete":volumes_delete,
        "amend":volumes_amend,
        'Loading_disk':volumes_host,
        'uninstall':volumes_uninstall,
        'backup':volumes_backup,
    },
    "PUT":{
        "UPSET":'upSet',
    },
    "DELETE":{
        "DELETE":'delete',
    }
}