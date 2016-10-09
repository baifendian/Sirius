# -*- coding: UTF-8 -*-
import json
from openstack.middleware.login.login import Login
from middleware.image.image import Image
from middleware.flavor.flavor import Flavor
# from common import json_data
from openstack.middleware.vm.vm import Vm_manage, Vm_control
from openstack.middleware.volume.volume import Volume, Volume_attach
from decimal import *

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


def volumes_deal(host,disk_list,volumes_id):
    try:
        volume_s = Volume()
        volumes_list = disk_list['os-extended-volumes:volumes_attached']
        volumes_name_list = []
        for volmes_dict in volumes_list:
            volumes_name = {}
            volumes_details = volume_s.show_detail(volmes_dict['id'])
            if volumes_id != volumes_details['volume']['id']:
                if volumes_details['volume']['displayName'] == None:
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

    def instances(self):
        ret = {}
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

def size_handle(size):
    return str((round(Decimal(int(size)) / Decimal(1024) / Decimal(1024), 2))) + 'MB'

def time_handle(time):
    return  ' '.join( time.split('.')[0].split('Z')[0].split('T'))


