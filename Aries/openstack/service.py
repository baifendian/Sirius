# -*- coding:utf-8 -*-
from openstack.middleware.login.login import Login, get_token, get_project
from openstack.middleware.image.image import Image
from openstack.middleware.flavor.flavor import Flavor
from common import json_data,volumes_deal,time_handle,size_handle,sendhttp,sendhttpdata,sendhttpdate
from openstack.middleware.vm.vm import Vm_manage, Vm_control, Vm_snap
from openstack.middleware.volume.volume import Volume, Volume_attach, Volume_snaps,Volume_backup
from django.http import HttpResponse
from Aries.settings import MONITOR_URL
import json
import logging
import traceback
import time

openstack_log = logging.getLogger("openstack_log")


def json_data(json_status):
    if len(json_status) == 0:
        json_status = {"data": json_status, "code": 400}
        json_status = json.dumps(json_status)
    else:
        json_status = {"data": json_status, "code": 200}
        json_status = json.dumps(json_status)
    return json_status


def image_id():
    pass


def flavor_id():
    pass


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

def user_login():
    def ensure_login(func):
        def ensure_login_wrapper(request,*args, **kwargs):
            try:
                login()
                openstack_log.info('login success')
                retu_obj = func(request,*args,**kwargs)
                openstack_log.info('execute func %s success' % func)
                return retu_obj
            except:
                s = traceback.format_exc()
                openstack_log.error('execute func %s failure : %s' % (func, s))
        return ensure_login_wrapper
    return ensure_login

@user_login()
def volumes_create(request):
#    login()
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

@user_login()
def volumes_delete(request):
   # login()
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

@user_login()
def volumes_amend(request):
  #  login()
    ret = {}
    size = request.POST.get('count')
    volumes_size = eval(request.POST.get('data'))['size']
    volumes_id = eval(request.POST.get('data'))['id']
    volumes_name = eval(request.POST.get('data'))['name']
    volume = Volume()
    if volume.show_detail(volumes_id)['volume']['status'] == 'available':
        return_data = volume.extend(volumes_id, size)
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
        ret['status'] = 'error'
        ret['totalList'] = "磁盘无法动态添加"
    ret = json_data(ret)
    return ret

@user_login()
def instances(request):
    ret = {}
  #  login()
    vm_manage = Vm_manage()
    for i in vm_manage.list()['servers']:
        ret[i['name']] = i['id']
    ret = json_data(ret)
    return ret

@user_login()
def volumes_host(request):
    ret = {}
    host_id = request.POST.get('host_id')
    host_name = request.POST.get('host_name')
    data = request.POST.get('data')
    volumes_id = eval(data)['id']
    volumes_name = eval(data)['name']
    volume_attach = Volume_attach()
    volume=Volume()
    return_data = volume_attach.attach(host_id, volumes_id)
    if return_data != 1:
        while True:
            time.sleep(1)
            return_show = volume.show_detail(volumes_id)['volume']['status']
            if return_show != 'attaching':
                ret['vm'] = host_name
                ret['status'] = True
                ret['volumes'] = volumes_name
                break
    else:
        ret['vm'] = host_name
        ret['status'] = False
        ret['volumes'] = volumes_name
    ret = json_data(ret)
    return ret

@user_login()
def volumes_uninstall(request):
  #  login()
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

@user_login()
def volumes_snapshot(request):
    ret = {}
 #   login()
    name = request.POST.get('name')
    volumes_id = eval(request.POST.get('data'))['id']
    volumes_name = eval(request.POST.get('data'))['name']
    desc = request.POST.get('desc')
    volume_snaps = Volume_snaps()
    return_data = volume_snaps.create(volumes_id, name, desc)
    openstack_log.info(return_data)
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

@user_login()
def volumes_backup_p(request):
    ret = {}
 #   login()
    name = request.POST.get('name')
    volumes_id = eval(request.POST.get('data'))['id']
    volumes_name = eval(request.POST.get('data'))['name']
    desc = request.POST.get('desc')
    volume_backup=Volume_backup()
    return_data=volume_backup.create(volumes_id,name)
    if return_data != 1:
        ret['status'] = True
    else:
        ret['status'] = False
    ret = json_data(ret)
    return ret

@user_login()
def volumes_backup_get(request):
    ret = {}
#    login()
    volume_snaps = Volume_snaps()
    volume = Volume()
    ret['totalList'] = []
    for i in volume_snaps.list_detail()['snapshots']:
        sys = {}
        sys['id']=i['id']
        sys['displayName'] = i['displayName']
        sys['displayDescription'] = i['displayDescription']
        sys['size'] = i['size']
        sys['status'] = i['status']
        sys['volume_name'] = volume.show_detail(i['volumeId'])['volume']['displayName']
        ret['totalList'].append(sys)
    ret = json_data(ret)
    return ret

@user_login()
def volumes_backup_t(request):
    ret={}
    volume = Volume()
    volume_backup=Volume_backup()
    host_id=request.GET.get('id')
    if host_id:
        return_data = volume_backup.show_detail(host_id)['backup']
        ret['status'] = return_data['status']
        ret['id'] = return_data['id']
        ret['name'] = return_data['name']
        ret = json_data(ret)
        return ret
    else:
        ret['totalList'] = []
        return_data = volume_backup.list_detail()
        for i in return_data['backups']:
            sys={}
            sys['name']=i['name']
            sys['description']=i['description']
            sys['size']=i['size']
            sys['status']=i['status']
            try:
                sys['volume_name'] = volume.show_detail(i['volume_id'])['volume']['displayName']
                sys['volume_id'] = i['volume_id']
            except:
                sys['volume_name'] = '-'
                sys['volume_id'] = False
            sys['id']=i['id']
            ret['totalList'].append(sys)
        ret = json_data(ret)
        return ret


@user_login()
def openstack_project(request):
    ret = {}
   # login()
    try:
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
    except:
        openstack_log.error("project异常")
        ret = json_data(ret)
        return ret

@user_login()
def volumes_Redact(request):
    ret = {}
  #  login()
    openstack_log.info(request.POST)
    volumes_id = request.POST.get('id')
    volumes_name = request.POST.get('name')
    volumes_desc = request.POST.get('desc')
    volume = Volume()
    return_data = volume.change(volumes_id, name=volumes_name, description=volumes_desc)
    openstack_log.info(return_data)
    if return_data != 1:
        ret['name'] = volumes_name
        ret['status'] = True
        ret['desc'] = volumes_desc
    else:
        ret['status'] = False
    ret = json_data(ret)
    return ret

@user_login()
def instances_backup(request):
    ret = {}
#    login()
    instances_id = request.POST.get('id')
    instances_name = request.POST.get('name')
    instances_name_b = request.POST.get('name_bakup')
    openstack_log.info(request.POST)
    vm_snap = Vm_snap(instances_id)
    return_data = vm_snap.create(instances_name_b)
    if return_data != 1:
        ret['name'] = instances_name
        ret['status'] = True
    else:
        ret['name'] = instances_name
        ret['status'] = False
    ret = json_data(ret)
    return ret

@user_login()
def instances_search(request):
#    login()
    ret = {}
    imagess = Image()
    flavorss = Flavor()
    vm_manage = Vm_manage()
    key = request.GET.get('keys')
    value = request.GET.get('value')
    if not value:
        key = "name"
        pass
    if key == 'image':
        image_list = imagess.list()
        for i in image_list['images']:
            if i['name'] == value:
                value = i['id']
                break
    elif key == "flavor":
        flavor_list = flavorss.list()
        for i in flavor_list['flavors']:
            if i['name'] == value:
                value = i['id']
                break
    elif key == "status":
        value = value.upper()
    dict_d = {key: value}
    currentPages = request.GET.get('currentPage')
    pageSizes = request.GET.get('pageSize')
    if currentPages and pageSizes:
        minpageSizes = (int(currentPages) - 1) * int(pageSizes)
        maxpageSizes = int(currentPages) * int(pageSizes)
    else:
        minpageSizes = 0
        maxpageSizes = 0
    host_list = vm_manage.list_detail(dict_d)
    ret['totalList'] = []
    for host in host_list['servers'][minpageSizes:maxpageSizes]:
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
        for key, value in host['addresses'].items():
            for ip in value:
                for keys, values in ip.items():
                    if keys == "addr":
                        sys['ip'] = values
        ret['totalList'].append(sys)
    ret['currentPage'] = 1
    ret['totalPageNum'] = len(host_list['servers'])
    ret = json_data(ret)
    return ret

@user_login()
def vm_uninstall(request):
    ret = {}
    data = eval(request.POST.get('data'))
    host_id = data['host_id']
    volumes_id = data['disk_id']
    host_name = data['host_name']
    volumes_name = data['disk_name']
    volume_attach = Volume_attach()
    return_data = volume_attach.delete(host_id, volumes_id)
    vm_manage = Vm_manage()
    if return_data != 1:
        vm_details = vm_manage.show_detail(host_id)['server']
        ret['disk_list'] = volumes_deal(host_name, vm_details, volumes_id)
        ret['host_name'] = host_name
        ret['status'] = True
        ret['volumes_name'] = volumes_name
    else:
        ret['host_name'] = host_name
        ret['status'] = False
        ret['volumes_name'] = volumes_name
    ret = json_data(ret)
    return ret

@user_login()
def vmdisk_show(request):
    ret = {}
    vm_id = request.GET.get('id')
    vm_manage = Vm_manage()
    vm_details = vm_manage.show_detail(vm_id)['server']
    ret['disk_list'] = volumes_deal(vm_details['name'], vm_details, vm_id)
    ret = json_data(ret)
    return ret


@user_login()
def snapshot_create(request):
    ret={}
    name=request.POST.get('name')
    snapshot=request.POST.get('snapshot')
    desc=request.POST.get('desc')
    type=request.POST.get('type')
    size=request.POST.get('size')
    snapshot_id=request.POST.get('id')
    volume=Volume()
    return_data=volume.create(size=size,name=name,des=desc,snapshot_id=snapshot_id,)
    if return_data != 1:
        ret['status']=True
    else:
        ret['status']=False
    ret = json_data(ret)
    return ret

@user_login()
def snapshot_delete(request):
    ret={}
    snapshot_id=request.POST.get('id')
    volume_snaps=Volume_snaps()
    return_data=volume_snaps.delete(snapshot_id)
    if return_data != 1:
        ret['status'] = True
    else:
        ret['status'] = False
    ret = json_data(ret)
    return ret

@user_login()
def snapshot_redact(request):
    ret={}
    snapshot_id=request.POST.get('id')
    snapshot_name=request.POST.get('name')
    snapshot_desc=request.POST.get('desc')
    volume_snaps = Volume_snaps()
    return_data=volume_snaps.change(snapshot_id,des=snapshot_desc,name=snapshot_name)
    if return_data != 1:
        ret['status']=True
    else:
        ret['status']=False
    ret = json_data(ret)
    return ret

def cpu_monitor(request):
    ret={}
    ret['date'] = []
    ret['cpu_monitor'] = []
    date=request.GET.get('date').split('_')
    time_stamp=sendhttpdate(date[1],int(date[0]))
    data=sendhttpdata(time_stamp,metric='sys.cpu.util',aggregator='sum',compute='*',instance='instance-00000437')
    return_data=sendhttp(MONITOR_URL,data)
    for i in return_data:
        sys={}
        sys['legend']=i['metric']
        sys['data'] = []
        for key in sorted(i['dps'].iterkeys()):
            ret['date'].append(time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(float(key))))
            sys['data'].append(str(i['dps'][key])[:4])
        ret['cpu_monitor'].append(sys)
    ret = json_data(ret)
    return ret

def mem_monitor(request):
    ret = {}
    ret['mem_monitor'] = []
    date=request.GET.get('date').split('_')
    time_stamp=sendhttpdate(date[1],int(date[0]))
    metrics=['sys.mem.free_mem','sys.mem.total_mem','sys.mem.util']
    for i in metrics:
        ret['date'] = []
        data = sendhttpdata(time_stamp, metric=i, aggregator='sum', compute='*', instance='instance-00000437')
        return_data = sendhttp(MONITOR_URL, data)
        for i in return_data:
            sys = {}
            sys['legend'] = i['metric']
            sys['data'] = []
            for key in sorted(i['dps'].iterkeys()):
                ret['date'].append(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(float(key))))
                sys['data'].append(str(round(i['dps'][key]/1024,2)))
            ret['mem_monitor'].append(sys)
    ret['date'].sort()
    ret = json_data(ret)
    return ret

def disk_iops_monitor(request):
    ret = {}
    ret['disk_iops_monitor'] = []
    date=request.GET.get('date').split('_')
    time_stamp=sendhttpdate(date[1],int(date[0]))
    metrics=['sys.disk.read_ops','sys.disk.write_ops']
    for i in metrics:
        ret['date'] = []
        data = sendhttpdata(time_stamp, metric=i, aggregator='sum', compute='*', instance='instance-00000437',name='*')
        return_data = sendhttp(MONITOR_URL, data)
        for i in return_data:
            sys = {}
            sys['legend'] = i['tags']['name']+'_'+i['metric']
            sys['data'] = []
            for key in sorted(i['dps'].iterkeys()):
                ret['date'].append(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(float(key))))
                sys['data'].append(str(i['dps'][key]))
            ret['disk_iops_monitor'].append(sys)
    ret['date'].sort()
    ret = json_data(ret)
    return ret

def disk_bps_monitor(request):
    ret = {}
    ret['disk_bps_monitor'] = []
    date=request.GET.get('date').split('_')
    time_stamp=sendhttpdate(date[1],int(date[0]))
    metrics=['sys.disk.read_bps','sys.disk.write_bps']
    for i in metrics:
        ret['date'] = []
        data = sendhttpdata(time_stamp, metric=i, aggregator='sum', compute='*', instance='instance-00000437',name='*')
        return_data = sendhttp(MONITOR_URL, data)
        for i in return_data:
            sys = {}
            sys['legend'] = i['tags']['name']+'_'+i['metric']
            sys['data'] = []
            for key in sorted(i['dps'].iterkeys()):
                ret['date'].append(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(float(key))))
                sys['data'].append(str(i['dps'][key]))
            ret['disk_bps_monitor'].append(sys)
    ret['date'].sort()
    ret = json_data(ret)
    return ret

def network_monitor(request):
    ret = {}
    ret['network_monitor'] = []
    date=request.GET.get('date').split('_')
    time_stamp=sendhttpdate(date[1],int(date[0]))
    metrics=['sys.nic.tx_bytes_second','sys.nic.rx_bytes_second']
    for i in metrics:
        ret['date'] = []
        data = sendhttpdata(time_stamp, metric=i, aggregator='sum', compute='*', instance='instance-000004cc',name='*')
        return_data = sendhttp(MONITOR_URL, data)
        for i in return_data:
            sys = {}
            sys['legend'] = i['tags']['name']+'_'+i['metric']
            sys['data'] = []
            for key in sorted(i['dps'].iterkeys()):
                ret['date'].append(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(float(key))))
                sys['data'].append(str(i['dps'][key]))
            ret['network_monitor'].append(sys)
    ret['date'].sort()
    ret = json_data(ret)
    return ret

def network_monitor_packets(request):
    ret = {}
    ret['network_monitor_packets'] = []
    date=request.GET.get('date').split('_')
    time_stamp=sendhttpdate(date[1],int(date[0]))
    metrics=['sys.nic.tx_packets_second','sys.nic.rx_packets_second']
    for i in metrics:
        ret['date'] = []
        data = sendhttpdata(time_stamp, metric=i, aggregator='sum', compute='*', instance='instance-000004cc',name='*')
        return_data = sendhttp(MONITOR_URL, data)
        for i in return_data:
            sys = {}
            sys['legend'] =  i['tags']['name']+'_'+i['metric']
            sys['data'] = []
            for key in sorted(i['dps'].iterkeys()):
                ret['date'].append(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(float(key))))
                sys['data'].append(str(i['dps'][key]))
            ret['network_monitor_packets'].append(sys)
    ret['date'].sort()
    ret = json_data(ret)
    return ret


@user_login()
def  backup_restore(request):
    ret={}
    name=request.POST.get('name')
    disk=request.POST.get('disk')
    backup_id=request.POST.get('id')
    volume_backup=Volume_backup()
    return_data=volume_backup.restore(backup_id=backup_id,volume_id=disk,volume_name=name)
    if return_data != 1:
        ret['status'] = True
    else:
        ret['status'] = False
    ret = json_data(ret)
    return ret

@user_login()
def instances_backup_show(request):
    print request.GET
    backup_id=request.GET.get('id')
    print backup_id
    vm_snap=Vm_snap(backup_id)
    return_data=vm_snap.list_snap()
    print return_data
    return HttpResponse('AA')

def backup_delete(request):
    ret={}
    backup_id=request.POST.get('id')
    volume_backup = Volume_backup()
    request_data=volume_backup.delete(backup_id=backup_id)
    if request_data != 1:
        ret['status'] = True
    else:
        ret['status'] = False
    ret=json_data(ret)
    return ret


Methods = {
    "GET": {
        "instances": instances,
        "backup": volumes_backup_get,
        "backup_t": volumes_backup_t,
        "instances_search": instances_search,
        "vmdisk_show": vmdisk_show,
        "cpu_monitor": cpu_monitor,
        "mem_monitor":mem_monitor,
        'disk_iops_monitor':disk_iops_monitor,
        'disk_bps_monitor':disk_bps_monitor,
        'network_monitor':network_monitor,
        'network_monitor_packets':network_monitor_packets,
        "instances_backup_show":instances_backup_show,
    },
    "POST": {
        "CREATE": volumes_create,
        "delete": volumes_delete,
        "amend": volumes_amend,
        'Loading_disk': volumes_host,
        'uninstall': volumes_uninstall,
        'snapshot': volumes_snapshot,
        'Redact': volumes_Redact,
        'instances_backup': instances_backup,
        'vm_uninstall': vm_uninstall,
        'backup_t': volumes_backup_p,
        'snapshot_create':snapshot_create,
        'snapshot_delete':snapshot_delete,
        'snapshot_redact':snapshot_redact,
        'backup_restore':backup_restore,
        'backup_delete':backup_delete,
    }
}
