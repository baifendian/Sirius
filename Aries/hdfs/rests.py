#encoding=utf8
#email: pan.lu@baifendian.com
from django.http import HttpResponse
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework import renderers
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
from rest_framework import generics
import logging
ac_logger = logging.getLogger("access_log")
from django.contrib.auth.models import User
from django.shortcuts import render,render_to_response
from django.http import HttpResponseRedirect
from django.http import StreamingHttpResponse
import json
from user_auth.tools import *
from service import *
from django.views.decorators.csrf import ensure_csrf_cookie
class pathOp(APIView):
#   @print_request
    def get(self,request,path,format=None):
        op = request.GET.get("op","")
        #download return httpresponse
        if op.upper() != "DOWNLOAD":
            try:
                result = OP_DICT.get("GET").get(op)(request,path)
            except Exception,e:
                ac_logger.error(traceback.format_exc())
                result = {"code":"500","data":"interval error"}
            return packageResponse(result)
        else:
            result = OP_DICT.get("GET").get(op)(request,path)            
            filename = path.split("/")[-1]
            response = StreamingHttpResponse(result.iter_content(1024))
            response['Content-Type'] = 'application/octet-stream'
 	    response['Content-Disposition'] = 'attachment;filename="{0}"'.format(filename)
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
            return response

  #  @print_request
    def post(self,request,path,format=None):
        op = request.GET.get("op","")
        try:
            ac_logger.info("op:%s" %op)
            result = OP_DICT.get("POST").get(op)(request,path)
        except  Exception,e:
            ac_logger.error(traceback.format_exc())
            result = {"code":"500","msg":"interval error"}
        return packageResponse(result)
   
  #  @print_request
    def put(self,request,path,format=None):
        op = request.GET.get("op","")
        try:
            result = OP_DICT.get("PUT").get(op)(request,path)
        except  Exception,e:
            ac_logger.error(traceback.format_exc())
            result = {"code":"500","msg":"interval error"}
        return packageResponse(result)

    def options(self,request,path):
        ac_logger.info("optionas......")
        op = request.GET.get("op","")
        result = {"code":200,"msg":"options"}
        return packageResponse(result)

 #   @print_request
    def delete(self,request,path,format=None):
        op = request.GET.get("op","")
        try:
            result = OP_DICT.get("DELETE").get(op)(request,path)
        except  Exception,e:
            #ac_logger.error(e)
            ac_logger.error(traceback.format_exc())
            result = {"code":500,"msg":"interval error"}
        return packageResponse(result)

class share(APIView):
    def get(self,request,path):
        try:
            ac_logger.info("get......:%s" %path)
            result = showShare(request,path)
        except Exception,e:
            ac_logger.error(traceback.format_exc())
            result = {"code":500,"msg":"interval error"}
        return packageResponse(result)

class capacityRecovery(APIView):
    def options(self,request,path):
        ac_logger.info("optionas......")
        op = request.GET.get("op","")
        result = {"code":200,"msg":"interval error"}
        return packageResponse(result)
#    @print_request
    def delete(self,request,space_name,format=None):
        op = "CAPACITYRECOVERY"
        try:
            result = OP_DICT.get("DELETE").get(op)(request,path)
        except  Exception,e:
            ac_logger.error(traceback.format_exc())
            result = {"code":"500","msg":"interval error"}
        return packageResponse(result)

class HostState(APIView):
    '''
    主机健康状态
    '''
    def get(self, request, format=None):
        result = HostStateGET(request)
        return packageResponse(result)

class Relation(APIView):
    '''
    各机器上组件的状态
    '''
    def get(self, request, host_name, format=None):
        result = RelationGET(request, host_name)
        return packageResponse(result)


class OperateService(APIView):
    '''
    '''
    def post(self, request, format=None):
        command = request.GET.get('command')
        params = request.GET.get('params')
        result = OperateServicePOST(request, command, params)
        return packageResponse(result)

class OperateComponent(APIView):
    def post(self, request, host_name, component_name, operate, format=None):
        if operate == 'RESTART':
            result = OperateComponentPOST(request, host_name, component_name, operate)
        elif operate == 'START' or operate == 'STOP':
            result = OperateComponentPUT(request, host_name, component_name, operate)
        else:
            ac_logger.error('operate error')
        return packageResponse(result)
@ensure_csrf_cookie
def upload(request,path):
    '''
       文件上传暂时不过django rest frame work 这个框架
    '''
    try:
        result = OP_DICT.get("POST").get("UPLOAD")(request,path)
    except Exception,e:
        ac_logger.error(traceback.format_exc())
        result = {"code":"500","msg":"interval error"}
    return packageResponse(result)
