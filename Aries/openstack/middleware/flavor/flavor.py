# coding:utf-8
from Aries.openstack.middleware.common.common import send_request, IP_nova, PORT_nova, dlog, plog
from Aries.openstack.middleware.login.login import get_token, get_proid


class Flavor:
    def __init__(self):
        self.token = get_token()
        self.project_id = get_proid()

    @plog("Flavor.list")
    def list(self):
        ret = 0
        assert self.token != "", "not login"
        path = "/v2.1/%s/flavors" % self.project_id
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Flavor.show_detail")
    def show_detail(self, flavor_id):
        assert self.token != "", "not login"
        path = "/v2.1/%s/flavors/%s" % (self.project_id, flavor_id)
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Flavor.list_detail")
    def list_detail(self):
        assert self.token != "", "not login"
        path = "/v2.1/%s/flavors/detail" % self.project_id
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.token}
        params = ""
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret

    @plog("Flavor.get_id")
    def get_id(self, name):
        assert self.token != "", "not login"
        tmp_ret = self.list()
        id = filter(lambda i: i["name"] == name, tmp_ret["flavors"])
        return id

    def create(self):
        pass

    def delete(self):
        pass
