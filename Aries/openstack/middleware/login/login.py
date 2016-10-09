# coding:utf-8
from openstack.middleware.common.common import send_request, IP_keystone, PORT_keystone, plog
from openstack.middleware.common.urls import url_get_token,url_project_id

token = ""
project_id = ""
user_token = ""
admin_token = ""
admin_project_id = ""
admin_user_token = ""


class Login:
    def __init__(self, name, password):
        global token
        global project_id
        global user_token
        self.token = token
        self.project_id = project_id
        self.user_token = user_token
        self.name = name
        self.password = password

    @plog("Login.get_user_token")
    def user_token_login(self):
        '''
        得到一个用户的token，但是没有对项目相关操作的权限
        :return:
        '''
        global user_token
        method = "POST"
        path = url_get_token
        params = {
            "auth":
                {
                    "identity":
                        {
                            "methods":
                                [
                                    "password"
                                ],
                            "password":
                                {
                                    "user":
                                        {
                                            "name": self.name,
                                            "domain": {
                                                "name": "default"
                                            },
                                            "password": self.password
                                        }
                                }
                        }
                }
        }
        head = {"Content-Type": "application/json"}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head, flag=1)
        self.user_token = ret["token_id"]
        user_token = self.user_token

    @plog("Login.get_proid")
    def proid_login(self):
        '''
        得到project_id,为下面获取token作准备
        :return:
        '''
        global project_id
        method = "GET"
        path = url_project_id
        params = ''
        head = {"X-Auth-Token": self.user_token}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        self.project_id = ret["projects"][0].get("id", "")
        project_id = self.project_id

    @plog("Login.get_token")
    def token_login(self):
        '''
        得到能对项目操作的token
        :return:
        '''
        global token
        assert self.project_id != "", "proejct_id is none"
        method = "POST"
        path = url_get_token
        params = {
            "auth":
                {
                    "identity":
                        {
                            "methods":
                                [
                                    "password"
                                ],
                            "password":
                                {
                                    "user":
                                        {
                                            "name": self.name,
                                            "domain": {
                                                "name": "default"
                                            },
                                            "password": self.password
                                        }
                                }
                        },
                    "scope":
                        {
                            "project": {
                                "id": self.project_id
                            }
                        }
                }
        }
        head = {"Content-Type": "application/json"}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head, flag=1)
        self.token = ret["token_id"]
        token = self.token


def get_token():
    return token

@plog("admin_login")
def admin_login():
    global admin_token
    global user_token
    global project_id
    global token
    global admin_project_id
    global admin_user_token
    user_token_tmp = user_token
    token_tmp = token
    project_id_tmp = project_id
    admin_username = "admin"
    admin_password = "baifendianadmin2016"
    admin_login = Login(admin_username,admin_password)
    admin_login.user_token_login()
    admin_login.proid_login()
    admin_login.token_login()
    admin_user_token = user_token
    admin_token = token
    admin_project_id = project_id
    user_token = user_token_tmp
    project_id = project_id_tmp
    token = token_tmp

@plog("get_admin_token")
def get_admin_token():
    if admin_token == "":
        admin_login()
    return admin_token

def get_admin_project_id():
    if admin_project_id == "":
        admin_login()
    return admin_project_id

def get_proid():
    return project_id

def get_user_token():
    return user_token

@plog("get_project")
def get_project():
    global user_token
    assert user_token != "", "not login"
    method = "GET"
    path = url_project_id
    params = ''
    head = {"X-Auth-Token": user_token}
    ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
    return ret

def login_out():
    global token
    global project_id
    token = ""
    project_id = ""


