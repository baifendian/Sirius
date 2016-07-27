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

def login(request):
    ac_logger.info("######################login#######")
    if request.method == "POST":
        res = {}
        username = "pan.lu"
        password = "pan.lu"
        user = authenticate(username=username, password=password)
        if user:
            auth_login(request, user)
            account = Account.objects.get(name=username)
            cur_space = account.cur_space
            if not cur_space:
                spaceUserRole = SpaceUserRole.objects.filter(user=account)[0]
                account.cur_space=spaceUserRole.space.name
                account.save()     
            res["code"] = 200
            res["data"] = {"name":username,"type":"1","cur_space":cur_space}
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
    user = request.user
    if user:
        username = user.username
        account = Account.objects.get(name=username)
        user = {"name":username,"type":1,"cur_space":account.cur_space}
    else:
        user = ""
    user = json.dumps(user)
    return render_to_response('index/index.html',locals())
