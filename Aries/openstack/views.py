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
from common import json_data,volumes_deal,time_handle,size_handle,ReturnImages,ReturnFlavor,ReturnVm
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

imagess = Image()
flavorss = Flavor()
vm_manage = Vm_manage()
volume_s = Volume()
host_vm_start = Vm_control()
volume_attach = Volume_attach()

@csrf_exempt
@user_login()
def instances(request):
    global imagess
    global flavorss
    global vm_manage
    global volume_s
    global host_vm_start
    ret = {}
    disk = []
    sys = {}
    username = request.user.username
    if request.method == "GET":
        host_id=request.GET.get('name')
        if host_id:
            return_data=vm_manage.show_detail(host_id,username=username)['server']
            ret['status']=return_data['status']
            ret['id']=return_data['id']
            ret['name']=return_data['name']
            json_status = json_data(ret)
            response = HttpResponse(json_status)
            response['Access-Control-Allow-Origin'] = '*'
            response['Content-Type'] = 'application/json'
            return response
        host_list = vm_manage.list_detail(username=username)
        currentPages = request.GET.get('currentPage')
        pageSizes = request.GET.get('pageSize')
        if currentPages and pageSizes:
            minpageSizes = (int(currentPages) - 1) * int(pageSizes)
            maxpageSizes = int(currentPages) * int(pageSizes)
        else:
            minpageSizes = 0
            maxpageSizes = 0
        ret['totalList'] = []
        #test_list = []
        returnimages = ReturnImages(imagess.list(username=username)['images'])
        returnflavor = ReturnFlavor(flavorss.list(username=username)['flavors'])
        for host in host_list['servers']:
            sys = {}
            sys['id'] = host['id']
            sys['name'] = host['name']
            sys['instance_name']=host['OS-EXT-SRV-ATTR:instance_name']
            try:
                sys['image'] = returnimages.images_name(host['image']['id'])
            except:
                sys['image'] = '-'
           # sys['flavor'] = flavorss.show_detail(host['flavor']['id'])['flavor']['name']
            sys['flavor'] = returnflavor.images_name(host['flavor']['id'])
            sys['created'] = time_handle(host['created'])
            sys['status'] = host['status']
            for key, value in host['addresses'].items():
                for ip in value:
                    for keys, values in ip.items():
                        if keys == "addr":
                            sys['ip'] = values
            ret['totalList'].append(sys)
           # test_list.append(sys)
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
            host_create = vm_manage.create_multiple(host_name, host_flavor, host_image, host_password,
                                                    int(host_count), int(host_count),key_name='',disk=disk,username=username)
            if host_create != 1:
                ret['status'] = True
                openstack_log.info("虚拟机创建:{0}".format(host_create))
            else:
                ret['status'] = False
        elif host_method == "start":
            request_list = request.POST.getlist('data')[0]
            for keys, values in eval(request_list).items():
                if vm_manage.show_detail(keys,username=username)['server']['OS-EXT-STS:vm_state'] != "active":
                    host_vm_startstatus = host_vm_start.start(keys,username=username)
                    if host_vm_startstatus == 1:
                        ret[values] = False
                    else:
                        ret[values] = True
                else:
                    ret[values] = "stopped"
        elif host_method == "stop":
            request_list = request.POST.getlist('data')[0]
            for keys, values in eval(request_list).items():
                if vm_manage.show_detail(keys,username=username)['server']['OS-EXT-STS:vm_state'] != "stopped":
                    host_vm_startstatus = host_vm_start.stop(keys,username=username)
                    if host_vm_startstatus == 1:
                        ret[values] = False
                    else:
                        while True:
                            if vm_manage.show_detail(keys,username=username)['server']['OS-EXT-STS:vm_state'] == "stopped":
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
                for keys, values in eval(request_list).items():
                    host_vm_startstatus = host_vm_start.reboot(keys,username=username)
                    if host_vm_startstatus == 1:
                        ret[values] = False
                    else:
                        ret[values] = True

        elif host_method == "delete":
            request_list = request.POST.getlist('data')[0]
            for keys, values in eval(request_list).items():
                host_vm_delete = vm_manage.delete(keys,username=username)
                if host_vm_delete == 1:
                    ret[values] = False
                else:
                    while True:
                        try:
                            return_data = vm_manage.show_detail(keys,username=username)['server']
                        except:
                            ret[values] = True
                            openstack_log.info("虚拟机删除成功:{0}".format(keys))
                            break

        elif host_method == "vnc":
            host_id = eval(request.POST.get('data'))['host_id']
            host_vnc = host_vm_start.get_console(host_id,username=username)
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
                host_id = request.POST.get('host_id')
                host_name = request.POST.get('host_name')
                type = request.POST.get('type')
                return_data = host_vm_start.resize(host_id, type,username=username)
                if return_data == 1:
                    ret[host_name] = False
                else:
                    ret[host_name] = True

            elif type_vm == "image":
                host_id = request.POST.get('host_id')
                host_name = request.POST.get('host_name')
                type = request.POST.get('type')
                return_data = host_vm_start.rebuild(host_id, type, host_name,username=username)
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
    global imagess
    sys = {}
    username = request.user.username
    if request.method == 'GET':
        sys['totalList'] = []
        sys['name'] = {}
        for i in imagess.list_detail(username=username)["images"]:
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
    global flavorss
    ret = {}
    username = request.user.username
    ret['totalList'] = []
    ret['name'] = {}
    if request.method == 'GET':
        for i in flavorss.list_detail(username=username)["flavors"]:
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
            flavor_list = flavorss.show_detail(flavor_id,username=username)
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
    global volume_s
    global vm_manage
    global volume_attach
    ret = {}
    username = request.user.username
    if request.method == "GET":
        host_id=request.GET.get('name')
        if host_id:
            return_data=volume_s.show_detail(host_id,username=username)['volume']
            if not return_data['displayName']:
                ret['name'] = return_data['id']
            else:
                ret['name'] = return_data['displayName']
            ret['id'] = return_data['id']
            ret['status']=return_data['status']
            json_status = json_data(ret)
            response = HttpResponse(json_status)
            response['Access-Control-Allow-Origin'] = '*'
            response['Content-Type'] = 'application/json'
            return response
        ret['totalList'] = []
        volumes_list = volume_s.list_detail(username=username)
        returnvm = ReturnVm(vm_manage.list(username=username)['servers'])
        for disk in volumes_list['volumes']:
            sys = {}
            if not disk['displayName']:
                sys['name'] = disk['id']
            else:
                sys['name'] = disk['displayName']
            sys['id'] = disk['id']
            sys['size'] = disk['size']
            if disk['status'] == 'deleting':
                continue
            sys['status']=disk['status']
            sys['voumetype'] = 'ceph'
            sys['created'] = time_handle(disk['createdAt'])
            sys['backupd'] = time_handle(disk['createdAt'])
            sys['displayDescription'] = disk['displayDescription']
            if len(disk['attachments'][0].keys()) == 4:
                for disk_host in disk['attachments']:
                    sys['device'] = disk_host['device']
                    try:
                        #sys['servername'] = vm_manage.show_detail(disk_host['serverId'])['server']['name']
                        sys['servername'] = returnvm.vm_name(disk_host['serverId'])
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
            ret['totalList'] = []
            for i in json.loads(disk):
                sys = {}
                return_data = volume_attach.attach(host, i,username=username)
                if return_data == 1:
                    sys['status'] = False
                else:
                    vm_details = vm_manage.show_detail(host,username=username)['server']
                    ret['disk_list'] = volumes_deal(vm_details['name'], vm_details, i,username)
                    sys['device'] = return_data['volumeAttachment']['device']
                    sys['servername'] = vm_details['name']
                    volume_d = volume_s.show_detail(i,username=username)
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
    global host_vm_start
    username = request.user.username
    return_data=''
    if line=='000':
        return_data=host_vm_start.get_console_log(id,username=username)
    else:
        return_data=host_vm_start.get_console_log(id,line,username=username)
    json_status = json_data(return_data)
    response = HttpResponse(json_status)
    response['Access-Control-Allow-Origin'] = '*'
    response['Content-Type'] = 'application/json'
    return response