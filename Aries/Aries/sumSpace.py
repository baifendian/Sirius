#encoding=utf-8
from user_auth.models import *
from django.conf import settings
from hdfs.tools import *
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
hdfs_logger = logging.getLogger("hdfs_log")

def sumSpace():
    spaces = Space.objects.all()
    for space in spaces:
        path = space.address
        exec_user = space.exec_user
        operator = "du"
        args = [path]
        capacity =json.load(space.capacity)
        exitCode,data = run_hadoop(user_name=exec_user,operator="du",args=args)
        if exitCode!=0:
            continue
            hdfs_logger.log("path:{0}.".format(path))
        else:
            capacity["used"] = int(data)
            hdfs_logger.info("path:{0},capacity:{1}".format(path,capacity))
            capacity = json.dumps(capacity)
            space.capacity = capacity
            space.save()
        
if __name__ == "__main__"
    sumSpace()
