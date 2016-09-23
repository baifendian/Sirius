#encoding=utf8
#email: jinzhu.wang@baifendian.com
from models import *
from user_auth.models import *
from Aries.settings import REST_BASE_URI
import logging
import hashlib
import subprocess
from django.contrib.auth.models import User
import traceback
import datetime,time
import os,sys,json
import threading
from django.conf import settings
from hdfs.function import HDFS
from django.http import HttpResponse
from tools import *

import requests
from requests.auth import HTTPBasicAuth

reload(sys)
sys.setdefaultencoding('utf-8')
hdfs_logger = logging.getLogger("access_log")
StatusCode = { "SUCCESS" : 200,
               "FAILED" : 500
             }
#暂无数据
TableNoData = {"totalList":[],"totalPageNum":0,"currentPage":1}

def packageResponse(result):
    response = HttpResponse(content_type='application/json')
    response.write(json.dumps(result))
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST,GET,PUT, DELETE"
    return response

def share_cmd(space_name,path,permision):
    space =getObjByAttr(Space,"name",space_name)[0]
    space_path = space.address
    exec_user = space.exec_user
    full_path = os.path.realpath("/%s/%s/%s" %(os.path.sep,space_path,path))
    hdfs_logger.info("full_path:{0}".format(full_path))
    exitCode,data = run_hadoop(user_name=exec_user,operator="chmod",args=["-R",permision,full_path])
    return exitCode,data

def deleteshare(request,path):
    share_id = request.GET.get("share_id","")
    result  = {}
    result["code"] = StatusCode["SUCCESS"]
    try:
        #权限恢复700 chmod -R 700 xxxxx
        dataShare = DataShare.objects.get(id=share_id)
        space_name = dataShare.space_name
        source_path = dataShare.source_path
        exitCode,data = share_cmd(space_name,source_path,"700")
        if exitCode != 0:
            result["data"] = "删除分享失败."
            result["code"] = StatusCode["FAILED"]
            hdfs_logger.error("share failed:{0}".format(data))
            return result
        dataShare.delete()
        result["data"] = "删除分享成功."
    except Exception,e:
        hdfs_logger.error(e)
        result["code"] = StatusCode["FAILED"]
        result["data"] = "删除分享失败."
    return result

#创建分享文件（夹）
def postshare(request,path):
    result = {}
    path = os.path.realpath("/%s/%s" %(os.path.sep,path))
    space_name = request.GET.get("spaceName","")
    proxy_link = hashlib.md5("%s%s%s" %(space_name,path,int(time.time()))).hexdigest()
    proxy_link = "{0}/{1}/{2}".format(settings.SHARE_PROXY_BASE_URI,"HDFS/ShowShare",proxy_link)
    hdfs_logger.info("proxy_link:{0}".format(proxy_link)) 
    # 设置目录权限 chmod -R 755 space_path/path
    exitCode,data = share_cmd(space_name,path,"755")
    if exitCode != 0:
        result["code"] = StatusCode["FAILED"]
        result["data"] = "分享失败"
        hdfs_logger.error("share failed:{0}".format(data))
        return result
    try:
        share_user = getUser(request).username
        share_type = request.GET.get("permission", "private")
        if share_type != "public":
            share_type = "private"
        share_validity = int(request.GET.get("Validity", "10"))
        datashare = DataShare.objects.create(source_path=path,proxy_path=proxy_link, share_type=share_type, share_user=share_user, share_validity=share_validity,space_name=space_name)
        datashare.save()
        if datashare:
            result["code"]=StatusCode["SUCCESS"]
            result["data"] = proxy_link
            result["proxy_link"] = proxy_link
        else:
            exitCode,data = run_hadoop(user_name=exec_user,operator="chmod",args=["-R",700,full_path])
            if exitCode !=0:
                hdfs_logger.error("分享失败,恢复失败. error:{0}".format(data))
            else:
                hdfs_logger.info("分享失败,恢复成功.")
            result["code"]=StatusCode["FAILED"]
            result["data"] = "分享失败"
            result["proxy_link"] = ""
    except:
        hdfs_logger.error(traceback.format_exc())
        result["code"]=StatusCode["FAILED"]
        result["data"] = "分享失败"
    return result

#显示分享文件（夹）的信息
def getshare(request,path):
    result = {}
    space_name = request.GET.get("spaceName")
    hdfs_logger.info("space_name:{0}".format(space_name))
    if space_name:
        try:
            sharelist = DataShare.objects.filter(space_name=space_name)
            result["code"] = StatusCode["SUCCESS"]
            totalList = [
                            {
                                'id':share.id,
                                'source_path':share.source_path,
                                'proxy_path':share.proxy_path,
                                'share_time':share.share_time.strftime("%Y-%m-%d %H:%M:%S"),
                                'share_validity':share.share_validity,
                                'share_user':share.share_user,
                                'is_validity': 1 if time.mktime((share.share_time+datetime.timedelta(days=share.share_validity)).timetuple())> \
                                                    time.mktime(datetime.datetime.now().timetuple()) else 0,
                                'desc':share.desc
                            } for share in sharelist
                        ]
            data = {"totalList":totalList,"totalPageNum":len(totalList),"currentPage":1}
            result["data"] = data
        except:
            hdfs_logger.info(traceback.format_exc())
            result["code"]=StatusCode["SUCCESS"]
            result["data"] = TableNoData
    else:
        hdfs_logger.error("space_name is not exist!")
        result["code"]=StatusCode["SUCCESS"]
        result["data"] = TableNoData
    return result

def compress_backgroud(exec_user,operator,args):
    exitCode,data = run_hadoop(user_name=exec_user,operator="compress",args=args)
    if exitCode !=0:
        hdfs_logger.error("压缩失败.日志如下:")
        hdfs_logger.error(data)    

#压缩文件
def compress(request,path):
    nowuser = getUser(request)
    result = {}
    space_name = request.GET.get("spaceName")
    space =getObjByAttr(Space,"name",space_name)[0]
    space_path = space.address
    exec_user = space.exec_user
    full_path = os.path.realpath("/%s/%s/%s" %(os.path.sep,space_path,path))
    hdfs_logger.info("compress full_path:{0}".format(full_path))
    #单独启动一个线程进行压缩
    t = threading.Thread(target=compress_backgroud,args=(exec_user,"compress",[full_path]))
    t.start()
    result["code"] = 200
    result["data"] = "目录:{0}正在压缩.请稍等".format(path)
    return result 

def share(request, path):
    if request.method == "POST":
        result = postshare(request, path)
    elif request.method == "DELETE":
        result = deleteshare(request,path)
    else:
        result = getshare(request, path)
    return result

#获取删除的log
def get_delete(request, path):
    nowuser = getUser(request)
    result = {}
    try:
        fileOperateType = FileOperatorType.objects.get(name='delete')
        dataoperate = DataOperator.objects.filter(o_user=nowuser, o_type=fileOperateType)
        data = []
        for dp in dataoperate:
            if time.mktime((dp.o_time+datetime.timedelta(days=1)).timetuple())>time.mktime(datetime.datetime.now().timetuple()):
                dp_dict = {}
                dp_dict[u"id"] = dp.id
                dp_dict[u"source_path"] = dp.source_path
                dp_dict[u"o_time"] = datetime.datetime.strftime(dp.o_time,'%Y-%m-%d %H:%M:%S')
                data.append(dp_dict)
        result["data"] = data
        result["code"] = StatusCode["SUCCESS"]
    except:
        hdfs_logger.debug(traceback.format_exc())
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = TableNoData
    return result


#删除文件（夹）
def de_delete(request, path):
    filterStr = request.GET.get("filter","").lower()
    if filterStr == "trash":
        space_name = request.GET.get("spaceName","")
        exec_user,space_path = getSpaceExecUserPath(space_name)
        source_path = trashPath(space_path)
        path = os.path.realpath("/%s/%s/%s" % (os.path.sep,source_path,path))
    elif filterStr == "share":
        shareId = request.GET.get("shareId")
        path,source_path = sharePath(shareId,path)
    else:
        space_name = request.GET.get("spaceName","")
        exec_user,space_path = getSpaceExecUserPath(space_name)
        path = os.path.realpath("/%s/%s/%s" % (os.path.sep,space_path,path))

    ac_logger.info("path:%s" %path)
    result={}
    nowuser = getUser(request)
    exitCode,data = run_hadoop(user_name=exec_user,operator="rmr",args=[path])
    ac_logger.info("data:%s" %data)
    if exitCode != 0:
        result["code"] = StatusCode["FAILED"]
        result["data"] = "删除失败!"
    else:
        o_type = FileOperatorType.objects.get(name='delete')
        fileopt = DataOperator.objects.create(source_path=path, target_path="-", o_type=o_type, o_user=nowuser.username)
        fileopt.save()
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = "删除成功!"
    return result
   

#删除文件（夹）
def delete(request, path):
    if request.method == "DELETE":
        result = de_delete(request, path)
    elif request.method == "GET":
        result = get_delete(request, path)
    else:
        result={}
        result["code"] = StatusCode["FAILED"]
        result["data"] = "删除文件不支持此类型的请求."
    return result

#配额回收
def capacityRecovery(request, space_name):
    result={}
    try:
        space = Space.objects.get(space_name=space_name)
        space.capacity = 0
        space.is_active = 0
        space.save()
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = "OK"
    except:
        hdfs_logger.debug(traceback.format_exc())
        result["code"] = StatusCode["FAILED"]
        result["data"] = "FAILED"
    return result

#申请扩容
def upSet(request, path):
    result = {}
    t = getUser(request)
    try:
        body_data = request.data
        capacity_value = body_data["capacity"]
        hdfs_logger.info("upSet capacity_value:{0}".format(capacity_value))
        space_name = request.GET.get("spaceName","")
        if capacity_value > 0:
            space = Space.objects.get(name=space_name)
            capacity = eval(space.capacity)
            used = capacity["used"]
            hdfs_logger.info("used: {0}, total: {1}, plan: {2}".format(used,capacity_value,capacity["plan"]))
            if int(used) > int(capacity_value):
                result["code"] = StatusCode["SUCCESS"]
                result["data"] = "配额扩容失败. 扩容后的容量小于当前已经使用的容量"
            else:
                capacity["total"] = capacity_value
                space.capacity = capacity
                space.save()
                result["code"] = StatusCode["SUCCESS"]
                result["data"] = "配额扩容成功"
    except:
        hdfs_logger.error(traceback.format_exc())
        result["code"] = StatusCode["FAILED"]
        result["data"] = "配额扩容失败."
    return result


#获取已使用容量和总容量
def sumSpace(request, path):
    result={}
    space_name = request.GET.get("spaceName","")
    #没有space_name则直接返回所有的space容量统计
    if space_name:
        spaces = Space.objects.filter(name="space_name")
    else:
        spaces = Space.objects.all()
    data = []
    for space in spaces:
        #capacity = json.loads(space.capacity) 
        capacity =eval(space.capacity)
        used =int(capacity["used"])
        total = int(capacity["total"])
        plan = int(capacity["plan"])
        remianing = total - used
        data.append({"remianing_capacity":remianing,"used_capacity":used,"total_capacity":total,"name":space.name,"plan_capacity":plan})
    if data:
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = data
    else:
        result["code"] = StatusCode["FAILED"]
        result["data"] = "容量获取失败"
    return result
   
#移动文件夹
def mv_or_cp(request, path):
    hdfs_logger.info("1.....")
    space_name = request.GET.get("spaceName","")
    exec_user,space_path = getSpaceExecUserPath(space_name)
    filterStr = request.GET.get("filter","").lower()
    destination = request.GET.get('destination','')
    destination = os.path.realpath("/%s/%s/%s" % (os.path.sep,space_path,destination))
    if filterStr == "trash":
        source_path = trashPath(space_path)
        path = os.path.realpath("/%s/%s/%s" % (os.path.sep,source_path,path))
        hdfs_logger.info("2")
    elif filterStr == "share":
        hdfs_logger.info("3")
        shareId = request.GET.get("shareId")
        path,source_path = sharePath(shareId,path)
    else:
        hdfs_logger.info("4")
        path = os.path.realpath("/%s/%s/%s" % (os.path.sep,space_path,path))
    hdfs_logger.info("5")
    hdfs_logger.info("path:{0},destination:{1}".format(path,destination))
    result = {}
    if len(destination) > 0:
        try:
            op = request.GET.get("op","mv").lower()
            exitCode,data = run_hadoop(user_name=exec_user,operator=op,args=[path,destination])
            if exitCode == 0:
                nowuser = getUser(request)
                o_type = FileOperatorType.objects.get(name=op)
                fileopt = DataOperator.objects.create(source_path=path, target_path=destination, o_type=o_type, o_user=nowuser)
                result["code"] = StatusCode["SUCCESS"]
                result["data"] = "移动成功!"
            else:
                result["code"] = StatusCode["FAILED"]
                result["data"] = "移动失败!"
        except:
            hdfs_logger.debug(traceback.format_exc())
            result["code"] = StatusCode["FAILED"]
            result["data"] = "移动失败!"
    else:
        hdfs_logger.info("用户%s的请求：目的路径不明确!"%(getUser(request)))
        result["code"] = StatusCode["FAILED"]
        result["data"] = "移动失败!"
    return result

def list_status(request, path):
    path = os.path.realpath("/%s/%s" % (os.path.sep, path))
    hdfs = HDFS()
    return hdfs.list_status(path, request)

def list_status_tree(request,path):
    path = os.path.realpath("/%s/%s" % (os.path.sep, path))
    hdfs = HDFS()
    baseData = hdfs.list_status(path, request)
    result = {}
    try: 
        if baseData:
            data=[{
                     "name":k["name"],
                     "isParent":"true",
                   } for k in baseData["data"]["totalList"]
                     if k["is_dir"]==1 ]
        else:
            data=[]
        hdfs_logger.info("liststatustree:%s" %data)
        result["code"] =  StatusCode["SUCCESS"]
        result["data"] = data
    except Exception,e:
        hdfs_logger.error("%s" %e)
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = []
    return result

def make_dir(request, path):
    hdfs_logger.info("make_dir")
    path = os.path.realpath("/%s/%s" % (os.path.sep, path))
    hdfs = HDFS()
    return hdfs.make_dir(path, request)

def upload(request, path):
    path = os.path.realpath("%s/%s" % (os.path.sep, path))
    hdfs = HDFS()
    return hdfs.upload(path, request)

def download(request, path):
    path = os.path.realpath("%s/%s" % (os.path.sep, path))
    hdfs = HDFS()
    return hdfs.download(path, request)

def showShare(request,path):
    result = {}
    try:
        path = os.path.realpath("%s/%s" %(os.path.sep,path))
        hdfs = HDFS()
        result = hdfs.list_status_share(request,path)
    except Exception,e:
        hdfs_logger.error(traceback.format_exc())
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = TableNoData
    finally:
        return result

def HostStateGET(request):
    dic = host_state_and_relation_req()
    result = {}
    if not dic.has_key('status'):
        all_host = []
        unhealthy_host = []
        for i in dic['items']:
            for j in i['host_components']:
                all_host.append(j['HostRoles']['host_name']) #所有主机
                if j['HostRoles']['service_name'] == 'HDFS' and j['HostRoles']['state'] == 'INSTALLED' and j['HostRoles']['component_name'] is not 'HDFS_CLIENT':
                    unhealthy_host.append(j['HostRoles']['host_name']) #不健康的主机
        healthy_host = [i for i in all_host if i not in unhealthy_host]
        a = list(set(all_host))
        result["code"] = StatusCode["SUCCESS"]
        data = {}
        data["healthy"] = list(set(healthy_host))
        data["except"] = list(set(unhealthy_host))
        data["all"] = a
        result["data"] = data
    else:
        result["code"] = StatusCode["FAILED"]
        result["data"] = "主机状态获取失败"
    ac_logger.info('result........:%s'%result)
    return result

def RelationGET(request, host_name):
    dic = host_state_and_relation_req()
    relation = []
    result = {}
    allhost = []
    if not dic.has_key('status'):
        for i in dic['items']:
            for j in i['host_components']:
                allhost.append(j['HostRoles']['host_name'])
                if host_name in allhost:
                    if j['HostRoles']['service_name'] == 'HDFS' and j['HostRoles']['component_name'] is not 'HDFS_CLIENT' and j['HostRoles']['host_name'] == host_name:
                         relation.append({"component": j['HostRoles']['component_name'], "state": j['HostRoles']['state']})
                         result["code"] = StatusCode["SUCCESS"]
                         result["data"] = relation
                else:
                    result["code"] = StatusCode["FAILED"]
                    result["data"] = '主机关系获取失败'
    else:
        result["code"] = StatusCode["FAILED"]
        result["data"] = "主机关系获取失败"
    ac_logger.info('result........:%s'%result)
    return result

def HostInfoGET(request, host_name):
    import time
    dic = host_desc_req()
    relation = []
    result = {}
    data = {}
    if dic.has_key('items'):
        for i in dic['items']:
            if i['Hosts']['host_name'] == host_name:
                data['host_name'] = host_name
                data['ip'] = i['Hosts']['ip']
                data['cpu_count'] = i['Hosts']['cpu_count']
                data['total_mem'] = format(i['Hosts']['total_mem'] / float(1024) / float(1024), '.2f') + 'GB'
                data['os'] = i['Hosts']['os_type'] + ' '+ '(' + i['Hosts']['os_arch'] + ')'
                last_heartbeat = ( int(str(time.time())[:10]) - int(str(i['Hosts']['last_heartbeat_time'])[:10]) )
                if last_heartbeat < 60:
                    data['last_heartbeat_time'] = str(last_heartbeat) + ' ' + 'seconds ago'
                elif last_heartbeat > 60 :
                    data['last_heartbeat_time'] = str(last_heartbeat / 60 ) + ' ' + 'minutes ago'
                elif last_heartbeat > 3600 :
                    data['last_heartbeat_time'] = str(last_heartbeat / 3600 ) + ' ' + 'hours ago'
                data['load_avg'] = ''
        result['code'] = StatusCode['SUCCESS']
        result['data'] = data
        return result
    else:
        result['code'] = StatusCode['FAILED']
        result['data'] = '主机信息获取失败'
    return result


def OperateServicePOST(request, command, params):
    import requests
    from requests.auth import HTTPBasicAuth
    result = {}
    url = '{0}requests'.format(settings.AMBARI_URL)
    files = '{"RequestInfo":{"context":"Execute %s By Sirius","command":"ARCHIVE","parameters/path":"/%s"},"Requests/resource_filters":[{"service_name":"HDFS","component_name":"HDFS_CLIENT","hosts":"%s"}]}' %(command, params,settings.HADOOP_CLIENT)
    r = requests.post(url, files, auth=HTTPBasicAuth(settings.AMBARI_USER,settings.AMBARI_PASSWORD))
    a = eval(r.text.encode('ascii'))
    if a.has_key('Requests') and a['Requests']['status'] == 'Accepted':
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = "操作成功"
    else:
        result["code"] = StatusCode["FAILED"]
        result["data"] = "操作失败"
    ac_logger.info('result........:%s'%result)
    return result

def OperateComponentPOST(request, host_name, component_name, operate):
    import requests
    from requests.auth import HTTPBasicAuth
    result = {}
    url = '{0}requests'.format(settings.AMBARI_URL)
    files = '{"RequestInfo":{"command":"RESTART","context":"Restart %s via Sirius","operation_level":{"level":"HOST","cluster_name":"hlg_ambari"}}, "Requests/resource_filters":[{"service_name":"HDFS","component_name":"%s","hosts":"%s"}]}' %(component_name, component_name, host_name)
    r = requests.post(url, files, auth=HTTPBasicAuth(settings.AMBARI_USER,settings.AMBARI_PASSWORD))
    a = eval(r.text.encode('ascii'))
    if a.has_key('Requests') and a['Requests']['status'] == 'Accepted':
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = "操作成功"
    else:
        result["code"] = StatusCode["FAILED"]
        result["data"] = "操作失败"
    ac_logger.info('result........:%s'%result)
    return result
         
def OperateComponentPUT(request, host_name, component_name, operate):
    import requests
    from requests.auth import HTTPBasicAuth
    result = {}
    url = '%shosts/%s/host_components/%s' %(settings.AMBARI_URL,host_name, component_name)
    if operate == 'STOP':
        files = '{"RequestInfo": {"context" :"STOP %s via Sirius"}, "HostRoles": {"state": "INSTALLED"}}'%component_name
    else:
        files = '{"RequestInfo": {"context" :"START %s via Sirius"}, "HostRoles": {"state": "STARTED"}}'%component_name
    r = requests.put(url, files, auth=HTTPBasicAuth(settings.AMBARI_USER,settings.AMBARI_PASSWORD))
    a = eval(r.text.encode('ascii'))
    if a.has_key('Requests') and a['Requests']['status'] == 'Accepted':
        result["code"] = StatusCode["SUCCESS"]
        result["data"] = "操作成功"
    else:
        result["code"] = StatusCode["FAILED"]
        result["data"] = "操作失败"
    return result

def host_state_and_relation_req():
    extendUrl = "hosts?fields=host_components/HostRoles/state,host_components/HostRoles/service_name"
    return requestEval(extendUrl)

def host_desc_req():
    import time
    extendUrl = "hosts?fields=Hosts/host_name,Hosts/public_host_name,Hosts/cpu_count,Hosts/ph_cpu_count,Hosts/host_status,Hosts/last_heartbeat_time,Hosts/ip,host_components/HostRoles/state,Hosts/total_mem,Hosts/os_arch,Hosts/os_type&sortBy=Hosts/host_name.asc&_=%s" %(int(time.time()))
    return requestEval(extendUrl)

def requestEval(url):
    fullUrl = "%s%s" %(settings.AMBARI_URL,url)
    ac_logger.info(fullUrl)
    r = requests.get(fullUrl, auth=HTTPBasicAuth(settings.AMBARI_USER,settings.AMBARI_PASSWORD))
    dic = eval(r.text)
    return dic

def getOverview(request):
    spaceName = request.GET.get("spaceName")
    result = {}
    result["code"] = StatusCode["SUCCESS"]
    data = {}
    #使用百分比
    space = getObjByAttr(Space,"name",spaceName)
    if space:
        capacity = space[0].capacity
        capacity = eval(capacity)
        used = capacity["used"]
        total = capacity["total"]
        try:
            hdfs_disk_used = float(used)/float(total)
        except Exception,e:
            ac_logger.error(e)
            hdfs_disk_used = 0
    else:
        hdfs_disk_used = 0
    #分享个数
    try:
        hdfs_shares = DataShare.objects.filter(space_name = spaceName).count()
    except Exception,e:
        ac_logger.error("hdfs_shares is get failed. so set default 0.")
        hdfs_shares = 0
    #datanode状态个数
    try:
        extendUrl = "services/HDFS/components/DATANODE"
        dic = requestEval(extendUrl)
        total_count = dic["ServiceComponentInfo"]["total_count"] 
        started_count = dic["ServiceComponentInfo"]["started_count"]
        hdfs_datanodes = "{0}/{1}".format(started_count,total_count)
    except Exception,e:
        ac_logger.error(e) 
        hdfs_datanodes = "0/0"
    data["hdfs_disk_used"] = hdfs_disk_used
    data["hdfs_shares"] = hdfs_shares
    data["hdfs_datanodes"] = hdfs_datanodes
    result["data"] = data
    return result

OP_DICT={
    "GET":{
        "DELETE":delete,
        "SHARE":share,
        "SUM":sumSpace,
        "LISTSTATUS": list_status,
        "DOWNLOAD": download,
        "LISTSTATUSTREE":list_status_tree,
    },
    "POST":{
        "SHARE":share,
        "UPLOAD": upload,
        "MKDIRS":make_dir,
        "COMPRESS":compress,
    },
    "PUT":{
        "UPSET":upSet,
        "MV":mv_or_cp,
        "CP":mv_or_cp,
    },
    "DELETE":{
        "DELETE":delete,
        "CAPACITYRECOVERY":capacityRecovery,
        "SHARE":share,
    }
}
