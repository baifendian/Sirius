# encoding:utf-8

import json
import time
import logging
import httplib
import traceback
import urllib

from django.conf import settings
from django.http import HttpResponse


kd_logger = logging.getLogger("kd_agent_log")
kd_logger.setLevel( logging.DEBUG )


# 用来包装从后端到前端的返回值
RETU_INFO_SUCCESS = 200
RETU_INFO_ERROR = 201

def generate_retu_info( code,msg,**ext_info ):
    retu_data = { 'code':code,'msg':msg }
    for k in ext_info:
        retu_data[k] = ext_info[k]
    return retu_data

def generate_success(**ext_info):
    return generate_retu_info( RETU_INFO_SUCCESS,'',**ext_info )

def generate_failure( msg,**ext_info ):
    return generate_retu_info( RETU_INFO_ERROR,msg,**ext_info )


# 一个装饰器，将原函数返回的json封装成response对象
def return_http_json(func):
    def http_json_wrapper( *arg1,**arg2 ):
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
    return http_json_wrapper

# 包装获取 k8s 信息的方法、url
class K8sRequestManager:
    @staticmethod
    def get_pod_detail_info( namespace,params={} ):
        url = '/api/v1/namespaces/%s/pods' % namespace
        return K8sRequestManager.get_k8s_data( url,params )

    @staticmethod
    def get_service_detail_info( namespace,params={} ):
        url = '/api/v1/namespaces/%s/services' % namespace    
        return K8sRequestManager.get_k8s_data( url,params )

    @staticmethod
    def get_rc_detail_info( namespace,params={} ):
        url = '/api/v1/namespaces/%s/replicationcontrollers' % namespace
        return K8sRequestManager.get_k8s_data( url,params )

    @staticmethod
    def get_ingress_detail_info( namespace,params={} ):
        url = '/apis/extensions/v1beta1/namespaces/%s/ingresses' % namespace
        return K8sRequestManager.get_k8s_data( url,params )

    # 根据原生的API获取k8s的数据
    @staticmethod
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




def generate_time_range( minutes ):
    time_end = int(time.time())
    time_start = time_end - int(minutes)*60
    return { 
        'time_start':'%ss' % time_start,
        'time_end':'%ss' % time_end,
    }

class InfluxDBQueryStrManager:
    TEMPLATE_STR = '''SELECT sum("value") FROM "{measurement}" 
                      WHERE "type" = '{type}' AND time > {time_start} and time < {time_end} 
                      GROUP BY time(1s) fill(null)'''

    M_CPU_USAGE = 'cpu/usage_rate'
    M_CPU_LIMIT = 'cpu/limit'
    M_CPU_REQUEST = 'cpu/request'

    M_MEMORY_USAGE = 'memory/usage'
    M_MEMORY_WORKINGSET = 'memory/working_set'
    M_MEMORY_LIMIT = 'memory/limit'
    M_MEMORY_REQUEST = 'memory/request'

    M_NETWORK_TRANSMIT = 'network/tx_rate'
    M_NETWORK_RECEIVE = 'network/rx_rate'

    M_FILESYSTEM_USAGE = 'filesystem/usage'
    M_FILESYSTEM_LIMIT = 'filesystem/limit'

    T_1H = '1h'
    T_6H = '6h'
    T_1D = '24h'

    T_NODE = 'node'
    T_POD = 'pod'

    @staticmethod
    def format_query_str(measurement,time_start ,time_end ,type = T_NODE):
        return InfluxDBQueryStrManager.TEMPLATE_STR.format( 
                measurement=measurement,
                time_start=time_start,
                time_end=time_end,
                type=type)

    @staticmethod
    def get_measurement_disname_dict():
        ISM = InfluxDBQueryStrManager
        return {
            ISM.M_CPU_USAGE:'Usage',
            ISM.M_CPU_LIMIT:'Limit',
            ISM.M_CPU_REQUEST:'Request',

            ISM.M_MEMORY_USAGE:'Usage',
            ISM.M_MEMORY_WORKINGSET:'Working Set',
            ISM.M_MEMORY_LIMIT:'Limit',
            ISM.M_MEMORY_REQUEST:'Request',

            ISM.M_NETWORK_TRANSMIT:'Transmit',
            ISM.M_NETWORK_RECEIVE:'Receive',

            ISM.M_FILESYSTEM_USAGE:'Usage',
            ISM.M_FILESYSTEM_LIMIT:'Limit'
        }
    
    @staticmethod
    def get_influxdb_data(sql_str,db = settings.INFLUXDB_DATABASE,epoch='s',timeout = 600 ):
        params = { 'q':sql_str, 'db':db, 'epoch':epoch }
        url_str = '/query?%s' % urllib.urlencode( params ) 
        resp = None
        try:
            con = httplib.HTTPConnection(settings.INFLUXDB_IP, settings.INFLUXDB_PORT, timeout=timeout)
            con.request('GET',url_str)
            resp = con.getresponse()
            if not resp:
                s = 'get inluxdb data resp is not valid : %s' % resp
                kd_logger.error( s )
                return generate_failure( s )

            if resp.status == 200:
                data = json.loads( resp.read() )
                kd_logger.debug( 'query influxdb data : %s' % data )
                
                if data['results'][0].get('error') == None:
                    kd_logger.info( 'get influxdb data success' )
                    return generate_success( data=data )
                else:
                    kd_logger.error( 'get influxdb data failure : %s' % data['results'][0]['error'] )
                    return generate_failure( data['results'][0]['error'] )
            else:
                s = 'get inluxdb data status is not 200 : %s' % resp.status
                kd_logger.error( s )
                return generate_failure( s )
        except Exception, e:
            s = "get inluxdb data occured exception : %s" % str(e)
            kd_logger.error( s )
            return generate_failure( s )
    
    @staticmethod
    def get_cluster_info_data( measurement,minutes,type_str = T_NODE ):
        kd_logger.info( 'call get_cluster_info_data with args : %s %s %s ' % (measurement,minutes,type_str) )
        try:
            time_range = generate_time_range(minutes)
            sql_str = InfluxDBQueryStrManager.format_query_str(
                            measurement=measurement,
                            time_start=time_range['time_start'],
                            time_end=time_range['time_end'],
                            type=type_str )
            kd_logger.info( 'generate sql_str : %s' % (sql_str) )

            retu_data = InfluxDBQueryStrManager.get_influxdb_data(sql_str=sql_str) 
            if retu_data['code'] == RETU_INFO_SUCCESS:
                kd_logger.debug( 'get influxdb data by sql_str return data : %s' % retu_data['data'] )
            else:
                kd_logger.error( 'get influxdb data by sql_str return error : %s' % retu_data['msg'] )
            return retu_data
        except Exception as reason:
            traceback_str = traceback.format_exc()
            kd_logger.error( traceback_str )
            return generate_failure( traceback_str )
