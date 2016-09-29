# coding:utf-8
import time

from openstack.middleware.common.common import send_request, IP_nova, PORT_nova, IP_cinder, PORT_cinder, plog, \
    run_in_thread, TIMEOUT, WorkPool
from openstack.middleware.login.login import get_token, get_proid
from openstack.middleware.common.urls import url_volume_action, url_volume_attach_action, url_volume_attach_create, \
    url_volume_attach_list, url_volume_backup_action, url_volume_backup_create, url_volume_backup_list, url_vm_action, \
    url_volume_backup_list_detail, url_volume_backup_restore, url_volume_change, url_volume_create, url_volume_extend, \
    url_volume_list, url_volume_list_detail, url_volume_snap_action, url_volume_snap_create, url_volume_snap_list, \
    url_volume_snap_list_detail


class Volume:
    def __init__(self):
        '''
        self.result为多快磁盘创建时记录创建状态
        {
            “name”:0|1|2   #0表示创建中，1为创建完成，2为创建失败
        }
        :return:
        '''
        self.token = get_token()
        self.project_id = get_proid()
        self.result = {}

    @plog("Volume.list")
    def list(self):
        '''
        列出虚拟卷
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_list.format(project_id=self.project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Volume.show_detail")
    def show_detail(self, volume_id):
        '''
        显示指定虚拟卷详细信息
        :param volume_id:
        :return:
        '''
        assert self.token != "", "not login"
        path = url_volume_action.format(project_id=self.project_id,volume_id=volume_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Volume.wait_complete")
    def wait_complete(self, volume_id, status):
        '''
        等待指定虚拟机创建完成,status为指定的状态
        :return:
        '''
        flag = True
        while flag:
            tmp_ret = self.show_detail(volume_id)
            if tmp_ret.get("volume", {}).get("status", "") in status:
                flag = False
            else:
                time.sleep(1)
        return 0

    @plog("Volume.create")
    def create(self, size, availability_zone="", name="", des="", metadata="", volume_type="ceph", snapshot_id="",
               flag=0):
        '''
        创建虚拟卷
        :return:
        :flag:阻塞标志，0表示非阻塞，1表示阻塞
        '''
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_create.format(project_id=self.project_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"volume": {"size": size}}
        if availability_zone:
            params["volume"].update({"availability_zone": availability_zone})
        if name:
            params["volume"].update({"display_name": name})
        if des:
            params["volume"].update({"display_description": des})
        if metadata:
            params["volume"].update({"metadata": metadata})
        if volume_type:
            params["volume"].update({"volume_type": volume_type})
        if snapshot_id:
            params["volume"].update({"snapshot_id": snapshot_id})
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        if flag:
            volume_id = ret["volume"].get("id", "")
            t = run_in_thread(self.wait_complete, volume_id, ["available"], timeout=TIMEOUT)
            if t != 0:
                self.result.update({name: 2})
            else:
                self.result.update({name: 1})
        return ret

    @plog("Volume.create_multiple")
    def create_multiple(self, name, num, size, availability_zone="", des="", metadata="", volume_type="ceph",
                        snapshot_id=""):
        '''
        创建多块磁盘
        :param name:
        :param num:
        :param size:
        :param availability_zone:
        :param des: 磁盘描述
        :param metadata: 元数据，暂时没使用
        :param volume_type: 磁盘类型，默认为ceph
        :param snapshot_id: 快照id
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        if num == 1:
            ret = self.create(size, availability_zone, name, des, metadata, volume_type, snapshot_id, 1)
        else:
            workpool = WorkPool()
            workpool.work_add()
            for i in range(num):
                disk_name = "%s_%s" % (name, i)
                self.result.update({disk_name: 0})
                workpool.task_add(self.create,
                                  (size, availability_zone, disk_name, des, metadata, volume_type, snapshot_id, 1))
            workpool.work_start()
            workpool.work_wait()
        return ret

    @plog("Volume.list_detail")
    def list_detail(self):
        '''
        虚拟卷详细信息
        :return:
        '''
        assert self.token != "", "not login"
        path = url_volume_list_detail.format(project_id=self.project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Volume.delete")
    def delete(self, volume_id):
        '''
        删除虚拟卷
        :param volume_id:
        :return:
        '''
        assert self.token != "", "not login"
        path = url_volume_action.format(project_id=self.project_id,volume_id=volume_id)
        method = "DELETE"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Volume.extend")
    def extend(self, volume_id, size):
        '''
        扩展虚拟卷容量
        :param volume_id:
        '''
        assert self.token != "", "not login"
        path = url_volume_extend.format(project_id=self.project_id,volume_id=volume_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"os-extend": {"new_size": size}}
        ret = send_request(method, IP_cinder, PORT_cinder, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Volume.change")
    def change(self, volume_id, name="", description=""):
        '''
        修改磁盘信息
        :return:
        '''
        assert self.token != "", "not login"
        path = url_volume_change.format(project_id=self.project_id,volume_id=volume_id)
        method = "PUT"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"volume": {}}
        if name:
            params["volume"].update({"name": name})
        if description:
            params["volume"].update({"description": description})
        ret = send_request(method, IP_cinder, PORT_cinder, path, params, head)
        assert ret != 1, "send_request error"
        return ret


class Volume_snaps():
    def __init__(self):
        self.token = get_token()
        self.project_id = get_proid()

    @plog("Volume_snaps.list")
    def list(self):
        '''
        列出快照
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_snap_list.format(project_id=self.project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Volume_snaps.create")
    def create(self, volume_id, snap_name="", des=""):
        '''
        创建快照
        :param volume_id:
        :param snap_name:
        :param des:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_snap_create.format(project_id=self.project_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"snapshot": {"volume_id": volume_id}}
        if snap_name:
            params["snapshot"].update({"display_name": snap_name})
        if des:
            params["snapshot"].update({"display_description": des})
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Volume_snaps.list_detail")
    def list_detail(self):
        '''
        列出快照详细信息
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_snap_list_detail.format(project_id=self.project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Volume_snaps.show_detail")
    def show_detail(self, snapshot_id):
        '''
        展示快照详细信息
        :param snapshot_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_snap_action.format(project_id=self.project_id,snapshot_id=snapshot_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Volume_snaps.delete")
    def delete(self, snapshot_id):
        '''
        删除快照
        :param snapshot_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_snap_action.format(project_id=self.project_id,snapshot_id=snapshot_id)
        method = "DELETE"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret


class Volume_attach():
    def __init__(self):
        self.token = get_token()
        self.project_id = get_proid()

    @plog("Volume_attach.list")
    def list(self, vm_id):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_attach_list.format(project_id=self.project_id,vm_id=vm_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Volume_attach.attach")
    def attach(self, vm_id, volum_id, device_name=""):
        '''
        虚拟磁盘连接虚拟机
        :param vm_id:
        :param volum_id:
        :param device_name:虚拟机上的盘符名，如/dev/sdb
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_attach_create.format(project_id=self.project_id,vm_id=vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"volumeAttachment": {"volumeId": volum_id}}
        if device_name:
            params["volumeAttachment"].update({"device": device_name})
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Volume_agttach.show_detail")
    def show_detail(self, vm_id, attach_id):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_attach_action.format(project_id=self.project_id,vm_id=vm_id,attach_id=attach_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Volume_attach.update")
    def update(self, vm_id, attach_id, volume_id):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_attach_action.format(project_id=self.project_id,vm_id=vm_id,attach_id=attach_id)
        method = "PUT"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"volumeAttachment": {"volumeId": volume_id}}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Volume_attach.delete")
    def delete(self, vm_id, attach_id):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_attach_action.format(project_id=self.project_id,vm_id=vm_id,attach_id=attach_id)
        method = "DELETE"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret


class Volume_backup():
    def __init__(self):
        self.token = get_token()
        self.project_id = get_proid()

    @plog("Volume_backup.list")
    def list(self):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_backup_list.format(project_id=self.project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_cinder, PORT_cinder, path, params, head)
        return ret

    @plog("Volume_backup.list_detail")
    def list_detail(self):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_backup_list_detail.format(project_id=self.project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_cinder, PORT_cinder, path, params, head)
        return ret

    @plog("Volume_backup.show_detail")
    def show_detail(self, backup_id):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_backup_action.format(project_id=self.project_id,backup_id=backup_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_cinder, PORT_cinder, path, params, head)
        return ret

    @plog("Volume_backup.delete")
    def delete(self, backup_id):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_backup_action.format(project_id=self.project_id,backup_id=backup_id)
        method = "DELETE"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_cinder, PORT_cinder, path, params, head)
        return ret

    @plog("Volume_backup.restore")
    def restore(self, backup_id, volume_id, volume_name):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_backup_restore.format(project_id=self.project_id,backup_id=backup_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"restore": {"name": volume_name}}
        if volume_id:
            params["restore"].update({"volume_id": volume_id})
        ret = send_request(method, IP_cinder, PORT_cinder, path, params, head)
        return ret

    @plog("Volume_backup.create")
    def create(self, volume_id, backup_name):
        ret = 0
        assert self.token != "", "not login"
        path = url_volume_backup_create.format(project_id=self.project_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"backup": {"container": "", "description": "", "name": backup_name, "volume_id": volume_id,
                             "incremental": ""}}
        ret = send_request(method, IP_cinder, PORT_cinder, path, params, head)
        return ret
