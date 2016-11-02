# coding:utf-8
from openstack.middleware.common.common import send_request, IP_nova, PORT_nova, dlog, plog,cache
from openstack.middleware.login.login import get_token, get_proid
from openstack.middleware.common.urls import url_image_action,url_image_list,url_image_list_detail
import urllib


class Image:
    def __init__(self):
        self.token_dict = get_token()
        self.project_id_dict = get_proid()

    @cache()
    def list(self, query_dict={},username=""):
        ret = 0
        try:
            token = self.token_dict[username]
            project_id = self.project_id_dict[username]
            assert token != "", "not login"
            path = url_image_list.format(project_id=project_id)
            if query_dict:
                query_str = urllib.urlencode(query_dict)
                path = "%s?%s" % (path, query_str)
            method = "GET"
            head = {"Content-Type": "application/json", "X-Auth-Token": token}
            params = ''
            ret = send_request(method, IP_nova, PORT_nova, path, params, head)
            assert ret != 1, "send_request error"
        except Exception,err:
            ret = 1
            dlog("Image.list err:%s"%err,lever="ERROR")
        return ret

    @cache()
    def list_detail(self,username):
        ret = 0
        try:
            token = self.token_dict[username]
            project_id = self.project_id_dict[username]
            assert token != "", "not login"
            path = url_image_list_detail.format(project_id=project_id)
            method = "GET"
            head = {"Content-Type": "application/json", "X-Auth-Token": token}
            params = ''
            ret = send_request(method, IP_nova, PORT_nova, path, params, head)
            assert ret != 1, "send_request error"
        except Exception,err:
            ret = 1
            dlog("Image.list_detail err:%s"%err,lever="ERROR")
        return ret

    @cache()
    def show_detail(self, image_id,username):
        ret = 0
        try:
            token = self.token_dict[username]
            project_id = self.project_id_dict[username]
            assert token != "", "not login"
            path = url_image_action.format(project_id=project_id,image_id=image_id)
            method = "GET"
            head = {"Content-Type": "application/json", "X-Auth-Token": token}
            params = ''
            ret = send_request(method, IP_nova, PORT_nova, path, params, head)
            assert ret != 1, "send_request error"
        except Exception,err:
            ret = 1
            dlog("Image.show_detail err:%s"%err,lever="ERROR")
        return ret

    @plog("Image.delete")
    def delete(self, image_id,username):
        ret = 0
        token = self.token_dict[username]
        project_id = self.project_id_dict[username]
        assert token != "", "not login"
        path = url_image_action.format(project_id=project_id,image_id=image_id)
        method = "DELETE"
        head = {"Content-Type": "application/json", "X-Auth-Token": token}
        params = ''
        ret = send_request(method, IP_nova, PORT_nova, path, params, head)
        assert ret != 1, "send_request error"
        return ret


class Image_metadata:
    def __init__(self):
        self.token = get_token()
