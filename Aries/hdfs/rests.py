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
import json
from user_auth.tools import *
from service import *
class pathOp(APIView):
#    @print_request
    def get(self,request,path,format=None):
        op = request.GET.get("op","")
        try:
            result = OP_DICT.get("GET").get(op)(request,path)
        except Exception,e:
            ac_logger.error(e)
            result = {"code":"500","msg":"interval error"}
        return packageResponse(result)

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
            
