# -*- coding: UTF-8 -*-
import json
from openstack.middleware.login.login import Login
from middleware.image.image import Image
from middleware.flavor.flavor import Flavor
# from common import json_data
from openstack.middleware.vm.vm import Vm_manage, Vm_control
from openstack.middleware.volume.volume import Volume, Volume_attach
from decimal import *
import urllib2
import traceback
import datetime
import time

import logging
openstack_log = logging.getLogger("openstack_log")


def json_data(json_status):
    if len(json_status) == 0:
        json_status = {"data": json_status, "code": 400}
        json_status = json.dumps(json_status)
    else:
        json_status = {"data": json_status, "code": 200}
        json_status = json.dumps(json_status)
    return json_status


def volumes_deal(host,disk_list,volumes_id,username):
    try:
        volume_s = Volume()
        volumes_list = disk_list['os-extended-volumes:volumes_attached']
        volumes_name_list = []
        for volmes_dict in volumes_list:
            volumes_name = {}
            volumes_details = volume_s.show_detail(volmes_dict['id'],username=username)
            if volumes_id != volumes_details['volume']['id']:
                if not volumes_details['volume']['displayName']:
                    volumes_name['disk_name'] = volumes_details['volume']['id']
                else:
                    volumes_name['disk_name'] = volumes_details['volume']['displayName']
                volumes_name['disk_id'] = volumes_details['volume']['id']
                volumes_name['size'] = volumes_details['volume']['size']
                volumes_name['voumetype'] = 'ceph'
                volumes_name['device'] = volumes_details['volume']['attachments'][0]['device']
                volumes_name_list.append(volumes_name)
        openstack_log.info("虚拟机磁盘:{0}..{1}".format(host, volumes_name_list))
    except Exception, e:
        openstack_log.error("虚拟机磁盘:{0}".format(e))
    return volumes_name_list

class OpenAPI(object):
    def __init__(self):
        pass

    def Login(self):
        login = Login("openstack", "baifendian2016")
        login.user_token_login()
        login.proid_login()
        login.token_login()

    def instances(self,username):
        ret = {}
        host_list = Vm_manage().list_detail({},username=username)
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

def size_handle(size):
    return str((round(Decimal(int(size)) / Decimal(1024) / Decimal(1024), 2))) + 'MB'

def time_handle(time):
    return  ' '.join( time.split('.')[0].split('Z')[0].split('T'))

def sendhttp(url,data):
    header = {"Content-Type": "application/json"}
    try:
        request = urllib2.Request(url, data)
        for key in header:
            request.add_header(key, header[key])
        try:
            result = urllib2.urlopen(request)
            result_t=json.loads(result.read())
        except:
            result_t = traceback.format_exc()
        else:
            result.close()
        return result_t
    except:
        s = traceback.format_exc()
        openstack_log.error('execute func %s failure : %s' % (sendhttp, s))

def sendhttpdata(start,metric,aggregator='sum',compute='*',instance='*',name=None):
    if name == None:
        return json.dumps({"start":start,"queries":[{"metric":metric,"aggregator":aggregator,"tags":{"compute":compute,"instance":instance}}]})
    else:
        return json.dumps({"start": start, "queries": [{"metric": metric, "aggregator": aggregator, "tags": {"compute": compute, "instance": instance,'name':name}}]})

def sendhttpdate(type,interval):
    data={
    'minutes': (datetime.datetime.now() - datetime.timedelta(minutes=interval)).strftime("%Y-%m-%d %H:%M:%S"),
    'hours': (datetime.datetime.now() - datetime.timedelta(hours=interval)).strftime("%Y-%m-%d %H:%M:%S"),
    'days': (datetime.datetime.now() - datetime.timedelta(days=interval)).strftime("%Y-%m-%d %H:%M:%S")
    }
    return int(str(time.mktime(time.strptime(data[type], "%Y-%m-%d %H:%M:%S"))).split('.')[0])

class Share_m(object):
    _state = {}
    def __new__(cls, *args, **kw):
        ob = super(Share_m, cls).__new__(cls, *args, **kw)
        ob.__dict__  = cls._state
        return ob

class ReturnImages(Share_m):
    def __init__(self,images):
        self.images=self.fun_deal(images)
    def images_name(self,id):
        return self.images[id]
    def fun_deal(self,images):
        sys={}
        for image in images:
            sys[image['id']]=image['name']
        return sys

class ReturnFlavor(Share_m):
    def __init__(self,flavorss):
        self.flavors=self.fun_deal(flavorss)
    def images_name(self,id):
        return self.flavors[id]
    def fun_deal(self,flavors):
        ret={}
        for flavor in flavors:
            ret[flavor['id']]=flavor['name']
        return ret

class ReturnVm(Share_m):
    def __init__(self,vm):
        self.vms=self.fun_deal(vm)
    def vm_name(self,id):
        return self.vms[id]
    def fun_deal(self,vms):
        ret={}
        for vm in vms:
            ret[vm['id']]=vm['name']
        return ret

class ReturnVolume(Share_m):
    def __init__(self,Volumes):
        self.Volume=self.fun_deal(Volumes)
    def Volume_name(self,id):
        return self.Volume[id]
    def fun_deal(self,Volumes):
        ret={}
        for Volume in Volumes:
            ret[Volume['id']]=Volume['displayName']
        return ret