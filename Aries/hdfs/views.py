from django.shortcuts import render
from models import *
from django.db.models import Q
from django.http import HttpResponse
import logging
ac_logger = logging.getLogger("access_log")
ac_logger.setLevel(logging.DEBUG)
from django.shortcuts import render,render_to_response
from django import forms
import json
from django.http import HttpResponse
# Create your views here.
def first_hdfs(request,path):
    if request.method=="POST":
        ac_logger.debug(path)
        ac_logger.debug('POST')
    elif request.method=="GET":
        ac_logger.debug(path)
        ac_logger.debug('GET')
    else:
        pass
    return HttpResponse('ok')
