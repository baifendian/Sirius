# -*- coding: UTF-8 -*-
'''
import datetime
from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class ScriptType(models.Model):
#    """脚本类型表:hql、python、shell等
#    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=128)
    is_valid = models.BooleanField(default=True)

    class Meta:
        db_table = 'ide_scripttype'

class TaskType(models.Model):
    type_name = models.CharField(max_length=256, null=True, blank=True)
    is_valid = models.BooleanField(default=True)

    def __unicode__(self):
        return self.type_name

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=128)
    scripttype = models.ForeignKey(ScriptType)  # 任务类型，hql、python、shell等
    ins_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ide_task'

class Schedule_Status(models.Model):
    """任务调度状态表
    """
    SCHEDULE_WAITING = 1 # 等待调度
    SCHEDULE_EXECUTABLE = 2 # 等待执行
    SCHEDULE_EXECUTING = 3 # 执行中
    SCHEDULE_EXECUTED = 4 # 执行完成
    SCHEDULE_KILLING = 5 # 任务停止中
    
    schedule_status_choice = ((SCHEDULE_WAITING, '等待调度'),
                             (SCHEDULE_EXECUTABLE, '等待执行'),
                             (SCHEDULE_EXECUTING, '执行中'), 
                             (SCHEDULE_EXECUTED, '执行完成'),
                             (SCHEDULE_KILLING, '停止中'),)
    
    RESULT_INIT = 0 #初始
    RESULT_SUCCESS = 1 #成功
    RESULT_FAILED = 2 #失败
    RESULT_TERMINATE = 3 #终止
    RESULT_TIMEOUT = 4 #超时
    RESULT_DEAL = 5 #DEAL
    
    result_choice = ((RESULT_INIT, '初始'),
                 (RESULT_SUCCESS, '成功'),
                 (RESULT_FAILED, '失败'),
                 (RESULT_TERMINATE, '终止'),
                 (RESULT_TIMEOUT, '超时'),
                 (RESULT_DEAL, 'DEAL'),) 

    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task)
    query_name = models.CharField(max_length=128)
    status = models.IntegerField(choices=schedule_status_choice)
    result = models.IntegerField(choices=result_choice)
    
    ins_time = models.DateTimeField(null=True,auto_now=True)
    modify_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    ready_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    running_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    leave_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    kill_time = models.DateTimeField(null=True,blank=True)
    category = models.CharField(max_length=128)
    extends = models.CharField(max_length=256,null=True,blank=True)

    ONLINE_ENV = 0 #生产环境
    TESTING_ENV = 1 #测试环境
    env_choice = ((ONLINE_ENV, '生产环境'),
                 (TESTING_ENV, '测试环境'),
                 )
#     env = models.IntegerField(choices=env_choice)
    
    def __unicode__(self):
        return self.task.name

    class Meta:
        db_table = 'ide_schedule_status'

    def status_info(self):
        '''返回简单调度信息
        '''
        return {'status': self.status,
                'result': self.result,
                'query_name': self.query_name,
                }

class Schedule_Log(models.Model):
    """任务调度日志表
    """
    
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task)
    result = models.IntegerField(choices=Schedule_Status.result_choice)
    
    desc = models.CharField(null=True,max_length=256)
    
    exe_date = models.DateTimeField()
    
    ready_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    running_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    leave_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    kill_time = models.DateTimeField(null=True,blank=True)
    
    query_name = models.CharField(max_length=128)
    is_valid = models.CharField(max_length=128,default='Y')

    def execute_time(self):
        if self.result in (Schedule_Status.RESULT_FAILED,Schedule_Status.RESULT_SUCCESS):
            return self.leave_time-self.running_time
        else:
            return ""

    executetime = property(execute_time)
    
    def __unicode__(self):
        return self.task.name
    
    class Meta:
        db_table = 'ide_schedule_log'

class Schedule_Log_Test(models.Model):
    """任务调度日志表(测试环境)
    """
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task)
    result = models.IntegerField(choices=Schedule_Status.result_choice)
    
    desc = models.CharField(null=True,max_length=256)
    
    exe_date = models.DateTimeField()
    
    ready_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    running_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    leave_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
    kill_time = models.DateTimeField(null=True,blank=True)
    
    query_name = models.CharField(max_length=128)
    
    def __unicode__(self):
        return self.exe_date,self.task
 
    class Meta:
        db_table = 'ide_schedule_log_test'


'''
