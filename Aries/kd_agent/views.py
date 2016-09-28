# encoding:utf-8
import json
import time
import logging
import traceback
import requests

from django.http import StreamingHttpResponse
from datetime import datetime
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from kd_agent.toolsmanager import RETU_INFO_SUCCESS,RETU_INFO_ERROR
from kd_agent.toolsmanager import generate_success,generate_failure
from kd_agent.toolsmanager import return_http_json
from kd_agent.toolsmanager import trans_return_json
from kd_agent.toolsmanager import K8sRequestManager as KRM
from kd_agent.toolsmanager import InfluxDBQueryStrManager as ISM



kd_logger = logging.getLogger("kd_agent_log")
kd_logger.setLevel( logging.DEBUG )


# 去掉时间字符串 2016-07-15T14:38:02Z 中的T、Z
def trans_time_str(time_str):
    return time_str[0:10] + ' ' + time_str[11:19]

def get_overview_k8s_pod_info(namespace):
    retu_data = { 'count':0, 'total':0 }
    pod_detail_info = KRM.get_pod_detail_info(namespace)
    if pod_detail_info['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call get_overview_k8s_pod_info query k8s pod data error : %s' % pod_detail_info['msg'] )
    else:
        count = 0
        total = 0
        for item in pod_detail_info['data']['items']:
            containerStatuses = item['status']['containerStatuses']
            total += len(containerStatuses)
            for cItem in containerStatuses:
                if cItem['state'].get( 'running' ) != None:
                    count += 1
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
def get_overview_k8s_node_info(namespace):
    retu_data = { 'count':0 }
    return retu_data

@csrf_exempt
@return_http_json
@trans_return_json
def get_k8soverview_info(request,namespace):
    retu_data = {
        'pod': get_overview_k8s_pod_info(namespace) ,
        'rc': get_overview_k8s_rc_info(namespace),
        'service': get_overview_k8s_service_info(namespace),
        'node': get_overview_k8s_node_info(namespace)
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
        record['CreationTime'] = trans_time_str(item['metadata']['creationTimestamp'])
        record['Node'] = item['spec']['nodeName']
        record['DetailInfo'] = trans_obj_to_easy_dis(item)

        containerStatuses = item['status']['containerStatuses']
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
        record['DetailInfo'] = trans_obj_to_easy_dis(item)

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
        record['DetailInfo'] = trans_obj_to_easy_dis(item)

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
        record['DetailInfo'] = trans_obj_to_easy_dis(item)
    
    kd_logger.debug( 'call get_ingress_list query k8s data : %s' % retu_data )
    kd_logger.info( 'call get_ingress_list query k8s data successful' )
    return generate_success( data = retu_data )

def trans_obj_to_easy_dis(obj_info):
    return json.dumps(obj_info, indent=1).split('\n')

@csrf_exempt
@return_http_json
@trans_return_json
def get_mytask_graph(request):
    import requests
    kd_logger.info( 'call get_mytask_graph' )
    url1 = 'http://' + settings.BDMS_IP + ':' + settings.BDMS_PORT + '/accounts/login/'  #模拟登陆BDMS
    url2 = 'http://' + settings.BDMS_IP + ':' + settings.BDMS_PORT + '/ide/schedule/directedgraphdata/?username=all&status=all&taskname=&env=0'  #任务运行网络图 rest api
    data={"username":settings.BDMS_USERNAME,"password": settings.BDMS_PASSWORD}
    headers = { "Accept":"*/*",
            "Accept-Encoding":"gzip, deflate, sdch",
            "Accept-Language":"zh-CN,zh;q=0.8",
            "Cache-Control":"no-cache",
            "Connection":"keep-alive",
            "Host":"",
            "Pragma":"no-cache",
            "Referer":"",
            "User-Agent":"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
            "X-Requested-With":"XMLHttpRequest"
            }
    headers["Host"] = settings.BDMS_IP + ":" + settings.BDMS_PORT
    headers["Referer"] = "http://" + settings.BDMS_IP + ":" + settings.BDMS_PORT + "/ide/schedule/directedgraph/"
    try:
        req = requests.Session()
        r1 = req.post(url1, data=data, headers=headers)
        r2 = req.get(url2)
        if r1.status_code and r2.status_code == 200:
            kd_logger.debug( 'get my task graph data success ')
            dic = eval(r2.text)
            all_task = []
            data = {}
            nodes = []
            edges = []
            #处理节点数据及颜色信息
            for i in dic['task_info']:
                for j in dic['task_process']:
                    if i['exec_txt'] == dic['task_process'][j]['exec_txt'] and dic['task_process'][j]['result'] == 1:  #执行完成(成功)
                        nodes.append({"id": i["id"], "label": i["exec_txt"], "color": "#87d068"})
                    if i['exec_txt'] == dic['task_process'][j]['exec_txt'] and dic['task_process'][j]['result'] == 2:  #执行完成(失败)
                        nodes.append({"id": i["id"], "label": i["exec_txt"], "color": "#F50"})
                    if i['exec_txt'] == dic['task_process'][j]['exec_txt'] and dic['task_process'][j]['status'] == 2:  #等待执行
                         nodes.append({"id": i["id"], "label": i["exec_txt"], "color": "#2db7f5"})
                    if i['exec_txt'] == dic['task_process'][j]['exec_txt'] and dic['task_process'][j]['status'] == 3:  #执行中
                         nodes.append({"id": i["id"], "label": i["exec_txt"], "color": "#0000FF"})
                    if i['exec_txt'] == dic['task_process'][j]['exec_txt'] and dic['task_process'][j]['status'] == 1:  #等待调度
                         nodes.append({"id": i["id"], "label": i["exec_txt"], "color": "#A9A9A9"})
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
    url = "http://" + settings.BDMS_IP + ":" + settings.BDMS_PORT + "/k8s/api/v1/namespaces/mytasklist/getoldrecords/?oldestrecordid=%s&requestnumber=%s&keywords=%s" %( oldestrecordid, requestnumber, keywords )
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
    url = "http://" + settings.BDMS_IP + ":" + settings.BDMS_PORT + "/k8s/api/v1/namespaces/mytasklist/checkhasnewrecords/?newestrecordid=%s&keywords=%s" %( newestrecordid, keywords )
    r = requests.Session()
    req = r.get(url)
    return req.json()

@csrf_exempt
@return_http_json
@trans_return_json
def mytask_get_new_records(request):
    newestrecordid = int(request.POST.get('newestrecordid'))
    keywords = json.loads(request.POST.get('keywords'))

    url = "http://" + settings.BDMS_IP + ":" + settings.BDMS_PORT + "/k8s/api/v1/namespaces/mytasklist/getnewrecords/?newestrecordid=%s&keywords=%s" %( newestrecordid, keywords )
    r = requests.Session()
    req = r.get(url)
    return req.json()

@csrf_exempt
@return_http_json
@trans_return_json
def dashboard_taskinfo(request):
    url = "http://" + settings.BDMS_IP + ":" + settings.BDMS_PORT + "/k8s/api/v1/dashboard/taskinfo"
    r = requests.Session()
    req = r.get(url)
    return req.json()

def filter_valid_data( influxdb_data_dict ):
    try:
        columns = influxdb_data_dict['results'][0]['series'][0]['columns']
        series_values = influxdb_data_dict['results'][0]['series'][0]['values']

        retu_data = []
        for item in series_values:
            # item是一个list，item[0]为时间戳，item[1]为value
            if item[1] != None:
                retu_data.append( item )
        return generate_success( data=retu_data )
    except Exception as reason:
        return generate_failure( traceback.format_exc() )

def trans_struct_to_easy_dis( filter_data_dict ):
    def map_timestamp_to_localtime( time_stamp ):
        return time.strftime( '%Y-%m-%d %H:%M:%S',time.localtime( time_stamp ) )    
    d = ISM.get_measurement_disname_dict()

    retu_data = {
        'series':[],
        'xaxis':[]
    }

    # 先把n条线数据的所有时间点都汇总起来，然后排序（避免出现某条线在某个时间点没有数据，被filter_valid_data筛掉的问题）
    time_points = set()
    for measurement,data_arr in filter_data_dict.items():
        for item in data_arr:
            time_points.add( item[0] )
    time_points = list(time_points)
    time_points.sort()

    for measurement,data_arr in filter_data_dict.items():
        series_obj = {
            'legend':d[measurement],
            'data':[None] * len(time_points)
        }
        for item in data_arr:
            # 如果某个数据点的time在time_point中，则将series['data']的相应位置置为数据点的值
            # 否则，什么都不做
            try:
                index = time_points.index( item[0] )
                series_obj['data'][index] = item[1]
            except:
                pass
        retu_data['series'].append(series_obj)
    
    retu_data['xaxis'] = map( map_timestamp_to_localtime,time_points )
    return retu_data

def execute_clusterinfo_request( data_dict ):
    retu_obj = {}
    for m,data in data_dict.items():
        # 对获取到的influx数据进行筛选，只保留有用的数据
        retu_data = filter_valid_data(data)
        if retu_data['code'] != RETU_INFO_SUCCESS:
            return generate_failure( retu_data['msg'] )
        retu_obj[m] = retu_data['data']
    return generate_success( data=trans_struct_to_easy_dis(retu_obj) )

@csrf_exempt
@return_http_json
@trans_return_json
def get_cluster_cpu_info(request,minutes):
    data_dict = {}
    for m in [ ISM.M_CPU_USAGE,ISM.M_CPU_LIMIT,ISM.M_CPU_REQUEST ]:
        retu_data = ISM.get_cluster_info_data( measurement=m,minutes = minutes,type_str=ISM.T_NODE )
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict )

@csrf_exempt
@return_http_json
@trans_return_json
def get_cluster_memory_info(request,minutes):
    data_dict = {}
    for m in [ ISM.M_MEMORY_USAGE,ISM.M_MEMORY_WORKINGSET,ISM.M_MEMORY_LIMIT,ISM.M_MEMORY_REQUEST ]:
        retu_data = ISM.get_cluster_info_data( measurement=m,minutes = minutes,type_str=ISM.T_NODE )
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict )

@csrf_exempt
@return_http_json
@trans_return_json
def get_cluster_network_info(request,minutes):
    data_dict = {}
    for m in [ ISM.M_NETWORK_TRANSMIT,ISM.M_NETWORK_RECEIVE ]:
        retu_data = ISM.get_cluster_info_data( measurement=m,minutes = minutes,type_str=ISM.T_POD )
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict )

@csrf_exempt
@return_http_json
@trans_return_json
def get_cluster_filesystem_info(request,minutes):
    data_dict = {}
    for m in [ ISM.M_FILESYSTEM_USAGE,ISM.M_FILESYSTEM_LIMIT ]:
        retu_data = ISM.get_cluster_info_data( measurement=m,minutes = minutes,type_str=ISM.T_NODE )
        if retu_data['code'] == RETU_INFO_SUCCESS:
            data_dict[m] = retu_data['data']
        else:
            return retu_data
    return execute_clusterinfo_request( data_dict )

