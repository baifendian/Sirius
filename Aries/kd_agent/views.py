# encoding:utf-8

import json
import time
import logging
import httplib
import traceback

from django.http import StreamingHttpResponse
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from django.shortcuts import render
from django.http import *
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from kd_agent.models import Schedule_Log
from kd_agent.models import Task
RETU_INFO_SUCCESS = 200
RETU_INFO_ERROR = 201

kd_logger = logging.getLogger("kd_agent_log")
kd_logger.setLevel( logging.DEBUG )




# 一个装饰器，将原函数返回的json封装成response对象
def return_http_json(func):
    def wrapper( *arg1,**arg2 ):
        try:
            retu_obj = func( *arg1,**arg2 )
            kd_logger.info( 'execute func %s success' % (func) )
        except Exception as reason:
            retu_obj = generate_failure( str(reason) )
            kd_logger.error( 'execute func %s failure : %s' % (func,str(reason)) )
            traceback.print_exc()

        obj = HttpResponse( json.dumps(retu_obj) )
        obj['Access-Control-Allow-Origin'] = '*'
        obj['Access-Control-Allow-Methods'] = 'GET,POST'
        obj['Access-Control-Allow-Headers'] = 'X-CSRFToken'
        obj['Content-Type'] = 'application/json'
        return obj
    return wrapper

def generate_retu_info( code,msg,**ext_info ):
    retu_data = { 'code':code,'msg':msg }
    for k in ext_info:
        retu_data[k] = ext_info[k]
    return retu_data

def generate_success(**ext_info):
    return generate_retu_info( RETU_INFO_SUCCESS,'',**ext_info )

def generate_failure( msg,**ext_info ):
    return generate_retu_info( RETU_INFO_ERROR,msg,**ext_info )

# 去掉时间字符串 2016-07-15T14:38:02Z 中的T、Z
def trans_time_str(time_str):
    return time_str[0:10] + ' ' + time_str[11:19]

# 根据原生的API获取k8s的数据
def get_k8s_data(url,params = {},timeout = 10 ):
    resp = None
    try:
        con = httplib.HTTPConnection(settings.K8S_IP, settings.K8S_PORT, timeout=timeout)
        con.request('GET', url, json.dumps(params, ensure_ascii=False))
        resp = con.getresponse()
        if not resp:
            s = 'get k8s data resp is not valid : %s' % resp
            kd_logger.error( s )
            return generate_failure( s )

        if resp.status == 200:
            s = resp.read()
            kd_logger.debug( 'get k8s data response : %s' % s )
            return generate_success( data = json.loads(s) )
        else:
            s = 'get k8s data status is not 200 : %s' % resp.status
            kd_logger.error( s )
            return generate_failure( s )
    except Exception, e:
        s = "get k8s data occured exception : %s" % str(e)
        kd_logger.error(s)
        return generate_failure( s )
    
def restore_k8s_path(p):
    return p.replace('/k8s','')


@csrf_exempt
@return_http_json
def get_overview_info(request,namespace):
    kd_logger.info( 'call get_overview_info request.path : %s , namespace : %s' % (request.path,namespace) )
    retu_dict = {
        'pod_used':0,
        'pod_total':100,
        'task_used':0,
        'task_total':100,
        'memory_used':0,
        'memory_total':100
    }

    # 获取pod个数
    url = '/api/v1/namespaces/%s/pods' % namespace
    pod_list = get_k8s_data( url )
    if pod_list['code'] == RETU_INFO_ERROR:
        kd_logger.error( 'call %s query k8s pod info error : %s' % ( url,pod_list['msg']) )
        return generate_failure( pod_list['msg'] )
    retu_dict['pod_used'] = len( pod_list['data']['items'] )

    return generate_success( data=retu_dict )


@csrf_exempt
@return_http_json
def get_pod_list(request,namespace):
    kd_logger.info( 'call get_pod_list request.path : %s , namespace : %s' % (request.path,namespace) )
    pod_detail_info = get_k8s_data( restore_k8s_path(request.path) )
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
def get_service_list(request,namespace):
    kd_logger.info( 'call get_service_list request.path : %s , namespace : %s' % (request.path,namespace) )
    service_detail_info = get_k8s_data( restore_k8s_path(request.path) )
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
def get_rc_list(request,namespace):
    kd_logger.info( 'call get_rc_list request.path : %s , namespace : %s' % (request.path,namespace) )
    rc_detail_info = get_k8s_data( restore_k8s_path(request.path) )
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

def trans_obj_to_easy_dis(obj_info):
    return json.dumps(obj_info, indent=1).split('\n')

'''
由于Pod、Service、RC的详情信息的展示方式暂时不确定，因此暂时使用最简单的json展示格式来展示
def __trans_obj_to_easy_dis(obj_info,head_str = 'obj'):
    
    将一个对象的所有属性转换成一种方便显示的方式，只支持dict、list这两种复合类型
    exam = { 'a':123,'b':[1,2,3] }
    将会被转换成：
    [
        'a = 123',
        'b[0] = 1',
        'b[1] = 2',
        'b[3] = 3'
    ]
    
    def trans_func( obj,head_str = 'obj' ):
        if isinstance( obj,dict ):
            temp = []
            for k in obj:
                temp += trans_func( obj[k],"%s['%s']" % ( head_str,str(k) ) )
            return temp
        elif isinstance( obj,list ):
            temp = []
            for i in range( len(obj) ):
                temp += trans_func( obj[i],head_str+str( '[%s]' % i ) )
            return temp
        else:
            return [ '%s = %s' % ( head_str,str(obj) ) ]
    retu_list = trans_func( obj_info,head_str )
    return retu_list
'''

@csrf_exempt
@return_http_json
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
            "Host":"172.24.2.114:10010",
            "Pragma":"no-cache",
            "Referer":"http://172.24.2.114:10010/ide/schedule/directedgraph/",
            "User-Agent":"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
            "X-Requested-With":"XMLHttpRequest"
            }
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
            for i in dic['task_info']:
                for j in dic['task_process']:
                    if i['exec_txt'] == dic['task_process'][j]['exec_txt'] and dic['task_process'][j]['result'] == 1:
                        nodes.append({"id": i["id"], "label": i["exec_txt"], "color": "#C2FABC"})
                    if i['exec_txt'] == dic['task_process'][j]['exec_txt'] and dic['task_process'][j]['result'] == 2:
                        nodes.append({"id": i["id"], "label": i["exec_txt"], "color": "#FF0000"})
            data["nodes"] = nodes
            data["edges"] = [{}]
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
def mytask_get_old_records(request):
    kd_logger.debug( 'call mytask_get_old_records : %s ' % request )
    oldestrecordid = int(request.POST.get('oldestrecordid'))
    requestnumber = int(request.POST.get('requestnumber'))
    keywords = json.loads(request.POST.get('keywords'))
    
    '''
    oldestrecordid = -1 
    requestnumber = 303 
    keywords = {
        'taskname': 'hyn',
        'shelltype': 'ALL', # HIVE SHELL SQOOP SPARK
        'executeresult': 'ALL', #  'ALL'、'INIT'、'SUCCESS'、'FAILURE'
        'startdate': '2015-08-10T00:00:00',  # 格式为 YYYY-MM-DDTHH:mm:SS 如：2016-02-03T04:05:46
        'enddate': '2016-08-30T23:59:59', 
    }'''

    convert_dict(keywords)
    retu_data = []
    if oldestrecordid == -1:
        oldestrecordid = 0xFFFFFFFFFFFFFFFFFF
    
    filtered_tasks = query_tasks(name=keywords['taskname'], scripttype=keywords['shelltype'] )
    info_dict = {}
    for task in filtered_tasks:
        info_dict[ task.id ] = task.name

    # 如果Task表中没有满足taskname、shelltype的双重约束，则直接返回空列表
    if filtered_tasks.count() == 0:
        return generate_success( data = {'records': []} )

    filtered_records = query_records( result=keywords['executeresult'],
                                      beginning_exec=keywords['startdate'],
                                      deadline_exec=keywords['enddate'],
                                      id=oldestrecordid,
                                      new=False )
    filtered_records = filtered_records.filter( task_id__in=filtered_tasks )
    filtered_records = filtered_records[0:requestnumber]
    for record in filtered_records:
        retu_data.append({
                'id':record.id,
                'job_name':record.query_name,
                'task_name':info_dict[record.task_id],
                'ready_time':format_datetime_obj(record.ready_time),
                'running_time':format_datetime_obj(record.running_time),
                'leave_time':format_datetime_obj(record.leave_time),
                'result':record.result,
                'status':trans_result_to_status(record.result)
            })
    return generate_success( data = {'records': retu_data} )


def format_datetime_obj(datetime_obj):
    if datetime_obj:
        return datetime_obj.strftime("%Y-%m-%d %H:%M:%S")
    else:
        return '<None>'

def trans_result_to_status(result):
    d = {
        0:'INIT',
        1:'SUCCESS',
        2:'FAILURE'
    }
    return d[result]

def query_records(result,beginning_exec,deadline_exec,id,new = False):
    QS = None
    if new == True:
        tmpq = Q(id__gt=id)
    else:
        tmpq = Q(id__lt=id)
    QS = QS & tmpq if QS else tmpq
    if result != '':
        tmpq = Q(result=result)
        QS = QS & tmpq if QS else tmpq

    tmpq = Q(ready_time__gte=beginning_exec,ready_time__lte=deadline_exec)
    QS = QS & tmpq if QS else tmpq
    if QS:
        return Schedule_Log.objects.using('kd_agent_bdms').filter(QS).order_by('-id')
    else:
        return Schedule_Log.objects.using('kd_agent_bdms').all().order_by('-id')

@csrf_exempt
@return_http_json
def mytask_check_has_new_records(request):  
    newestrecordid = int(request.POST.get('newestrecordid'))
    keywords = json.loads(request.POST.get('keywords'))
    '''
    newestrecordid = 494665 
    keywords = {
        'taskname': 'HDFSCheck',
        'shelltype': 'ALL', # ALL HIVE SHELL SQOOP SPARK
        'executeresult': 'ALL', #  'ALL'、'INIT'、'SUCCESS'、'FAILURE'
        'startdate': '2016-08-20T23:59:59',  # 格式为 YYYY-MM-DDTHH:mm:SS 如：2016-02-03T04:05:46
        'enddate': '2016-08-31T23:59:59', 
    }'''

    convert_dict(keywords)

    filtered_tasks = query_tasks(name=keywords['taskname'], scripttype=keywords['shelltype'] )
    info_dict = {}
    for task in filtered_tasks:
        info_dict[ task.id ] = task.name

    # 如果Task表中没有满足taskname、shelltype的双重约束，则直接返回空列表
    if filtered_tasks.count() == 0:
        return generate_success( data = {'hasnew': 0 } ) 

    filtered_records = query_records( result=keywords['executeresult'],
                                      beginning_exec=keywords['startdate'],
                                      deadline_exec=keywords['enddate'],
                                      id=newestrecordid,
                                      new=True )
    filtered_records = filtered_records.filter( task_id__in=filtered_tasks )
    return generate_success( data = {'hasnew': 0 if filtered_records.count() == 0 else 1 } )
 

@csrf_exempt
@return_http_json
def mytask_get_new_records(request):
    newestrecordid = int(request.POST.get('newestrecordid'))
    keywords = json.loads(request.POST.get('keywords'))
    '''
    newestrecordid = 494702  
    keywords = {
        'taskname': 'HDFSCheck',
        'shelltype': 'ALL', # ALL HIVE SHELL SQOOP SPARK
        'executeresult': 'ALL', #  'ALL'、'INIT'、'SUCCESS'、'FAILURE'
        'startdate': '2016-08-20T23:59:59',  # 格式为 YYYY-MM-DDTHH:mm:SS 如：2016-02-03T04:05:46
        'enddate': '2016-08-31T23:59:59', 
    }'''
    convert_dict(keywords)
    retu_data = []

    filtered_tasks = query_tasks(name=keywords['taskname'], scripttype=keywords['shelltype'] )
    info_dict = {}
    for task in filtered_tasks:
        info_dict[ task.id ] = task.name

    # 如果Task表中没有满足taskname、shelltype的双重约束，则直接返回空列表
    if filtered_tasks.count() == 0:
        return generate_success( data = {'records': []} )

    filtered_records = query_records( result=keywords['executeresult'],
                                      beginning_exec=keywords['startdate'],
                                      deadline_exec=keywords['enddate'],
                                      id=newestrecordid,
                                      new=True )
    filtered_records = filtered_records.filter( task_id__in=filtered_tasks )
    for record in filtered_records:
        retu_data.append({
                'id':record.id,
                'job_name':record.query_name,
                'task_name':info_dict[record.task_id],
                'ready_time':format_datetime_obj(record.ready_time),
                'running_time':format_datetime_obj(record.running_time),
                'leave_time':format_datetime_obj(record.leave_time),
                'result':record.result,
                'status':trans_result_to_status(record.result)
            })  
    return generate_success( data = {'records': retu_data} )


#查询脚本类型
#def get_scripttype(name):
#    try:
#        return ScriptType.objects.get(name=name).id
#    except :
#        return None

#根据条件查询任务
def query_tasks(name=None, name_op = 'contains', scripttype=None):#,status=None,owner=None,export_flag=None):
    QS = None
    if name and name.strip() != '':
        if name_op == '==':
            QS = QS & Q(name=name) if QS else Q(name=name)
        else :
            QS = QS & Q(name__icontains=name) if QS else Q(name__icontains=name)
    if scripttype:
        QS = QS & Q(scripttype=scripttype) if QS else Q(scripttype=scripttype)
    if QS:
        return Task.objects.using('kd_agent_bdms').filter(QS)
    else:
        return Task.objects.using('kd_agent_bdms').all()

def convert_dict(keywords):
    scripttype = {
        'ALL':0,
        'HIVE':1,
        'SQOOP':2,
        'SHELL':3,
        'SPARK':4
    }
    result = {
        'ALL':'',
        'INIT':0,
        'SUCCESS':1,
        'FAILURE':2
    }
    keywords['shelltype'] = scripttype[keywords['shelltype']]
    keywords['executeresult'] = result[keywords['executeresult']]
    keywords['startdate'] = datetime.strptime(keywords['startdate'], '%Y-%m-%dT%H:%M:%S')
    keywords['enddate'] = datetime.strptime(keywords['enddate'], '%Y-%m-%dT%H:%M:%S')
    return keywords
