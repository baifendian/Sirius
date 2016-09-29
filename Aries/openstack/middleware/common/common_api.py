# coding:utf-8
from openstack.middleware.login.login import get_token, get_proid
from common import send_request, plog,IP_nova,PORT_nova
from urls import url_keypairs

class CommonApi:
    def __init__(self):
        pass

    @classmethod
    @plog("CommonApi.get_keypairs")
    def get_keypairs(cls):
        '''
        获取密钥对
        :return:
        '''
        token = get_token()
        project_id = get_proid()
        path = url_keypairs.format(project_id=project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1,"send_request error"
        return ret