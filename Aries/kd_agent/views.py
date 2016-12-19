# encoding:utf-8
import json
import time
import logging
import traceback
import requests
import os
import codecs
import math

from django.http import StreamingHttpResponse
from datetime import datetime,timedelta

# 由于前面有 import time ，为了防止重名，因此这里改下名
from datetime import time as datetime_time

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.core.servers.basehttp import FileWrapper

from kd_agent.toolsmanager import RETU_INFO_SUCCESS,RETU_INFO_ERROR
from kd_agent.toolsmanager import generate_success,generate_failure
from kd_agent.toolsmanager import return_http_json
from kd_agent.toolsmanager import trans_return_json
from kd_agent.toolsmanager import K8sRequestManager as KRM
from kd_agent.toolsmanager import InfluxDBQueryStrManager as ISM

from kd_agent.models import ResourceUsageCache

kd_logger = logging.getLogger("kd_agent_log")


# 去掉时间字符串 2016-07-15T14:38:02Z 中的T、Z
def trans_time_str(time_str):
    return time_str[0:10] + ' ' + time_str[11:19]

def get_overview_k8s_pod_info(namespace):
    retu_data = { 'count':0, 'total':0 }
    pod_detail_info = KRM.get_pod_detail_info(namespace)
    if pod_detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_overview_k8s_pod_info query k8s pod data error : %s' % pod_detail_info['msg'] )
    else:
        total = len(pod_detail_info['data']['items'])
        count = 0
        for item in pod_detail_info['data']['items']:
            containerStatuses = item['status'].get('containerStatuses',[])

            is_all_container_running = True
            for cItem in containerStatuses:
                if cItem['state'].get( 'running' ) == None:
                    is_all_container_running = False
                    break

            count += 1 if is_all_container_running else 0

        retu_data['count'] = count
        retu_data['total'] = total
    return retu_data

def get_overview_k8s_service_info(namespace):
    retu_data = { 'count':0  }
    service_detail_info = KRM.get_service_detail_info( namespace )
    if service_detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_overview_k8s_service_info query k8s service data error : %s' % service_detail_info['msg'] )
    else:
        retu_data['count'] = len(service_detail_info['data']['items'])
    return retu_data

def get_overview_k8s_rc_info(namespace):
    retu_data = { 'count':0, 'total':0 }
    rc_detail_info = KRM.get_rc_detail_info( namespace )
    if rc_detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_overview_k8s_rc_info query k8s rc data error : %s' % rc_detail_info['msg'] )
    else:
        total = 0
        count = 0
        for item in rc_detail_info['data']['items']:
            total += item['spec']['replicas']
            count += item['status']['replicas']
        retu_data['count'] = count
        retu_data['total'] = total
    return retu_data

# node要从influxdb中获取数量，但是当前无法获取，因此该函数的实现暂时先搁置。
def get_overview_k8s_node_info():
    retu_data = { 'total':0,'count':0 }
    node_detail_data = KRM.get_node_detail_info()
    if node_detail_data['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_overview_k8s_node_info query k8s node data error : %s' % node_detail_data['msg'] )
    else:
        total = len(node_detail_data['data']['items'])
        count = 0
        for item in node_detail_data['data']['items']:
            for condition in item['status']['conditions']:
                if condition['type'] == 'Ready' and condition['status'] == 'True':
                    count += 1
                    break
        retu_data['count'] = count
        retu_data['total'] = total
    return retu_data

@csrf_exempt
@return_http_json
@trans_return_json
def get_k8soverview_info(request,namespace):
    pod = get_overview_k8s_pod_info(namespace) 
    rc = get_overview_k8s_rc_info(namespace)
    service = get_overview_k8s_service_info(namespace)
    node = get_overview_k8s_node_info()

    retu_data = {
        'k8sp_pod':{ 'lives':pod['count'],'dead':pod['total']-pod['count'] },
        'k8sp_rc':{ 'current':rc['count'],'desired':rc['total'] },
        'k8sp_service':{ 'count':service['count'] } ,
        'k8sp_nodes': { 'lives':node['count'],'dead':node['total']-node['count'] }
    }
    kd_logger.info( 'call get_overview_k8s_rc_info query k8s overview info : %s' % retu_data )
    return generate_success( data=retu_data )

@csrf_exempt
@return_http_json
@trans_return_json
def get_pod_list(request,namespace):
    kd_logger.info( 'call get_pod_list request.path : %s , namespace : %s' % (request.path,namespace) )
    pod_detail_info = KRM.get_pod_detail_info(namespace)
    if pod_detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_pod_list query k8s data error : %s' % pod_detail_info['msg'] )
        return generate_failure( pod_detail_info['msg'] )

    retu_data = []
    for item in pod_detail_info['data']['items']:
        record = {}
        retu_data.append(record)
        record['Name'] = item['metadata']['name']
        record['PodIP'] = item['status'].get('podIP','<None>')
        record['HostIP'] = item['status'].get('hostIP','<None>')
        record['CreationTime'] = trans_time_str(item['metadata']['creationTimestamp'])
        record['Node'] = item['spec'].get('nodeName','<None>')
        record['DetailInfoStrList'] = trans_obj_to_easy_dis(item)
        record['DetailInfoDict'] = item

        containerStatuses = item['status'].get('containerStatuses',[])
        total = len(containerStatuses)
        running = 0
        for cItem in containerStatuses:
            if cItem['state'].get( 'running' ) != None:
                running += 1
        record['Ready'] = '%s / %s' % ( running,total )

        if total == running:
            record['Status'] = 'Running'
        else:
            #TODO:此处需要测试
            statusArr = []
            for cItem in containerStatuses:
                statusArr.append( cItem['state'][ cItem['state'].keys()[0] ]['reason'] )   
            record['Status'] = '{ %s }' % str(',').join( set(statusArr) )

        restartCountArr = []
        for cItem in containerStatuses:
            restartCountArr.append( cItem['restartCount'] )
        record['Restarts'] = sum(restartCountArr)
    
    kd_logger.debug( 'call get_pod_list query k8s data : %s' % retu_data )
    kd_logger.info( 'call get_pod_list query k8s data successful' )
    return generate_success( data = retu_data )

@csrf_exempt
@return_http_json
@trans_return_json
def get_service_list(request,namespace):
    kd_logger.info( 'call get_service_list request.path : %s , namespace : %s' % (request.path,namespace) )
    service_detail_info = KRM.get_service_detail_info( namespace )
    if service_detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_service_list query k8s data error : %s' % service_detail_info['msg'] )
        return generate_failure( service_detail_info['msg'] )

    retu_data = []
    for item in service_detail_info['data']['items']:
        record = {}
        retu_data.append(record) 

        record['Name'] = item['metadata']['name']
        record['ClusterIP'] = item['spec']['clusterIP']
        record['ExternalIP'] = '<None-IP>'      #TODO:mini的测试暂时没有这个东西，这里暂时填充 <none-IP>
        record['CreationTime'] = trans_time_str( item['metadata']['creationTimestamp'] )
        record['DetailInfoStrList'] = trans_obj_to_easy_dis(item)
        record['DetailInfoDict'] = item

        ports_info_arr = []
        for cItem in item['spec']['ports']:
            ports_info_arr.append( '%s/%s' % ( cItem['port'],cItem['protocol'] ) )
        record['Ports'] = str(',').join(ports_info_arr)

        if not item['spec'].get('selector'):
            record['Selector'] = '<None>'
        else:
            selector_info_arr = []
            for k,v in item['spec']['selector'].iteritems():
                selector_info_arr.append( '%s=%s' % (k,v) )
            record['Selector'] = str(',').join( selector_info_arr )

    kd_logger.debug( 'call get_service_list query k8s data : %s' % retu_data )
    kd_logger.info( 'call get_service_list query k8s data successful' )
    return generate_success( data = retu_data )

@csrf_exempt
@return_http_json
@trans_return_json
def get_rc_list(request,namespace):
    kd_logger.info( 'call get_rc_list request.path : %s , namespace : %s' % (request.path,namespace) )
    rc_detail_info = KRM.get_rc_detail_info( namespace )
    if rc_detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_rc_list query k8s data error : %s' % rc_detail_info['msg'] )
        return generate_failure( rc_detail_info['msg'] )

    retu_data = []
    for item in rc_detail_info['data']['items']:
        record = {}
        retu_data.append(record) 

        record['Name'] = item['metadata']['name']
        record['Desired'] = item['spec']['replicas']
        record['Current'] = item['status']['replicas']      #TODO:Current暂时这样取值
        record['CreationTime'] = trans_time_str( item['metadata']['creationTimestamp'] )
        record['DetailInfoStrList'] = trans_obj_to_easy_dis(item)
        record['DetailInfoDict'] = item

        container_arr = []
        image_arr = []
        for cItem in item['spec']['template']['spec']['containers']:
            container_arr.append( cItem['name'] )
            image_arr.append( cItem['image'] )
        record['Containers'] = str(',').join( container_arr )
        record['Images'] = str(',').join( image_arr )
        
        if not item['spec'].get('selector'):
            record['Selector'] = '<None>'
        else:
            selector_info_arr = []
            for k,v in item['spec']['selector'].iteritems():
                selector_info_arr.append( '%s=%s' % (k,v) )
            record['Selector'] = str(',').join( selector_info_arr )
    
    kd_logger.debug( 'call get_rc_list query k8s data : %s' % retu_data )
    kd_logger.info( 'call get_rc_list query k8s data successful' )
    return generate_success( data = retu_data )

def get_ingress_detail_host_info( rules ):
    if type( rules ) != list:
        return []
    ingress_detail_host_info = []
    for r in rules:
        host = r.get('host')
        if host == None:
            continue
        
        try:    paths = r['http']['paths']
        except: paths = []
        for p in paths:
            obj = {
                'protocal':'http',
                'host':host,
                'port':p['backend']['servicePort'],
                'path':p['path']
            }
            obj['Url'] = '%s://%s:%s%s' % ( obj['protocal'],obj['host'],obj['port'],obj['path'] )
            obj['ServiceName'] = p['backend']['serviceName']
            
            ingress_detail_host_info.append( obj ) 
    return ingress_detail_host_info

@csrf_exempt
@return_http_json
@trans_return_json
def get_ingress_list(request,namespace):
    kd_logger.info( 'call get_ingress_list request.path : %s , namespace : %s' % (request.path,namespace) )
    ingress_detail_info = KRM.get_ingress_detail_info( namespace )
    if ingress_detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_ingress_list query k8s data error : %s' % ingress_detail_info['msg'] )
        return generate_failure( ingress_detail_info['msg'] )

    retu_data = []
    for item in ingress_detail_info['data']['items']:
        record = {}
        retu_data.append(record)
        record['Name'] = item['metadata']['name']

        try:    
            record['Ingress'] = []
            for ing in item['status']['loadBalancer']['ingress']:
                record['Ingress'].append( ing['ip'] )
        except: 
            record['Ingress'] = ['<None>']

        try:    record['Rules'] = get_ingress_detail_host_info( item['spec']['rules'] )
        except: record['Rules'] = []
         
        record['CreationTime'] = trans_time_str(item['metadata']['creationTimestamp'])
        record['DetailInfoStrList'] = trans_obj_to_easy_dis(item)
        record['DetailInfoDict'] = item
    
    kd_logger.debug( 'call get_ingress_list query k8s data : %s' % retu_data )
    kd_logger.info( 'call get_ingress_list query k8s data successful' )
    return generate_success( data = retu_data )

def trans_obj_to_easy_dis(obj_info):
    return json.dumps(obj_info, indent=1).split('\n')


def download_pod_json(request,namespace):
    pod_name = request.GET.get('podname')
    kd_logger.info( 'call download_pod_json namespace : %s, name : %s' % (namespace,pod_name) )
    return search_k8s_config_obj( 'pod',KRM.get_pod_detail_info,namespace,pod_name )

def download_service_json(request,namespace):
    service_name = request.GET.get('servicename')
    kd_logger.info( 'call download_service_json namespace : %s, name : %s' % (namespace,service_name) )
    return search_k8s_config_obj( 'service',KRM.get_service_detail_info,namespace,service_name )

def download_rc_json(request,namespace):
    rc_name = request.GET.get('rcname')
    kd_logger.info( 'call download_rc_json namespace : %s, name : %s' % (namespace,rc_name) )
    return search_k8s_config_obj( 'rc',KRM.get_rc_detail_info,namespace,rc_name )

def download_ingress_json(request,namespace):
    ingress_name = request.GET.get('ingressname')
    kd_logger.info( 'call download_ingress_json namespace : %s, name : %s' % (namespace,ingress_name) )
    return search_k8s_config_obj( 'ingress',KRM.get_ingress_detail_info,namespace,ingress_name )

# 严格意义上，search_k8s_config_obj 函数从以上四个 download_*_json 函数中提取出来是不合适的
# 但是因为它们的操作很统一，因此提取出来，以避免重复编码
def search_k8s_config_obj( key,func,namespace,name ):
    detail_info = func( namespace )
    if detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_%s_list query k8s data error : %s' % (key,detail_info['msg']) )
        return generate_failure( detail_info['msg'] )
    for item in detail_info['data']['items']:
        if item['metadata']['name'] == name:
            kd_logger.info( 'find %s with name : %s' % (key,name) )
            json_obj = {
                'metadata':item['metadata'],
                'spec':item['spec']
            }
            return download_k8s_config_json( json_obj,'%s_%s_%s.json' % (namespace,key,name) )
    
    s = 'cannot find %s with name : %s' % (key,name)
    kd_logger.error(s)
    return generate_failure( s )

def download_k8s_config_json( json_obj,file_name ):
    cur_dir = os.path.dirname(os.path.abspath(__file__))
    file_full_path = os.path.abspath(os.path.join( cur_dir,file_name ))

    with codecs.open(file_full_path,'wb','utf8') as fileObj:
        for line_text in trans_obj_to_easy_dis(json_obj):
            fileObj.write( line_text + '\n' )
    
    wrapper = FileWrapper(file(file_full_path))  
    response = StreamingHttpResponse(wrapper, content_type='text/csv')  
    response['Content-Disposition'] = 'attachment; filename="%s"' % file_name
    response['Content-Length'] = os.path.getsize(file_full_path)
    return response




@csrf_exempt
@return_http_json
@trans_return_json
def get_mytask_graph(request):
    kd_logger.info( 'call get_mytask_graph' )
    url = 'http://%s:%s/k8s/api/v1/namespaces/mytaskgraph'%(settings.BDMS_IP, settings.BDMS_PORT)  #任务运行网络图 rest api
    try:
        req = requests.Session()
        r = req.get(url)
        if r.status_code == 200:
            kd_logger.debug( 'get my task graph data success ')
            dic = json.loads(r.text)
            all_task = []
            data = {}
            nodes = []
            edges = []
            task_info = dic['task_info']
            task_process = []

            #处理节点数据及颜色信息
            for i in task_info:
                try:
                    id = "%s" %i["id"]
                    if dic['task_process'][id]['status'] == 1:
                        nodes.append({"id": id, "label": i["exec_txt"], "color": "#A9A9A9"})
                    if dic['task_process'][id]['status'] == 2:
                        nodes.append({"id": id, "label": i["exec_txt"], "color": "#2db7f5"})
                    if dic['task_process'][id]['status'] == 3:
                        nodes.append({"id": id, "label": i["exec_txt"], "color": "#0000FF"}) 
                    if dic['task_process'][id]['status'] == 4 and dic['task_process'][id]['result'] == 1:
                        nodes.append({"id": id, "label": i["exec_txt"], "color": "#87d068"})
                    if dic['task_process'][id]['status'] == 4 and dic['task_process'][id]['result'] == 2:
                        nodes.append({"id": id, "label": i["exec_txt"], "color": "#F50"})
                except Exception, e:
                    nodes.append({"id": id, "label": i["exec_txt"], "color": "#A9A9A9"})
            # 处理依赖关系
            for depen in dic['task_info']:
                if depen['input']:
                    for detal in depen['input']:
                        edges.append({"from": detal, "to": depen['id']})  
            data["nodes"] = nodes
            data["edges"] = edges
            return generate_success( data=data )
        else:
            kd_logger.error('get my tsk graph data error ')
            return generate_failure( 'get my tsk graph data error ' )
    except Exception, e:
        s = "get mytask graph data occured exception : %s" % str(e)
        kd_logger.error(s)
        return generate_failure(s)

def download(request):
    sys = request.GET.get('sys')
    def readfile(file_name, chunk_size=262144):
        with open(file_name) as f:
            while True:
                c = f.read(chunk_size)
                if c:
                    yield c
                else:
                    break
    osx_file = settings.KUBECTL_OSX
    linux_file = settings.KUBECTL_LINUX
    if sys == 'osx':
        response = StreamingHttpResponse(readfile(osx_file))
        response['Content-Type'] = 'application/octet-stream'
        response['Content-Disposition'] = 'attachment;filename="{0}"'.format(osx_file)
    elif sys == 'linux':
        response = StreamingHttpResponse(readfile(linux_file))
        response['Content-Type'] = 'application/octet-stream'
        response['Content-Disposition'] = 'attachment;filename="{0}"'.format(linux_file)
    else:
        kd_logger.error('Download Error')
    return response

@csrf_exempt
@return_http_json
@trans_return_json
def mytask_get_old_records(request):
    kd_logger.debug( 'call mytask_get_old_records : %s ' % request )
    oldestrecordid = int(request.POST.get('oldestrecordid'))
    requestnumber = int(request.POST.get('requestnumber'))
    keywords = json.loads(request.POST.get('keywords'))
    
    kd_logger.info('\n\n\nkeywords & type:%s\n%s\n\n'%( keywords, type(keywords) ))
    url = "http://%s:%s/k8s/api/v1/namespaces/mytasklist/getoldrecords/?oldestrecordid=%s&requestnumber=%s&keywords=%s" %( settings.BDMS_IP, settings.BDMS_PORT, oldestrecordid, requestnumber, keywords )
    r = requests.Session()
    req = r.get(url)
    return req.json()

@csrf_exempt
@return_http_json
@trans_return_json
def mytask_check_has_new_records(request):  
    newestrecordid = int(request.POST.get('newestrecordid'))
    keywords = json.loads(request.POST.get('keywords'))

    kd_logger.info('\n\n\nnewestrecordid & type: %s\n %s\n\n'%(newestrecordid, type(newestrecordid)))
    kd_logger.info('\n\n\nkeywords & type:%s\n%s\n\n'%( keywords, type(keywords) ))
    url = "http://%s:%s/k8s/api/v1/namespaces/mytasklist/checkhasnewrecords/?newestrecordid=%s&keywords=%s" %( settings.BDMS_IP, settings.BDMS_PORT, newestrecordid, keywords )
    r = requests.Session()
    req = r.get(url)
    return req.json()

@csrf_exempt
@return_http_json
@trans_return_json
def mytask_get_new_records(request):
    newestrecordid = int(request.POST.get('newestrecordid'))
    keywords = json.loads(request.POST.get('keywords'))

    url = "http://%s:%s/k8s/api/v1/namespaces/mytasklist/getnewrecords/?newestrecordid=%s&keywords=%s" %( settings.BDMS_IP, settings.BDMS_PORT, newestrecordid, keywords )
    r = requests.Session()
    req = r.get(url)
    return req.json()

@csrf_exempt
@return_http_json
@trans_return_json
def dashboard_taskinfo(request):
    url = "http://%s:%s/k8s/api/v1/dashboard/taskinfo" %( settings.BDMS_IP, settings.BDMS_PORT )
    r = requests.Session()
    req = r.get(url)
    return req.json()

def trans_struct_to_easy_dis( filter_data_dict,time_point_arr ):
    def map_timestamp_to_localtime( time_stamp ):
        return time.strftime( '%Y-%m-%d %H:%M:%S',time.localtime( time_stamp ) )
    retu_data = {
        'series':[],
        'xaxis':[]
    }

    for measurement,data_arr in filter_data_dict.items():
        series_obj = {
            'legend':ISM.get_measurement_disname_dict()[measurement],
            'data':[0] * len(time_point_arr),        # 有可能出现该namespce下面没有pod，因此没有数据的情况。将默认值设为0，即标识指标用量为0
            'hasvaliddata':True
        }
        for item in data_arr:
            # 如果某个数据点的time在time_point中，则将series['data']的相应位置置为数据点的值
            # 否则，什么都不做
            try:
                index = time_point_arr.index( item[0] )
                if item[1]:
                    series_obj['data'][index] = item[1]
            except:
                pass
        series_obj['hasvaliddata'] = (series_obj['data'].count(0) != len(series_obj['data']))
        
        retu_data['series'].append(series_obj)

    retu_data['xaxis'] = map( map_timestamp_to_localtime,time_point_arr )
    return retu_data

def execute_clusterinfo_request( data_dict,time_range ):
    # 由于influxdb数据库中记录的时间戳都是整分钟的，因此这里按照整分钟地来生成
    time_point_arr =[]
    for cur_time in range( time_range['time_start'],time_range['time_end']+1 ):
        if cur_time % 60 == 0:
            time_point_arr.append( cur_time )

    retu_obj = {}
    for m,influxdb_data_dict in data_dict.items():
        # 对获取到的influx数据进行筛选，只保留有用的数据
        retu_data = []
        if influxdb_data_dict['results'][0]:
            for item in influxdb_data_dict['results'][0]['series'][0]['values']:                
                retu_data.append( item )            # item是一个list，item[0]为时间戳，item[1]为value
        retu_obj[m] = retu_data
    return generate_success( data=trans_struct_to_easy_dis(retu_obj,time_point_arr) )

def generate_time_range( minutes ):
    time_end = int(time.time())
    time_start = time_end - int(minutes)*60
    return { 
        'time_start':time_start,
        'time_end':time_end,
    }


@csrf_exempt
@return_http_json
@trans_return_json
def get_namespace_cpu_info(request,namespace,minutes):
    time_range = generate_time_range( minutes )
    data_dict = {}
    for m in [ ISM.M_CPU_USAGE,ISM.M_CPU_LIMIT,ISM.M_CPU_REQUEST ]:
        retu_data = ISM.get_namespace_podsummary_data( 
            measurement=m,
            time_start=time_range['time_start'],
            time_end=time_range['time_end'],
            namespace=namespace 
        )
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict,time_range )

@csrf_exempt
@return_http_json
@trans_return_json
def get_namespace_memory_info(request,namespace,minutes):
    time_range = generate_time_range( minutes )
    data_dict = {}
    for m in [ ISM.M_MEMORY_USAGE,ISM.M_MEMORY_WORKINGSET,ISM.M_MEMORY_LIMIT,ISM.M_MEMORY_REQUEST ]:
        retu_data = ISM.get_namespace_podsummary_data( 
            measurement=m,
            time_start=time_range['time_start'],
            time_end=time_range['time_end'],
            namespace=namespace 
        )        
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict,time_range )

@csrf_exempt
@return_http_json
@trans_return_json
def get_namespace_network_info(request,namespace,minutes):
    time_range = generate_time_range( minutes )
    data_dict = {}
    for m in [ ISM.M_NETWORK_TRANSMIT,ISM.M_NETWORK_RECEIVE ]:
        retu_data = ISM.get_namespace_podsummary_data( 
            measurement=m,
            time_start=time_range['time_start'],
            time_end=time_range['time_end'],
            namespace=namespace 
        )
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict,time_range )

@csrf_exempt
@return_http_json
@trans_return_json
def get_namespace_filesystem_info(request,namespace,minutes):
    time_range = generate_time_range( minutes )
    data_dict = {}
    for m in [ ISM.M_FILESYSTEM_USAGE,ISM.M_FILESYSTEM_LIMIT ]:
        retu_data = ISM.get_namespace_podsummary_data( 
            measurement=m,
            time_start=time_range['time_start'],
            time_end=time_range['time_end'],
            namespace=namespace 
        )        
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict,time_range )

@csrf_exempt
@return_http_json
@trans_return_json
def get_poddetail_cpu_info(request,namespace,minutes):
    pod_name = request.GET.get('podname')
    time_range = generate_time_range( minutes )
    data_dict = {}
    for m in [ ISM.M_CPU_USAGE,ISM.M_CPU_LIMIT,ISM.M_CPU_REQUEST ]:
        retu_data = ISM.get_namespace_poddetail_data( 
            measurement=m,
            time_start=time_range['time_start'],
            time_end=time_range['time_end'],
            namespace=namespace,
            pod_name=pod_name
        )        
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict,time_range )


@csrf_exempt
@return_http_json
@trans_return_json
def get_poddetail_memory_info(request,namespace,minutes):
    pod_name = request.GET.get('podname')
    time_range = generate_time_range( minutes )
    data_dict = {}
    for m in [ ISM.M_MEMORY_USAGE,ISM.M_MEMORY_WORKINGSET,ISM.M_MEMORY_LIMIT,ISM.M_MEMORY_REQUEST ]:
        retu_data = ISM.get_namespace_poddetail_data( 
            measurement=m,
            time_start=time_range['time_start'],
            time_end=time_range['time_end'],
            namespace=namespace,
            pod_name=pod_name
        )        
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict,time_range )

@csrf_exempt
@return_http_json
@trans_return_json
def get_poddetail_network_info(request,namespace,minutes):
    pod_name = request.GET.get('podname')
    time_range = generate_time_range( minutes )
    data_dict = {}
    for m in [ ISM.M_NETWORK_TRANSMIT,ISM.M_NETWORK_RECEIVE ]:
        retu_data = ISM.get_namespace_poddetail_data( 
            measurement=m,
            time_start=time_range['time_start'],
            time_end=time_range['time_end'],
            namespace=namespace,
            pod_name=pod_name
        )        
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict,time_range )

@csrf_exempt
@return_http_json
@trans_return_json
def get_poddetail_filesystem_info(request,namespace,minutes):
    pod_name = request.GET.get('podname')
    time_range = generate_time_range( minutes )
    data_dict = {}
    for m in [ ISM.M_FILESYSTEM_USAGE,ISM.M_FILESYSTEM_LIMIT ]:
        retu_data = ISM.get_namespace_poddetail_data( 
            measurement=m,
            time_start=time_range['time_start'],
            time_end=time_range['time_end'],
            namespace=namespace,
            pod_name=pod_name
        )        
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict,time_range )


# 这里获取某个时间段内，cpu、memory相应指标的总和
def get_resource_usage_from_influxdb( start_date,end_date,namespace ):
    # 由于传入的时间是local time，而influxdb中保存的时间戳是 utc time，因此需要做一个简单的转换
    s_timestamp = int(time.mktime( start_date.timetuple() ))
    e_timestamp = int(time.mktime( end_date.timetuple() ))

    # 这里只计算CPU、Memory的
    measurements = [ ISM.M_CPU_USAGE,ISM.M_CPU_LIMIT,ISM.M_CPU_REQUEST ] + \
                   [ ISM.M_MEMORY_USAGE,ISM.M_MEMORY_LIMIT,ISM.M_MEMORY_REQUEST ]

    retu_obj = {}
    for m in measurements:
        retu_data = ISM.get_namespace_resourceusage_data( m,s_timestamp,e_timestamp,namespace )
        
        if retu_data['code'] != RETU_INFO_SUCCESS:
            return retu_data
        
        # 如果某个space下，influxdb返回的 results 为是空数组，则表明数据库中没有该筛选条件下的数据，因此置为0
        try:
            data_arr = [ item[1] if item[1] else 0   \
                         for item in retu_data['data']['results'][0]['series'][0]['values'] ]
            retu_obj[m] = sum(data_arr)
        except Exception as e:
            retu_obj[m] = 0
            
    return generate_success( data = retu_obj )


# 1. 检查mysql数据库中是否已经缓存了数据。如果有，则直接返回；如果没有，则现查
#    注意，如果 start_date 的年月日与今天的年月日相同，则直接查influxdb，而不存mysql缓存
# 2. get_resource_usage_from_influxdb 返回的值是相应指标的总和，即将1天内24×60个分钟的采样数据全部加起来；
#    但是计算使用量所需要的是1天内平均每分钟的指标值。之所以缓存的值也是总和，是为了防止浮点存储数据不一致的为题（ 0.1+0.2 == 0.3 返回False ）
def get_resource_usage_info( start_date,namespace ):
    # 保证 start_date 时分秒都为0
    start_date = datetime.combine( start_date,datetime_time() )
    end_date = start_date+timedelta(seconds=24*60*60)

    # 如果 start_date 与当前的年月日相同或者大，则直接查询influxdb并返回，且不缓存数据到mysql
    if start_date >= datetime.combine( datetime.now(),datetime_time() ):
        return get_resource_usage_from_influxdb( start_date,end_date,namespace )
    else:
        records = list(ResourceUsageCache.objects.filter( datetime=start_date,namespace=namespace ))
        if len(records) == 0:
            # 如果数据库中无缓存，则需要查询influxdb
            retu_data = get_resource_usage_from_influxdb( start_date,end_date,namespace )

            # 查询失败，则直接返回
            if retu_data['code'] != RETU_INFO_SUCCESS:
                return retu_data

            # 如果查询成功，但是缓存失败，也可以直接返回，而不做任何处理
            try:
                ResourceUsageCache.generate_obj_by_measurement_key( start_date,namespace,retu_data['data'] ).save()
            except:
                pass
            return retu_data
        else:
            return generate_success(data=records[0].to_measurement_keys())


@csrf_exempt
@return_http_json
@trans_return_json
def resource_usage(request,namespace):
    start_date_str = request.GET.get('startdate',datetime.now().strftime('%Y-%m-%d'))
    days = int(request.GET.get('days',1))

    # 从时间字符串初始化一个datetime对象
    start_date = datetime.strptime( start_date_str,'%Y-%m-%d' )

    retu_infos = []
    for index in range(days):
        s = start_date+timedelta(seconds=24*60*60)*index
        retu_data = get_resource_usage_info(s,namespace)
        
        if retu_data['code'] != RETU_INFO_SUCCESS:
            return retu_data

        data_obj = retu_data['data']

        # 将获取到的指标数据的总和在分钟上进行平均，得到每分钟的指标值
        measurements = [ ISM.M_CPU_USAGE,ISM.M_CPU_LIMIT,ISM.M_CPU_REQUEST ] + \
                       [ ISM.M_MEMORY_USAGE,ISM.M_MEMORY_LIMIT,ISM.M_MEMORY_REQUEST ]
        for m in measurements:
            data_obj[m] = data_obj[m]/(24*60)

        data_obj['usage'] = calc_virtual_machine_day( data_obj[ISM.M_CPU_USAGE],data_obj[ISM.M_MEMORY_USAGE] )
        data_obj['limit'] = calc_virtual_machine_day( data_obj[ISM.M_CPU_LIMIT],data_obj[ISM.M_MEMORY_LIMIT] )
        data_obj['request'] = calc_virtual_machine_day( data_obj[ISM.M_CPU_REQUEST],data_obj[ISM.M_MEMORY_REQUEST] )
        
        # date 是可以直接显示到页面上的日期（没有时分秒）
        retu_infos.append({
            'date':s.strftime('%Y-%m-%d'),
            'data':data_obj
        })
        
    return generate_success(data=retu_infos)

# u 多少个0.5VCPU   （1VCPU == cpu/1000 ，0.5VCPU是预设的值）
# v 多少个128MB内存  （ 128MB是预设的值 ）
# 计算公式为： u*0.025 + 0.003*v / (8*u)
# 同时，这个结果保留两位有效小数（0.01）（且直接进位）
# 即如果结果是 0.0212 则，应该显示 0.03
def calc_virtual_machine_day( cpu_value,memory_value ):
    u = cpu_value/1000/0.5
    v = memory_value/128/1024/1024
    try:
        v = u*0.025 + 0.003*v / (8*u)
    except:
        v = 0
    
    # 先放大100倍，然后向上取整。之后再缩小100倍。由于缩小之后，获取的数不会严格100倍，因此round一下
    # 如：
    # >>> 1.3/10000
    # 0.00013000000000000002
    return round( math.ceil(v/0.01)*0.01,2 )








