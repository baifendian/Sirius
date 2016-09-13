# -*- coding:utf-8 -*-
from openstack.middleware.login.login import Login, get_token, get_project
from openstack.middleware.image.image import Image
from openstack.middleware.flavor.flavor import Flavor
from common import json_data
from openstack.middleware.vm.vm import Vm_manage, Vm_control
from openstack.middleware.volume.volume import Volume, Volume_attach, Volume_snaps
from django.http import HttpResponse
import json


def json_data(json_status):
    if len(json_status) == 0:
        json_status = {"data": json_status, "code": 400}
        json_status = json.dumps(json_status)
    else:
        json_status = {"data": json_status, "code": 200}
        json_status = json.dumps(json_status)
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
    ret = {}
    volumes_name = request.POST.get('name')
    volumes_count = int(request.POST.get('count'))
    volumes_type = request.POST.get('type')
    volumes_size = request.POST.get('size')
    volumes_des = request.POST.get('desc')
    volume = Volume()
    return_data = volume.create_multiple(volumes_name, volumes_count, volumes_size, 'nova', volumes_des)
    if return_data != 1:
        ret[volumes_name] = True
    else:
        ret[volumes_name] = False
    ret = json_data(ret)
    return ret


def volumes_delete(request):
    login()
    ret = {}
    sys = {}
    volume = Volume()
    volumes_dic = eval(request.POST.get('volumes_object'))
    for key, value in volumes_dic.iteritems():
        return_data = volume.delete(key)
        if return_data != 1:
            ret[value] = True
        else:
            ret[value] = False
    ret = json_data(ret)
    return ret


def volumes_amend(request):
    login()
    ret = {}
    size = request.POST.get('count')
    volumes_size = eval(request.POST.get('data'))['size']
    volumes_id = eval(request.POST.get('data'))['id']
    volumes_name = eval(request.POST.get('data'))['name']
    volume = Volume()
    return_data = volume.extend(volumes_id, size)
    if volume.show_detail(volumes_id)['volume']['status'] == 'available':
        if return_data != 1:
            ret['name'] = volumes_name
            ret['status'] = True
            ret['size'] = size
            ret['volumes_size'] = volumes_size
        else:
            ret['name'] = volumes_name
            ret['status'] = False
            ret['size'] = size
            ret['volumes_size'] = volumes_size
    else:
        ret['name'] = volumes_name
        ret['status'] = False
        ret['totalList'] = "磁盘无法动态添加"
    ret = json_data(ret)
    return ret


def instances(request):
    ret = {}
    login()
    vm_manage = Vm_manage()
    for i in vm_manage.list()['servers']:
        ret[i['name']] = i['id']
    ret = json_data(ret)
    return ret


def volumes_host(request):
    ret = {}
    host_id = request.POST.get('host_id')
    host_name = request.POST.get('host_name')
    data = request.POST.get('data')
    volumes_id = eval(data)['id']
    volumes_name = eval(data)['name']
    volume_attach = Volume_attach()
    return_data = volume_attach.attach(host_id, volumes_id)
    if return_data != 1:
        ret['vm'] = host_name
        ret['status'] = True
        ret['volumes'] = volumes_name
    else:
        ret['vm'] = host_name
        ret['status'] = False
        ret['volumes'] = volumes_name
    ret = json_data(ret)
    return ret


def volumes_uninstall(request):
    login()
    ret = {}
    data = eval(request.POST.get('data'))
    host_id = data['host_id']
    host_name = data['host_name']
    volumes_id = data['id']
    volumes_name = data['name']
    volume_attach = Volume_attach()
    return_data = volume_attach.delete(host_id, volumes_id)
    if return_data != 1:
        ret['host_name'] = host_name
        ret['status'] = True
        ret['volumes_name'] = volumes_name
    else:
        ret['host_name'] = host_name
        ret['status'] = False
        ret['volumes_name'] = volumes_name
    ret = json_data(ret)
    return ret


def volumes_backup(request):
    ret = {}
    name = request.POST.get('name')
    volumes_id = eval(request.POST.get('data'))['id']
    volumes_name = eval(request.POST.get('data'))['name']
    desc = request.POST.get('desc')
    volume_snaps = Volume_snaps()
    return_data = volume_snaps.create(volumes_id, name, desc)

    if return_data != 1:
        ret['volumes_name'] = volumes_name
        ret['status'] = True
        ret['name'] = name
    else:
        ret['volumes_name'] = volumes_name
        ret['status'] = False
        ret['name'] = name
    ret = json_data(ret)
    return ret


def volumes_backup(request):
    ret = {}
    login()
    volume_snaps = Volume_snaps()
    volume = Volume()
    ret['totalList'] = []
    for i in volume_snaps.list_detail()['snapshots']:
        sys = {}
        sys['displayName'] = i['displayName']
        sys['displayDescription'] = i['displayDescription']
        sys['size'] = i['size']
        sys['status'] = i['status']
        sys['volume_name'] = volume.show_detail(i['volumeId'])['volume']['displayName']
        ret['totalList'].append(sys)

    ret = json_data(ret)
    return ret


def openstack_project(request):
    ret = {}
    login()
    return_data = get_project()
    ret['totalList'] = []
    for i in return_data['projects']:
        sys = {}
        sys['name'] = i['name']
        sys['id'] = i['id']
        sys['desc'] = i['description']
        sys['domain_id'] = i['domain_id']
        sys['domain_name'] = 'default'
        ret['totalList'].append(sys)
    ret = json_data(ret)
    return ret

def instances_search(request):
    login()
    ret={}
    print request.GET
    vm_manage=Vm_manage()
    key=request.GET.get('keys')
    value=request.GET.get('value')
    #dict_d={}
    dict_d={key:value}
    print dict_d,type(dict_d)
    print json.dumps(vm_manage.list_detail(dict_d),indent=4)
    currentPages = request.GET.get('currentPage')
    pageSizes = request.GET.get('pageSize')
    if currentPages and pageSizes:
        minpageSizes = (int(currentPages) - 1) * int(pageSizes)
        maxpageSizes = int(currentPages) * int(pageSizes)
    else:
        minpageSizes = 0
        maxpageSizes = 0
    host_list=vm_manage.list_detail(dict_d)
    ret['totalList'] = []
    test_list = []
    imagess = Image()
    flavorss = Flavor()
    for host in host_list['servers'][minpageSizes:maxpageSizes]:
        sys = {}
        sys['id'] = host['id']
        sys['name'] = host['name']
        try:
            sys['image'] = imagess.show_detail(host['image']['id'])['image']['name']
        except:
            sys['image'] = '-'
        sys['flavor'] = flavorss.show_detail(host['flavor']['id'])['flavor']['name']
        sys['created'] = host['created']
        sys['status'] = host['OS-EXT-STS:vm_state']
        for key, value in host['addresses'].items():
            # sys['ip']={}
            for ip in value:
                #  sys['ip'][ip['OS-EXT-IPS:type']] =ip['addr']
                for keys, values in ip.items():
                    if keys == "addr":
                        sys['ip'] = values
        ret['totalList'].append(sys)
    ret['currentPage'] = 1
    ret['totalPageNum'] = len(host_list['servers'])
    print  key,value
    ret = json_data(ret)
    return ret

Methods = {
    "GET": {
        "instances": instances,
        "backup": volumes_backup,
        "instances_search":instances_search
    },
    "POST": {
        "CREATE": volumes_create,
        "delete": volumes_delete,
        "amend": volumes_amend,
        'Loading_disk': volumes_host,
        'uninstall': volumes_uninstall,
        'backup': volumes_backup,
    }
}
