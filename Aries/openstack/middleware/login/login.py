# coding:utf-8
from openstack.middleware.common.common import send_request, IP_keystone, PORT_keystone, plog,cache
from openstack.middleware.common.urls import url_get_token,url_project_id

token_dict = {}
project_id_dict = {}
user_token_dict = {}
admin_token = ""
admin_project_id = ""
admin_user_token = ""


class Login:
    def __init__(self, name, password):
        self.token = ""
        self.project_id = ""
        self.user_token = ""
        self.name = name
        self.password = password

    @plog("Login.get_user_token")
    def user_token_login(self):
        '''
        得到一个用户的token，但是没有对项目相关操作的权限
        :return:
        '''
        global user_token_dict
        cache(username=self.name)
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
        cache(del_cache="*")   #切换用户时清除缓存
        head = {"Content-Type": "application/json"}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head, flag=1)
        self.user_token = ret["token_id"]
        user_token_dict[self.name] = self.user_token

    @plog("Login.get_proid")
    def proid_login(self):
        '''
        得到project_id,为下面获取token作准备
        :return:
        '''
        global project_id_dict
        method = "GET"
        path = url_project_id
        params = ''
        head = {"X-Auth-Token": self.user_token}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        self.project_id = ret["projects"][0].get("id", "")
        project_id_dict[self.name] = self.project_id

    @plog("Login.get_token")
    def token_login(self):
        '''
        得到能对项目操作的token
        :return:
        '''
        global token_dict
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
        token_dict[self.name] = self.token


def get_token():
    return token_dict

@plog("admin_login")
def admin_login(project_id_now=""):
    global admin_token
    global user_token_dict
    global project_id_dict
    global token_dict
    global admin_project_id
    global admin_user_token
    admin_username = "admin"
    admin_password = "mbk3HwlMx8e"
    admin_handle = Login(admin_username,admin_password)
    admin_handle.user_token_login()
    admin_handle.proid_login()
    if project_id_now:
        admin_handle.project_id = project_id_now
    admin_handle.token_login()
    admin_user_token = user_token_dict[admin_username]
    admin_token = token_dict[admin_username]
    admin_project_id = project_id_dict[admin_username]

@plog("get_admin_token")
def get_admin_token(project_id=""):
    if admin_token == "":
        admin_login(project_id)
    return admin_token

def get_admin_project_id():
    if admin_project_id == "":
        admin_login()
    return admin_project_id

def get_proid():
    return project_id_dict

def get_user_token():
    return user_token_dict

@plog("get_project")
def get_project(user_name):
    global user_token_dict
    user_token = user_token_dict[user_name]
    assert user_token != "", "not login"
    method = "GET"
    path = url_project_id
    params = ''
    head = {"X-Auth-Token": user_token}
    ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
    return ret

def login_out(username):
    global token_dict
    global project_id_dict
    token_dict[username] = ""
    project_id_dict[username] = ""


