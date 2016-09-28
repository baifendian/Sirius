#encoding=utf8
#desc: 主要放一下装饰器工具
#email: pan.lu@baifendian.com
import functools
import logging
import os
import pwd
import subprocess
import sys
from django.conf import settings
from user_auth.models import *
from hdfs.models import *
ac_logger = logging.getLogger("cmd_log")

def run_hadoop(user_name="hadoop",operator="ls",args=["/user/hadoop",]):
    pw_record = pwd.getpwnam(user_name)
    user_name      = pw_record.pw_name
    user_home_dir  = pw_record.pw_dir
    user_uid       = pw_record.pw_uid
    user_gid       = pw_record.pw_gid
    env = os.environ.copy()
    env[ 'HOME'     ]  = user_home_dir
    env[ 'LOGNAME'  ]  = user_name
    #env[ 'PWD'      ]  = cwd
    env[ 'USER'     ]  = user_name
    cur_dir = os.path.join(os.getcwd(),"Aries/hdfs")
    run_script = os.path.join(cur_dir,settings.HADOOP_RUN_SCRIPT)
    cmd=["sh",run_script,operator]
    cmd= cmd + args
    cmd = " ".join(cmd)
    ac_logger.info("cmd:{0}".format(cmd))
    process = subprocess.Popen(
        cmd,shell=True, preexec_fn=demote(user_uid, user_gid), env=env,stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    result = process.wait()
    if result != 0:
        return  result,"{0} run error".format(cmd)
    else:
        if operator.upper() == "DU":
            for line in process.stdout.read().split("\n"):
                if line.strip().isdigit():
                    return result,line.strip()
        return  result,process.stdout.read()

def demote(user_uid, user_gid):
    def result():
        os.setgid(user_gid)
        os.setuid(user_uid)
    return result

def print_request(request_data):
    '''
      打印请求的参数
    '''
    @functools.wraps(request_data)
    def wrapper(*args, **kwds):
      ac_logger.info("print_request: %s" %args[1].data)
      ac_logger.info("print_request username: %s" %(args[1].user.username))
      return request_data(*args, **kwds)
    return wrapper

def print_args(argsv):
    '''
       打印传进来的参数
    '''
    @functools.wraps(argsv)
    def wrapper(*args, **kwds):
      #ac_logger.info("print args: %s" %args[1])
      return argsv(*args,**kwds)
    return wrapper

def getUser(request):
    user = request.user
    #user = User.objects.get(username="pan.lu")
    ac_logger.info("user:%s" %user.username)
    return user

def getSpaceExecUserPath(space_name):
    exec_user = ""
    space_path = ""
    try:
        spaces = getObjByAttr(Space,"name",space_name)
        space = spaces[0]
        space_path = space.address
        exec_user = space.exec_user
    except Exception,e:
        ac_logger.error(e.message)
        ac_logger.error("space_name:{0}".format(space_name))
    finally:
        return exec_user,space_path

def getObjByAttr(cla,name,value):
    return cla.objects.filter(name=value)

def getObjAll(cla):
    return cla.objects.all()

def getObjById(cla,id):
    try:
        obj =cla.objects.get(id=id)
        return obj
    except Exception,e:
        ac_logger.error("%s" %e)
        return None

def delObjById(cla,id):
    try:
        obj = cla.objects.get(id=id)
        obj.delete()
        return 200
    except Exception,e:
        ac_logger.error("%s" %e)
        return 500

def trashPath(space_path):
    trashPath =  os.path.realpath("/%s/%s/%s/%s" %(os.path.sep,space_path,"/.Trash/Current/",space_path))
    return trashPath

def sharePath(shareId,path):
    dataShare = DataShare.objects.filter(proxy_path__icontains=shareId)[0]
    source_path = dataShare.source_path
    if path != "/":
        source_path = "/".join(source_path.split("/")[:-1])
    space_name = dataShare.space_name
    exec_user,space_path = getSpaceExecUserPath(space_name)
    ac_logger.info("space_path:{0}, source_path:{1},path:{2}".format(space_path,source_path,path))
    real_path = os.path.realpath("%s/%s/%s/%s" %(os.path.sep,space_path,source_path,path))
    return real_path,source_path

def unitTransform(size,index,unit):
    if size/1024.0 > 1024:
        b = size/1024.0
        index = index+1
        return unitTransform(b,index,unit)
    elif size/1024.0 < 1:
        return "{0} {1}".format(round(size,1),unit[index])
    elif size/1024.0 >1 and size/1024.0 < 1024:
        b = size/1024.0
        index = index+1
        return "{0} {1}".format(round(b,1),unit[index])

@print_request
def test(a,b):
  print a

@print_args
def test2(a,b):
  print a,b

if __name__=="__main__":
  unitTransform(1025,0,["KB","MB","GB","TB"])
  #print "aaa"
  #test(3,4)
  #test2(3,4)
