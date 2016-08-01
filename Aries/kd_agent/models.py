# -*- coding: UTF-8 -*-
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
#    
#    def __unicode__(self):
#        return self.name
#    class Meta:
#        permissions=(
#        ("show_ddl","查看数据管理"),
#        ("show_ide","查看数据开发"),
#        ("show_deploy","查看生产部署"),
#        ("show_schedule","查看任务运行网络图"),
#        ("show_connect_list","查看资源管理"),
#        ("show_hbaseshell","查看HBase终端"),
#        ("show_ftp_download","查看ftp下载"),
#        ("show_result_download","查看数据结果下载"),
#        ("show_queue_list","查看队列管理"),
#        ("show_statistic","查看统计分析"),
#        ("show_auth","判断是否有管理员权限"),
#    )
#
#class ExportType(models.Model):
#    """导出类型表
#    """
#    id = models.AutoField(primary_key=True)
#    type = models.CharField(max_length=30) #导出类型
#    is_valid = models.BooleanField(default=True)
#    
#    def __unicode__(self):
#        return self.type
#
##add by szw for download
#class DownLoadFile(models.Model):
#    """
#    """
#    id = models.AutoField(primary_key=True)
#    md5 = models.CharField(max_length=128) # 文件的md5
#    group_name = models.CharField(max_length=20) # 队列名
#    file_name = models.CharField(max_length=128) # 文件名
#    create_time = models.CharField(max_length=120) # 创建时间
#    deadline = models.CharField(max_length=120) # 截止时间
#    def to_json(self):
#        #return self.db_name
#        return {"id":self.id,
#                "md5":self.md5,
#                "group_name":self.group_name,
#                "file_name":self.file_name,
#                "create_time":self.create_time,
#                "deadline":self.deadline,
#               }
#
##add by szw for queue
#class Queue(models.Model):
#    """
#    """
#    id = models.AutoField(primary_key=True)
#    queue_name = models.CharField(max_length=128) # 队列名
#    queue_resource = models.IntegerField(default=10) # 队列资源百分比
#    perm_level = models.IntegerField(default=1) # 权限级别
#    def to_json(self):
#        #return self.db_name
#        return {"id":self.id,
#                "queue_name":self.queue_name,
#                "queue_resource":self.queue_resource,
#                "perm_level":self.perm_level,
#               }
#
##add by szw for queue
#class GroupProfile(models.Model):
#    id = models.AutoField(primary_key=True)
#    group = models.OneToOneField('auth.Group', unique=True)
#    url = models.CharField(max_length=100)
#    def to_json(self):
#        return {"id":self.id,
#                "group_id":self.group.id,
#                "group_name":self.group.name,
#                "url":self.url,
#                }
#                
##数据库连接管理
#class Db_Connect(models.Model):
#    """
#    """
#    id = models.AutoField(primary_key=True)
#    db_name = models.CharField(max_length=128) # 标识名
#    host = models.TextField(blank=True) #导出类型
#    port = models.CharField(max_length=10) #端口
#    uname = models.CharField(max_length=128) #用户名
#    password = models.CharField(max_length=128) #密码
#    db_type = models.CharField(max_length=10) # 数据库类型
#    operator_name = models.CharField(max_length=128) #操作用户
#    def to_json(self):
#        #return self.db_name
#        return {"id":self.id,
#                "db_name":self.db_name, 
#                "host":self.host,
#                "port":self.port,
#                "uname":self.uname,
#                "password":self.password,
#                "db_type":self.db_type,
#                "operator_name":self.operator_name,
#               }
#

class TaskType(models.Model):
    type_name = models.CharField(max_length=256, null=True, blank=True)
    is_valid = models.BooleanField(default=True)

    def __unicode__(self):
        return self.type_name


class Task(models.Model):
#    """任务表
#    """
#    DEPLOY_APP_REJECT = -1  # 审核未通过
#    DEPLOY_APP_DEV = 1  # 代码开发中
#    DEPLOY_APP_REVIEWING = 2  # 代码审核中
#    DEPLOY_APP_APPROVED = 3 # 审核通过
#    DEPLOY_APP_ON = 8  # 已上线
#    DEPLOY_APP_OFF = 9  # 已下线
#    task_status_choice = (
#        (DEPLOY_APP_REJECT, '审核未通过'),
#        (DEPLOY_APP_DEV, '开发中'),
#        (DEPLOY_APP_REVIEWING, '审核中'),
#        (DEPLOY_APP_APPROVED, '审核通过'),
#        (DEPLOY_APP_ON, '已上线'),
#        (DEPLOY_APP_OFF, '已下线'),
#    )
#    is_normal_choice = [('0', '否'),('1', '是')]
#    export_choice = [('0', '否'),('1', '是')]
#
#    is_task_retry_choice = [(0, '否'),(1, '是')]
#    task_retry_times_choice = [(1, '1次'),(2, '2次'),(3, '3次')]
#    task_retry_choice = [(5,'5分钟'),(15,'15分钟'),(30,'30分钟')]
#    
#    id = models.AutoField(primary_key=True)
#    name = models.CharField(max_length=128)
    scripttype = models.ForeignKey(ScriptType)  # 任务类型，hql、python、shell等
#    command = models.TextField(blank=True)
#    exec_auth = models.IntegerField(null=True,blank=True)
#    is_normal = models.BooleanField(default=False)
#    crontab = models.CharField(max_length=128, blank=True)
#    
#    # 后台使用字段开始
#    schedule_tag = models.CharField(max_length=32, null=True,blank=True)
#    schedule_tag_test = models.CharField(max_length=32, null=True,blank=True)
#    run_time = models.CharField(max_length=32, null=True,blank=True)
#    #后台使用字段结束
#
#    #add by szw for queue
#    queue_level = models.IntegerField(null=True,blank=True)
#    
#    priority = models.IntegerField(null=True,blank=True)
#    status = models.IntegerField(choices=task_status_choice, default=DEPLOY_APP_DEV)
#    exec_user = models.CharField(max_length=32, blank=True)
#    exec_hosts = models.CharField(max_length=256, blank=True)
#    exec_port = models.IntegerField(null=True,blank=True)
#    exec_param = models.CharField(max_length=256,blank=True)
#    
#    owner = models.ForeignKey(User) #任务的所有者、申请人
#    groupid = models.CharField(max_length=256,blank=True)
#
#    reviewer = models.ForeignKey(User, related_name='ide_task_reviewer', null=True, blank=True) #任务的审核人
#    ins_time = models.DateTimeField(auto_now=True)
#    modify_time = models.DateTimeField(auto_now=True)
#    is_valid = models.CharField(max_length=128,default='Y')
#    parent_id = models.CharField(max_length=1024,blank=True)
#    alarmtime = models.CharField(max_length=128,blank=True)
#
#    # 下面为添加了报警字段
#    end_time=models.CharField(max_length=128,null=True,blank=True)
#    alarm_text=models.CharField(max_length=128,null=True,blank=True)
#    # 添加报警字段结束
#    desc = models.CharField(max_length=1024, null=True, blank=True)
#    export_flag = models.BooleanField(default=False)
#    export = models.ManyToManyField(ExportType, null=True, blank=True, symmetrical=False)
#    depend = models.ManyToManyField('self', null=True, blank=True, symmetrical=False)
#    extra_task_flag = models.BooleanField(default=False)
#    
#    run_time_total = models.IntegerField(max_length=4,null=True,blank=True)
#    task_type = models.ManyToManyField(TaskType, null=True, blank=True)
#    retry_flag = models.IntegerField(choices=is_task_retry_choice, default=0 )
#    retry_times = models.IntegerField(choices=task_retry_times_choice, default=1 )
#    retry_choice = models.IntegerField(choices=task_retry_choice, default=5 )
#    # choices=[1,2,3,4,5,6,7,8,9,10]
#    # meta = models.CharField(max_length=225)
#
#    def __unicode__(self):
#        return self.name
#    
#    def to_json(self):
#        return {
#            'id': self.id,
#            'name': self.name,
#            'desc':self.desc,
#            'scripttype_id':self.scripttype_id,
#        }
#    
    class Meta:
        db_table = 'ide_task'
#
#    def to_dict(self):
#        return {
#                'id': self.id,'name':self.name,
#                'desc': self.desc,'depend':[dd.id for dd in self.depend.all()],
#                'is_normal': '1' if self.is_normal else '0',
#                'crontab':self.crontab,
#                'export_flag': '1' if self.export_flag else '0',
#                'export':[et.id for et in self.export.all()],
#                'exec_user': self.exec_user, 'groupid':self.groupid,
#                'alarmtime':self.alarmtime,
#                'reviewer': self.reviewer.id if self.reviewer else None,
#                'extra_task_flag': '1' if self.export_flag else '0',
#                }
#
#    def to_zk(self,schedule_single):
#        date = datetime.datetime.now()
#        str = date.strftime("%Y%m%d%H%M")
#        zk_tuple = [self.id,1 if self.is_normal else 0 ,1 if self.priority else 0 ,self.groupid,schedule_single,str,self.scripttype.id]
#        return '''{0[0]}&0&{0[1]}&{0[2]}&{0[3]}&{0[4]}&{0[5]}&{0[6]}'''.format(zk_tuple)


#class TaskGroup(models.Model):
#    id = models.AutoField(primary_key=True)
#    name = models.CharField(max_length=255)
#    # members = models.ManyToManyField(Task, related_name="members", related_query_name="groups")
#    # django 1.4 不支持related_query_name TODO: update to django 1.8
#    members = models.ManyToManyField(Task, related_name="members")

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

#class Schedule_Status_Test(models.Model):
#    """任务调度状态表(测试环境)
#    """
#    SCHEDULE_WAITING = 1 # 等待调度
#    SCHEDULE_EXECUTABLE = 2 # 等待执行
#    SCHEDULE_EXECUTING = 3 # 执行中
#    SCHEDULE_EXECUTED = 4 # 执行完成
#    SCHEDULE_KILLING = 5 # 任务停止中
#    
#    schedule_status_choice = ((SCHEDULE_WAITING, '等待调度'),
#                             (SCHEDULE_EXECUTABLE, '等待执行'),
#                             (SCHEDULE_EXECUTING, '执行中'), 
#                             (SCHEDULE_EXECUTED, '执行完成'),
#                             (SCHEDULE_KILLING, '停止中'),)
#    
#    RESULT_INIT = 0 #初始
#    RESULT_SUCCESS = 1 #成功
#    RESULT_FAILED = 2 #失败
#    RESULT_TERMINATE = 3 #终止
#    RESULT_TIMEOUT = 4 #超时
#    RESULT_DEAL = 5 #DEAL
#    
#    result_choice = ((RESULT_INIT, '初始'),
#                     (RESULT_SUCCESS, '成功'),
#                     (RESULT_FAILED, '失败'),
#                     (RESULT_TERMINATE, '终止'), 
#                     (RESULT_TIMEOUT, '超时'),
#                     (RESULT_DEAL, 'DEAL'),)
#    
#    id = models.AutoField(primary_key=True)
#    task = models.ForeignKey(Task)
#    query_name = models.CharField(max_length=128)
#    status = models.IntegerField(choices=schedule_status_choice)
#    result = models.IntegerField(choices=result_choice)
#    
#    ins_time = models.DateTimeField(null=True,auto_now=True)
#    modify_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
#    ready_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
#    running_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
#    leave_time = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
#    kill_time = models.DateTimeField(null=True,blank=True)
#    
#    ONLINE_ENV = 0 #生产环境
#    TESTING_ENV = 1 #测试环境
#    env_choice = ((ONLINE_ENV, '生产环境'),
#                 (TESTING_ENV, '测试环境'),
#                 )
##     env = models.IntegerField(choices=env_choice)
#    
#    def __unicode__(self):
#        return self.task.name
#    
#    def status_info(self):
#        return {'status':self.status,
#                'result':self.result,
#                'query_name':self.query_name,
#                }
#        

#class UploadFile(models.Model):
#    id          = models.AutoField(primary_key=True)
#    task        = models.ForeignKey(Task)
#    name_file   = models.TextField(blank=True)
#    upload_date = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
#    def __unicode__(self):
#        return self.task
#
#class ExtraTask(models.Model):
#    id          = models.AutoField(primary_key=True)
#    task        = models.ForeignKey(Task)
#    export_type = models.ForeignKey(ExportType)
#    command     = models.TextField(blank=True)
#    def __unicode__(self):
#        return self.task
#class FtpConf(models.Model):
#    id          = models.AutoField(primary_key=True)
#    task        = models.ForeignKey(Task)
#    username    = models.TextField(blank=True)
#    password    = models.TextField(blank=True)
#    dir         = models.TextField(blank=True)
#    filename    = models.TextField(blank=True)
#    hdfs_dir    = models.TextField(blank=True)
#    upload_date = models.DateTimeField(null=True,default='0000-00-00 00:00:00')
#
#    def __unicode__(self):
#        return HttpResponse("ok")
## create permission
#class ExtendPermission(models.Model):
#    id      = models.AutoField(primary_key=True)
#    name    = models.CharField(max_length=128)
#    gId     = models.IntegerField()
#    def __unicode__(self):
#       return self.name
#
#    def to_json(self):
#        return {"id"  : self.id,
#                "name": self.name,
#                "gId":self.gId,
#               }
#
