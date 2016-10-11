# -*- coding: UTF-8 -*-
from django.shortcuts import render, render_to_response
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, HttpResponse
from openstack.middleware.login.login import Login, get_token
from openstack.middleware.image.image import Image
from openstack.middleware.flavor.flavor import Flavor
from common import json_data,volumes_deal,time_handle,size_handle
from openstack.middleware.vm.vm import Vm_manage, Vm_control
from openstack.middleware.volume.volume import Volume, Volume_attach
import time
from openstack.service import user_login
from django.views.decorators.csrf import csrf_exempt
import base64
from decimal import *
import json
import logging
openstack_log = logging.getLogger("openstack_log")


def login(request):
    ret = {}
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        login = Login("openstack", "baifendian2016")
        longin_token = login.user_token_login()
        proid_token = login.proid_login()
        login_proid_token = login.token_login()
        if longin_token != 1 and proid_token != 1 and login_proid_token != 1:
            ret = {"name": username, "type": 2}
    json_status = json_data(ret)
    response = HttpResponse(json_status)
    response['Access-Control-Allow-Origin'] = '*'
    response['Content-Type'] = 'application/json'
    return response


def logout(request):
    aa = {'aa': 'bb'}
    json_status = json_data(aa)
    response = HttpResponse(json_status)
    response['Access-Control-Allow-Origin'] = '*'
    response['Content-Type'] = 'application/json'
    return response


def create_host(request):
    ret = {}
    if request.method == 'POST':
        type_name = request.POST.get('name')
        if type_name == 'T1':
            ret = {'cpu': "1", "mem": "2", "count": '0.14'}
            ret = json.dumps(ret)
            return HttpResponse(ret)
        elif type_name == "T2":
            ret = {'cpu': "2", "mem": "4", "count": "0.24"}
            ret = json.dumps(ret)
            return HttpResponse(ret)
        elif type_name == "T3":
            ret = {"cpu": "4", "mem": "8", "count": "0.35"}
            ret = json.dumps(ret)
            return HttpResponse(ret)

        return HttpResponseRedirect("/bfddashboard/instances/")
    return render_to_response('manage_host.html')


@csrf_exempt
@user_login()
def instances(request):
    ret = {}
    disk = []
    sys = {}
    vm_manage = Vm_manage()
    volume_s = Volume()
    if request.method == "GET":
        imagess = Image()
        flavorss = Flavor()
        host_id=request.GET.get('name')
        if host_id:
            return_data=vm_manage.show_detail(host_id)['server']
            ret['status']=return_data['status']
            ret['id']=return_data['id']
            ret['name']=return_data['name']
            json_status = json_data(ret)
            response = HttpResponse(json_status)
            response['Access-Control-Allow-Origin'] = '*'
            response['Content-Type'] = 'application/json'
            return response
        host_list = vm_manage.list_detail()
        currentPages = request.GET.get('currentPage')
        pageSizes = request.GET.get('pageSize')
        if currentPages and pageSizes:
            minpageSizes = (int(currentPages) - 1) * int(pageSizes)
            maxpageSizes = int(currentPages) * int(pageSizes)
        else:
            minpageSizes = 0
            maxpageSizes = 0
        ret['totalList'] = []
        test_list = []
        for host in host_list['servers']:
            sys = {}
            sys['id'] = host['id']
            sys['name'] = host['name']
            try:
                sys['image'] = imagess.show_detail(host['image']['id'])['image']['name']
            except:
                sys['image'] = '-'
            sys['flavor'] = flavorss.show_detail(host['flavor']['id'])['flavor']['name']
            sys['created'] = time_handle(host['created'])
            sys['status'] = host['status']
            try:
                volumes_list=host['os-extended-volumes:volumes_attached']
                volumes_name_list=[]
                for volmes_dict in volumes_list:
                    volumes_name={}
                    volumes_details=volume_s.show_detail(volmes_dict['id'])
                    if not volumes_details['volume']['displayName']:
                        volumes_name['disk_name']=volumes_details['volume']['id']
                    else:
                        volumes_name['disk_name']=volumes_details['volume']['displayName']
                    volumes_name['disk_id']=volumes_details['volume']['id']
                    volumes_name['size'] = volumes_details['volume']['size']
                    volumes_name['voumetype'] = 'ceph'
                    volumes_name['device']=volumes_details['volume']['attachments'][0]['device']
                    volumes_name_list.append(volumes_name)
                sys['disk_list']=volumes_name_list
                openstack_log.info("虚拟机磁盘:{0}..{1}".format(host['name'],volumes_name_list))
            except Exception,e:
                sys['disk_list']=[]
                openstack_log.error("虚拟机磁盘:{0}".format(e))
            for key, value in host['addresses'].items():
                for ip in value:
                    for keys, values in ip.items():
                        if keys == "addr":
                            sys['ip'] = values
            ret['totalList'].append(sys)
            test_list.append(sys)
        ret['currentPage'] = 1
        ret['totalPageNum'] = len(host_list['servers'])

    if request.method == "POST":
        host_method = request.POST.get('method')
        if host_method == "create":
            host_name = request.POST.get('name')
            host_count = request.POST.get('count')
            host_flavor = request.POST.get('type')
            host_image = request.POST.get('images')
            host_password = 'bfd123'
            host_userdata = base64.b64encode('aaa')
            for keys, values in request.POST.items():
                if 'disk' in keys:
                    disk.append({"size": values})
            host_create = vm_manage.create_multiple(host_name, host_flavor, host_image, host_password, host_userdata,
                                                    int(host_count), int(host_count), disk)
            if host_create != 1:
                ret['status'] = True
                openstack_log.info("虚拟机创建:{0}".format(host_create))
            else:
                ret['status'] = False
        elif host_method == "start":
            request_list = request.POST.getlist('data')[0]
            host_vm_start = Vm_control()
            for keys, values in eval(request_list).items():
                if vm_manage.show_detail(keys)['server']['OS-EXT-STS:vm_state'] != "active":
                    host_vm_startstatus = host_vm_start.start(keys)
                    if host_vm_startstatus == 1:
                        ret[values] = False
                    else:
                        ret[values] = True
                else:
                    ret[values] = "stopped"
        elif host_method == "stop":
            request_list = request.POST.getlist('data')[0]
            host_vm_start = Vm_control()
            for keys, values in eval(request_list).items():
                if vm_manage.show_detail(keys)['server']['OS-EXT-STS:vm_state'] != "stopped":
                    host_vm_startstatus = host_vm_start.stop(keys)
                    if host_vm_startstatus == 1:
                        ret[values] = False
                    else:
                        while True:
                            if vm_manage.show_detail(keys)['server']['OS-EXT-STS:vm_state'] == "stopped":
                                ret[values] = True
                                break
                else:
                    ret[values] = "stopped"
        elif host_method == "restart":
            type = request.POST.get('type')
            if type == "restart":
                pass
            else:
                request_list = request.POST.getlist('data')[0]
                host_vm_start = Vm_control()
                for keys, values in eval(request_list).items():
                    host_vm_startstatus = host_vm_start.reboot(keys)
                    if host_vm_startstatus == 1:
                        ret[values] = False
                    else:
                        ret[values] = True

        elif host_method == "delete":
            request_list = request.POST.getlist('data')[0]
            for keys, values in eval(request_list).items():
                host_vm_delete = vm_manage.delete(keys)
                if host_vm_delete == 1:
                    ret[values] = False
                else:
                    while True:
                        try:
                            return_data = vm_manage.show_detail(keys)['server']
                        except:
                            ret[values] = True
                            openstack_log.info("虚拟机删除成功:{0}".format(keys))
                            break

        elif host_method == "vnc":
            host_id = eval(request.POST.get('data'))['host_id']
            vm_control = Vm_control()
            host_vnc = vm_control.get_console(host_id)
            if host_vnc == 1:
                return_data = {}
                return_data['console'] = {}
                return_data['console']['url'] = False
                ret = return_data
            else:
                ret = host_vnc
        elif host_method == "update":
            type_vm = request.POST.get('type_vm')
            if type_vm == "flavor":
                flavors = Flavor()
                host_vm_start = Vm_control()
                host_id = request.POST.get('host_id')
                host_name = request.POST.get('host_name')
                type = request.POST.get('type')
                return_data = host_vm_start.resize(host_id, type)
                if return_data == 1:
                    ret[host_name] = False
                else:
                    ret[host_name] = True

            elif type_vm == "image":
                host_vm_start = Vm_control()
                host_id = request.POST.get('host_id')
                host_name = request.POST.get('host_name')
                type = request.POST.get('type')
                return_data = host_vm_start.rebuild(host_id, type, host_name)
                if return_data == 1:
                    ret[host_name] = False
                else:
                    ret[host_name] = True

        elif host_method == "host_status":
            pass
    json_status = json_data(ret)
    response = HttpResponse(json_status)
    response['Access-Control-Allow-Origin'] = '*'
    response['Content-Type'] = 'application/json'
    return response

@user_login()
def images(request):
    """ 获取images"""
    sys = {}
    image = Image()
    if request.method == 'GET':
        sys['totalList'] = []
        sys['name'] = {}
        for i in image.list_detail()["images"]:
            openstack_log.info(i)
            ret = {}
            if len(i['metadata']) > 0:
                try:
                    if i['metadata']['image_type'] == "snapshot":
                        continue
                except:
                    ret['public'] = "YES"
                    ret['type_image'] = "镜像"
                    sys['name'][i['id']] = i['name']
                    ret['name'] = i['name']
                    ret['format'] = 'QCOW2'
                    ret['image_status'] = i['status']
                    ret['id'] = i['id']
                    ret['size'] = size_handle(i['OS-EXT-IMG-SIZE:size'])
            else:
                ret['public'] = "YES"
                ret['type_image'] = "镜像"
                sys['name'][i['id']] = i['name']
                ret['name'] = i['name']
                ret['format'] = 'QCOW2'
                ret['image_status'] = i['status']
                ret['id'] = i['id']
                ret['size'] = size_handle(i['OS-EXT-IMG-SIZE:size'])
            sys['totalList'].append(ret)
        sys['currentPage'] = 1
        sys['totalPageNum'] = len(sys['totalList'])
    openstack_log.info(sys)
    json_status = json_data(sys)
    response = HttpResponse(json_status)
    response['Access-Control-Allow-Origin'] = '*'
    response['Content-Type'] = 'application/json'
    return response


@csrf_exempt
@user_login()
def flavors(request):
    ret = {}
    flavor = Flavor()
    ret['totalList'] = []
    ret['name'] = {}
    if request.method == 'GET':
        for i in flavor.list_detail()["flavors"]:
            sys = {}
            ret['name'][i['id']] = i['name']
            sys['id'] = i['id']
            sys['name'] = i['name']
            sys['ram'] = i['ram']
            sys['vcpus'] = i['vcpus']
            sys['disk'] = i['disk']
            sys['public'] = 'yes'
            ret['totalList'].append(sys)

        ret['currentPage'] = 1
        ret['totalPageNum'] = len(ret['totalList'])

    if request.method == "POST":
        host_method = request.POST.get('method')
        if host_method == 'single':
            flavor_id = request.POST.get('id')
            flavor_list = flavor.show_detail(flavor_id)
            ret['cpu'] = flavor_list['flavor']['vcpus']
            ret['ram'] = flavor_list['flavor']['ram']
            ret['name'] = flavor_list['flavor']['name']
        if host_method == "update":
            pass

    json_status = json_data(ret)
    response = HttpResponse(json_status)

    response['Access-Control-Allow-Origin'] = '*'
    response["Access-Control-Allow-Headers"] = "*"
    response['Content-Type'] = 'application/json'
    return response


@csrf_exempt
@user_login()
def volumes(request):
    ret = {}
    volume_s = Volume()
    vm_manage = Vm_manage()
    if request.method == "GET":
        ret['totalList'] = []
        volumes_list = volume_s.list_detail()
        for disk in volumes_list['volumes']:
            sys = {}
            if not disk['displayName']:
                sys['name'] = disk['id']
            else:
                sys['name'] = disk['displayName']
            sys['id'] = disk['id']
            sys['size'] = disk['size']
            sys['voumetype'] = 'ceph'
            sys['created'] = time_handle(disk['createdAt'])
            sys['backupd'] = time_handle(disk['createdAt'])
            sys['displayDescription'] = disk['displayDescription']
            if len(disk['attachments'][0].keys()) == 4:
                for disk_host in disk['attachments']:
                    sys['device'] = disk_host['device']
                    try:
                        sys['servername'] = vm_manage.show_detail(disk_host['serverId'])['server']['name']
                    except:
                        sys['servername'] = None
                    sys['server_id'] = disk_host['serverId']
            else:
                sys['device'] = ''
                sys['servername'] = ''

            ret['totalList'].append(sys)
        ret['currentPage'] = 1
        ret['totalPageNum'] = len(ret['totalList'])
    if request.method == "POST":
        openstack_log.info(request.POST)
        host_method = request.POST.get('method')
        if host_method == 'attach':
            disk = request.POST.get('disk')
            host = request.POST.get('host')
            volume_attach = Volume_attach()
            ret['totalList'] = []
            for i in json.loads(disk):
                sys = {}
                return_data = volume_attach.attach(host, i)
                if return_data == 1:
                    sys['status'] = False
                else:
                    vm_details = vm_manage.show_detail(host)['server']
                    ret['disk_list'] = volumes_deal(vm_details['name'], vm_details, i)
                    sys['device'] = return_data['volumeAttachment']['device']
                    sys['servername'] = vm_details['name']
                    volume_d = volume_s.show_detail(i)
                    if volume_d['volume']['displayName'] == None:
                        sys['volumename'] = volume_d['volume']['id']
                    else:
                        sys['volumename'] = volume_d['volume']['displayName']
                    sys['status'] = True
                ret['totalList'].append(sys)
            openstack_log.info(ret)
    json_status = json_data(ret)
    response = HttpResponse(json_status)
    response['Access-Control-Allow-Origin'] = '*'
    response['Content-Type'] = 'application/json'
    return response

@user_login()
def instances_log(request,id,line):
    return_data=''
    if line=='000':
        vm_control=Vm_control()
        return_data=vm_control.get_console_log(id)
    else:
        vm_control=Vm_control()
        return_data=vm_control.get_console_log(id,line)
    json_status = json_data(return_data)
    response = HttpResponse(json_status)
    response['Access-Control-Allow-Origin'] = '*'
    response['Content-Type'] = 'application/json'
    return response