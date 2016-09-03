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
import threading
import paramiko
import os
import random
import logging
from kazoo.client import KazooClient
import json,re,requests
from models import *
ac_logger = logging.getLogger("access_log")

local_dir=settings.CODIS_LOCAL_DIR
commnd_dir=settings.CODIS_COMMOND_DIR
datadir=settings.CODIS_DATADIR
logfiledir=settings.CODIS_LOGFILE_DIR
pidfiledir=settings.CODIS_PIDFILE_DIR
ZKADDR=settings.CODIS_ZK_ADDR
indexline=settings.CODIS_INDEX_LINE
mainhostinfo=settings.CODIS_HOST_INFO
CODISHOME=settings.CODIS_SHOME
SERVERINSTANCEMAXMEMORY=settings.CODIS_MEMORY_MAX

#@ brief   获取danshboard所在主机的信息
#@ param[out] danshboard所在主机的信息
def GetDashHost():
    return mainhostinfo


#@ brief   集成一些读取zookeeper某些信息的函数的类
class ZooKeeper():
    #@ brief   初始化类的所有成员
    #@ param[in] zkaddr    zookeeper的ip及端口号
    #@ param[in] productid   要查询的codis服务对应的productid
    def __init__(self,zkaddr):#[ip,user,passwd,port,zkpath]
        self.ZK_= KazooClient(zkaddr)
    #@ brief   获取productid对应的codis服务内已存在group的总数
    #@ param[in] productid  用户标签
    #@ param[out] productid对应的codis服务内已存在group的总数
    def GetGrpNum(self,productid):
        maxno=-1
        serverpath="/zk/codis/db_%s/servers"%productid
        self.ZK_.start()
        groups=self.ZK_.get_children(serverpath)
        self.ZK_.stop()
        for group in groups:
            no=int(group.split('_')[1])
            if no>maxno:
                maxno=no
        return maxno

    #@ brief 判断zk中是否已包含同名的product
    #@ param[in] productid  用户标签
    #@ param[out] 1 没有 0  有
    def Getcodisproduct(self,productid):
        try:
            self.ZK_.start()
            product_list=self.ZK_.get_children("/zk/codis")
            self.ZK_.stop()
            if product_list.count(productid)==0:
                return 1
            else:
                return 0
        except Exception,e:
            return 1
    
    #@ brief 从zk中删除已挂掉的dashboard
    #@ param[in] productid  用户标签
    def RMDashBoard(self,productid):
        dashboardpath='/zk/codis/db_%s/dashboard'%productid
        try:
            self.ZK_.start()
            self.ZK_.delete(dashboardpath)
            self.ZK_.stop()
        except Exception,e:
            ac_logger.error(e)


    #@ brief 从zk中删除product信息
    #@ param[in] productid  用户标签
    def RmrProduct(self,productid):
        productpath='/zk/codis/db_%s'%productid
        try:
            self.ZK_.start()
            self.ZK_.delete(productpath, version=-1, recursive=True)
            self.ZK_.stop()
        except Exception,e:
            ac_logger.error(e)


#@ brief  为已存在的codis服务扩容的类
class AlterMem(threading.Thread):
    #@ brief   初始化类的所有成员
    #@ param[in] productid    用户的标签
    #@ param[in] altermem  申请的容量（G）
    def __init__(self,productid,altermem):
        threading.Thread.__init__(self)
        self.zk_=ZooKeeper(settings.CODIS_ZK_ADDR)
        self.productid=productid
        self.altermem=altermem


    #@ brief   重载threading.Thread类的run函数，用于为codis服务扩容
    def run(self):
        try:
            codis=Codis.objects.all()
            productids=[n.product_id for n in codis]
            if self.productid in productids:
                CODISHOME=Host.objects.all()[0].codis_home
                serverhostlist=[]
                codisinfo=Codis.objects.filter(product_id=self.productid)[0]
                codis_id=codisinfo.codis_id
                serverinfo=Servers.objects.filter(codis_id=codis_id)
                dashhost=GetDashHost()
                sshdash=SSH(dashhost[1],dashhost[2])
                serverhostlist=GetFitHostList(self.altermem)
                if serverhostlist:
                    sshgrp=GetHostSSH(serverhostlist)
                    portlist=StartCodisServer(sshgrp,serverhostlist,codis_id,self.productid)#masterport,slaveport
                    AddServerGrp(self.zk_,sshdash,serverhostlist, portlist,self.productid)
                    lastneed=serverhostlist[len(serverhostlist)/2-1].applymem
                codisinfo.product_id=self.productid
                codisinfo.key_num=0
                codisinfo.memory_total=codisinfo.memory_total+self.altermem
                codisinfo.memory_used=0
                if CheckCodis(self.zk_, self.productid,True):
                    codisinfo.available='Y'
                else:
                    codisinfo.available='N'
                codisinfo.save()
                time.sleep(5)
                sshdash.close()
            else:
                ac_logger.error("this id doesn't exist")
        except MyException as error:
            ac_logger.error('异常退出')
            GenerateCommandLog(self.productid,'Error','',error.message)
        else:
            GenerateCommandLog(self.productid,'info','','扩容成功')



#@ brief   一键删除codis
class DeleteCodisApply(threading.Thread):
    #@ brief   初始化类的所有成员
    #@ param[in]  codisinfo   codis信息
    def __init__(self,codisinfo):
        threading.Thread.__init__(self)
        self.codisinfo=codisinfo
        self.zk_=ZooKeeper(settings.CODIS_ZK_ADDR)

    #@ brief   用于启动codis服务
    def run(self): #Overwrite run() method, put what you want the thread do here
        DeleteCodisRun(self.zk_,self.codisinfo)

#@ brief   添加codis proxy
class AddCodisProxyApply(threading.Thread):
    #@ brief   初始化类的所有成员
    #@ param[in]  codisinfo   codis信息
    def __init__(self,codisinfo):
        threading.Thread.__init__(self)
        self.codisinfo=codisinfo
        self.zkinfo=settings.CODIS_ZK_ADDR

    #@ brief   用于启动codis服务
    def run(self): #Overwrite run() method, put what you want the thread do here
        AddCodisProxyApplyRun(self.codisinfo,self.zkinfo)


#@ brief   用于启动codis服务的类
class NewApply(threading.Thread): 
    #@ brief   初始化类的所有成员
    #@ param[in]  productid   用户的标签
    #@ param[in] applymem   codis服务的容量
    #@ param[in] zkip    zookeeper所在主机的ip
    #@ param[in] zkport    zookeeper占用的端口号
    #@ param[in] dashboardinfo    dashboard所在主机的ip，用户名及密码
    def __init__(self, productid,applymem,zkinfo,dashboardinfo):  
        threading.Thread.__init__(self) 
        self.zk_=ZooKeeper(settings.CODIS_ZK_ADDR)
        self.productid=productid
        self.applymem=applymem
        self.zk=zkinfo
        self.dashboardinfo=dashboardinfo
        
    #@ brief   用于启动codis服务
    def run(self): #Overwrite run() method, put what you want the thread do here  
        ApplyMemory(self.zk_,self.productid, self.applymem,self.zk,self.dashboardinfo)


#@ brief   集成一些修改codisserver配置文件某些信息的函数的类
class PyRedis():
    #@ brief   初始化类的所有成员
    #@ param[in] hostip   codisserver所在主机的ip
    #@ param[in] port     codisserver所占用的端口号
    def __init__(self,hostip,port):
        self.rediscli=redis.Redis(host=hostip,port=port)
        self.hostip=hostip
        self.port=port


    #@ brief    析构函数
    def __del__(self):
        return


    #@ brief   修改codisserver的最大容量
    #@ param[in] maxmem   要修改的最大容量
    def AlterMaxMem(self,maxmem):
        ret=self.rediscli.config_set('maxmemory',maxmem)
        ac_logger.debug(str(self.hostip)+':'+str(self.port))
        ac_logger.debug("ret:"+str(ret))
        self.rediscli.config_rewrite()


    #@ brief    获取codisserver的总容量，已用容量，键值对总量
    def GetCodisServerInfo(self):
        ret=self.rediscli.info()
        ac_logger.info('hostip:'+str(self.hostip)+';port:'+str(self.port))
        usedmem=long(ret['used_memory'])
        keysnum=long(ret['db0']['keys'])
        memtotal=long(self.rediscli.config_get('maxmemory')['maxmemory'])
        return memtotal,usedmem,keysnum


#@ brief 我的异常类
class MyException(Exception):
    #@ param[in] 异常信息
    def __init__(self,mess):
        self.message=mess


#@ brief    生成codis服务的配置文件
#@ param[in] zkip    zk所在主机的ip
#@ param[in] zkport   zk占用的端口号
#@ param[in] dashboardip   dashboard 所在主机的ip
#@ param[in] dashboardport   dashboard占用的端口号
#@ param[in] productid    客户标签
def GenerateCodisConfigini(zk,dashboardip,dashboardport,productid):
    configini=open(local_dir+('config%s.ini')%productid,'w')
    configini.write('zk=%s\n'\
                                                    'product=%s\n'\
                                                    'dashboard_addr=%s:%d\n'\
                                                    'coordinator=zookeeper\n'\
                                                    'backend_ping_period=5\n'\
                                                    'session_max_timeout=30000\n'\
                                                    'session_max_bufsize=131072\n'\
                                                    'session_max_pipeline=128\n'\
                                                    'proxy_id=proxy_%s\n'\
                                                    %(zk,productid,dashboardip,dashboardport,productid))
    configini.close()


#@ brief  为codis服务的第n个proxy生成配置文件
#@ param[in] zkip    zk所在主机的ip
#@ param[in] zkport   zk占用的端口号
#@ param[in] dashboardip   dashboard 所在主机的ip
#@ param[in] dashboardport   dashboard占用的端口号
#@ param[in] productid    客户标签
#@ param[in] count 第几个proxy
def GenerateProxynConfigini(zk,dashboardip,dashboardport,productid,count):
    configini=open(local_dir+('proxy%d%s.ini')%(count,productid),'w')
    configini.write('zk=%s\n'\
                                                    'product=%s\n'\
                                                    'dashboard_addr=%s:%d\n'\
                                                    'coordinator=zookeeper\n'\
                                                    'backend_ping_period=5\n'\
                                                    'session_max_timeout=30000\n'\
                                                    'session_max_bufsize=131072\n'\
                                                    'session_max_pipeline=128\n'\
                                                    'zk_session_timeout=30000\n'\
                                                    'proxy_id=proxy%d_%s\n'\
                                                    %(zk,productid,dashboardip,dashboardport,count,productid))
    configini.close()


#@ brief  为codis服务的第1个proxy生成配置文件
#@ param[in] zkip    zk所在主机的ip
#@ param[in] zkport   zk占用的端口号
#@ param[in] dashboardip   dashboard 所在主机的ip
#@ param[in] dashboardport   dashboard占用的端口号
#@ param[in] productid    客户标签
def GenerateProxy1Configini(zk,dashboardip,dashboardport,productid):
    configini=open(local_dir+('proxy1%s.ini')%productid,'w')
    configini.write('zk=%s\n'\
                                                    'product=%s\n'\
                                                    'dashboard_addr=%s:%d\n'\
                                                    'coordinator=zookeeper\n'\
                                                    'backend_ping_period=5\n'\
                                                    'session_max_timeout=30000\n'\
                                                    'session_max_bufsize=131072\n'\
                                                    'session_max_pipeline=128\n'\
                                                    'zk_session_timeout=30000\n'\
                                                    'proxy_id=proxy1_%s\n'\
                                                    %(zk,productid,dashboardip,dashboardport,productid))
    configini.close()


#@ brief  为codis服务的第二个proxy生成配置文件
#@ param[in] zkip    zk所在主机的ip
#@ param[in] zkport   zk占用的端口号
#@ param[in] dashboardip   dashboard 所在主机的ip
#@ param[in] dashboardport   dashboard占用的端口号
#@ param[in] productid    客户标签
def GenerateProxy2Configini(zk,dashboardip,dashboardport,productid):
    configini=open(local_dir+('proxy2%s.ini')%productid,'w')
    configini.write('zk=%s\n'\
                                                    'product=%s\n'\
                                                    'dashboard_addr=%s:%d\n'\
                                                    'coordinator=zookeeper\n'\
                                                    'backend_ping_period=5\n'\
                                                    'session_max_timeout=30000\n'\
                                                    'session_max_bufsize=131072\n'\
                                                    'session_max_pipeline=128\n'\
                                                    'zk_session_timeout=30000\n'\
                                                    'proxy_id=proxy2_%s\n'\
                                                    %(zk,productid,dashboardip,dashboardport,productid))
    configini.close()


#@ brief  为codis服务的第三个proxy生成配置文件
#@ param[in] zkip    zk所在主机的ip
#@ param[in] zkport   zk占用的端口号
#@ param[in] dashboardip   dashboard 所在主机的ip
#@ param[in] dashboardport   dashboard占用的端口号
#@ param[in] productid    客户标签
def GenerateProxy3Configini(zk,dashboardip,dashboardport,productid):
    configini=open(local_dir+('proxy3%s.ini')%productid,'w')
    configini.write('zk=%s\n'\
                                                    'product=%s\n'\
                                                    'dashboard_addr=%s:%d\n'\
                                                    'coordinator=zookeeper\n'\
                                                    'backend_ping_period=5\n'\
                                                    'session_max_timeout=30000\n'\
                                                    'session_max_bufsize=131072\n'\
                                                    'session_max_pipeline=128\n'\
                                                    'zk_session_timeout=30000\n'\
                                                    'proxy_id=proxy3_%s\n'\
                                                    %(zk,productid,dashboardip,dashboardport,productid))
    configini.close()

#@ brief 生成或追加  commnd命令行输出
def GenerateCommandLog(productid,commandname,command,commandret):
    global indexline
    configini=open(settings.CODIS_COMMOND_DIR+('command%s.log')%productid,'a+')
    configini.write(('#%s\n'+str(indexline)+'-[command]['+time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))+']:\n  %s\n\n'\
                    '[ret]['+time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))+']:\n%s\n\n')\
                    %(str(commandname.lower()),str(command),str(commandret)))
    configini.close()
    indexline=indexline+1

#@ brief 查看启动codis的日志文件
def ViewLog(request,productid):
    log=open(settings.CODIS_COMMOND_DIR+('command%s.log')%productid,'a+')
    codislog=[]
    if log:
        for line in log:
            codislog.append(line)
    log.close()
    return render_to_response('codislog.html', locals(), context_instance=RequestContext(request))



#@ brief   生成codisserver主的配置文件
#@ param[in] ip  codisserver绑定的ip
#@ param[in] port   codisserver绑定的端口号
#@ param[in] productid   客户标签
#@ param[in] maxmem  codisserver的最大容量
def GenerateMasterServerConf(ip,port,productid,maxmem):
    mastersrc=open(local_dir+'redis.conf')
    masterdes=open(local_dir+('%smaster%s.conf')%(productid,port),'w')
    for line in mastersrc:
        if '#' not in line:
            masterdes.write(line)
    masterdes.write('pidfile %s%sredismaster%s.pid \n'%(pidfiledir,productid,str(port)))
    masterdes.write('logfile %s%sredismaster%s.log \n'%(logfiledir,productid,str(port)))
    masterdes.write('dir %s \n'%datadir)
    masterdes.write('dbfilename %sredismaster%s.rdb \n'%(productid,str(port)))
    masterdes.write('appendfilename %sredismaster%s.aof \n'%(productid,str(port)))
    masterdes.write('bind %s \n'%ip)
    masterdes.write('port %d \n'%port)
    masterdes.write('maxmemory %ldgb'%maxmem)
    mastersrc.close()
    masterdes.close()

def GenerateSlaveServerConf(ip,port,productid,maxmem):
    mastersrc=open(local_dir+'redis.conf')
    masterdes=open(local_dir+('%sslave%s.conf')%(productid,port),'w')
    for line in mastersrc:
        if '#' not in line:
            masterdes.write(line)
    masterdes.write('pidfile %s%sredisslave%s.pid \n'%(pidfiledir,productid,str(port)))
    masterdes.write('logfile %s%sredisslave%s.log \n'%(logfiledir,productid,str(port)))
    masterdes.write('dir %s \n'%datadir)
    masterdes.write('dbfilename %sredisslave%s.rdb \n'%(productid,str(port)))
    masterdes.write('appendfilename %sredisslave%s.aof \n'%(productid,str(port)))
    masterdes.write('bind %s \n'%ip)
    masterdes.write('port %d \n'%port)
    masterdes.write('maxmemory %ldgb'%maxmem)
    mastersrc.close()
    masterdes.close()

#@ brief   重启DashBoard
#@ zk zookeeper类
#@ 连接到dashboard所在主机的ssh连接
#@ dashboard所在主机的ip
#@ 用户标签
#@ dashboard占用的端口号
def ResetDashBoard(zk,sshdash,dashboardip,productid,dashboardport):
    zk.RMDashBoard(productid)
    time.sleep(1)
    StartDashBoard(sshdash, dashboardip, productid, dashboardport)


#@ brief   获取元素为tuple的列表
#@ param[in] list  列表
#@ param[out]  元素为tuple的列表
def GetTuplelist(list):
    if len(list)==0:
        return None
    Arraylist=[]
    if not isinstance(list[0],tuple):
        Arraylist.append(list)
    else:
        Arraylist=list
    return Arraylist


#@ brief   查询列表中所有的连续区间，并输出所有区间的开始和结束（如输入[1,2,3,4,5] 输出 [1,5] ）
#@ param[in] li  列表
#@ param[out] 查询列表中所有的连续区间，并输出所有区间的开始和结束
def ArrList(li):
    afterarr=[]
    afterarr.append(li[0])
    if len(li)==1:
        afterarr.append(li[0])
        return afterarr
    for i in range(1,len(li)):
        if li[i]!=li[i-1]+1:
            afterarr.append(li[i-1])
            afterarr.append(li[i])
    if len(afterarr)&1==1:
        afterarr.append(li[-1])
    return afterarr



#@ brief    启动dashboard进程
#@ param[in] mysqlctl   数据库管理类
#@ param[in] sshdash    连接到dashboard所在主机的ssh连接
#@ param[in] dashboardip   dashboard所在主机的ip
#@ param[in] productid   客户标签
#@ param[in] dashboardport   dashboard占用的端口号
def StartDashBoard(sshdash,dashboardip,productid,dashboardport):
    ac_logger.debug('STARTDASHBOARD')
    sshdash.exec_command('cd %sbin/ && chmod +x codis-config'%CODISHOME)
    com='cd %s &&nohup  ./bin/codis-config  -c ./codisconf/config%s.ini dashboard --addr=%s:%d >>./codislog/dashboard%s.log 2>&1 < /dev/null &'\
                                                    %(CODISHOME,productid,dashboardip,dashboardport,productid)
    ac_logger.debug(com)
    sshdash.exec_command(com)
    time.sleep(3)
    cat='cat %scodislog/dashboard%s.log'%(CODISHOME,productid)
    ac_logger.info(cat)
    stdin,stdout,stderr=sshdash.exec_command(cat)
    outread = stdout.readlines()
    outstring = ''.join(outread)
    time.sleep(3)
    GenerateCommandLog(productid,'STARTDASHBOARD',com,outstring)
    if 'error' in outstring.lower() or 'failed' in outstring.lower():
        raise MyException('startdashboard失败')

#@ brief   初始化slot
#@ param[in] sshdash    连接到dashboard所在主机的ssh连接
#@ param[in] productid   用户标签
def InitSlots(sshdash,productid):
    ac_logger.debug('INITSLOTS')
    initcom='cd %s && ./bin/codis-config -c ./codisconf/config%s.ini slot init '%(CODISHOME,productid)
    ac_logger.debug(initcom)
    stdin,stdout,stderr=sshdash.exec_command(initcom)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(productid,'INITSLOTS',initcom,outstring)
    if 'error' in outstring.lower() or 'failed' in outstring.lower():
        raise MyException('初始化slot失败')


#@ brief   启动codisserver
#@ param[in] sshgrp   连接到所有codisserver所在主机的ssh连接
#@ param[in] hostinfolist   所有codisserver所在主机的信息
#@ param[in] codisid   codis服务的编号
#@ param[in] mysqlctl   数据库管理类
#@ param[in] productid   用户标签
#@ param[out] codisserver 的主从端口列表
def StartCodisServer(sshgrp,hostinfolist,codisid,productid):
    ac_logger.debug('STARTCODISSERVER')
    grpnum=len(hostinfolist)/2
    portlist=[]
    remote_dir="%sserverconf/conf/"%CODISHOME
    for i in range(0,grpnum):
        mashostid,masip,masroot,maspasswd,masreqmem=hostinfolist[i].host_id,hostinfolist[i].host_ip,\
        hostinfolist[i].host_user,hostinfolist[i].host_pass,hostinfolist[i].applymem
        server=Servers.objects.filter(host_id=mashostid).order_by('-server_port')
        if server:
            masport=server[0].server_port+1
        else:
            masport=9000
        GenerateMasterServerConf(masip, int(masport),productid,masreqmem)
        SFTPFile(('%smaster%s.conf')%(productid,str(masport)),remote_dir,masip, masroot, maspasswd, 22)
        sshgrp[i].exec_command('cd %sbin/ && chmod +x codis-server'%CODISHOME)
        stamastercom='cd %s && ./bin/codis-server ./serverconf/conf/%smaster%s.conf'\
                         %(CODISHOME,productid,str(masport))
        ac_logger.debug(stamastercom)
        sshgrp[i].exec_command(stamastercom)
        time.sleep(3)
        stdin,stdout,stderr=sshgrp[i].exec_command('cat %s%sredismaster%s.log'%(logfiledir,productid,str(masport)))
        outread = stdout.readlines()
        outstring = ''.join(outread)
        GenerateCommandLog(productid,'STARTMASTERSERVER',hostinfolist[i].host_ip+'\n'+stamastercom,outstring)
        if 'error' in outstring.lower() or 'failed' in outstring.lower():
            raise MyException('startmasterserver失败')
        server=Servers(codis_id=codisid,host_id=mashostid,server_ip=masip,server_port=int(masport),role='MASTER')
        server.save()
        try:
            slahostid,slaip,slaroot,slapasswd,slareqmem=hostinfolist[i+grpnum].host_id,hostinfolist[i+grpnum].host_ip,\
            hostinfolist[i+grpnum].host_user,hostinfolist[i+grpnum].host_pass,hostinfolist[i+grpnum].applymem
            server_list=Servers.objects.filter(host_id=slahostid).order_by('-server_port')
            if server_list:
                slaport=server_list[0].server_port+1
            else:
                slaport=9000
            GenerateSlaveServerConf(slaip, int(slaport),productid,masreqmem)
            SFTPFile(('%sslave%s.conf')%(productid,str(slaport)),remote_dir,slaip, slaroot, slapasswd, 22)
            sshgrp[i+grpnum].exec_command('cd %sbin/ && chmod +x codis-server'%CODISHOME)
            staslavecom='cd %s && ./bin/codis-server ./serverconf/conf/%sslave%s.conf'\
                          %(CODISHOME,productid,str(slaport))
            ac_logger.debug(staslavecom)
            sshgrp[i+grpnum].exec_command(staslavecom)
            time.sleep(3)
            stdin,stdout,stderr=sshgrp[i+grpnum].exec_command('cat %s%sredisslave%s.log'%(logfiledir,productid,str(slaport)))
            outread = stdout.readlines()
            outstring = ''.join(outread)
            GenerateCommandLog(productid,'STARTSLAVESERVER',hostinfolist[i+grpnum].host_ip+'\n'+staslavecom,outstring)
            if 'error' in outstring.lower() or 'failed' in outstring.lower():
                raise MyException('startslaveserver失败')
            server=Servers(codis_id=codisid,host_id=slahostid,server_ip=slaip,server_port=int(slaport),role='SLAVE')
            server.save()
            host = Host.objects.get(pk=hostinfolist[i+grpnum].host_id)
            portlist.append([int(masport),int(slaport)])
        except Exception:
            ac_logger.debug('id错误，查找失败3')
    return portlist


#@ brief    将codisserver添加到zk
#@ param[in] zk   管理zk的类
#@ param[in] sshdash   连接到dashboard所在主机的ssh连接
#@ param[in] hostinfolist  所有codisserver所在主机的信息
#@ param[in] portlist    所有codisserver的端口集合
#@ param[in] productid   客户标签
#@ param[out] productid对应的codis服务已存在group数
def AddServerGrp(zk,sshdash,hostinfolist,portlist,productid):
    ac_logger.debug('ADDSERVERGRP')
    grpnum=len(hostinfolist)/2
    grpstart=1
    if zk!=None:
        grpstart+=int(zk.GetGrpNum(productid))
    for i in range(0,grpnum):
        masterip,slaveip=hostinfolist[i].host_ip,hostinfolist[i+grpnum].host_ip
        masterport,slaveport=portlist[i][0],portlist[i][1]
        addmastercom='cd %s && ./bin/codis-config -c ./codisconf/config%s.ini server add %d %s:%d master'\
                         %(CODISHOME,productid,grpstart+i,masterip,masterport)
        addslavecom='cd %s && ./bin/codis-config -c ./codisconf/config%s.ini server add %d %s:%d slave'\
                         %(CODISHOME,productid,grpstart+i,slaveip,slaveport)
        stdin,stdout,stderr=sshdash.exec_command(addmastercom)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(productid,'ADDMASTERSERVERGRP',addmastercom,outstring)
        if 'error' in outstring.lower() or 'failed' in outstring.lower():
            raise MyException('addmasterservergrp失败')
        stdin,stdout,stderr=sshdash.exec_command(addslavecom)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(productid,'ADDSLAVESERVERGRP',addslavecom,outstring)
        if 'error' in outstring.lower() or 'failed' in outstring.lower():
            raise MyException('addslaveservergrp失败')
        ac_logger.debug(addmastercom)
        ac_logger.debug(addslavecom)


#@ brief   取得最大公约数
#@ param[in] lhs   第一个整数
#@ param[in] rhs  第二个整数
#@ param[out] 最大公约数
def GetGCD(lhs,rhs):
    if rhs>lhs:
        lhs,rhs=rhs,lhs
    if rhs==0:
        return lhs
    if lhs&1==0 and rhs&1==0:
        return 2*GetGCD(lhs/2,rhs/2)
    else:
        return GetGCD(rhs,lhs-rhs) 

 
#@ brief    将slot按每个group的最大内存比分配
#@ param[in] hostlist  所有codisserver所在主机的信息
#@ param[out] 分配好的slot列表
def SlotDist(hostlist):
    slotgrp=[]
    grpnum=len(hostlist)/2
    if grpnum:
        lastneedmem=hostlist[grpnum-1].applymem
        maxmem=SERVERINSTANCEMAXMEMORY
        gcd=GetGCD(maxmem,lastneedmem)
        grpnum=len(hostlist)/2
        nume=(grpnum-1)*maxmem/gcd+lastneedmem/gcd
        per=1024/nume
        for i in range (grpnum-1):
            slotgrp.append([per*maxmem/gcd*i,per*maxmem/gcd*(i+1)-1])
        slotgrp.append([per*maxmem/gcd*(grpnum-1),1023])
    else:
        slotgrp=[[0,1023]]
    return slotgrp




#@ brief   将slot的编号连接为字符串
#@ param[in] start  slot起始编号
#@ param[in] end   slot结束编号
#@ param[out] slot组合成的字符串
def GenSlotStr(start,end):
    slotstr=str(start)
    for i in range(start+1,end+1):
        slotstr+=',%d'%i
    return slotstr


#@ brief   为每个group安排slot
#@ param[in] sshdash   连接到dashboard所在主机的ssh连接
#@ param[in] mysqlctl  数据库管理类
#@ param[in] hostlist   所有codisserver所在主机的信息
#@ param[in] productid   用户标签
def SetServerGrp(sshdash,hostlist,productid):
    ac_logger.debug('SETSERVERGRP')
    slotgrp=SlotDist(hostlist)
    grpnum=len(hostlist)/2
    for i in range(0,grpnum):
        setservercom='cd %s && ./bin/codis-config -c ./codisconf/config%s.ini slot range-set %d %d %d online'\
                     %(CODISHOME,productid,slotgrp[i][0],slotgrp[i][1],i+1)
        ac_logger.debug(setservercom)
        codisinfo=Codis.objects.filter(product_id=productid)
        stdin,stdout,stderr=sshdash.exec_command(setservercom)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(productid,'SETSERVERGRP',setservercom,stdout.readlines()+stderr.readlines())
        if 'error' in outstring.lower() or 'failed' in outstring.lower():
            raise MyException('setservergrp失败')



#@ brief   启动proxy
#@ param[in] hostrecord  proxy所在主机的信息
#@ param[in] mysqlctl   数据库管理类
#@ param[in] productid   用户标签
#@ param[in] codisid   codis服务的编号
def StartCodisProxy(hostrecord,productid,codisid,id):
    ac_logger.debug('STARTCODISPROXY')
    proxyip=hostrecord.host_ip
    httpip=hostrecord.host_ip
    host_id=hostrecord.host_id    
    sshproxy=SSH(hostrecord.host_ip,hostrecord.host_user)
    proxy_list=Proxy.objects.filter(host_id=host_id).order_by('-proxy_port')
    if proxy_list:
        proxyport=proxy_list[0].proxy_port+1
        httpport=proxy_list[0].http_port+1
    else:
        proxyport=20000
        httpport=12000
    sshproxy.exec_command('cd %sbin/ && chmod +x codis-proxy'%CODISHOME)
    setproxycom='cd %s &&nohup ./bin/codis-proxy -c ./proxyconf/proxy%d%s.ini -L ./proxylog/proxy%d%s.log  --cpu=2'\
    ' --addr=%s:%d --http-addr=%s:%d >>./proxylog/proxy%d%s.log 2>&1 < /dev/null &'\
                 %(CODISHOME,id,productid,id,productid,proxyip,proxyport,proxyip,httpport,id,productid)
    proxyonlinecom='cd %s &&nohup  ./bin/codis-config -c ./proxyconf/proxy%d%s.ini proxy online proxy%d_%s >>./proxylog/proxy%d%s.log 2>&1 < /dev/null &'\
                 %(CODISHOME,id,productid,id,productid,id,productid)
    ac_logger.debug(setproxycom)
    ac_logger.debug(proxyonlinecom)
    stdin,stdout,stderr=sshproxy.exec_command(setproxycom)
    time.sleep(3)
    stdi,stdo,stde=sshproxy.exec_command(proxyonlinecom)
    time.sleep(3)
    cat='cat %sproxylog/proxy%d%s.log'%(CODISHOME,id,productid)
    stdin1,stdout1,stderr1=sshproxy.exec_command(cat)
    outread = stdout1.readlines()
    outstring = ''.join(outread)
    proxy=Proxy(codis_id=codisid,host_id=host_id,proxy_ip=proxyip,proxy_port=proxyport,http_ip=httpip,http_port=httpport)
    proxy.save()
    time.sleep(3)
    GenerateCommandLog(productid,'STARTCODISPROXY',setproxycom,outstring)
    GenerateCommandLog(productid,'proxyonlinecom',proxyonlinecom,outstring)
    if 'error' in outstring.lower():
        raise MyException('startcodisproxy失败')


#@ brief  启动CodisHA
#@ sshgrp  连接到CodisServer主机的SSH连接
#@ daship  dashboard所在主机的ip
#@ dashport   dashboard占用的端口号
#@ productid    用户标签
def StartCodisHA(sshgrp,daship,dashport,productid):
    ac_logger.debug('START CODISHA')
    hostinfo=GetDashHost()
    asshgrp=SSH(hostinfo[1],hostinfo[2])
    asshgrp.exec_command('cd %sbin/ && chmod +x codis-ha'%CODISHOME)
    sthacom='cd %s &&nohup ./bin/codis-ha --codis-config=%s:%d'\
    ' --productName=%s >>./codislog/codisha%s.log  2>&1 < /dev/null &'%(CODISHOME,daship,dashport,productid,productid)
    ac_logger.info(sthacom)
    asshgrp.exec_command(sthacom)
    time.sleep(3)
    stdin,stdout,stderr=asshgrp.exec_command('cat %scodislog/codisha%s.log'%(CODISHOME,productid))
    outread = stdout.readlines()
    outstring = ''.join(outread)
    GenerateCommandLog(productid,'START CODISHA',sthacom,outstring)
    asshgrp.close()
    if 'error' in outstring.lower() or 'failed' in outstring.lower():
        raise MyException('start  codisha失败')



#@ brief    建立到每个host的ssh连接
#@ param[in] hostlist   主机信息列表
#@ param[out] ssh连接列表
def GetHostSSH(hostlist):
    sshgrp=[]
    for i in range(0,len(hostlist)):
        ssh=SSH(hostlist[i].host_ip,hostlist[i].host_user)
        sshgrp.append(ssh)
    return sshgrp

#@ brief     为启动codis做准备工作
#@ param[in] mysqlctl   数据库管理类
#@ param[in] hostlist    所有codisserver所在主机的信息
#@ param[in] proxyhostlist   proxy所在主机的信息
#@ param[in] productid   用户标签
#@ param[in] zkip   zk所在主机的ip
#@ param[in] zkport   zk占用的端口号
#@ param[in] dashboardinfo   dashboard所在主机的ip，用户名及密码
#@ param[in] applymem   申请的总容量
#@ param[out] ssh连接列表,codis服务的编号,dashboard端口号
def PreCodis(hostlist,proxyhostlist,productid,zk,dashboardinfo,applymem):
    sshgrp=GetHostSSH(hostlist)
    remotecodisconf_dir="%scodisconf/"%CODISHOME
    remoteproxyconf_dir="%sproxyconf/"%CODISHOME
    codis_list=Codis.objects.filter(dashboard_ip=dashboardinfo[0]).order_by('-dashboard_port')
    if codis_list:
        dashboardport=codis_list[0].dashboard_port+1
    else:
        dashboardport=8000
    codis=Codis(product_id=productid,key_num=0,memory_total=applymem,memory_used=0,dashboard_port=int(dashboardport),available='N',dashboard_ip=dashboardinfo[0])
    codis.save()
    codisid=codis.codis_id
    GenerateCodisConfigini(zk,dashboardinfo[0],dashboardport,productid)
    GenerateProxy1Configini(zk,dashboardinfo[0],dashboardport,productid)
    GenerateProxy2Configini(zk,dashboardinfo[0],dashboardport,productid)
    GenerateProxy3Configini(zk,dashboardinfo[0],dashboardport,productid)
    SFTPFile(('config%s.ini')%productid,remotecodisconf_dir,dashboardinfo[0],dashboardinfo[1], dashboardinfo[2], 22)
    SFTPFile(('proxy1%s.ini')%productid,remoteproxyconf_dir,proxyhostlist[0].host_ip, proxyhostlist[0].host_user, proxyhostlist[0].host_pass, 22)
    SFTPFile(('proxy2%s.ini')%productid,remoteproxyconf_dir,proxyhostlist[1].host_ip, proxyhostlist[1].host_user, proxyhostlist[1].host_pass, 22)
    SFTPFile(('proxy3%s.ini')%productid,remoteproxyconf_dir,proxyhostlist[2].host_ip, proxyhostlist[2].host_user, proxyhostlist[2].host_pass, 22)
    return sshgrp,codisid,dashboardport


#@ brief  移除proxy的进程，配置文件和数据库
#@ param[in] codsiinfo codis信息
def MoveProxyInfo(codisinfo):
    proxylist=Proxy.objects.filter(codis_id=codisinfo.codis_id)
    for proxy in proxylist:
        hostinfo=Host.objects.get(host_id=proxy.host_id)
        sshproxy=SSH(hostinfo.host_ip,hostinfo.host_user)
        #杀掉codis-proxy进程
        com="kill -9 `ps -ef | grep codis-proxy | grep %s | awk '{print $2}'`"%str(proxy.proxy_port)
        ac_logger.info(com)
        stdin,stdout,stderr=sshproxy.exec_command(com)
        time.sleep(1)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(codisinfo.product_id,'#kill codis-proxy thread',hostinfo.host_ip+'\n'+com,outstring)
        #删除proxy配置文件
        com='cd %sproxyconf/ && rm ./proxy%d%s.ini'%(CODISHOME,num,codisinfo.product_id)
        ac_logger.info(com)
        sshproxy.exec_command(com)
        time.sleep(1)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(codisinfo.product_id,'#delete codis-proxy config',hostinfo.host_ip+'\n'+com,outstring)
        #删除proxy日志文件
        com='cd %sproxylog/ && rm ./proxy*%s.log*'%(CODISHOME,codisinfo.product_id)
        ac_logger.info(com)
        sshproxy.exec_command(com)
        time.sleep(1)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(codisinfo.product_id,'#delete codis-proxy log',hostinfo.host_ip+'\n'+com,outstring)
        sshproxy.close()


#@ brief 删除master server生成的文件
#@ param[in] codisinfo codis信息
#@ param[in] server  server信息
#@ param[in] hostinfo  host信息
def DeleteMasterServer(sshserver,codisinfo,server,hostinfo):
    com='cd %sserverconf/log && rm ./%sredismaster%s.log'%(CODISHOME,codisinfo.product_id,str(server.server_port))
    ac_logger.info(com)
    stdin,stdout,stderr=sshserver.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis-server log',hostinfo.host_ip+'\n'+com,outstring)
    #删除server生成的pid
    com='cd %sserverconf/pid && rm ./%sredismaster%s.pid'%(CODISHOME,codisinfo.product_id,str(server.server_port))
    ac_logger.info(com)
    stdin,stdout,stderr=sshserver.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis-server pid',hostinfo.host_ip+'\n'+com,outstring)
    #删除server生成的data文件
    com='cd %sserverconf/data && rm ./%sredismaster%s.rdb'%(CODISHOME,codisinfo.product_id,str(server.server_port))
    ac_logger.info(com)
    stdin,stdout,stderr=sshserver.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis-server data',hostinfo.host_ip+'\n'+com,outstring)
    #删除server的配置文件
    com='cd %sserverconf/conf/ && rm ./%smaster%s.conf'%(CODISHOME,codisinfo.product_id,str(server.server_port))
    ac_logger.info(com)
    stdin,stdout,stderr=sshserver.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis-server config',hostinfo.host_ip+'\n'+com,outstring)



#@ brief 删除slave server生成的文件
#@ param[in] codisinfo codis信息
#@ param[in] server  server信息
#@ param[in] hostinfo  host信息
def DeleteSlaveServer(sshserver,codisinfo,server,hostinfo):
    com='cd %s && rm ./%sredisslave%s.log'%(logfiledir,codisinfo.product_id,str(server.server_port))
    ac_logger.info(com)
    stdin,stdout,stderr=sshserver.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis-server log',hostinfo.host_ip+'\n'+com,outstring)
    #删除server生成的pid
    com='cd %s && rm ./%sredisslave%s.pid'%(pidfiledir,codisinfo.product_id,str(server.server_port))
    ac_logger.info(com)
    stdin,stdout,stderr=sshserver.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis-server pid',hostinfo.host_ip+'\n'+com,outstring)
    #删除server生成的data文件
    com='cd %s && rm ./%sredisslave%s.rdb'%(datadir,codisinfo.product_id,str(server.server_port))
    ac_logger.info(com)
    stdin,stdout,stderr=sshserver.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis-server data',hostinfo.host_ip+'\n'+com,outstring)
    #删除server的配置文件
    com='cd %sserverconf/conf/ && rm ./%sslave%s.conf'%(CODISHOME,codisinfo.product_id,str(server.server_port))
    ac_logger.info(com)
    stdin,stdout,stderr=sshserver.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis-server config',hostinfo.host_ip+'\n'+com,outstring)



#@ brief    移除server进程，配置信息，输出文件
#@ param[in] codsiinfo codis信息
def MoveServerInfo(codisinfo):
    serverlist=Servers.objects.filter(codis_id=codisinfo.codis_id)
    for server in serverlist:
        hostinfo=Host.objects.get(host_id=server.host_id)
        sshserver=SSH(hostinfo.host_ip,hostinfo.host_user)
        #杀掉server进程
        com="kill -9 `ps -ef | grep codis-server | grep %s | awk '{print $2}'`"%str(server.server_port)
        ac_logger.info(com)
        stdin,stdout,stderr=sshserver.exec_command(com)
        time.sleep(1)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(codisinfo.product_id,'#kill codis-server',hostinfo.host_ip+'\n'+com,outstring)
        #删除server生成的log文件
        if server.role=='MASTER':
            DeleteMasterServer(sshserver,codisinfo,server,hostinfo)
        else:
            DeleteSlaveServer(sshserver,codisinfo,server,hostinfo)
        time.sleep(2)
        sshserver.close()
        hostinfo.memory_used-=SERVERINSTANCEMAXMEMORY
        hostinfo.save()

#@ brief add proxy
#@ param[in] codsiinfo codis信息
def AddCodisProxyApplyRun(codisinfo,zkinfo):
    try:
        id_list=[]
        count=0
        remoteconf_dir="%sproxyconf/"%CODISHOME
        proxy_list=Proxy.objects.filter(codis_id=codisinfo.codis_id)
        for proxy in proxy_list:
            id_list.append(proxy.host_id)
            count+=1
        host_list=Host.objects.exclude(host_id__in=id_list)
        if not host_list:
            host_list=[]
            host_all = Host.objects.all()
            for host in host_all:
                proxy_count = Proxy.objects.filter(host_id=host.host_id,codis_id=codisinfo.codis_id).count()
                if proxy_count < 2:
                    host_list.append(host)
                    break
        the_random = random.randint(0,len(host_list)-1)
        GenerateProxynConfigini(zkinfo,codisinfo.dashboard_ip,codisinfo.dashboard_port,codisinfo.product_id,count+1)
        time.sleep(2)
        SFTPFile(('proxy%d%s.ini')%(count+1,codisinfo.product_id),remoteconf_dir,host_list[the_random].host_ip, host_list[the_random].host_user, host_list[the_random].host_pass, 22)
        time.sleep(2)
        StartCodisProxy(host_list[the_random],codisinfo.product_id,codisinfo.codis_id,count+1)
        time.sleep(2)
    except MyException as error:
        ac_logger.error('异常退出')
        GenerateCommandLog(codisinfo.product_id,'Error','',error.message)
    else:
        GenerateCommandLog(codisinfo.product_id,'info','','proxy添加成功')


#@ brief    删除codis服务
#@ param[in] codsiinfo codis信息
def DeleteCodisRun(zk,codisinfo):
    MoveProxyInfo(codisinfo)
    MoveServerInfo(codisinfo)
    dashhost=GetDashHost()
    sshdash=SSH(dashhost[1],dashhost[2])
    #杀掉dashboard进程
    com="kill -9 `ps -ef | grep dashboard | grep %s | awk '{print $2}'`"%str(codisinfo.dashboard_port)
    ac_logger.info(com)
    stdin,stdout,stderr=sshdash.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#kill dashboard',dashhost[1]+'\n'+com,outstring)
    #删除dashboard log文件
    com='cd %slog/ && rm ./dashboard%s.ini'%(CODISHOME,codisinfo.product_id)
    ac_logger.info(com)
    stdin,stdout,stderr=sshdash.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete dashboard log',dashhost[1]+'\n'+com,outstring)
    #删除codis config文件
    com='cd %scodisconf/ && rm ./config%s.ini'%(CODISHOME,codisinfo.product_id)
    ac_logger.info(com)
    stdin,stdout,stderr=sshdash.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete codis config',dashhost[1]+'\n'+com,outstring)
    #删除rediscloud下的配置文件
    com='cd %sredisconf && rm ./*%s*'%(CODISHOME,codisinfo.product_id)
    ac_logger.info(com)
    stdin,stdout,stderr=sshdash.exec_command(com)
    time.sleep(1)
    outstring=str(stdout.readlines()+stderr.readlines())
    GenerateCommandLog(codisinfo.product_id,'#delete rediscloud config',dashhost[1]+'\n'+com,outstring)
    sshdash.close()
    #删除zk信息
    zk.RmrProduct(codisinfo.product_id)
    #删除proxy信息
    Proxy.objects.filter(codis_id=codisinfo.codis_id).delete()
    #删除servers信息
    Servers.objects.filter(codis_id=codisinfo.codis_id).delete()
    #删除codis信息
    codisinfo.delete()
    GenerateCommandLog(codisinfo.product_id,'#result','','delete success')





#@ brief    启动codis服务
#@ param[in] mysqlctl   数据库管理类
#@ param[in] productid    用户标签
#@ param[in] applymem    申请的总容量
#@ param[in] zkip   zk所在主机的ip
#@ param[in] zkport   zk占用的端口号
#@ param[in] dashboardinfo    dashboard所在主机的ip，用户名及密码
def ApplyMemory(zk,productid,applymem,zkinfo,dashboardinfo):
    try:
        global indexline
        indexline=1
        codis=Codis.objects.all()
        productids=[n.product_id for n in codis]
        result=zk.Getcodisproduct(productid)
        if result==0:
            raise MyException('zk中存在同名product')
        if productid not in productids:
            hostlist=GetFitHostList(applymem) #master,slave,proxy1,proxy2
            if hostlist!=None:
                global  CODISHOME
                CODISHOME=Host.objects.all()[0].codis_home
                if not CODISHOME.endswith('/'):
                    CODISHOME += '/'
                proxyhostlist=SelectProxyHost()
                sshgrp,codisid,dashboardport=PreCodis(hostlist,proxyhostlist,productid,zkinfo,dashboardinfo,applymem)
                sshdash=SSH(dashboardinfo[0],dashboardinfo[1])
                StartDashBoard(sshdash,dashboardinfo[0],productid,dashboardport)
                time.sleep(2)
                InitSlots(sshdash,productid)
                portlist=StartCodisServer(sshgrp,hostlist,codisid,productid)#masterport,slaveport
                AddServerGrp(None,sshdash,hostlist, portlist,productid)
                SetServerGrp(sshdash,hostlist,productid)
                StartCodisProxy(proxyhostlist[0],productid,codisid,1)
                StartCodisProxy(proxyhostlist[1],productid,codisid,2)
                StartCodisProxy(proxyhostlist[2],productid,codisid,3)
                StartCodisHA(sshgrp,dashboardinfo[0],dashboardport,productid)
                try:
                    codis=Codis.objects.get(codis_id=codisid)
                except Exception:
                    ac_logger.debug('id错误，查找失败4')
                if CheckCodis(zk,productid,True):
                    codis.available="Y"
                else:
                    codis.available="N"
                codis.save()
                time.sleep(5)
                sshdash.close()
                for n in sshgrp:
                    n.close()
        else:
            ac_logger.error('%s exists'%productid)
    except MyException as error:
        ac_logger.error('异常退出')
        GenerateCommandLog(productid,'Error','',error.message)
    else:
        GenerateCommandLog(productid,'info','','创建成功')


#@ brief   检查编号为codisid的codis服务下所有codisserver是否可用
#@ param[in] codisid   codis服务的编号
#@ param[in] mysqlctl   数据库管理类
#@ param[out] 编号为codisid的codis服务所有server是否可用
def CheckServer(codisid,productid):
    #return True and True
    #serverinfo=GetServerInfoByCodisID(mysqlctl, codisid)
    serverinfo_list=Servers.objects.filter(codis_id=codisid)
    if serverinfo_list:
        serverinfo=serverinfo_list[0]
    else:
        ac_logger.error("错误的codis_id")
        return 
    masret=False
    slaret=False
    if len(serverinfo_list)>=2:
        maret=True
        slret=True
        try:
            for server in serverinfo_list:
                if server.role=='MASTER':
                    pyredis=redis.Redis(host=server.server_ip,port=server.server_port)
                    ret=pyredis.set('k','v')
                    maret = (maret and ret)
                    ac_logger.error("1maret:"+str(maret)+"slret"+str(slret))
                    ac_logger.info(server.server_ip)
                    ac_logger.info(server.server_port)
                    GenerateCommandLog(productid,'check master servers',str(server.server_port)+':'+str(server.server_ip),str(maret))
                    time.sleep(2)
            for server in serverinfo_list:
                if server.role=='SLAVE':
                    pyredis=redis.Redis(host=server.server_ip,port=server.server_port)
                    ret=pyredis.get('k')
                    ac_logger.info('ret')
                    ac_logger.info(ret)
                    ac_logger.info('slret:'+str(slret)+'   ret==v:'+str(ret=='v'))
                    slret = (slret and ret=='v')
                    ac_logger.error("2maret:"+str(maret)+"slret"+str(slret))
                    ac_logger.info(server.server_ip)
                    ac_logger.info(server.server_port)
                    GenerateCommandLog(productid,'check slave servers',str(server.server_port)+':'+str(server.server_ip),str(slret))
                    time.sleep(2)
        except:
            maret=False
        masret=maret
        slaret=slret
    ac_logger.debug('CHECKSERVERS:'+str(masret  and slaret))
    GenerateCommandLog(productid,'check servers','',str(masret and slaret))
    return (masret and slaret)



#@ brief   检查编号为codisid的codis服务所有的proxy是否可用
#@ param[in] codisid  codis服务的编号
#@ param[in] mysqlctl   数据库管理类
#@ param[out] 编号为codisid的codis服务所有的proxy是否可用
def CheckProxy(codisid,productid):
    proxyinfo=Proxy.objects.filter(codis_id=codisid)
    ret=False
    if proxyinfo!=None:
        inret=True
        for proxy in proxyinfo:
            try:
                pyredis=redis.Redis(host=proxy.proxy_ip,port=proxy.proxy_port)
                subret=pyredis.set('k','v')
                inret=inret and subret
            except:
                ac_logger.error("can\'t connect to proxy %s:%d"%(proxy.proxy_ip,proxy.proxy_port))
                GenerateCommandLog(productid,'checkproxy','',"can\'t connect to proxy %s:%d"%(proxy.proxy_ip,proxy.proxy_port))
        ret=inret
    ac_logger.debug('CHECKPROXY:'+str(ret))
    GenerateCommandLog(productid,'checkproxy','',str(ret))
    return ret


#@ brief   检查dashboard是否可用
#@ param[in] dashboardip   dashboard所在主机的ip
#@ param[in] dashboardport   dashboard占用的端口号
#@ param[out] dashboard是否可用
def CheckDashBoard(dashboardip,dashboardport,productid):
    dashhost=GetDashHost()
    if dashhost!=None:
        try:
            sshboard=SSH(dashhost[1],dashhost[2])
            com='netstat -na | grep %d'%dashboardport
            stdin,stdout,stderr=sshboard.exec_command(com)
            out=stdout.readlines()
            for o in out:
                if 'LISTEN' in o:
                    ac_logger.debug('CHECKDASHBOARD:'+str(True))
                    GenerateCommandLog(productid,'checkdashboard',com,'True')
                    return True
        except:
            GenerateCommandLog(productid,'checkdashboard',com,"cann\'t connect to %s"%dashboardip)
            ac_logger.error("cann\'t connect to %s"%dashboardip)
            return False
    ac_logger.debug('CHECKDASHBOARD:'+str(False))
    GenerateCommandLog(productid,'checkdashboard','','False')
    return False


#@ brief   检查productid对应的codis是否可用
#@ param[in] mysqlctl   数据库管理类
#@ param[in] productid   用户标签
#@ param[out] productid对应的codis是否可用
def CheckCodis(zk,productid,flag):
    codisinfo=Codis.objects.filter(product_id=productid)[0]
    if flag and not CheckDashBoard(codisinfo.dashboard_ip, codisinfo.dashboard_port, productid) and CheckServer(codisinfo.codis_id, productid)\
     and CheckProxy(codisinfo.codis_id, productid):
        dashhost=GetDashHost()
        sshdash=SSH(dashhost[1],dashhost[2])
        ResetDashBoard(zk, sshdash, codisinfo.dashboard_ip, productid, codisinfo.dashboard_port)
    return  CheckServer(codisinfo.codis_id, productid) and CheckProxy(codisinfo.codis_id, productid) \
        and CheckDashBoard(codisinfo.dashboard_ip,codisinfo.dashboard_port, productid)
        

#@ brief   将tuple的列表转换为list的列表
#@ param[in] tuplelist   元素为tuple的列表
#@ param[out] list的列表
def Tuple2List(tuplelist):
    classlist=[]
    for innertuple in tuplelist:
        innerclass=[]
        for ele in innertuple :
            innerclass.append(ele)
        classlist.append(innerclass)
    return classlist
            

#@ brief   获取当前主机的可用内存总量
#@ param[in] hostrecord   主机信息
#@ param[out] 当前主机的可用内存总量
def GetFreeMem(hostrecord):
    return long(hostrecord.memory_total-hostrecord.memory_used)


#@ brief   在指定范围内获取三个随机数
#@ param[in] begin  范围的起点
#@ param[in] end   范围的终点
#@ 两个随机数
def GetThreeRan(begin,end):
    if end-begin>=1:
        first=random.randint(begin,end)
        sec=first
        while sec==first:
            sec=random.randint(begin,end)
        third=first
        while third==sec or third==first:
            third=random.randint(begin,end)
        return first,sec,third
    return None

#@ brief   选取proxy所在的主机
#@ param[in] mysqlctl   数据库管理类
#@ param[out] proxy所在的主机列表
def SelectProxyHost():
    proxyhostlist=[]
    hostlist=Host.objects.all()
    first=-1
    second=-1
    third=-1
    first,second,third=GetThreeRan(0,len(hostlist)-1)
    if first!=-1 and second!=-1 and third!=-1:
        proxyhostlist.append(hostlist[first])
        proxyhostlist.append(hostlist[second])
        proxyhostlist.append(hostlist[third])
    return proxyhostlist



#@ brief    获取所有主机可用内存的总数
#@ param[in] hostrecords   所有可用主机的信息列表
#@ param[out] 所有主机可用内存的总数
def GetTotalMem(hostrecords):
    sum=0
    for hostrecord in hostrecords:
        sum+=GetFreeMem(hostrecord)
    return sum


#@ brief   为所有的codisserver获取可用的主机
#@ param[in] mysqlctl   数据库管理类
#@ param[in] applymem   申请的空间总量
#@ param[out] codisserver所在主机列表
def GetFitHostList(applymem):
    classlist=Host.objects.extra(select={'new_order_field':'memory_total-memory_used'}).extra(order_by = ['-new_order_field'])
    totalmem=GetTotalMem(Host.objects.all())
    if applymem*2<=totalmem:
        hostinfolist=[]
        if applymem<SERVERINSTANCEMAXMEMORY:
            SelectMasterHost(hostinfolist,classlist,applymem,1,False)
            SelectMasterHost(hostinfolist,classlist,applymem,1,True)
            if len(hostinfolist)!=2:
                return None
            return hostinfolist
        divided=applymem/SERVERINSTANCEMAXMEMORY
        remin=applymem%SERVERINSTANCEMAXMEMORY
        #选主
        for i in range(0,divided):
            SelectMasterHost(hostinfolist,classlist,SERVERINSTANCEMAXMEMORY,2,True)
        if divided!=0 and len(hostinfolist)!= divided:
            return None
        #选从
        for j in range(0,divided):
            SelectSlaveHost(hostinfolist,classlist,SERVERINSTANCEMAXMEMORY,j,True)
        if remin!=0 and len(hostinfolist)!=divided+1:
            return None
        return hostinfolist
    else:
        ac_logger.error('Apply For Too Much Memory')    


#@ brief   选取一个可用的主机
#@ param[in] hostinfolist   已选中的主机列表
#@ param[in] classlist   数据库中可用主机信息的内存对象
#@ param[in] applymem   申请的容量
#@ param[in] times   容量的倍数
#@ param[in] flag    此次选取的主机是否可以存在于hostinfolist
def SelectMasterHost(hostinfolist,classlist,applymem,times,flag):
    if applymem==0:
        return 
    m=1
    for n in classlist:
        if (n.memory_total-n.memory_used)>=applymem:
            m+=1
    if m==1:
        ac_logger.error('Memory is used out')
        return None
    if not flag:
        hostinfolist.append(classlist[0])
        hostinfolist[-1].applymem=applymem
        classlist[0].memory_used+=applymem*2
        classlist[0].save()
    elif flag:
        hostids=[]
        classlist=Host.objects.extra(select={'new_order_field':'memory_total-memory_used'}).extra(order_by = ['-new_order_field'])
        for sortedhost in classlist:
            if (sortedhost.memory_total-sortedhost.memory_used)>=applymem and sortedhost.host_ip!=GetDashHost()[1]:
                hostinfolist.append(sortedhost)
                hostinfolist[-1].applymem=applymem
                sortedhost.memory_used+=applymem
                sortedhost.save()
                return 

#@ brief   选取一个可用的主机
#@ param[in] hostinfolist   已选中的主机列表
#@ param[in] classlist   数据库中可用主机信息的内存对象
#@ param[in] applymem   申请的容量
#@ param[in] times   容量的倍数
#@ param[in] flag    此次选取的主机是否可以存在于hostinfolist
def SelectSlaveHost(hostinfolist,classlist,applymem,times,flag):
    if applymem==0:
        return
    m=1
    for n in classlist:
        if (n.memory_total-n.memory_used)>=applymem:
            m+=1
    if m==1:
        ac_logger.error('Memory is used out')
        return None
    if not flag:
        hostinfolist.append(classlist[0])
        hostinfolist[-1].applymem=applymem
        classlist[0].memory_used+=applymem*2
        classlist[0].save()
    elif flag:
        hostids=[]
        classlist=Host.objects.extra(select={'new_order_field':'memory_total-memory_used'}).extra(order_by = ['-new_order_field'])
        for sortedhost in classlist:
            if (sortedhost.memory_total-sortedhost.memory_used)>=applymem and sortedhost.host_id!=hostinfolist[times].host_id:
                hostinfolist.append(sortedhost)
                hostinfolist[-1].applymem=applymem
                classlist[0].memory_used+=applymem
                classlist[0].save()
                return


#@ brief   向远程服务器传递文件
#@ param[in] file  文件名
#@ param[in] remotedir   远程服务器存放文件的目录
#@ param[in] ip  远程服务器的ip
#@ param[in] user  远程服务器的用户名
#@ param[in] passwd   远程服务器的密码
#@ param[in] port=22  连接远程服务器的端口号
def SFTPFile(file,remotedir,ip,user,passwd,port=3222):
    pkey = settings.SSH_PKEY
    key=paramiko.RSAKey.from_private_key_file(pkey)
    t=paramiko.Transport((ip,3222))
    t.connect(username=user, pkey=key)
    sftp=paramiko.SFTPClient.from_transport(t) 
    files=os.listdir(local_dir) 
    for f in files: 
        if f==file:
            ac_logger.debug('Begin to upload file  to %s ' % ip) 
            ac_logger.debug('Uploading '+str(os.path.join(local_dir,f))) 
            ac_logger.debug(local_dir)
            ac_logger.debug(remotedir)
            sftp.put(os.path.join(local_dir,f),os.path.join(remotedir,f))
    t.close()



#@ brief   获取连接远程服务器的ssh连接
#@ param[in] ip  远程服务器的ip
#@ param[in] username   远程服务器的用户名
#@ param[in] passwd   远程服务器的密码
#@ param[out] 远程服务器的ssh连接
def SSH(ip,username):  
    #try:  
    pkey = settings.SSH_PKEY
    known_host_dir = settings.SSH_KNOWN_HOSTS
    key=paramiko.RSAKey.from_private_key_file(pkey)
    ssh = paramiko.SSHClient()  
    ssh.load_system_host_keys(settings.SSH_KNOWN_HOSTS)
    ssh.connect(ip,3222,username,None,key)  
    return ssh 
    #except :  
    ac_logger.error('connect to %s\tError\n'%(ip))  
    return None


def CheckHost(ip,user):
    ssh=SSH(ip,user)
    if ssh==None:
        return False
    return True
#@ brief   用于显示网页的主页
#@ param[in] request 
def index(request):
    if request.method == "GET":
        hostinfolist = Host.objects.all().order_by('host_id')
        proxyinfolist = Proxy.objects.all().order_by('proxy_id')
        codisinfolist = Codis.objects.all().order_by('codis_id')
        serverinfolist = Servers.objects.all().order_by('server_id')
        #rxCBK = re.compile("(?:keys=([^#=,&\s]+))", re.I)
        #for codisinfo in codisinfolist:
        #    url = 'http://%s:%s/api/overview'%(codisinfo.dashboard_ip,str(codisinfo.dashboard_port))
        #    res = requests.get(url)
        #    action = json.loads(res.text)
        #    codisinfo.ops = int(action['ops'])
        #    memory_used = 0
        #    key_num = 0
        #    for serverinfo in action['redis_infos']:
        #        memory_used += int(serverinfo['used_memory'])
        #        db0_string = serverinfo['db0']
        #        keys = rxCBK.findall(db0_string)[0]
        #        key_num += int(keys)
        #    memory_used /= 1024*1024*1024
        #    codisinfo.memory_used = memory_used
        #    codisinfo.key_num = key_num
        #    codisinfo.save()
        context={'hostinfolist':hostinfolist,'proxyinfolist':proxyinfolist,\
                 'codisinfolist':codisinfolist,'serverinfolist':serverinfolist}
        return render_to_response('index.html', locals(), context_instance=RequestContext(request))


#@ brief   网页内启动codis服务的接口
#@ param[in] request 
def ApplyMem(request,method):
    if method=="applymem":
        productid=""
        requiremem=-1
        if request.method=="POST":
            productid = request.POST.get('product_id',"")
            requiremem = long(request.POST.get('need_memory',""))
        else:
            productid = request.GET.get('product_id',"")
            requiremem = long(request.GET.get('need_memory',""))
        ac_logger.debug('APPLYMEM-------------------')
        codis_list = Codis.objects.filter(product_id=productid)
        if codis_list:
            mess='1'
            return render_to_response('applymem.html', locals(), context_instance=RequestContext(request))
        t1=NewApply(productid,requiremem,settings.CODIS_ZK_ADDR,GetDashHost()[1:4])
        t1.start()
        mess='2'
        return render_to_response('applymem.html', locals(), context_instance=RequestContext(request))
    else:
        return render_to_response('applymem.html', locals(), context_instance=RequestContext(request))

def deletetheproxy(proxy):
    try:
        codisinfo=Codis.objects.get(codis_id=proxy.codis_id)
        hostinfo=Host.objects.get(host_id=proxy.host_id)
        sshproxy=SSH(hostinfo.host_ip,hostinfo.host_user)
        #杀掉codis-proxy进程
        com="kill -9 `ps -ef | grep codis-proxy | grep %s | awk '{print $2}'`"%str(proxy.proxy_port)
        ac_logger.info(com)
        stdin,stdout,stderr=sshproxy.exec_command(com)
        time.sleep(1)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(codisinfo.product_id,'#kill codis-proxy thread',hostinfo.host_ip+'\n'+com,outstring)
        #删除proxy配置文件
        com='cd %sproxyconf/ && rm ./proxy%d%s.ini'%(CODISHOME,num,codisinfo.product_id)
        ac_logger.info(com)
        sshproxy.exec_command(com)
        time.sleep(1)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(codisinfo.product_id,'#delete codis-proxy config',hostinfo.host_ip+'\n'+com,outstring)
        #删除proxy日志文件
        com='cd %sproxylog/ && rm ./proxy*%s.log*'%(CODISHOME,codisinfo.product_id)
        ac_logger.info(com)
        sshproxy.exec_command(com)
        time.sleep(1)
        outstring=str(stdout.readlines()+stderr.readlines())
        GenerateCommandLog(codisinfo.product_id,'#delete codis-proxy log',hostinfo.host_ip+'\n'+com,outstring)
        sshproxy.close()
        result = {
            "code":"200",
            "msg":"OK",
            "data":"Ok,delete success",
        }
    except Exception as e:
        result = {
            "code":"500",
            "msg":"ERROR:ssh error",
            "data":"ERROR:ssh error",
        } 
    finally:
        return result


## restapi start from here
def packageResponse(result):
    response = HttpResponse(content_type='application/json')
    response.write(json.dumps(result))
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
    return response

