# coding:utf-8
from middleware.common.common import send_request, IP_keystone, PORT_keystone, plog

token = ""
project_id = ""


class Login:
    def __init__(self, name, password):
        global token
        global project_id
        self.token = token
        self.project_id = project_id
        self.user_token = ""
        self.name = name
        self.password = password

    @plog("Login.get_user_token")
    def user_token_login(self):
        '''
        得到一个用户的token，但是没有对项目相关操作的权限
        :return:
        '''
        method = "POST"
        path = "/v3/auth/tokens"
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

    @plog("Login.get_proid")
    def proid_login(self):
        '''
        得到project_id,为下面获取token作准备
        :return:
        '''
        global project_id
        method = "GET"
        path = "/v3/auth/projects"
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
        path = "/v3/auth/tokens"
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


def get_proid():
    return project_id


def login_out():
    global token
    global project_id
    token = ""
    project_id = ""
