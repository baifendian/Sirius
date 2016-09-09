# coding:utf-8
import sys
import time
from openstack.middleware.flavor.flavor import Flavor
from openstack.middleware.login.login import Login
from openstack.middleware.vm.vm import Vm_manage, Vm_control, Vm_snap
from openstack.middleware.volume.volume import Volume, Volume_backup
from openstack.middleware.image.image import Image
from openstack.middleware.common.common import run_in_thread
import json
import base64


def prints(msg):
    print json.dumps(msg, indent=4)


class Test_Module():
    def test_login(self):
        '''
        测试登入
        :return:
        '''
        login = Login("openstack", "baifendian2016")
        login.user_token_login()
        login.proid_login()
        login.token_login()

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
        volume.create(10, name="test_a")

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
        volume_id = ""
        volume = Volume()
        msg = volume.show_detail(volume_id)
        prints(msg)

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

    def test_list_vm(self):
        self.test_login()
        vm = Vm_manage()
        msg = vm.list()
        prints(msg)

    def test_show_vm(self):
        self.test_login()
        vm_id = ""
        vm = Vm_manage()
        msg = vm.show_detail(vm_id)
        prints(msg)

    def test_list_vm_detail(self):
        self.test_login()
        vm = Vm_manage()
        query = {"name": "ddd"}
        msg = vm.list_detail(query)
        prints(msg)

    def test_create_vm(self):
        '''
        :return:
        '''
        self.test_login()
        vm = Vm_manage()
        disk = [{"name": "disk_test2", "size": "10", "dev_name": "/dev/sdb"},
                {"name": "disk_test3", "size": "10", "dev_name": "/dev/sdc"}]
        tmp_str = base64.b64encode("test")
        msg = vm.create("test_zd3", "1", "222e2074-65e0-4ef2-b40e-a48e41181bce", "123456",tmp_str, disk)
        prints(msg)

    def test_create_vm_multiple(self):
        '''
        :return:
        '''
        self.test_login()
        vm = Vm_manage()
        disk = [{"name": "disk_test2", "size": "10", "dev_name": "/dev/sdb"},
                {"name": "disk_test3", "size": "10", "dev_name": "/dev/sdc"}]
        tmp_str = base64.b64encode("test")
        msg = vm.create_multiple("test_zd3", "1", "222e2074-65e0-4ef2-b40e-a48e41181bce", "123456",tmp_str, 3, 10, disk)
        prints(msg)

    # def test_create_image(self):
    #     self.test_login()
    #     vm_id = "abbd4d3f-3483-41b3-97eb-ee59898191cf"
    #     vm = Vm_snap(vm_id)
    #     image_name = "test_snap_1"
    #     ret = vm.create(vm_id,image_name)

    def test_create_snap(self):
        self.test_login()
        vm_id = "abbd4d3f-3483-41b3-97eb-ee59898191cf"
        vm = Vm_snap(vm_id)
        image_name = "test_snap_1"
        ret = vm.create(vm_id, image_name)

    def test_rebuild(self):
        self.test_login()
        vm_id = ""
        vm = Vm_snap(vm_id)
        image_name = ""
        ret = vm.rebuild(image_name)

    def test_getinfo_snap(self):
        self.test_login()
        vm_id = ""
        vm = Vm_snap(vm_id)
        image_name = ""
        ret = vm.getinfo_node(image_name)
        prints(ret)

    def test_change_snap(self):
        self.test_login()
        vm_id = ""
        vm = Vm_snap(vm_id)
        image_name = ""
        image_name_new = ""
        ret = vm.change_node(image_name, image_name_new)
        prints(ret)

    def test_del_snap(self):
        self.test_login()
        vm_id = ""
        vm = Vm_snap(vm_id)
        image_name = ""
        ret = vm.delete_node(image_name)
        prints(ret)

    def test_vm_resize(self):
        self.test_login()
        vm_id = ""
        vm = Vm_control()
        flavor = ""
        vm.resize(vm_id,flavor)

    def test_vm_console(self):
        self.test_login()
        vm_id = ""
        vm = Vm_control()
        ret = vm.get_console(vm_id)
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
        volume_id = ""
        volume_backup_name = ""
        ret = volume_backup.create(volume_id,volume_backup_name)
        prints(ret)

    def test_vbackup_restore(self):
        self.test_login()
        volume_backup = Volume_backup()
        volume_backup_id = ""
        volume_name = ""
        volume_id = ""
        ret = volume_backup.restore(volume_backup_id,volume_id,volume_name)
        prints(ret)

    def test_vbackup_delete(self):
        self.test_login()
        volume_backup = Volume_backup()
        volume_backup_id = ""
        ret = volume_backup.delete(volume_backup_id)
        prints(ret)

    def no_found(self):
        """
        出错返回函数
        :return:
        """
        print "not found params"


if __name__ == "__main__":
    assert sys.argv[1], "missing params"
    test_sec = "test_%s" % sys.argv[1]
    test = Test_Module()
    test.test_login()
    test_func = getattr(test, test_sec, test.no_found)
    test_func()
