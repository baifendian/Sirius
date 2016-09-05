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
import json

@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'hosts': reverse('hosts', request=request, format=format),
        'codis': reverse('codis', request=request, format=format),      
        'codislog': reverse('codis-log', request=request, format=format),      
        'allcodisinfo': reverse('allcodisinfo', request=request, format=format),      
        'rebalance': reverse('rebalance', request=request, format=format),      
        'proxyinfo': reverse('proxyinfo', request=request, format=format),      
        'serverinfo': reverse('serverinfo', request=request, format=format),      
    })


