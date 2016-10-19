#coding:utf-8
import time
from django.test import TestCase
from openstack.middleware.login.login import Login, get_admin_token, get_admin_project_id
from openstack.middleware.flavor.flavor import Flavor
from openstack.middleware.vm.vm import Vm_manage, Vm_control, Vm_snap
from openstack.middleware.volume.volume import Volume, Volume_backup,Volume_snaps, Volume_attach
from openstack.middleware.image.image import Image
from openstack.middleware.common.common import run_in_thread
from openstack.middleware.common.common_api import CommonApi
from openstack.middleware.user.user import User
import json
import base64
import inspect
from colorama import Fore, Back, Style

def prints(msg):
    caller_name = inspect.stack()[1][3]
    if msg == 1:
        print("%-50s%s[false]%s"%(caller_name,Fore.RED,Fore.RESET))
    else:
        # print json.dumps(msg, indent=4)
        print("%-50s%s[ok]%s"%(caller_name,Fore.GREEN,Fore.RESET))

IMAGE_ID = "e2aec20b-a965-42b7-98a6-c0f9e7ca5c3f"
FLAVOR_ID = "c2a8d2cf-bc61-499f-86a6-616de6db5948"
VM_ID = ""
VOLUME_ID = ""
VOLUME_SNAP_ID = ""
SNAPSHOT_ID = ""
ATTACH_ID = ""
PROJECT_ID = ""
USER_NAME = ""

class Openstack_test(TestCase):
    def test_login(self):
        login = Login("openstack", "baifendian2016")
        login.user_token_login()
        login.proid_login()
        login.token_login()

    def test_user_list(self):
        user = User()
        msg = user.list()
        prints(msg)

    def test_get_user_project(self):
        user = User()
        name = "openstack"
        msg = user.get_user_project(name)
        prints(msg)

    def test_get_project_user(self):
        user = User()
        project_id = PROJECT_ID
        msg = user.get_project_user(project_id)
        prints(msg)

    def test_user_create(self):
        user = User()
        name = "test_user"
        project_id = PROJECT_ID
        password = "123456"
        msg = user.create(name,project_id=project_id,password=password)
        prints(msg)

    def test_project_user_add(self):
        user = User()
        user_name = USER_NAME
        project_id = PROJECT_ID
        user_id = user.get_id_by_name(user_name)
        msg = user.project_user_add(project_id,user_id)
        prints(msg)

    def test_project_user_del(self):
        user = User()
        user_name = USER_NAME
        project_id = PROJECT_ID
        user_id = user.get_id_by_name(user_name)
        msg = user.project_user_del(project_id,user_id)
        prints(msg)

    def test_list_image(self):
        self.test_login()
        image = Image()
        msg = image.list()
        prints(msg)

    def test_create_volume(self):
        '''
        创建volume
        :return:
        '''
        self.test_login()
        volume = Volume()
        ret = volume.create(10, name="test_a")
        prints(ret)
        return ret

    def test_create_volume_multiple(self):
        '''
        创建多块磁盘
        :return:
        '''
        self.test_login()
        volume = Volume()
        volume.create_multiple("test_disk",3,10)

    def test_list_volume(self):
        '''
        :return:
        '''
        self.test_login()
        volume = Volume()
        msg = volume.list()
        prints(msg)

    def test_show_volume(self):
        '''
        :return:
        '''
        self.test_login()
        volume_id = VOLUME_ID
        volume = Volume()
        msg = volume.show_detail(volume_id)
        prints(msg)

    def test_delete_volume(self):
        '''
        :return:
        '''
        self.test_login()
        volume_id = VOLUME_ID
        volume = Volume()
        msg = volume.delete(volume_id)
        prints(msg)

    def test_extend_volume(self):
        '''
        :return:
        '''
        self.test_login()
        volume_id = VOLUME_ID
        size = 11
        volume = Volume()
        msg = volume.extend(volume_id,size)
        prints(msg)

    def test_create_volume_snap(self):
        '''
        创建磁盘快照
        :return:
        '''
        self.test_login()
        volume_id = VOLUME_ID
        name = "test_snap"
        volume_snap = Volume_snaps()
        ret = volume_snap.create(volume_id,name)
        prints(ret)
        return ret

    def test_change_volume_snap(self):
        '''
        创建磁盘快照
        :return:
        '''
        self.test_login()
        volume_snap_id = VOLUME_SNAP_ID
        volume_snap = Volume_snaps()
        ret = volume_snap.change(volume_snap_id,name="asd",des="111111")
        prints(ret)
        return ret

    def test_delete_volume_snap(self):
        '''
        删除磁盘快照
        :return:
        '''
        self.test_login()
        snapshot_id = SNAPSHOT_ID
        volume_snap = Volume_snaps()
        ret = volume_snap.delete(snapshot_id)
        prints(ret)

    def test_create_flavor(self):
        '''
        :return:
        '''
        self.test_login()

    def test_list_flavor(self):
        self.test_login()
        flavor = Flavor()
        msg = flavor.list()
        prints(msg)

    def test_list_flavor_detail(self):
        self.test_login()
        flavor = Flavor()
        msg = flavor.list_detail()
        prints(msg)

    def test_list_vm(self):
        self.test_login()
        vm = Vm_manage()
        msg = vm.list()
        prints(msg)

    def test_show_vm(self):
        self.test_login()
        vm_id = VM_ID
        vm = Vm_manage()
        msg = vm.show_detail(vm_id)
        prints(msg)

    def test_list_vm_detail(self):
        self.test_login()
        vm = Vm_manage()
        query = {"name": "ddd"}
        msg = vm.list_detail(query)
        prints(msg)

    def test_get_vm_avzone(self):
        self.test_login()
        vm = Vm_manage()
        ret = vm.get_avzone()
        prints(ret)

    def test_create_vm(self):
        '''
        :return:
        '''
        self.test_login()
        vm = Vm_manage()
        disk = [{"name": "disk_test2", "size": "10", "dev_name": "/dev/sdb"},
                {"name": "disk_test3", "size": "10", "dev_name": "/dev/sdc"}]
        tmp_str = base64.b64encode("test")
        msg = vm.create("test_zd3", FLAVOR_ID, IMAGE_ID, "123456",tmp_str)
        prints(msg)
        return msg

    def test_create_vm_multiple(self):
        '''
        :return:
        '''
        self.test_login()
        vm = Vm_manage()
        disk = [{"name": "disk_test2", "size": "10", "dev_name": "/dev/sdb"},
                {"name": "disk_test3", "size": "10", "dev_name": "/dev/sdc"}]
        tmp_str = base64.b64encode("test")
        msg = vm.create_multiple("test_zd3", FLAVOR_ID, IMAGE_ID, "123456",tmp_str, 3, 10, disk)
        prints(msg)

    # def test_create_image(self):
    #     self.test_login()
    #     vm_id = "abbd4d3f-3483-41b3-97eb-ee59898191cf"
    #     vm = Vm_snap(vm_id)
    #     image_name = "test_snap_1"
    #     ret = vm.create(vm_id,image_name)

    def test_create_snap(self):
        self.test_login()
        vm_id = VM_ID
        vm = Vm_snap(vm_id)
        image_name = "test_snap_1"
        ret = vm.create(image_name)
        prints(ret)

    def test_rebuild(self):
        self.test_login()
        vm_id = VM_ID
        vm = Vm_snap(vm_id)
        image_name = ""
        ret = vm.rebuild(image_name)

    def test_getinfo_snap(self):
        self.test_login()
        vm_id = VM_ID
        vm = Vm_snap(vm_id)
        image_name = ""
        ret = vm.getinfo_node(image_name)
        prints(ret)

    def test_change_snap(self):
        self.test_login()
        vm_id = VM_ID
        vm = Vm_snap(vm_id)
        image_name = ""
        image_name_new = ""
        ret = vm.change_node(image_name, image_name_new)
        prints(ret)

    def test_del_snap(self):
        self.test_login()
        vm_id = VM_ID
        vm = Vm_snap(vm_id)
        image_name = ""
        ret = vm.delete_node(image_name)
        prints(ret)

    def test_vm_resize(self):
        self.test_login()
        vm_id = VM_ID
        vm = Vm_control()
        flavor = ""
        vm.resize(vm_id,flavor)

    def test_vm_console(self):
        self.test_login()
        vm_id = VM_ID
        vm = Vm_control()
        ret = vm.get_console(vm_id)
        prints(ret)

    def test_vm_attach_create(self):
        self.test_login()
        vm_id = VM_ID
        volume_id = VOLUME_ID
        volume_attach = Volume_attach()
        ret = volume_attach.attach(vm_id,volume_id)
        prints(ret)
        return ret

    def test_vm_attach_list(self):
        self.test_login()
        volume_attach = Volume_attach()
        vm_id = VM_ID
        ret = volume_attach.list(vm_id)
        prints(ret)

    def test_vm_attach_show_detail(self):
        self.test_login()
        volume_attach = Volume_attach()
        vm_id = VM_ID
        attach_id = ATTACH_ID
        ret = volume_attach.show_detail(vm_id,attach_id)
        prints(ret)

    def test_vm_attach_delete(self):
        self.test_login()
        volume_attach = Volume_attach()
        vm_id = VM_ID
        attach_id = ATTACH_ID
        ret = volume_attach.delete(vm_id,attach_id)
        prints(ret)

    def test_thread(self):
        def test_t(a):
            print a
            time.sleep(a)
            return 0

        a = run_in_thread(test_t, (10,), timeout=10)
        print a

    def test_vbackup_list(self):
        self.test_login()
        volume_backup = Volume_backup()
        ret = volume_backup.list()
        prints(ret)

    def test_vbackup_list_detail(self):
        self.test_login()
        volume_backup = Volume_backup()
        ret = volume_backup.list_detail()
        prints(ret)

    def test_vbackup_show_detail(self):
        self.test_login()
        volume_backup = Volume_backup()
        volume_backup_id = ""
        ret = volume_backup.show_detail(volume_backup_id)
        prints(ret)

    def test_vbackup_create(self):
        self.test_login()
        volume_backup = Volume_backup()
        volume_id = VM_ID
        volume_backup_name = "test_volume_backup"
        ret = volume_backup.create(volume_id,volume_backup_name)
        prints(ret)

    def test_vbackup_restore(self):
        self.test_login()
        volume_backup = Volume_backup()
        volume_backup_id = ""
        volume_name = ""
        volume_id = VM_ID
        ret = volume_backup.restore(volume_backup_id,volume_id,volume_name)
        prints(ret)

    def test_vbackup_delete(self):
        self.test_login()
        volume_backup = Volume_backup()
        volume_backup_id = ""
        ret = volume_backup.delete(volume_backup_id)
        prints(ret)

    def test_console_log(self):
        self.test_login()
        vm_control = Vm_control()
        vm_id = VM_ID
        ret = vm_control.get_console_log(vm_id)
        prints(ret)

    def test_get_keypairs(self):
        self.test_login()
        ret = CommonApi.get_keypairs()
        prints(ret)

    def test_get_az(self):
        self.test_login()
        ret = CommonApi.get_azinfo()
        prints(ret)

    def test_get_hv(self):
        self.test_login()
        ret = CommonApi.get_hvinfo()
        prints(ret)


    def auto_test(self):
        global VM_ID
        global VOLUME_ID
        global SNAPSHOT_ID
        global ATTACH_ID
        print "_____________________start test___________________________________"
        #list
        self.test_list_image()
        self.test_list_volume()
        self.test_list_flavor()
        self.test_list_flavor_detail()
        self.test_list_vm()
        self.test_list_vm_detail()
        self.test_vbackup_list()
        self.test_vbackup_list_detail()
        self.test_get_az()
        self.test_get_hv()
        #volume
        tmp_ret = self.test_create_volume()
        time.sleep(10)
        try:
            VOLUME_ID = tmp_ret["volume"]["id"]
        except:
            pass
        self.test_show_volume()
        self.test_create_volume_multiple()
        self.test_extend_volume()
        tmp_ret = self.test_create_volume_snap()
        try:
            SNAPSHOT_ID = tmp_ret["snapshot"]["id"]
        except:
            pass
        time.sleep(10)
        self.test_delete_volume_snap()
        #vm
        self.test_get_vm_avzone()
        tmp_ret = self.test_create_vm()
        try:
            VM_ID = tmp_ret["server"]["id"]
        except:
            pass
        self.test_show_vm()
        self.test_vm_console()
        self.test_console_log()
        self.test_vm_attach_list()
        tmp_ret = self.test_vm_attach_create()
        try:
            ATTACH_ID = tmp_ret["volumeAttachment"]["id"]
        except:
            pass
        self.test_vm_attach_show_detail()
        time.sleep(10)
        self.test_vm_attach_delete()
        self.test_create_snap()
        print "_____________________end test___________________________________"