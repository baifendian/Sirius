# coding:utf-8
from openstack.middleware.common.common import send_request, IP_nova, PORT_nova, dlog, plog,cache
from openstack.middleware.login.login import get_token, get_proid
from openstack.middleware.common.urls import url_flavor_action,url_flavor_list,url_flavor_list_detail

class Flavor:
    def __init__(self):
        self.token_dict = get_token()
        self.project_id_dict = get_proid()

    @cache()
    def list(self,username):
        ret = 0
        try:
            token = self.token_dict[username]
            project_id = self.project_id_dict[username]
            assert token != "", "not login"
            # path = "/v2.1/%s/flavors" % self.project_id
            path = url_flavor_list.format(project_id=project_id)
            method = "GET"
            head = {"Content-Type": "application/json", "X-Auth-Token": token}
            params = ''
            ret = send_request(method, IP_nova, PORT_nova, path, params, head)
            assert ret != 1, "send_request error"
        except Exception,err:
            ret = 1
            dlog("Flavor.list err:%s"%err,lever="ERROR")
        return ret

    @cache()
    def show_detail(self, flavor_id,username):
        ret = 0
        try:
            token = self.token_dict[username]
            project_id = self.project_id_dict[username]
            assert token != "", "not login"
            # path = "/v2.1/%s/flavors/%s" % (self.project_id, flavor_id)
            path = url_flavor_action.format(project_id=project_id,flavor_id=flavor_id)
            method = "GET"
            head = {"Content-Type": "application/json", "X-Auth-Token": token}
            params = ""
            ret = send_request(method, IP_nova, PORT_nova, path, params, head)
            assert ret != 1, "send_request error"
        except Exception,err:
            ret = 1
            dlog("Flavor")
        return ret

    @cache()
    def list_detail(self,username):
        ret = 0
        try:
            token = self.token_dict[username]
            project_id = self.project_id_dict[username]
            assert token != "", "not login"
            # path = "/v2.1/%s/flavors/detail" % self.project_id
            path = url_flavor_list_detail.format(project_id=project_id)
            method = "GET"
            head = {"Content-Type": "application/json", "X-Auth-Token": token}
            params = ""
            ret = send_request(method, IP_nova, PORT_nova, path, params, head)
            assert ret != 1, "send_request error"
        except Exception,err:
            ret = 1
            dlog("Flavor.list_detail err:%s"%err,lever="ERROR")
        return ret

    @cache()
    def get_id(self, name,username):
        try:
            token = self.token_dict[username]
            project_id = self.project_id_dict[username]
            assert token != "", "not login"
            tmp_ret = self.list()
            id = filter(lambda i: i["name"] == name, tmp_ret["flavors"])
        except Exception,err:
            id = 1
            dlog("Flavor.get_id err:%s"%err,lever="ERROR")
        return id

    def create(self):
        pass

    def delete(self):
        pass
