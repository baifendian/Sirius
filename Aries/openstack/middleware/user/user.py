# coding:utf-8
import urllib
import md5
from openstack.middleware.common.common import send_request,plog, IP_keystone, PORT_keystone
from openstack.middleware.common.urls import url_user_common, url_user_action,url_user_project,url_project_member,url_project_user_action
from openstack.middleware.login.login import get_admin_project_id,get_admin_token
class User(object):
    def __init__(self):
        self.admin_token = get_admin_token()
        self.role_id = "f4f7c960435f4745abd0a08126dab279"     #普通用户role id，暂时写死就可以了
        self.domain_id = "48fc8e31d60348008001455ec8d19a14"   #domain_id固定，现在官方API有问题
        self.password = md5.md5("baifendian").hexdigest()

    @plog("User.list")
    def list(self,query_dict=None):
        '''
        列出和查询用户
        :param query_dict:
        :return:
        '''
        assert self.admin_token != "","can not login with admin user"
        path = url_user_common
        method = "GET"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.admin_token}
        params = ""
        if query_dict:
            query_str = urllib.urlencode(query_dict)
            path = "%s?%s" % (path, query_str)
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        return ret

    @plog("User.create")
    def create(self,name,project_id=None,password=None):
        '''
        创建用户
        :param name:
        :param project_id:
        :param passward:
        :return:
        '''
        assert self.admin_token != "","can not login with admin user"
        path = url_user_common
        method = "POST"
        head = {"Content-Type": "application/json", "X-Auth-Token": self.admin_token}
        params = {"user":{"name":name,"domain_id":self.domain_id,"enabled":True}}
        if project_id:
            params["user"].update({"default_project_id":project_id})
        if password:
            params["user"].update({"password":password})
        ret = send_request(method,IP_keystone,PORT_keystone,path,params,head)
        return ret

    @plog("User.get_id_by_name_user")
    def get_id_by_name(self,name):
        '''
        通过用户名获取用户id
        :param name:
        :return:
        '''
        tmp_dict = self.list({"name":name})
        assert tmp_dict != 1
        user_id = tmp_dict["users"][0].get("id","")
        return user_id

    @plog("User.delete")
    def delete(self):
        pass

    @plog("User.update")
    def update(self):
        pass

    @plog("User.get_project")
    def get_user_project(self,name):
        '''
        获取指定user所在的project
        :param name:
        :return:
        '''
        user_id = self.get_id_by_name(name)
        assert user_id != 1,"get user id faild"
        path = url_user_project.format(user_id=user_id)
        method = "GET"
        params = ""
        head = {"Content-Type": "application/json", "X-Auth-Token": self.admin_token}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        return ret

    plog("User.get_project_user")
    def get_project_user(self,project_id):
        '''
        获取指定project中的成员
        :return:返回结果中只有user的id，没有name
        '''
        path = url_project_member
        query_dict = {"role.id":self.role_id,"scope.project.id":project_id,"include_subtree":True}
        query_str = urllib.urlencode(query_dict)
        path = "%s?%s" % (path, query_str)
        method = "GET"
        params = ""
        head = {"Content-Type": "application/json", "X-Auth-Token": self.admin_token}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        return ret

    plog("User.project_user_add")
    def project_user_add(self,project_id,user_id):
        '''
        将user加入project中
        :return:
        '''
        path = url_project_user_action.format(project_id=project_id,user_id=user_id,role_id=self.role_id)
        method = "PUT"
        params = ""
        head = {"Content-Type": "application/json", "X-Auth-Token": self.admin_token}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        return ret

    plog("User.project_user_del")
    def project_user_del(self,project_id,user_id):
        '''
        将user从project中移除
        :return:
        '''
        path = url_project_user_action.format(project_id=project_id,user_id=user_id,role_id=self.role_id)
        method = "DELETE"
        params = ""
        head = {"Content-Type": "application/json", "X-Auth-Token": self.admin_token}
        ret = send_request(method, IP_keystone, PORT_keystone, path, params, head)
        return ret

    @plog("User.user_attach")
    def user_attach(self,project_id,user_add_list=None,user_del_list=None):
        '''
        1.判断新增用户是否存在，不存在则创建用户
        2.将新增用户加入project中(不需要判断是否已存在于project中)
        3.判断需要剔除的用户是否存在于project中，存在则剔除(不能直接剔除，否则会报错)
        :return:
        '''
        ret = 0
        user_list_tmp = self.list().get("users",[])
        user_list = {}
        map(lambda i:user_list.update({i["name"]:i["id"]}),user_list_tmp)
        if user_add_list:
            for user in user_add_list:
                if user not in user_list:
                    ret_tmp = self.create(user,project_id,self.password)
                    assert ret_tmp != 1,'create user faild'
                else:
                    ret_tmp = self.project_user_add(project_id,user_list[user])
                    assert ret_tmp != 1,"add user to project faild"
        if user_del_list:
            project_user_list = self.get_project_user(project_id)
            for user in user_del_list:
                if user in project_user_list:
                    ret_tmp = self.project_user_del(project_id,user_list[user])
                    assert ret_tmp != 1,"del user from project faild"
        return ret
