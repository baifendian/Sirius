#encoding=utf8
from django.db.models import Q
import logging
ac_logger = logging.getLogger("access_log")
from django.contrib.auth.models import User
from django.contrib.auth import login as auth_login,logout as auth_logout,authenticate
from django import forms
from django.shortcuts import render,render_to_response,redirect
import json
from django.http import HttpResponse
from user_auth.models import *
from ldap_client import ldap_get_vaild

def login(request):
    ac_logger.info("######################login#######")
    if request.method == "POST":
        res = {}
        username = request.POST.get("username")
        password = request.POST.get("password")
        email = username + "@baifendian.com"
        #username = "pan.lu"
        #password = "pan.lu"
        ldap_user = ldap_get_vaild(username=username,passwd=password)
        if ldap_user:
            ac_logger.info("######################login####### %s" %ldap_user)
            user = authenticate(username=username, password=password)
            if not user:
                userAdd=User.objects.create_user(username,email,password)  
                userAdd.is_active=True  
                userAdd.save
                user = authenticate(username=username, password=password)
            is_admin = "0"
            cur_space = ""
            if user:
                ac_logger.info("######################user %s" %user)
                auth_login(request, user)
                account = Account.objects.filter(name=username)
                ac_logger.info("######################logindddddddddd %s" %account)
                if not account:
                    account = Account(name=username,password=password,email=email,is_active=1)
                    account.role = Role.objects.get(name="guest")
                    account.save()   
                else:  
                    spaceUserRole = SpaceUserRole.objects.filter(user=account)
                    if spaceUserRole:
                        ac_logger.info("################### %s" %spaceUserRole)
                        if SpaceUserRole[0].role.name == "spacedev" or SpaceUserRole[0].role.name ==  "spaceviewer" or SpaceUserRole[0].role.name == "guest":
                            is_admin = 0
                        else:
                            is_admin = 1
                        account[0].cur_space=spaceUserRole.space.name
                        account[0].save()   
                        cur_space = account.cur_space
                res["code"] = 200
                res["data"] = {"name":username,"type":is_admin,"cur_space":cur_space}
            else:
                res["code"] = 500
                res["data"] = "username or password is error"
            response = HttpResponse(content_type='application/json')
            response.write(json.dumps(res))
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
                user = {"name":username,"type":1,"cur_space":account.cur_space}
            except Exception,e:
                ac_logger.error(e)
                user = ""
        else:
            user = ""
        user = json.dumps(user)
        ac_logger.info("##########user:%s" %user)   
        return render_to_response('index/index.html',locals())

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
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
    return response

def index(request):
    #save cur_space
    user = request.user
    cur_space = request.GET.get("cur_space","")
    if user:
        username = user.username
        try:
            account = Account.objects.get(name=username)
            if not cur_space:
                cur_space = account.cur_space
            user = {"name":username,"type":1,"cur_space":cur_space}
        except Exception,e:
            ac_logger.error(e)
            user = ""
    else:
        user = ""
    user = json.dumps(user)
    return render_to_response('index/index.html',locals())
