# coding:utf-8
import urllib
import time
from openstack.middleware.common.common import send_request, IP_nova, PORT_nova, plog, run_in_thread, WorkPool, \
    get_time, dlog, TIMEOUT, DB_host, DB_name, DB_password, DB_user
from openstack.middleware.db.db import Db
from openstack.middleware.image.image import Image
from openstack.middleware.login.login import get_token, get_proid
from openstack.middleware.volume.volume import Volume, Volume_attach
from openstack.models import vm_snap


# 虚拟机管理类
class Vm_manage:
    def __init__(self):
        '''
        result用来为多台虚拟机创建时存储状态，数据结构为：
        {
            “name_vm”:{
                "status_vm":0|1|2, #0表示创建中，1为创建完成，2为创建失败
                "status_disk":{
                    "name_disk":0|1|2  #0表示创建中，1为创建完成，2为创建失败
                }
            }
        }
        :return:
        '''
        self.token = get_token()
        self.project_id = get_proid()
        self.result = {}

    @plog("Vm_manage.list")
    def list(self):
        '''
        列出虚拟机
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers" % self.project_id
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Vm_manage.show_detail")
    def show_detail(self, vm_id):
        '''
        列出指定虚拟机详细信息
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s" % (self.project_id, vm_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Vm_mange.list_detail")
    def list_detail(self, query_dict={}):
        '''
        列出虚拟机详细信息
        :param query_list:查询的条件{"name":"","ip":"","status":"",........}
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/detail" % self.project_id
        if query_dict:
            query_str = urllib.urlencode(query_dict)
            path = "%s?%s" % (path, query_str)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Vm_manage.wait_complete")
    def wait_complete(self, vm_id):
        '''
        等待指定虚拟机创建完成,status为ACTIVE的状态
        :return:
        '''
        flag = True
        while flag:
            tmp_ret = self.show_detail(vm_id)
            if tmp_ret.get("server", {}).get("status", "") == "ACTIVE":
                flag = False
            else:
                time.sleep(1)
        return 0

    @plog("Vm_manage.create")
    def create(self, name, flavor, image, password, userdata, disk=[]):
        '''
        创建虚拟机,创建的接口在后台应该是异步执行的，当创建的请求发送过去后很快会有结果返回，但是虚拟机实际可能还没有创建成功
        所以需要先判断虚拟机的创建状态，如果是完成的再绑定磁盘
        :param name:
        :param flavor:
        :param image:
        :param password:
        :param userdata:
        :param disk:如果创建时需要选择磁盘则传，格式为:
        [
            {
                "name":"",可选
                "size":"",
                "availability_zone":"",#可选
                "des":"",#可选
                "metadata":{},#可选
                "volume_type":""#可选,
                "snapshot_id":""#可选,
                "dev_name":"连接虚拟机后的盘符名"#可选
            }
        ]
        :return:
        '''
        ret = 0
        self.result.update({name: {"name": name, "id": "", "status_vm": 0,
                                   "status_disk": {}}})  # 虚拟机创建状态，0表示创建中，1表示成功，2表示失败
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers" % self.project_id
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"server": {"name": name, "flavorRef": flavor, "imageRef": image, "adminPass": password,
                             "user_data": userdata}}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        vm_id = ret["server"]["id"]
        vm_snap = Vm_snap()
        vm_snap.set_vm(vm_id)
        vm_snap.create_root_snap(image)
        self.result[name]["id"] = vm_id
        if disk:
            volume = Volume()
            volume_attach = Volume_attach()
            vm_compele_flag = 0  # 判断虚拟机是否创建完成的标志，如果置1则下面不再判断创建的状态
            for tmp_dict in disk:
                name_disk = tmp_dict.get("name", "")
                self.result[name]["status_disk"].update({name_disk: 0})
                size = tmp_dict["size"]
                availability_zone = tmp_dict.get("availability_zone", "")
                des = tmp_dict.get("des", "")
                metadata = tmp_dict.get("metadata", "")
                volume_type = tmp_dict.get("volume_type", "")
                snapshot_id = tmp_dict.get("snapshot_id", "")
                tmpret = volume.create(size, availability_zone, name_disk, des, metadata, volume_type, snapshot_id)
                dev_name = tmp_dict.get("dev_name", "")
                volume_id = tmpret["volume"]["id"]
                if not vm_compele_flag:
                    t1 = run_in_thread(self.wait_complete, vm_id, timeout=TIMEOUT)
                    if t1 == 0:
                        vm_compele_flag = 1
                t2 = run_in_thread(volume.wait_complete, volume_id, ["available"],
                                   timeout=TIMEOUT)  # assert vm_compele_flag == 1, "vm status is not activate"
                if not vm_compele_flag:
                    self.result[name]["status_vm"] = 2
                    ret = 1
                    break
                # assert t2 == 0, "volume status is not available"
                if t2 != 0:
                    self.result[name]["status_disk"][name_disk] = 2
                    continue
                self.result[name]["status_disk"][name_disk] = 1
                volume_attach.attach(vm_id, volume_id, dev_name)
            self.result[name]["status_vm"] = 1
        else:
            t = run_in_thread(self.wait_complete, vm_id, timeout=TIMEOUT)
            self.result[name]["status_vm"] = 1 if t == 0 else 2
        return ret

    @plog("Vm_manage.create")
    def create_multiple(self, name, flavor, image, password, userdata, min_count=1, max_count=1, disk=[]):
        '''
        同时创建多台虚拟机，现在的测试环境只能测试功能，无法测试性能
        先实现功能，后面再测试效率，如果效率过低需要换成异步创建的方式
        由于使用multiple的接口创建多台虚拟机的返回结果中只会包含第一台虚拟机的id
        所以如果创建的虚拟机需要绑定磁盘的情况下不能用这个接口直接做，需要调用单个创建虚拟机的接口循环做，但是效率可能需要改进
        :param name:
        :param flavor:
        :param image:
        :param password:
        :param userdata:
        :param disk  和上面的接口相同的参数
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        if min_count > max_count:
            max_count = min_count
        # if disk:  # 创建多个带磁盘的虚拟机需要用线程池来做，暂时默认为三个线程
        workpool = WorkPool()
        workpool.work_add()
        for i in range(max_count):
            name_new = "%s-%s" % (name, i)
            workpool.task_add(self.create, (name_new, flavor, image, password, userdata, disk))
        workpool.work_start()
        workpool.work_wait()  # 改成非阻塞的模式,通过self.result来判断是否做完
        # else:  下面的方法是调用原生的api去创建多台虚拟机，但是无法展示每台创建的进度，现在是循序调用创建单台的api
        #     path = "/v2.1/%s/servers" % self.project_id
        #     method = "POST"
        #     head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        #     params = {"server": {"name": name, "flavorRef": flavor, "imageRef": image, "adminPass": password,
        #                          "min_count": min_count, "max_count": max_count}}
        #     ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret

    @plog("Vm_manage.delete")
    def delete(self, vm_id):
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s" % (self.project_id, vm_id)
        method = "DELETE"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        return ret


# 虚拟机控制类
class Vm_control:
    def __init__(self):
        self.token = get_token()
        self.project_id = get_proid()

    @plog("Vm_control.wait_complete")
    def wait_complete(self, vm_id, status):
        '''
        等待指定虚拟机创建完成,status为指定的状态
        :return:
        '''
        flag = True
        vm_mange = Vm_manage()
        while flag:
            tmp_ret = vm_mange.show_detail(vm_id)
            if tmp_ret.get("server", {}).get("status", "") in status:
                flag = False
            else:
                time.sleep(1)
        return 0

    @plog("Vm_control.start")
    def start(self, vm_id):
        '''
        启动虚拟机
        :param vm_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"os-start": ""}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.stop")
    def stop(self, vm_id):
        '''
        停止虚拟机
        :param vm_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"os-stop": ""}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.lock")
    def lock(self, vm_id):
        '''
        锁定虚拟机
        :param vm_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"lock": ""}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.unlock")
    def unlock(self, vm_id):
        '''
        解锁虚拟机
        :param vm_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"unlock": ""}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.pause")
    def pause(self, vm_id):
        '''
        暂停虚拟机
        :param vm_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"pause": ""}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.unpause")
    def unpause(self, vm_id):
        '''
        从暂停中恢复虚拟机
        :param vm_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"unpause": ""}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.reboot")
    def reboot(self, vm_id, type="HARD"):
        '''
        重启虚拟机
        :param vm_id:
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"reboot": {"type": type}}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.resize")
    def resize(self, vm_id, flavor_id):
        '''
        更改虚拟机flavor类型
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"resize": {"flavorRef": flavor_id, "OS-DCF:diskConfig": "AUTO"}}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        t1 = run_in_thread(self.wait_complete, vm_id, ["VERIFY_RESIZE"], timeout=TIMEOUT)
        assert t1 == 0
        params = {"confirmResize": ""}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        t2 = run_in_thread(self.wait_complete, vm_id, ["ACTIVE", "SHUTOFF"], timeout=TIMEOUT)
        assert t2 == 0
        return ret

    @plog("vm_control.create_backup")
    def create_backup(self, vm_id, name, rotation, type="daily"):
        '''
        主机备份
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"createBackup": {"name": name, "backup_type": type, "rotation": rotation}}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.migrate")
    def migrate(self, vm_id):
        '''
        虚拟机冷迁移
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"migrate": ""}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.live_migrate")
    def live_migrate(self, vm_id, host, block_migration, disk_over_commit):
        '''
        虚拟机热迁移
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {
            "os-migrateLive": {"host": host, "block_migration": block_migration, "disk_over_commit": disk_over_commit}}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.create")
    def create_image(self, vm_id, image_name):
        '''
        创建镜像
        只有在ACTIVE, SHUTOFF, PAUSED, 或 SUSPENDED的状态下才能制作镜像
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"createImage": {"name": image_name, "metadata": {"meta_var": "meta_val"}}}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.rebuild")
    def rebuild(self, vm_id, image_id, name, adminPass="", metadata="", personality="", preserve_ephemeral=False):
        '''
        主机从镜像(快照)还原
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"rebuild": {"imageRef": image_id, "name": name}}
        if adminPass:
            params["rebuild"].update({"adminPass": adminPass})
        if metadata:
            params["rebuild"].update({"metadata": metadata})
        if personality:
            params["rebuild"].update({"personality": personality})
        if preserve_ephemeral:
            params["rebuild"].update({"preserve_ephemeral": True})
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("vm_control.get_console")
    def get_console(self, vm_id):
        '''
        主机备份
        :return:
        '''
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/servers/%s/action" % (self.project_id, vm_id)
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = {"os-getVNCConsole": {"type": "novnc"}}
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret


class Vm_snap:
    def __init__(self, vm_id=""):
        self.token = get_token()
        self.vm_id = vm_id

    @plog("Vm_snap.find_parent")
    def find_parent(self):
        '''
        找到当前主机所在的快照节点
        :return:
        '''
        tmp_ret = vm_snap.objects.get(vm_id=self.vm_id,status=1)
        ret = tmp_ret.image_name
        return ret

    @plog("Vm_snap.create_root_snap")
    def create_root_snap(self, image_id):
        '''
        创建root快照节点,创建虚拟机时调用
        :param vm_id:
        :return:
        '''
        ret = 0
        time_now = get_time()
        root_snap = vm_snap(image_name="root",vm_id=self.vm_id,parent_name="",image_id=image_id,status=1,time=time_now)
        root_snap.save()
        return ret

    @plog("Vm_snap.delete_table")
    def delete_vm(self, vm_id):
        '''
        删除虚拟机所有快照信息，删除虚拟机时调用
        :param vm_id:
        :return:
        '''
        ret = 0
        vm_snap.objects.filter(vm_id=vm_id).delete()
        return ret

    @plog("Vm_snap.change_node")
    def change_node(self, image_name_old, image_name_new):
        '''
        修改快照名
        :param image_name:
        :return:0表示正常，1表示有异常，2表示名称冲突
        '''
        ret = 0
        image_list = self.list_snap()
        if image_name_new in image_list:
            ret = 2
        else:
            vm_snap.objects.get(vm_id=self.vm_id,image_name=image_name_old).update(image_name=image_name_new)
            vm_snap.objects.filter(vm_id=self.vm_id,parent_name=image_name_old).update(parent_name=image_name_new)
        return ret

    @plog("Vm_snap.delete_node")
    def delete_node(self, image_name):
        '''
        删除某一个快照
        :param image_name:
        :return:
        '''
        ret = 0
        parent_name = vm_snap.objects.get(image_name=image_name,vm_id=self.vm_id).parent_name
        vm_snap.objects.get(image_name=image_name,vm_id=self.vm_id).delete()
        vm_snap.objects.filter(vm_id=self.vm_id,parent_name=image_name).update(parent_name=parent_name)
        return ret

    def set_vm(self, vm_id):
        '''
        设置表
        :return:
        '''
        self.vm_id = vm_id

    @plog("Vm_snap.getinfo_node")
    def getinfo_node(self, image_name):
        '''
        获取指定快照信息
        :param image_name:
        :return:
        '''
        ret = vm_snap.objects.get(image_name=image_name,vm_id=self.vm_id)
        return ret

    @plog("Vm_snap.get_id")
    def get_id(self, name):
        '''
        通过快照名称获取对应的id，所以快照的名称必须是唯一的
        :return:
        '''
        image = Image()
        tmp_ret = image.list({"type": "snapshot"})
        id = filter(lambda i: i["name"] == name, tmp_ret["images"])[0]["id"]
        return id

    @plog("Vm_snap.create")
    def create(self, image_name):
        '''
        创建快照
        :param image_name:
        :return:1表示有异常，2表示名称冲突
        '''
        image_list = self.list_snap()
        image_name = self.vm_id+image_name  #确保名称的唯一性
        if image_name.strip() in image_list:
            ret = 2
        else:
            vm = Vm_control()
            ret = vm.create_image(self.vm_id, image_name)
            assert ret != 1
            # 更新快照树数据
            time_now = get_time()
            image_id = self.get_id(image_name)
            assert image_id != 1
            parent_name = self.find_parent()
            assert parent_name != 1
            date = vm_snap(image_name=image_name,vm_id=self.vm_id,parent_name=parent_name,image_id=image_id,status=1,time=time_now)
            date.save()
            vm_snap.objects.get(image_name=parent_name,vm_id=self.vm_id).update(status=0)
        return ret

    @plog("Vm_snap.rebuild")
    def rebuild(self, image_name):
        '''
        还原快照，对应快照的状态改为1
        :param image_name:
        :return:
        '''
        ret = 0
        vm = Vm_control()
        image_id = vm_snap.objects.get(image_name=image_name,vm_id=self.vm_id).image_id
        ret = vm.rebuild(self.vm_id, image_id, "default")
        assert ret != 1
        vm_snap.objects.get(status=1,vm_id=self.vm_id).update(status=0)
        vm_snap.objects.get(image_name=image_name,vm_id=self.vm_id).update(status=1)
        return ret

    @plog("Vm_snap,list_snap")
    def list_snap(self):
        '''
        列出当前虚拟机下的snap
        :return:
        '''
        tmp_list = vm_snap.objects.filter(vm_id=self.vm_id)
        image_list = [i.image_name for i in tmp_list]
        return image_list
