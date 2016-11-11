# coding:utf-8
import urllib

from openstack.middleware.login.login import get_token, get_proid,get_admin_project_id,get_admin_token, admin_login
from common import send_request, plog,IP_nova,PORT_nova,IP_keystone,PORT_keystone
from urls import url_keypairs,url_az_info,url_hv_info,url_domain_info,url_role_info


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

    @classmethod
    @plog("CommonApi.get_azinfo")
    def get_azinfo(cls):
        '''
        获取Availability zone信息，只有admin的用户才有权限，所以调用前需要用admin账号临时登入下
        :return:
        '''
        admin_token = get_admin_token()
        admin_project_id = get_admin_project_id()
        #path = url_keypairs.format(project_id=project_id)
        path = url_az_info.format(project_id=admin_project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": admin_token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        if ret == 1:
            admin_login()
            admin_token = get_admin_token()
            admin_project_id = get_admin_project_id()
            path = url_az_info.format(project_id=admin_project_id)
            head = {"Content-Type": "application/json", "X-Auth-Token": admin_token}
            ret = send_request(method, IP_nova, PORT_nova, path, params, head)
            assert ret != 1,"send_request error"
        return ret

    @classmethod
    @plog("CommonApi.get_azinfo")
    def get_hvinfo(cls):
        '''
        获取 Hypervisor信息，只有admin的用户才有权限，所以调用前需要用admin账号临时登入下
        :return:
        '''
        admin_token = get_admin_token()
        admin_project_id = get_admin_project_id()
        #path = url_keypairs.format(project_id=project_id)
        path = url_hv_info.format(project_id=admin_project_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": admin_token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        if ret == 1:
            admin_login()
            admin_token = get_admin_token()
            admin_project_id = get_admin_project_id()
            path = url_hv_info.format(project_id=admin_project_id)
            head = {"Content-Type": "application/json", "X-Auth-Token": admin_token}
            ret = send_request(method, IP_nova, PORT_nova, path, params, head)
            assert ret != 1,"send_request error"
        return ret

    @classmethod
    @plog("CommonApi.get_domain_id")
    def get_domain_id(cls,query_dict=None):
        '''
        获取domain_id
        :return:
        '''
        admin_token = get_admin_token()
        path = url_domain_info
        if query_dict:
            query_str = urllib.urlencode(query_dict)
            path = "%s?%s" % (path, query_str)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": admin_token}
        params = ""
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        return ret

    @classmethod
    @plog("CommonApi.get_role_id")
    def get_role_id(cls,query_dict=None):
        '''
        获取role_id
        :return:
        '''
        admin_token = get_admin_token()
        path = url_role_info
        if query_dict:
            query_str = urllib.urlencode(query_dict)
            path = "%s?%s" % (path, query_str)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": admin_token}
        params = ""
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        return ret
