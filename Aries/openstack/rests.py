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
from common import json_data
from openstack.middleware.vm.vm import Vm_manage, Vm_control
from openstack.middleware.volume.volume import Volume, Volume_attach, Volume_snaps


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
    def get(self,request,format=None):
        name=request.GET.get('name')
        ret=Methods.get('GET').get(name)(request)
        return packageResponse(ret)

class overview(APIView):
    def get(self,request,format=None):
        ret={}
        host_count=0
        image_count=0
        login()
        vm_manage=Vm_manage()
        volume=Volume()
        image=Image()
        vm_list=vm_manage.list_detail()
        volume_list=volume.list()
        #print vm_list,volume_list,imgage_list
        for i in image.list_detail()["images"]:
            if len(i['metadata']) > 0:
                try:
                    if i['metadata']['image_type'] == "snapshot":
                        continue
                except:
                    image_count = image_count + 1
            else:
                image_count=image_count+1
        volume_len=len(volume_list['volumes'])
        vm_len=len(vm_list['servers'])
        for host in vm_list['servers']:
            if host['status'] == 'ACTIVE':
                host_count = host_count+1
        vm=('%s/%s') %(host_count,vm_len)
        ret['vm']=vm
        ret['image']=image_count
        ret['volume']=volume_len
        ret = json_data(ret)
        return packageResponse(ret)
