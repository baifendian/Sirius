# -*- coding: UTF-8 -*-

import traceback
import datetime
import logging
import os
import requests
import json

from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError

from kd_agent.toolsmanager import RETU_INFO_SUCCESS,RETU_INFO_ERROR
from kd_agent.toolsmanager import generate_success,generate_failure
from kd_agent.models import ResourceUsageDailyCache as RUDC
from kd_agent.models import NamespaceDepartmentRef as NDR
from kd_agent.models import ClusterUsagePushFailureRecords as CUPFR
from kd_agent.views import get_resource_usage_info


logger = logging.getLogger("kd_agent_pushclusterinfo_log")


# 将需要推送的数据的关键信息放到失败记录表中（ClusterUsagePushFailureRecords），之后再统一推送
def refresh_failure_record():
    date = datetime.datetime.combine( datetime.datetime.now(),datetime.time() )
    yesterday = date - datetime.timedelta(seconds=24*60*60)

    # 在数据库中插入记录，然后统一根据记录来往运维推送
    for record in NDR.objects.all():
        try:
            CUPFR( namespace=record,datetime=yesterday ).save()
            logger.debug( 'insert undo record(%s,%s) success' % (record.namespace,yesterday) )
        except IntegrityError:  # （主键重复的异常）如果数据库中已经存在了这条记录，则该异常可以直接忽略
            pass
        except:
            logger.error( 'insert undo record(%s,%s) failure : %s' % (record.namespace,yesterday,traceback.format_exc()) )

def get_push_url():
    return 'http://li.app/v1/om/source/Sirius/addSirius'

def push_data():
    for record in CUPFR.objects.all():
        try:
            namespace = record.namespace.namespace
            department = record.namespace.department

            # django存到mysql的datetime对象是不带有时区的，
            # # 因此这里为了方便处理，直接把不含时区的datetime对象转换为含有时区（本地时区）的datetime对象
            date = record.datetime+datetime.timedelta(seconds=8*60*60)
            date = datetime.datetime.strptime( date.strftime('%Y-%m-%d'),'%Y-%m-%d' )

            retu_data = push_identify_data(date,namespace,department)
            if retu_data['code'] == RETU_INFO_SUCCESS:
                record.delete()
                logger.debug('push_identify_data(%s,%s,%s) success' % (date,namespace,department))
            else:
                logger.error('push_identify_data(%s,%s,%s) failure : %s' % (date,namespace,department,retu_data['msg']))        
        except:
            logger.error( 'push_identify_data(%s,%s,%s) raise exception : %s' % (date,namespace,department,traceback.format_exc()) )

def push_identify_data(date,namespace,department):
    retu_data = get_resource_usage_info( date,namespace )
    if retu_data['code'] != RETU_INFO_SUCCESS:
        s = 'get_resource_usage_info(%s,%s) failure : %s' % (date,namespace,retu_data['msg'])
        return generate_failure( s )
    return push_http(date,department,retu_data['data']['request'])

'''
接口所接受的post数据的格式：
    usage:[{
        department:'基础研发部'   标识部门名称的字符串，可能是二级部门、一级部门、中心的名字
        date:'2016-12-01'        标识该记录是哪个时间段的数据统计汇总出来的（ 2016-12-01 00:00:00:000 至 2016-12-01 59:59:59:999 ）
        usage:'11.03'            标识该部门在这天的机器用量，单位是 机器/天
    },{
        ...
    }]

备注：接口支持一次性传输多条记录，但是我这里为了方便，每次只传输一条记录
'''
def push_http(date,department,usage):
    post_data = {
        'usage':[{
            'department':department,
            'date':date.strftime('%Y-%m-%d'),
            'usage':str(usage)
        }]
    }
    req = requests.post(get_push_url(), data=json.dumps(post_data))
    if req.status_code != requests.codes.ok:
        s = 'requests.post(%s,%s) return req.status_code is not requests.codes.ok' % \
            ( get_push_url(),json.dumps(post_data) )
        return generate_failure( s )

    retu_obj = req.json()
    if retu_obj['status'] == True:
        return generate_success()
    else:
        s = 'requests.post(%s,%s) return status is not True : %s' % ( get_push_url(),json.dumps(post_data),retu_obj )
        return generate_failure( s )


class Command(BaseCommand):
    help = 'Push k8s cluster usage to operation'

    # 由于该脚本执行的命令较为简单，因此不接受参数
    def add_arguments(self, parser):
        return None

    def handle(self, *args, **options):
        command_str = str(__file__)
        command_str = os.path.split(command_str)[1]
        command_str = os.path.splitext(command_str)[0]
        try:
            refresh_failure_record()
            push_data()
            logger.info( 'execute command %s success' % command_str )
        except:
            logger.error( 'execute command %s failure : \n%s' % (command_str,traceback.format_exc()) )
