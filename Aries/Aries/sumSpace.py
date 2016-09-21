#encoding=utf-8
from user_auth.models import *
from django.conf import settings
from hdfs.tools import *
import sys
import threading
import time
import json
reload(sys)
sys.setdefaultencoding('utf-8')
hdfs_logger = logging.getLogger("hdfs_log")

def sumSpace(operator='du'):
    hdfs_logger.info("##########sumSpace count start.")
    spaces = Space.objects.all()
    for space in spaces:
        path = space.address
        exec_user = space.exec_user
        operator = "du"
        args = [path]
        name = space.name
        capacity = eval(space.capacity)
        try:
            exitCode,data = run_hadoop(user_name=exec_user,operator=operator,args=args)
        except Exception,e:
            hdfs_logger.error(traceback.format_exc())
        else:
            if exitCode != 0:
                hdfs_logger.log("path:{0}.".format(path))
                continue
            else:
                capacity["used"] = int(data)/1024.0/1024/1024
                hdfs_logger.info("spaceName:{0}, path:{1}, capacity:{2}".format(name,path,capacity))
                space.capacity = capacity
                space.save()
    hdfs_logger.info("###########sumSpace count end.")

def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()
    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t

def run(pollTime):
    set_interval(sumSpace,pollTime)
