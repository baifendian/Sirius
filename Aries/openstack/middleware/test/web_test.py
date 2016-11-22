# coding:utf-8
import random

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import unittest
USER_NAME = ""
PASSWORD = ""


class Mytest(unittest.TestCase):
    def setUp(self):
        self.login_flag = 0
        self.elem_flag = 0
        self.checkbox_count = 1  #0表示勾选所有
        self.browser = webdriver.Chrome("C:\Program Files (x86)\Google\Chrome\Application\chromedriver",
                                        service_args=["--verbose", "--log-path=D:\\tmp\qc1.log"])
        self.browser.get("http://172.24.3.64:9090")

    def _randname(self):
        return random.sample('zyxwvutsrqponmlkjihgfedcba', 5)

    def _refresh_volume(self):
        button_refresh = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.0']")
        button_refresh.click()
        try:
            element = WebDriverWait(self.browser,10).until_not(EC.presence_of_all_elements_located((By.XPATH, "//div[@data-reactid='.0.1.1.0.0.1.2.0.0.0.0']")))
        finally:
            pass

    def _refresh_vm(self):
        button_refresh = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.0']")
        button_refresh.click()
        try:
            element = WebDriverWait(self.browser,10).until_not(EC.presence_of_all_elements_located((By.XPATH, "//div[@data-reactid='.0.1.1.0.2.1.2.0.0.0.0.0.0.0.0']")))
        finally:
            pass

    def login_test(self):
        '''
        测试登入
        :return:
        '''
        if not self.login_flag:
            global USER_NAME
            global PASSWORD
            self.browser.refresh()  # 进入页面后一定要再刷新一次才能登入，原因不明
            elem_login = self.browser.find_elements_by_class_name("bfd-input")
            username = elem_login[0]
            password = elem_login[1]
            username.send_keys(USER_NAME)
            password.send_keys(PASSWORD)
            button_submit = self.browser.find_element_by_xpath("//button[@type='submit']")
            button_submit.click()
            try:
                element = WebDriverWait(self.browser, 10).until(
                    EC.presence_of_all_elements_located((By.XPATH, "//li[@data-reactid='.0.1.0:0.0.0.0']")))
            finally:
                pass
            # print "quit"
            #     self.browser.quit()
            self.login_flag = 1
        return 0

    def _get_elem(self):
        if not self.elem_flag:
            self.cloudCompute = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30']")
            self.cloudCompute.click()
            self.compute = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30.1.$31']")
            self.compute.click()
            self.stroge = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30.1.$32']")
            self.stroge.click()
            # 下面的按钮需要先点开 云主机->计算和云主机->存储
            self.emeu_instacne = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30.1.$31.1.0']")
            self.emeu_image = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30.1.$31.1.1']")
            self.emeu_flavor = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30.1.$31.1.2']")
            self.emeu_volume = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30.1.$32.1.0']")
            self.emeu_volume_snap = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30.1.$32.1.1']")
            self.emeu_volume_backup = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.0:0.0.0.$30.1.$32.1.2']")
            self.elem_flag = 1

    def into_instance(self):
        '''
        进入虚拟机页面
        :return:
        '''
        self.login_test()
        self._get_elem()
        self.emeu_instacne.click()
        try:
            element = WebDriverWait(self.browser, 10).until(
                EC.presence_of_all_elements_located((By.XPATH, "//button[@data-reactid='.0.1.1.0.2.1.0.1.0']")))
        finally:
            pass
        time.sleep(2)
        try:
            element = WebDriverWait(self.browser,10).until_not(EC.presence_of_all_elements_located((By.XPATH, "//div[@data-reactid='.0.1.1.0.2.1.2.0.0.0.0.0.0.0.0']")))
        finally:
            pass

    def into_image(self):
        '''
        进入镜像页面
        :return:
        '''
        self.login_test()
        self._get_elem()
        self.emeu_image.click()
        time.sleep(2)
        try:
            element = WebDriverWait(self.browser, 10).until_not(
                EC.presence_of_all_elements_located((By.XPATH, "//div[@data-rectid='.0.1.1.0.1.1.1.0.0.0.0']")))
        finally:
            pass

    def into_flavor(self):
        '''
        进入类型页面
        :return:
        '''
        self.login_test()
        self._get_elem()
        self.emeu_flavor.click()
        time.sleep(2)
        try:
            element = WebDriverWait(self.browser, 10).until_not(
                EC.presence_of_all_elements_located((By.XPATH, "//div[@data-rectid='.0.1.1.0.0.1.1.1.0.0.0.0']")))
        finally:
            pass

    def into_volume(self):
        '''
        进入volume页面
        :return:
        '''
        self.login_test()
        self._get_elem()
        self.emeu_volume.click()
        try:
            element = WebDriverWait(self.browser, 10).until(
                EC.presence_of_all_elements_located((By.XPATH, "//button[@data-reactid='.0.1.1.0.0.1.1.0']")))
        finally:
            pass
        time.sleep(2)
        try:
            element = WebDriverWait(self.browser,10).until_not(EC.presence_of_all_elements_located((By.XPATH, "//div[@data-reactid='.0.1.1.0.0.1.2.0.0.0.0']")))
        finally:
            pass

    def into_volume_snap(self):
        '''
        进入volume快照页面
        :return:
        '''
        self.login_test()
        self._get_elem()
        self.emeu_volume_snap.click()
        try:
            element = WebDriverWait(self.browser, 10).until(
                EC.presence_of_all_elements_located((By.XPATH, "//button[@data-reactid='.0.1.1.0.1.1.0.0']")))
        finally:
            pass
        time.sleep(2)
        try:
            element = WebDriverWait(self.browser,10).until_not(EC.presence_of_all_elements_located((By.XPATH, "//div[@data-reactid='.0.1.1.0.1.1.1.0.0.0.0']")))
        finally:
            pass

    def into_volume_backup(self):
        '''
        进入快照备份页面
        :return:
        '''
        self.login_test()
        self._get_elem()
        self.emeu_volume_backup.click()
        try:
            element = WebDriverWait(self.browser, 10).until(
                EC.presence_of_all_elements_located((By.XPATH, "//button[@data-reactid='.0.1.1.0.1.1.0.0']")))
        finally:
            pass
        time.sleep(2)
        try:
            element = WebDriverWait(self.browser,10).until_not(EC.presence_of_all_elements_located((By.XPATH, "//div[@data-reactid='.0.1.1.0.1.1.1.0.0.0.0']")))
        finally:
            pass

    def instance_create(self):
        '''
        虚拟机创建测试
        :return:
        '''
        self.into_instance()
        button_create = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.1.0']")
        button_create.click()
        try:
            element = WebDriverWait(self.browser, 10).until(EC.presence_of_all_elements_located(
                (By.XPATH, "//input[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.1.1.0.0.1.0.0']")))
        finally:
            pass
        input_instance_name = self.browser.find_element_by_xpath(
            "//input[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.1.1.0.0.1.0.0']")
        instance_name = self._randname()
        input_instance_name.send_keys(instance_name)
        input_instance_num = self.browser.find_element_by_xpath(
            "//input[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.1.1.0.1.1.0.0']")
        input_instance_num.send_keys(1)
        select_list_flavor = self.browser.find_element_by_xpath(
            "//div[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.1.1.0.2.1.0.0.$title']")
        try:
            element = WebDriverWait(self.browser, 10).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.0.0']").is_displayed())
        finally:
            pass
        select_list_flavor.click()
        flavor_type = self.browser.find_element_by_xpath(
            "//li[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.1.1.0.2.1.0.1.1.0.$5/=11=2$4']")
        flavor_type.click()
        select_list_image = self.browser.find_element_by_xpath(
            "//div[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.1.1.0.3.1.0.0.$title']")
        select_list_image.click()
        image_type = self.browser.find_element_by_xpath(
            "//li[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.1.1.0.3.1.0.1.1.0.$3/=11=2$2']")
        image_type.click()
        button_confirm = self.browser.find_element_by_xpath(
            "//button[@data-reactid='.0.1.1.0.2.1.0.1.1.$=10.1.0.0.1.0.0.1.1.0.5']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.2.0.0']").is_displayed())
        finally:
            pass
        self._refresh_vm()
        return 0

    def instance_start(self):
        '''
        启动列表中的第一台虚拟机，若虚拟机以开启则直接返回
        :return:
        '''
        self.into_instance()
        if self.browser.find_element_by_xpath("//span[@data-reactid='.0.1.1.0.2.1.2.0.0.0.0.0.1.1.$0.1:$40.0']").text == "SHUTOFF":
            checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
            checkbox_first.click()
            button_pull = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.0.1']")
            button_pull.click()
            button_start = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[0]
            button_start.click()
            try:
                element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                    "//span[@data-reactid='.0.1.1.0.2.0.0']").is_displayed())
            finally:
                pass
            self._refresh_vm()

    def instance_stop(self):
        '''
        停止列表中的第一台虚拟机
        :return:
        '''
        self.into_instance()
        if self.browser.find_element_by_xpath("//span[@data-reactid='.0.1.1.0.2.1.2.0.0.0.0.0.1.1.$0.1:$40.0']").text == "ACTIVE":
            checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
            checkbox_first.click()
            button_pull = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.0.1']")
            button_pull.click()
            button_stop = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[2]
            button_stop.click()
            button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.3.$=10.1.0.0.1.1.0']")
            button_confirm.click()
            try:
                element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                    "//span[@data-reactid='.0.1.1.0.2.0.0']").is_displayed())
            finally:
                pass
            self._refresh_vm()

    def instance_restart(self):
        '''
        重启列表中的第一台虚拟机
        :return:
        '''
        self.into_instance()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_pull = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.0.1']")
        button_pull.click()
        button_restart = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[1]
        button_restart.click()
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.3.$=10.1.0.0.1.1.0']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.2.0.0']").is_displayed())
        finally:
            pass
        self._refresh_vm()

    def instance_snap(self):
        '''
        创建第一台虚拟机的快照
        :return:
        '''
        self.into_instance()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_pull = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.0.1']")
        button_pull.click()
        button_snap = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[3]
        button_snap.click()
        input_name = self.browser.find_element_by_xpath("//input[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.0.0.1.0.0']")
        input_name.send_keys(self._randname())
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.0.1']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.2.0.0']").is_displayed())
        finally:
            pass
        self._refresh_vm()

    def instance_attach(self):
        '''
        为第一台虚拟机挂载硬盘
        :return:
        '''
        self.into_instance()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_pull = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.0.1']")
        button_pull.click()
        # button_volume_list = self.browser.find_elements_by_xpath("//li[@class='ant-dropdown-menu-item-selected ant-dropdown-menu-item']")
        # if not button_volume_list:
        #     button_volume = self.browser.find_elements_by_xpath("//li[@class='ant-dropdown-menu-item']")[4]
        # else:
        #     button_volume = button_volume_list[0]
        button_volume = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[4]
        button_volume.click()
        time.sleep(2)
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.0.0']").is_displayed())
        finally:
            pass
        volume_select = self.browser.find_elements_by_xpath("//div[@class='bfd-fetch'][@style='min-height:30px;']")[2]
        volume_select.click()
        volume_checkbox = self.browser.find_elements_by_xpath("//label[@class='bfd-checkbox bfd-checkbox--block']")[0]
        volume_checkbox.click()
        volume_select.click()
        volume_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.1.0.4.0']")
        volume_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_vm()

    def instance_reset(self):
        '''
        选择第一台虚拟机重置类型
        :return:
        '''
        self.into_instance()
        flavor_now = self.browser.find_element_by_xpath("//td[@data-reactid='.0.1.1.0.2.1.2.0.0.0.0.0.1.1.$0.1:$10']").text
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_pull = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.0.1']")
        button_pull.click()
        button_reset = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[5]
        button_reset.click()
        flavor_select = self.browser.find_element_by_xpath("//div[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.1.1.0.0']")
        flavor_select.click()
        time.sleep(2)
        if flavor_now == 'm1.tiny':
            flavor_name = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.1.1.0.1.1.$1/=11=2$0']")
        else:
            flavor_name = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.1.1.0.1.1.$5/=11=2$4']")
        flavor_name.click()
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.1.0.$=10.1.0.0.0.1.1.0.2']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.2.0.0']").is_displayed())
        finally:
            pass
        self._refresh_vm()

    def instance_del(self):
        '''
        删除第一台虚拟机
        :return:
        '''
        self.into_instance()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_pull = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.2.0.1']")
        button_pull.click()
        button_delete = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[7]
        button_delete.click()
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.2.1.0.3.$=10.1.0.0.1.1.0']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.2.0.0']").is_displayed())
        finally:
            pass
        self._refresh_vm()

    def volume_create(self):
        '''
        创建一个虚拟卷
        :return:
        '''
        self.into_volume()
        button_create = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.1.0']")
        button_create.click()
        input_name = self.browser.find_element_by_xpath("//input[@data-reactid='.0.1.1.0.0.1.1.1.1.$=10.1.0.0.1.0.0.1.0.0']")
        input_name.send_keys(self._randname())
        input_num = self.browser.find_element_by_xpath("//input[@data-reactid='.0.1.1.0.0.1.1.1.1.$=10.1.0.0.1.0.1.1.0.0']")
        input_num.send_keys(1)
        input_size = self.browser.find_element_by_xpath("//input[@data-reactid='.0.1.1.0.0.1.1.1.1.$=10.1.0.0.1.0.3.1.0.0']")
        input_size.send_keys(10)
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.1.1.$=10.1.0.0.1.0.5']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_volume()

    def volume_change(self):
        '''
        修改虚拟卷信息
        :return:
        '''
        self.into_volume()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_enmu = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.0.1']")
        button_enmu.click()
        button_change = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[0]
        button_change.click()
        input_name = self.browser.find_element_by_xpath("//input[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.0.1.0.0']")
        input_name.send_keys(self._randname())
        input_des = self.browser.find_element_by_xpath("//textarea[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.1.1.0']")
        input_des.send_keys(self._randname())
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.2']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_volume()

    def volume_extend(self):
        '''
        扩展虚拟卷,测试的磁盘大小需要小于15G
        :return:
        '''
        self.into_volume()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_enmu = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.0.1']")
        button_enmu.click()
        button_extend = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[1]
        button_extend.click()
        input_size = self.browser.find_element_by_xpath("//input[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.1.1.0.0']")
        input_size.send_keys(15)
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.2']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_volume()

    def volume_attach(self):
        '''
        加载卷到虚拟机中
        :return:
        '''
        self.into_volume()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_enmu = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.0.1']")
        button_enmu.click()
        button_attach = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[2]
        button_attach.click()
        time.sleep(2)
        select_vm_section = self.browser.find_element_by_xpath("//div[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.1.1.0.0']")
        select_vm_section.click()
        select_vm = self.browser.find_element_by_xpath("//li[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.1.1.0.1.1.0.$1/=11=2$0']")
        select_vm.click()
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.2']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_volume()

    def volume_unattach(self):
        '''
        从虚拟机中卸载卷
        :return:
        '''
        self.into_volume()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_enmu = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.0.1']")
        button_enmu.click()
        button_unattach = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[3]
        button_unattach.click()
        time.sleep(2)
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.2']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_volume()

    def volume_snap_create(self):
        '''
        创建虚拟卷快照
        :return:
        '''
        self.into_volume()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_enmu = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.0.1']")
        button_enmu.click()
        button_snap = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[4]
        button_snap.click()
        input_name = self.browser.find_element_by_xpath("//input[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.3.1.0.0']")
        input_name.send_keys(self._randname())
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.5']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_volume()

    def volume_backup_create(self):
        '''
        创建虚拟卷备份
        :return:
        '''
        self.into_volume()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_enmu = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.0.1']")
        button_enmu.click()
        button_backup = self.browser.find_elements_by_xpath("//li[@role='menuitem']")[5]
        button_backup.click()
        input_name = self.browser.find_element_by_xpath("//input[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.3.1.0.0']")
        input_name.send_keys(self._randname())
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.3.1.0.$=10.1.0.0.1.0.0.5']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_volume()

    def volume_del(self):
        '''
        创建虚拟卷备份
        :return:
        '''
        self.into_volume()
        checkbox_first = self.browser.find_elements_by_class_name("bfd-checkbox")[self.checkbox_count]
        checkbox_first.click()
        button_del = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.2.0']")
        button_del.click()
        button_confirm = self.browser.find_element_by_xpath("//button[@data-reactid='.0.1.1.0.0.1.1.2.1.$=10.1.0.0.1.0.1.0']")
        button_confirm.click()
        try:
            element = WebDriverWait(self.browser, 60).until_not(lambda i: i.find_element_by_xpath(
                "//span[@data-reactid='.0.1.1.0.0.0.0']").is_displayed())
        finally:
            pass
        self._refresh_volume()

    def auto_test(self):
        #虚拟机
        self.instance_create()
        self.instance_stop()
        self.instance_start()
        self.instance_restart()
        self.instance_attach()
        self.instance_snap()
        self.instance_del()
        #虚拟卷
        self.volume_create()
        self.volume_extend()
        self.volume_change()
        self.volume_attach()
        self.volume_unattach()
        self.volume_snap_create()
        self.volume_backup_create()

if __name__ == "__main__":
    unittest.main()
