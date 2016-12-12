# -*- coding:utf-8 -*-
from django.shortcuts import render, get_object_or_404, render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.template import loader, Context, RequestContext
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework import renderers
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
from rest_framework import generics
from django.conf import settings
import json
from service import *
from openstack.middleware.image.image import Image
from common import *
from openstack.middleware.vm.vm import Vm_manage, Vm_control
from openstack.middleware.volume.volume import Volume, Volume_attach, Volume_snaps


class instances(APIView):
    def get(self,request,format=None):
        method = request.GET.get('name')
        ret = Methods.get('GET').get(method)(request)
        return packageResponse(ret)

    def post(self,request,format=None):
        method = request.POST.get('method')
        ret = Methods.get('POST').get(method)(request)
        return packageResponse(ret)

class volumes(APIView):
    def get(self, request, format=None):
        method = request.GET.get('name')
        ret = Methods.get('GET').get(method)(request)
        return packageResponse(ret)

    def post(self, request, format=None):
        method = request.POST.get('method')
        ret = Methods.get('POST').get(method)(request)
        return packageResponse(ret)


class project(APIView):
    def get(self, request, format=None):
        ret = openstack_project(request)
        return packageResponse(ret)


class search(APIView):
    def get(self, request, format=None):
        name = request.GET.get('name')
        ret = Methods.get('GET').get(name)(request)
        return packageResponse(ret)

class monitor(APIView):
    def get(self,request,format=None):
        name = request.GET.get('name')
        vm_name=request.GET.get('id')
        ret = Methods.get('GET').get(name)(request,vm_name)
        return  packageResponse(ret)


class overview(APIView):
    def get(self, request, format=None):
        ret = {'openstack_vm':{"lives":0,"dead":0},'openstack_image':0,'openstack_disk':0}
        login(request)
        username = request.user.username
        total,running = num_get_vm(request,username)
        ret['openstack_vm']['lives'] = running
        ret['openstack_vm']['dead'] = total - running
        ret['openstack_image'] = num_get_image(request,username)
        ret['openstack_disk'] = num_get_volume(request,username)
        ret = json_data(ret)
        return packageResponse(ret)


