#encoding=utf8
import logging
ac_logger = logging.getLogger("access_log")
from django.contrib.auth.models import User
from django.contrib.auth import login as auth_login,logout as auth_logout,authenticate
from django.shortcuts import render_to_response
import json
from django.http import HttpResponse
from user_auth.models import *
from ldap_client import ldap_get_vaild
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings

def is_admin(account,cur_space_in):
    is_supper = 0
    if cur_space_in:
        cur_space_1 =  Space.objects.filter(name=cur_space_in)
        if cur_space_1:
            cur_space = cur_space_in
        else:
            cur_space = ""
    else: 
        cur_space = cur_space_in
    flag = True
    if account.role.name.upper() in ["SUPERADMIN","ROOT"]:
        is_admin =1
        is_supper = 1
        if not cur_space:
            spaces = Space.objects.all()
            if spaces:
                account.cur_space = spaces[0].name
                account.save()
                cur_space = account.cur_space
            else:
                flag = False
    else:
        is_admin = 0
        if cur_space:
            spaceUserRole = SpaceUserRole.objects.filter(user=account,space=Space.objects.get(name=cur_space))
            if len(spaceUserRole) == 1:
                if spaceUserRole[0].role.name.upper() in ["SPACEADMIN"]:
                    is_admin =1
            else:
                flag = False
        else:
            spaceUserRole = SpaceUserRole.objects.filter(user=account)
            if spaceUserRole:
                if spaceUserRole[0].role.name.upper() in ["SPACEADMIN"]:
                    is_admin = 1
                account.cur_space=spaceUserRole[0].space.name
                account.save()
                cur_space = account.cur_space
            else:
                flag = False
    if flag:
        return {"name":account.name,"cur_space":cur_space,"type":is_admin,"is_supper":is_supper}
    else:
        return {"cur_space":"","type":0,"is_supper":is_supper}

#@ensure_csrf_cookie
def login(request):
    if request.method == "POST":
        res = {}
        username = request.POST.get("username")
        password = request.POST.get("password")
        email = username + "@baifendian.com"
        ldap_user = ldap_get_vaild(username=username,passwd=password)
        if ldap_user:
            user = authenticate(username=username, password=password)
            if not user:
                userAdd=User.objects.create_user(username, email, password)  
                userAdd.is_active=True  
                userAdd.save
                user = authenticate(username=username, password=password)
            if user:
                auth_login(request, user)
                account_list = Account.objects.filter(name=username)
                if len(account_list) == 1:
                    account = account_list[0]
                    data = is_admin(account,account.cur_space)
                else:
                    if len(account_list) >1:
                        for one in account_list[1:]:
                            one.delete()
                        data = is_admin(account_list[0],account_list[0].cur_space)
                    else:
                        account = Account(name=username,email=email,is_active=1)
                        account.role = Role.objects.get(name="guest")
                        account.save()
                        data = is_admin(account,account.cur_space)
                ac_logger.info("user:{0}".format(data))
                res["code"] = 200
                res["data"] = data
            else:
                res["code"] = 500
                res["data"] = "username or password is error"
            response = HttpResponse(content_type='application/json')
            response.write(json.dumps(res))
            #response.set_cookie('csrftoken',request.COOKIES.get('csrftoken',"S6ouKsk1kRrp5qsHlmd5fupVJewYitW3"))
            response.set_cookie('csrftoken',"S6ouKsk1kRrp5qsHlmd5fupVJewYitW3")
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
            return response
        else:
            res["code"] = 500
            res["data"] = "username or password is error"
            response = HttpResponse(content_type='application/json')
            response.write(json.dumps(res))
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
            return response
    else:
        user = request.user
        ac_logger.info("----------------user:%s" %user)
        if user:
            username = user.username
            try:
                account = Account.objects.get(name=username)
                user = is_admin(account,account.cur_space)
                #if not account.cur_space:
                #    spaceUserRole = SpaceUserRole.objects.filter(user=account)
                #    account.cur_space=spaceUserRole[0].space.name
                #    account.save()
                #user = {"name":username,"type":1,"cur_space":account.cur_space}
            except Exception,e:
                ac_logger.error(e)
                user = ""
        else:
            user = ""
        user = json.dumps(user)
        ac_logger.info("##########user:%s" %user)   
        response =  render_to_response('index/index.html',locals())
        # set default cookie value
        #response.set_cookie('csrftoken',request.COOKIES.get('csrftoken','S6ouKsk1kRrp5qsHlmd5fupVJewYitW3'))
        response.set_cookie('csrftoken',"S6ouKsk1kRrp5qsHlmd5fupVJewYitW3")
        return response

#@ensure_csrf_cookie
def logout(request):
    result = {}
    try:
        auth_logout(request)
        result["code"] = 200
        result["data"] = "logout success."
    except Exception,e:
        ac_logger.error(e)
        result["code"] = 500
        result["data"] = "logout failed."
    response = HttpResponse(content_type='application/json')
    response.write(json.dumps(result))
    response.set_cookie('csrftoken',"S6ouKsk1kRrp5qsHlmd5fupVJewYitW3")
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
    return response

@ensure_csrf_cookie
def index(request):
    ac_logger.info("######################cookie: {0}#######".format(request.COOKIES.get('csrftoken')))
    #save cur_space
    user = request.user
    cur_space = request.GET.get("cur_space","")
    if user:
        username = user.username
        try:
            account = Account.objects.get(name=username)
            user = is_admin(account,cur_space)
        except Exception,e:
            ac_logger.error(e)
            user = ""
    else:
        user = ""
    user = json.dumps(user)
    return render_to_response('index/index.html',locals())

def permission_check(request):
    from django.contrib import admin
    from django.conf.urls import patterns,url,include
    import urls
    admin.autodiscover()
    if request.META.has_key('HTTP_X_FORWARDED_FOR'):
        ip =  request.META['HTTP_X_FORWARDED_FOR']
    else:
        ip = request.META['REMOTE_ADDR']
    whitelist = settings.WHITELIST_IP
    temp = False
    for i in whitelist:
        #ac_logger.error('\n\n\n ip is :\n %s \n\n\n'%ip)
        #ac_logger.error('\n\n\n whitelist ip is :\n %s \n\n\n'%i)
        if ip.startswith(i):
            temp = True
            break
    if temp:
        urls.urlpatterns[0] = url(r'^admin/', include(admin.site.urls))
    else:
        return HttpResponse('<h2>Permission Forbidden!</h2>')