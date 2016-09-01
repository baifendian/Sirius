#!/usr/bin/python
# -*- coding:utf-8 -*-
from django.shortcuts import render,get_object_or_404,render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.template import loader,Context,RequestContext
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
import redis
import logging
import json,re,requests
from models import *
from service import *
ac_logger = logging.getLogger("access_log")


class HostInfo(APIView):
    '''
    获取所有host信息
    '''
    def get(self, request, format=None):
        ac_logger.info("host_list==========================")
        host_list = Host.objects.all().order_by('host_id') 
        host_ret = []
        for host in host_list:
            host_dict = {}
            host_dict['host_id'] = host.host_id
            host_dict['host_ip'] = host.host_ip
            host_dict['host_user'] = host.host_user
            host_dict['memory_total'] = host.memory_total
            host_dict['memort_used'] = host.memory_used
            host_dict['codis_home'] = host.codis_home
            host_ret.append(host_dict)
        result = {
            "code":200,
            "msg":"OK",
            "data":host_ret
        }
        return packageResponse(result) 

    '''
    添加host
    '''
    def post(self, request, format=None):
        ac_logger.info("host_add==========================")
        hostip=request.POST.get("host_ip","")
        hostuser=request.POST.get("host_user","")
        hostpasswd= request.POST.get("password","")
        memtotal=int(request.POST.get("memory",""))
        codishome=request.POST.get("codis_home","")
        ac_logger.info("host_add====%s %s %s %s %s" %(hostip,hostuser,hostpasswd,memtotal,codishome))
         
        host_list = Host.objects.filter(host_ip=hostip)
        if host_list:
            result = {
                "code":400,
                "msg":"ERROR:the host already exists"
            }
            return packageResponse(result) 
        #if CheckHost(hostip, hostuser):
        if True:
            host=Host(host_ip=hostip, host_user=hostuser, host_pass=hostpasswd, memory_total=memtotal, codis_home=codishome, memory_used=0)
            host.save()
            result = {
                "code":200,
                "msg":"OK"
            }
        else:
            result = {
                "code":400,
                "msg":"ERROR:check host error, please check ssh keys"
            }
        return packageResponse(result) 

class CodisInfo(APIView):
    '''
        申请codis
    '''
    def post(self, request, format=None):
        ac_logger.info("codis_add==========================")
        product_id = request.POST.get('name')
        memory_size = request.POST.get('mem')
        cc = Codis.objects.filter(product_id=product_id)
        if len(cc)>0:
            result = {
            "code":400,
            "msg":"product_id重名，请重新尝试"
            }
            return packageResponse(result) 
        codis=Codis(product_id=product_id,memory_total=int(memory_size))
        codis.save()  
        #t1=NewApply(product_id, memory_size, settings.CODIS_ZK_ADD,GetDashHost()[1:4])
        #t1.start()
        result = {
            "code":200,
            "msg":"OK"
        }
        return packageResponse(result) 
    
    '''
    查看codis列表
    '''
    def get(self, request, format=None):
        ac_logger.info("codis_get===========================")
        codis_list = Codis.objects.all().order_by('codis_id')
        codis_ret = []
        for one in codis_list:
            codis_dict = {}
            codis_dict['codis_id'] = one.codis_id
            codis_dict['product_id'] = one.product_id
            codis_dict['key_num'] = one.key_num
            codis_dict['memory_total'] = one.memory_total
            codis_dict['memory_used'] = one.memory_used
            codis_dict['memory_used_to_total'] = str(one.memory_used) + "/" + str(one.memory_total)
            codis_dict['dashboard_proxy_addr'] = one.dashboard_proxy_addr
            codis_dict['dashboard'] = one.dashboard_ip + ":" + str(one.dashboard_port)
            ac_logger.info("codis_get===========================%s" %codis_dict)
            codis_ret.append(codis_dict)
        result = {
            "code":200,
            "msg":"OK",
            "data":codis_ret
        }
        return packageResponse(result)
 
    '''
    删除codis集群
    '''
    def delete(self,request,format=None):
        ac_logger.info("codis_Delete==================%s" %request.data)
        dict_1 = json.loads(request.data["data"])
        product_id = dict_1['product_id']
        cc = Codis.objects.get(product_id=product_id)
        if cc:
            cc.delete()
            ac_logger.info("codis_Delete==================%s" %cc)
        else:
            result ={"code":400,"msg":"无法找到此codis！"}
            return packageResponse(result)
        #t1=DeleteCodisApply(codisinfo)
        #t1.start()
        result ={"code":200,"msg":"删除请求已经提交！"}
        return packageResponse(result)

    '''
    codis扩容以及添加proxy操作
    '''
    def put(self,request,format=None):
        data = request.data
        dict_1 = json.loads(data["data"])
        op = dict_1["op"]
        if op.upper() == "ADDPROXY":
            product_id = dict_1["product_id"]
            cc = Codis.objects.get(product_id=product_id)
            ac_logger.info("codis_addproxy============%s" %cc)
            if cc:
                ac_logger.info("codis_addproxy============%s" %cc)
            else:
                result ={"code":400,"msg":"无此codis集群！"}
                return packageResponse(result)
            #t1 = AddCodisProxyApply(codisinfo,settings.CODIS_ZK_ADDR)
            #t1.start()
            result ={"code":200,"msg":"添加proxy申请已提交！"}
        elif op.upper() == "UPDATEPROXYADDR":
            ac_logger.info("codis_UPDATEPROXYADDR==========================")
            product_id = dict_1["name"]
            new_addr = dict_1["new_addr"]
            cc = Codis.objects.get(product_id=product_id)
            cc.dashboard_proxy_addr = new_addr
            cc.save()
            result ={"code":200,"msg":"更新成功！"}
        else:
            ac_logger.info("codis_ALEARTMEM==========================")
            product_id = dict_1["product_id"]
            requiremem = long(dict_1["alertmem"])
            cc = Codis.objects.get(product_id=product_id)
            cc.memory_total += requiremem
            cc.save()
            #t1 = AlterMem(product_id,requiremem)
            #t1.start()
            result ={"code":200,"msg":"扩容请求已发送！"}
        return packageResponse(result)

    def options(self,request,format=None):
        result = {"code":200,"msg":"success"}
        return packageResponse(result)

class CodisLog(APIView):
    '''
        获取codis log信息
    '''
    def post(self, request, format=None):
        product_id = request.POST.get("product_id","")
        try:
            log=open(settings.CODIS_COMMOND_DIR+('command%s.log')%product_id,'a+')
            print settings.CODIS_COMMOND_DIR+('command%s.log')%product_id
            codislog=[]
            if log:
                for line in log:
                    codislog.append(line)
            log.close()
            result ={"code":200,"msg":"ok","data":codislog}
        except Exception as e:
            result ={"code":500,"msg":"error:无法获取log信息，请重新尝试！"}
               
        return packageResponse(result)



class ServerInfo(APIView):
    '''
    '''
    def post(self, request, format=None):
        codis_id = request.POST.get("codis_id")
        codis_info = Codis.objects.get(codis_id=int(codis_id))
        try:
            r = requests.get("http://%s:%s/api/server_groups"%(codis_info.dashboard_ip, str(codis_info.dashboard_port)))
            result_list = json.loads(r.text.encode('ascii'))
            for group in result_list:
                for server in group['servers']:
                    host=server['addr'].split(':')[0]
                    port=int(server['addr'].split(":")[1])
                    rediscli=redis.Redis(host=host, port=port)
                    redis_info = rediscli.info()
                    server['key_info'] = str(redis_info['db0'])
                    server['used_mem'] = redis_info['used_memory_human']
                    server['maxmemory'] = int(rediscli.config_get('maxmemory')['maxmemory'])/(1024*1024*1024)
            result = {
                "code":200,
                "msg":"OK",
                "data":result_list
            }
        except Exception, e:
            result = {
                "code":500,
                "msg":"Error"
            }
        finally:
            return packageResponse(result)



class ProxyInfo(APIView):
    '''
    '''
    def post(self, request, format=None):
        codis_id = request.POST.get("codis_id")
        codis_info = Codis.objects.get(codis_id=int(codis_id))
        r = requests.get("http://%s:%s/api/proxy/list"%(codis_info.dashboard_ip, str(codis_info.dashboard_port)))
        result_list = json.loads(r.text.encode('ascii'))
        result = {
            "code":200,
            "msg":"OK",
            "data":result_list
        }
        return packageResponse(result)

class DeleteProxy(APIView):
    '''
    '''
    def post(self, request, format=None):
        proxy_addr = request.POST.get("proxy_addr")
        proxy_info = proxy_addr.split(":")
        proxy = Proxy.objects.filter(proxy_ip=proxy_info[0],proxy_port=proxy_info[1])     
        if proxy:
            result = deletetheproxy(proxy[0])
        else:
            result = {
                "code":200,
                "msg":"OK",
                "data":"error,don't have this proxy"
            }
        return packageResponse(result)


class AutoReblanceApi(APIView):
    '''
        自动负载均衡
    '''
    def post(self, request, format=None):
        product_id = request.POST.get("product_id")
        codis_info = Codis.objects.get(product_id=product_id)
        try:
            r = requests.post("http://%s:%s/api/rebalance"%(codis_info.dashboard_ip, str(codis_info.dashboard_port)))
            result = eval(r.text.encode('ascii'))
            if result['msg']=="OK":
                result['code'] = 200
            else:
                result['code'] = 500
        except Exception, e:
            result = {
                "code":500,
                "msg":"Error"
            }
        finally:
            return packageResponse(result) 



class GetAllCodisInfo(APIView):
    '''
       获取表信息 
    '''
    def get(self, request, format=None):
        codis_id = request.GET.get("codis_id")
        query_url = settings.OPENTSDB_URL + "/api/query/"
        codis_info = Codis.objects.get(codis_id=int(codis_id))
        ops_query_args = {"start":"6h-ago","end":"","queries":[{"aggregator": "sum","metric":"codis.pv.count",\
                     "tags":{"db":codis_info.product_id}}]} 
        latency_query_args = {"start":"6h-ago","end":"","queries":[{"aggregator": "avg","metric":"codis.proxy.command.spent",\
                             "tags":{"db":codis_info.product_id,"cmd":"*"}}]}
        mem_query_args = {"start":"6h-ago","end":"","queries":[{"aggregator": "avg","metric":"codis.cluster.memory_used_ratio",\
                             "tags":{"db":codis_info.product_id}}]}
        keys_query_args = {"start":"6h-ago","end":"","queries":[{"aggregator": "avg","metric":"codis.cluster.expired_keys_ratio",\
                             "tags":{"db":codis_info.product_id}}]}
        latency_info = requests.post(query_url,data=json.dumps(latency_query_args),timeout=10)
        ops_info = requests.post(query_url,data=json.dumps(ops_query_args),timeout=10)
        mem_info = requests.post(query_url,data=json.dumps(mem_query_args),timeout=10)
        keys_info = requests.post(query_url,data=json.dumps(keys_query_args),timeout=10)
        print json.loads(latency_info.content)
        print json.loads(ops_info.content)
        print json.loads(mem_info.content)
        print json.loads(keys_info.content)
        pass

