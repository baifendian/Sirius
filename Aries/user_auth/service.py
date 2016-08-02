#encoding=utf8
#email: pan.lu@baifendian.com
from models import *
from django.db.models import Q
from rest_framework import status
from Aries.settings import REST_BASE_URI
import logging
from django.http import HttpResponse
import json
ac_logger = logging.getLogger("access_log")
from tools import *
StatusCode={"GET_SUCCESS":200,
             "GET_FAILED":500,
             "PUT_SUCCESS":200,
             "PUT_FAILED":"500",
             "POST_SUCCESS":200,
             "POST_FAILED":"500"   
            }


def packageResponse(result):
    response = HttpResponse(content_type='application/json')
    response.write(json.dumps(result))
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
    return response

#spaceList
def spaceListGet(request):
    result={}
    url = "{0}/v1/user_auth/spaces/info/{1}/"
    url_member="{0}/v1/user_auth/spaces/member/{1}/"
    accounts = getObjByAttr(Account,"name",getUser(request).username)
    default_space=0
    space_name = request.GET.get("filter","");
    if accounts:
        result["code"]=StatusCode["GET_SUCCESS"]
        spaceUserRoles=SpaceUserRole.objects.filter(user=accounts)
        if space_name:
            #get space
            spaces = getObjByAttr(Space,"name",space_name)
            if spaces:
                data = {"space_id":spaces[0].id,"space_name":spaces[0].name}
            else:
                result["code"]=StatusCode["GET_FAILED"]
        else:
            data=[]
            for spaceUserRole in spaceUserRoles:
                sur_dict = {}
                sur_dict["space_id"]=spaceUserRole.space.id
                sur_dict["space_name"]=spaceUserRole.space.name
                sur_dict["href_info"] = url.format(REST_BASE_URI,spaceUserRole.space.id)
                sur_dict["href_members"] = url_member.format(REST_BASE_URI,spaceUserRole.space.id)
                data.append(sur_dict)
        result["data"] = data
    else:
        result["code"]=StatusCode["GET_FAILED"]
        result["data"] = "user %s is not exist" %getUser(request).username
        
    return result

def spaceListPost(request,id):
    result = {}
    data = request.data
    user = getUser(request)
    result["code"]=200
    result["data"]="operator success!"
    ac_logger.info("data: %s" %data)
    return result

#spaceMember
def spaceMemberGet(request,pk):
    space_id = pk
    is_admin = isAdmin(getUser(request).username,space_id)
    pk = request.GET.get("inspace","1")
    space_user_role = SpaceUserRole.objects.filter(space__id__exact = space_id)
    ac_logger.info(space_user_role)
    accounts_space = []
    user_list = []
    no_user_list = []
    result = {}
    for one in space_user_role:
        accounts_space.append(one.user)
    #if pk == "0":
    #不属于space的用户
    accounts = Account.objects.filter(~Q(role__name__exact="superAdmin") & ~Q(role__name__exact="root"))
    ac_logger.info(accounts)
    accounts = list((set(accounts)) - set(accounts_space))
    for one in accounts:
        one_dict = {}
        one_dict["id"] = one.id
        one_dict["user_id"] = one.id
        one_dict["user_name"] = one.name
        no_user_list.append(one_dict)
    #else:
    #属于space的用户
    for one in space_user_role:
        one_dict = {}
        one_dict["id"] = one.id
        one_dict["user_id"] = one.user.id
        one_dict["user_name"] = one.user.name
        one_dict["role_id"] = one.role.id
        one_dict["role_name"] = one.role.name
        user_list.append(one_dict)
    data={}
    ac_logger.info("pk-----%s" %pk)
    if pk=="0":
        data["totalList"] = no_user_list  
    elif pk=="1":
	data["totalList"] = user_list
    elif pk=="2":
        ac_logger.info("############")
        #将存在和不存在的用户分类返回
        data["totalList"] = {"no_user_list":no_user_list,"user_list":user_list}

    result["code"] = StatusCode["GET_SUCCESS"]
    result["msg"]="OK"
    data["is_admin"] = is_admin
    data["currentPage"] = 1
    data["totalPageNum"] = 500
    result["data"] = data
    return result
       

def spaceMemberPost(request,pk):
    '''
       add Member or delete Member
    '''
    result = {}
    space_id = pk
    data = request.data
    try:
        space = getObjById(Space,space_id)
        result["code"] = StatusCode["POST_SUCCESS"]
        result["msg"] = "OK"
        result["data"] = "add success!"
    except ExcegetObjByIdption,e:
        result["code"] = StatusCode["POST_FAILED"]
        result["msg"]  = "space id(%s) not exist." %space_id
        result["data"] = "add failed"
    spaceUserRoles = SpaceUserRole.objects.filter(space=space).values("user")
    oldUser = [u["user"] for u in spaceUserRoles]
    data_list = data.get("key")
    newUser = eval(data_list)
    newUser2=[]
    for one in newUser:
        newUser2.append(int(one))
    #deleteUser = list(set(oldUser).difference(set(newUser)))
    #deleteSpaceUserRoles = SpaceUserRole.objects.filter(user__id__in=deleteUser,space=space)
    #deleteSpaceUserRoles.delete()
    deleteUser = list((set(oldUser)) - set(newUser2))
    addUser = list((set(newUser2)) - set(oldUser))
    role_name = "spaceViewer"
    role = getObjByAttr(Role,"name",role_name)[0]
    for uid in addUser:
        try:
            user = getObjById(Account,uid)  
            spaceUserRole = SpaceUserRole(user=user,
                                          role=role,
                                          space=space,)
            spaceUserRole.save()
            result["code"]=200
            result["data"]="operator success!"
        except Exception,e:
            ac_logger.error("%s" %e)
            result["code"] = StatusCode["POST_FAILED"]
            result["data"] = "%s" %e
    for uid in deleteUser:
        deleteSpaceUserRoles = SpaceUserRole.objects.filter(user__id=uid,space=space)
        deleteSpaceUserRoles.delete()  
    return result   
 
def spaceMemberPut(request,pk):
    '''
       update Member. 全量更新
    '''
    result = {}
    data = request.data.get("key")
    data = eval(data)
    ac_logger.info("###################################data:%s,%s" %(data,pk))
    if data:
        for i in data:
            user_id = i["user_id"]
            role_id = i["role_id"]
            ac_logger.info("###################################user_id:%s,%s" %(user_id,role_id))
            saveOrUpdateSpaeceUserRole(user_id,pk,role_id)
    result["code"] = StatusCode["PUT_SUCCESS"]
    result["data"] = "OK"
    return result

#roleList
def roleListGET(request):
    result = {}
    #默认查询所有的 0:superAdmin以下 1:全部
    isAdmin = request.GET.get("isadmin","0")
    if isAdmin == "0":
        roles = Role.objects.filter(name__in=["spaceAdmin","spaceDev","spaceViewer","guest"])
    else:
        roles = getObjAll(Role)
    result["code"] = StatusCode["GET_SUCCESS"]
    #result["msg"]  = "OK"
    data = []
    for role in roles:
        r = {}
        r["role_id"] = role.id
        r["role_name"] = role.name
        data.append(r)
    result["data"] = data
    return result

#spaceInfo
def spaceInfoGet(request,pk):
    result ={}
    space_id = pk
    is_admin = isAdmin(getUser(request).username,space_id)
    result["code"] = StatusCode["GET_SUCCESS"]
    result["msg"] = "OK"
    if is_admin == 2:
        result["code"] = StatusCode["GET_FAILED"]
        result["msg"] = "interval error"
        is_admin = 0
    data={}
    data["is_admin"] = is_admin
    monitor = {}
    data["monitor"] = monitor
    result["data"] = data
    return result

def userListPut(request,space):
    user = getUser(request)
    result = {}
    try:
        account = getObjByAttr(Account,"name",user.username)[0]
        account.cur_space = space
        account.save()
        result["code"] = 200
        result["data"] = "put success"
    except Exception,e:
        ac_logger.error(e)
        result["code"] = 500
        result["data"] = "put failed"
    return result

def user2Account(user):
    return getObjByAttr(Account,"name",user.username)[0]

def saveOrUpdateSpaeceUserRole(user_id,space_id,role_id):
    '''
       user_id and space_id 存在更新,不存在插入.
    '''
    account = getObjById(Account,user_id)
    space = getObjById(Space,space_id)
    role = getObjById(Role,role_id)
    try:
        spaceUserRole = SpaceUserRole.objects.get(space=space,user=account)
        spaceUserRole.role = role
    except Exception,e:
        ac_logger.error("%s" %e)
        spaceUserRole = SpaceUserRole(space=space,user=account,role=role)
    spaceUserRole.save()
     

def isAdmin(user_name,space_id):
    # 1 yes 0 no 2 error
    try:
        #user__name__exact
        user_name ="pan.lu"
        spaceUserRole = SpaceUserRole.objects.get(user__name__exact=user_name,space__id__exact=space_id)
        role_name = spaceUserRole.role.name
        if role_name.lower() == "spaceadmin":
            return 1
        else:
            return 0
    except Exception,e:
        ac_logger.error("%s" %e)
        return 0

def updateObjById(obj,dic):
    '''
       将dic中的key,value更新到obj的name中. 不包含外建对象的情况
    '''
    for k,v in dic.items():
        if hasattr(obj,k):
            attr_value = getattr(obj,k)
            #如果两个变量的类型相同则直接赋值
            if type(attr_value) == type(v):
                ac_logger.info("k: %s, v: %s" %(k,v))
                setattr(obj,k,v)
            else:
                cla = type(attr_value)
                ac_logger.info("k: %s, v:%s " %(k,v))
                setattr(obj,k,getObjById(cla,v))
        else:
            ac_logger.warn("attr: %s is not exist!" %k)
    
    obj.save()
    return status.HTTP_201_CREATED

