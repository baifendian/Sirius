#encoding=utf-8
from user_auth.models import *
from django.conf import settings
from hdfs.tools import *
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
hdfs_logger = logging.getLogger("hdfs_log")

def sumSpace():
    hdfs_logger.info("##########sumSpace 统计开始.")
    spaces = Space.objects.all()
    for space in spaces:
        path = space.address
        exec_user = space.exec_user
        operator = "du"
        args = [path]
        name = space.name
        capacity =json.load(space.capacity)
        exitCode,data = run_hadoop(user_name=exec_user,operator="du",args=args)
        if exitCode!=0:
            continue
            hdfs_logger.log("path:{0}.".format(path))
        else:
            capacity["used"] = int(data)/1024.0/1024/1024
            hdfs_logger.info("spaceName:{0}, path:{1}, capacity:{2}".format(name,path,capacity))
            capacity = json.dumps(capacity)
            space.capacity = capacity
            space.save()
    hdfs_logger.info("###########sumSpace 统计结束.")
if __name__ == "__main__"
    sumSpace()
