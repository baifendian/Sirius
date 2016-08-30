#-*- coding: UTF-8 -*-

from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


class List(models.Model):
    hostname = models.CharField(max_length=100, verbose_name=u'项目名')
    username = models.CharField(max_length=50, verbose_name=u'负责人',)
    pub_date = models.DateTimeField('发表时间', auto_now_add=True, editable=True)
    update_time = models.DateTimeField('更新时间', auto_now=True, null=True)

    def __unicode__(self):
        return self.hostname

class ModeList(models.Model):
    nameuser = models.CharField(max_length=30, verbose_name=u'插件名称')
    urlname = models.CharField(max_length=50, verbose_name=u'URL',)
    mlistm = models.ForeignKey('List')
    pub_date = models.DateTimeField('发表时间', auto_now_add=True, editable=True)
    update_time = models.DateTimeField('更新时间', auto_now=True, null=True)

class StorData(models.Model):
    time=models.CharField(max_length=20, verbose_name=u'录入时间')
    username = models.CharField(max_length=50, verbose_name=u'维护人')
    title = models.CharField(max_length=20,verbose_name=u'标题')
    date_time = models.CharField(max_length=20,verbose_name=u'维护时间')
    data=models.TextField(verbose_name=u'维护记录')
    pub_date = models.DateTimeField('发表时间', auto_now_add=True, editable=True)
    update_time = models.DateTimeField('更新时间', auto_now=True, null=True)
    data_list = models.ForeignKey('List')

class Permissions(models.Model):
    title = models.CharField(max_length=20,verbose_name=u'标题')
    hostname = models.CharField(max_length=50, verbose_name=u'项目名')
    username = models.CharField(max_length=50, verbose_name=u'申请人')
    email= models.CharField(max_length=50, verbose_name=u'邮箱地址')
    status=models.IntegerField(verbose_name=u'状态')
    data=models.TextField(verbose_name=u'说明')
    pub_date = models.DateTimeField('发表时间', auto_now_add=True, editable=True)
    update_time = models.DateTimeField('更新时间', auto_now=True, null=True)
    User_list = models.ForeignKey(User)
  
    
