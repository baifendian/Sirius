#encoding=utf8
from models import *
#from serializers import *
from django.db.models import Q
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import renderers
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
import logging
ac_logger = logging.getLogger("access_log")
from django.contrib.auth.models import User
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from user_auth.models import Account,Role,SpaceUserRole
from django import forms
from ldap_client import ldap_get_vaild
import json

def login(request):
    if  request.method=="POST":
        #username = request.POST.get("username")
        #password = request.POST.get("password")
        #user = ldap_get_vaild(username=username,passwd=password)
        #ac_logger.info(username)
        user = {"name":"admin","type":"1","cur_space":"test2"}
        username = "pan.lu"
        #if user:
        account_db = Account.objects.filter(name__exact = username)
        if not account_db:
            role_ = Role.objects.get(name="guest")
            ac_logger.info(role_)
            account_ = Account(name=user,password="111111",role=role_,is_active=1)
            account_.save()
            user_db = User.objects.filter(username__exact=username)
            if not user_db:
                user_ = User(username=user,password="111111")
                user_.save()
        user = json.dumps(user)
        return render_to_response('user_auth/index.html',locals())
    else:
        user = {}
        user = json.dumps(user)
        return render_to_response('user_auth/index.html',locals())

@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'spaces': reverse('space-list', request=request, format=format),
        'roles': reverse('role-list', request=request, format=format),      
    })


