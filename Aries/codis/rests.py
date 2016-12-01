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
import time
from hdfs.tools import *
import logging
import json,re,requests
from models import *
ac_logger = logging.getLogger("access_log")
codis_rest_url = settings.CODIS_REST_URL
opentsdb_url = settings.OPENTSDB_URL

def is_super(user_name):
    # 1 yes 0 no 2 error
    try:
        account = Account.objects.get(name=user_name)
        if account.role.name.upper() in ["ROOT","SUPERADMIN"]:
            return 1
        else:
            return 0
    except Exception,e:
        ac_logger.error("%s" %e)
        return 0

class HostInfo(APIView):
    '''
    获取所有host信息
    '''
    def get(self, request, format=None):
        issuper = is_super(getUser(request).username)
        request_data = requests.get(codis_rest_url+"/codis/hosts/")
        host_ret =  request_data.json()['data'] 
        result = {
            "code":200,
            "msg":"OK",
            "data":{'host_list':host_ret,'is_super':issuper}
        }
        return packageResponse(result) 

    '''
    添加host
    '''
    def post(self, request, format=None):
        hostip=request.POST.get("host_ip","")
        hostuser=request.POST.get("host_user","")
        hostpasswd= request.POST.get("password","")
        memtotal=int(request.POST.get("memory",""))
        codishome=request.POST.get("codis_home","")
        data = {"hostip":hostip,"hostuser":hostuser,"hostpasswd":hostpasswd,"memtotal":memtotal,"codishome":codishome}
        request_data = requests.post(codis_rest_url+"/codis/hosts/",json=data)
        result = request_data.json()
        return packageResponse(result) 

class CodisInfo(APIView):
    '''
        申请codis
    '''
    def post(self, request, format=None):
        product_id = request.POST.get('name')
        memory_size = int(request.POST.get('mem'))
        data = {"product_id":product_id,"memory_size":memory_size}
        request_data = requests.post(codis_rest_url+"/codis/codis/",json=data)
        result = request_data.json()
        return packageResponse(result) 
    
    '''
    查看codis列表
    '''
    def get(self, request, format=None):
        issuper = is_super(getUser(request).username)
        request_data = requests.get(codis_rest_url+"/codis/codis/")
        codis_ret = request_data.json()['data']
        result = {
            "code":200,
            "msg":"OK",
            "data":{"codis_list":codis_ret,"is_super":issuper}
        }
        return packageResponse(result)
 
    '''
    删除codis集群
    '''
    def delete(self,request,format=None):
        dict_1 = json.loads(request.data["data"])
        product_id = dict_1['product_id']
        data = {'product_id':product_id}
        request_data = requests.delete(codis_rest_url+"/codis/codis/",json=data)
        result = request_data.json()
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
            data = {"op":op, "product_id":product_id}
            requests.put(codis_rest_url+'/codis/codis/',json=data)
            result ={"code":200,"msg":"添加proxy申请已提交！"}
        elif op.upper() == "UPDATEPROXYADDR":
            product_id = dict_1["name"]
            new_addr = dict_1["new_addr"]
            data = {"op":op, "name":product_id, "new_addr":new_addr}
            requests.put(codis_rest_url+'/codis/codis/',json=data)
            result ={"code":200,"msg":"更新成功！"}
        else:
            product_id = dict_1["product_id"]
            requiremem = int(dict_1["alertmem"])
            data = {"op":op, "product_id":product_id, "requiremem":requiremem}
            requests.put(codis_rest_url+'/codis/codis/',json=data)
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
        data = {"product_id":product_id}
        request_data = requests.post(codis_rest_url+"/codis/codislog/",json=data)
        codislog = request_data.json()['data']
        result ={"code":200,"msg":"ok","data":codislog}
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
            result_list.sort(key=lambda k: (k.get('id', 0)))
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


class CodisOverview(APIView):
    '''
       获取概览信息
    '''
    def get(self, request, format=None):
        query_url = opentsdb_url + "/api/query/"
        host_list = Host.objects.all()
        allcodis_count = Codis.objects.all().count()
        badcodis_count = 0
        memory_used_count = 0
        memory_total_count = 0
        for host in host_list:
            memory_used_count += host.memory_used
            memory_total_count += host.memory_total
        badcodis_query_args = {"start":"6h-ago","end":"","queries":[{"metric":"codis.badcluster","aggregator": "sum",\
                               "tags":{"bad":"true"}}]}
        try:
            badcodis = requests.post(query_url,data=json.dumps(badcodis_query_args),timeout=10)
            for k,v in json.loads(badcodis.text)[0]['dps'].items():
                badcodis_count = v
                break
            data = {
                "codis_cluster": {
                    "lives": allcodis_count - badcodis_count,
                    "dead": badcodis_count,
                },
                "codis_memory": {
                    "used": memory_used_count,
                    "nonUsed": memory_total_count - memory_used_count,
                    "unit": "GB",
                }
            }
            result={
                "msg":"OK",
                "code":200,
                "data":data
            }
        except Exception, e:
            data = {
                "codis_cluster": {
                    "lives": allcodis_count - badcodis_count,
                    "dead": badcodis_count,
                },
                "codis_memory": {
                    "used": memory_used_count,
                    "nonUsed": memory_total_count - memory_used_count,
                    "unit": "GB",
                }
            }
            result = {
                "msg": "Error, error request from opentsdb",
                "code": 201,
                "data": data
            }
            ac_logger.error("Error, error request from opentsdb %s" % e)
        return packageResponse(result)
    


class GetAllCodisInfo(APIView):
    '''
       获取表信息 
    '''
    def post(self, request, format=None):
        codis_id = request.POST.get("codis_id")
        query_url = opentsdb_url + "/api/query/"
        codis_info = Codis.objects.get(codis_id=int(codis_id))
        ops_query_args = {"start":"6h-ago","end":"","queries":[{"aggregator": "sum","metric":"codis.pv.count","rate":"true",\
                     "downsample":"10m-avg","tags":{"db":codis_info.product_id}}]} 
        latency_query_args = {"start":"6h-ago","end":"","queries":[{"aggregator": "avg","metric":"codis.proxy.command.spent",\
                             "downsample":"10m-avg","tags":{"db":codis_info.product_id,"cmd":"*"}}]}
        total_expired_keys = {"start":"6h-ago","end":"","queries":[{"aggregator": "avg","metric":"codis.cluster.total_expired_keys",\
                             "downsample":"10m-avg","tags":{"db":codis_info.product_id}}]}
        total_keys = {"start":"6h-ago","end":"","queries":[{"aggregator": "avg","metric":"codis.cluster.total_keys",\
                             "downsample":"10m-avg","tags":{"db":codis_info.product_id}}]}
        total_usedmemory = {"start":"6h-ago","end":"","queries":[{"aggregator": "avg","metric":"codis.cluster.usedmemory",\
                             "downsample":"10m-avg","tags":{"db":codis_info.product_id}}]}
        total_maxmemory = {"start":"6h-ago","end":"","queries":[{"aggregator": "avg","metric":"codis.cluster.total_maxmemory",\
                             "downsample":"10m-avg","tags":{"db":codis_info.product_id}}]}
        latency_info = requests.post(query_url,data=json.dumps(latency_query_args),timeout=10)
        ops_info = requests.post(query_url,data=json.dumps(ops_query_args),timeout=10)
        expired_keys = requests.post(query_url,data=json.dumps(total_expired_keys),timeout=10)
        keys = requests.post(query_url,data=json.dumps(total_keys),timeout=10)
        usedmemory = requests.post(query_url,data=json.dumps(total_usedmemory),timeout=10)
        maxmemory = requests.post(query_url,data=json.dumps(total_maxmemory),timeout=10)
        opsdata = []
        latencydata = []
        expiredkeysdata = 1
        allkeysdata = 1
        usedmemorydata = 1
        maxmemorydata = 1
        dict_ops = json.loads(ops_info.text)[0]['dps']
        list_ops = sorted(dict_ops.items(),key=lambda d:d[0],reverse=False)
        for k,v in list_ops:
            a = {}
            timeStamp = int(k)
            timeArray = time.localtime(timeStamp)
            otherStyleTime = time.strftime("%Y-%m-%d %H:%M:%S", timeArray)
            a["ops"] = v
            a["date"] = otherStyleTime
            opsdata.append(a)
        count = 0
        for j in json.loads(latency_info.text):
            list_ops = sorted(j['dps'].items(),key=lambda d:d[0],reverse=False)
            for k,v in list_ops:
                timeArray = time.localtime(int(k))
                otherStyleTime = time.strftime("%Y-%m-%d %H:%M:%S", timeArray)
                if count == 0:
                    b = {}
                    b[j['tags']['cmd']] = v
                    b['date'] = otherStyleTime
                    latencydata.append(b)
                else:
                    for m in latencydata:
                        if m['date'] == otherStyleTime:
                            m[j['tags']['cmd']] = v
            count += 1
        for k,v in json.loads(expired_keys.text)[0]['dps'].items():
            expiredkeysdata = v
            break
        for k,v in json.loads(keys.text)[0]['dps'].items():
            allkeysdata = v
            break
        for k,v in json.loads(usedmemory.text)[0]['dps'].items():
            usedmemorydata = round(v/(1024*1024*1024),2)
            break
        for k,v in json.loads(maxmemory.text)[0]['dps'].items():
            maxmemorydata = round(v/(1024*1024*1024),2)
            break
        data={"ops":opsdata,"expiredkeysdata":expiredkeysdata,"allkeysdata":allkeysdata,"usedmemorydata":usedmemorydata,"maxmemorydata":maxmemorydata,"latency":latencydata}
        result={
            "msg":"OK",
            "code":200,
            "data":data
        } 
        return packageResponse(result) 

## restapi start from here
def packageResponse(result):
    response = HttpResponse(content_type='application/json')
    response.write(json.dumps(result))
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
    return response
