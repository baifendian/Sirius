# coding:utf-8
import Queue
import json
import threading
import logging
import subprocess
import httplib
import os
import errno
import time
import ConfigParser
from Aries.settings import BASE_DIR,IP_CINDER,PORT_CINDER,IP_KEYSTONE,PORT_KEYSTONE,IP_NOVA,PORT_NOVA,DATABASES

pro_path = os.path.join(BASE_DIR,"openstack/middleware/common")
# pro_path = os.path.split(os.path.realpath(__file__))[0]    //模块测试时用这个
LOG_PATH = os.path.join(pro_path, "log")  # 日志路径
LOG_FLAG = True  # 日志开关
POLL_TIME_INCR = 0.5
#opensatck配置
IP_keystone = IP_KEYSTONE
PORT_keystone = PORT_KEYSTONE
IP_nova = IP_NOVA
PORT_nova = PORT_NOVA
IP_cinder = IP_CINDER
PORT_cinder = PORT_CINDER
#数据库配置
DB_host = DATABASES["default"]["HOST"]
DB_name = DATABASES["default"]["NAME"]
DB_user = DATABASES["default"]["USER"]
DB_password = DATABASES["default"]["PASSWORD"]
TIMEOUT = 60


def exec_shell(cmd):
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    p.wait()
    out = p.stdout
    err = p.stderr
    ret = p.returncode
    return out, err, ret


def prints(msg):
    print json.dumps(msg, indent=4)


def get_time():
    value = time.time()
    format = '%Y-%m-%d %H:%M:%S'
    value = time.localtime(value)
    time_now = time.strftime(format, value)
    return time_now


def init_log(logfile=os.path.join(LOG_PATH, "dashboard.log")):
    try:
        if not os.path.exists(LOG_PATH):
            os.makedirs(LOG_PATH)
        logger = logging.getLogger()
        handler = logging.FileHandler(logfile)
        formatter = logging.Formatter('[%(asctime)s][%(levelname)s]: %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        return logger
    except:
        pass


logger = init_log()


def dlog(log, lever="INFO"):
    '''
    日志打印方法
    :param log:
    :param lever:
    :return:
    '''
    global LOG_FLAG
    assert LOG_FLAG == True
    try:
        global logger
        lever = lever.upper()
        if lever == "INFO":
            logger.info(log)
        elif lever == "DEBUG":
            logger.debug(log)
        elif lever == "WARNING":
            logger.warning(log)
        elif lever == "ERROR":
            logger.error(log)
        elif lever == "CRITICAL":
            logger.critical(log)
    except:
        pass


def send_request(methods, ip, port, path, params, head={}, flag=0):
    try:
        if params:
            params_str = json.dumps(params)
        else:
            params_str = ""
        conn = httplib.HTTPConnection("%s:%s" % (ip, port))
        # path = "%s?%s"%(path,params_str)
        if head:
            conn.request(methods, path, params_str, head)
        else:
            conn.request(methods, path, params_str)
        res = conn.getresponse()
        # print res.status, res.reason
        assert res.status in [200, 201, 202, 203, 204], "send_request status=%s,reason=%s,params=%s" % (
        res.status, res.reason, params_str)
        if flag:
            token_id = res.getheader("X-Subject-Token", "")
            res_json = json.loads(res.read())
            res_json.update({"token_id": token_id})
        else:
            try:
                res_json = json.loads(res.read())
            except:
                res_json = ""
                pass
        # print res_json
        ret = res_json
    except Exception, err:
        dlog("send_request err:%s" % err, lever="ERROR")
        ret = 1
    return ret


# 工作线程池
class WorkPool():
    def __init__(self):
        self.queue = Queue.Queue()
        self.worklist = []
        self.retList = []

    def task_add(self, fun, arglist):
        self.queue.put((fun, arglist))

    def work_add(self, threadnum=3):
        for i in range(threadnum):
            self.worklist.append(WorkThread(self.queue, self.retList))

    def work_start(self):
        for work in self.worklist:
            work.start()

    def work_wait(self, time=120):
        for work in self.worklist:
            if work.isAlive():
                work.join(time)
        self.worklist = []


class WorkThread(threading.Thread):
    def __init__(self, queue, retList):
        threading.Thread.__init__(self)
        self.work_queue = queue
        self.retList = retList

    def run(self):
        while True:
            try:
                fun, args = self.work_queue.get(block=False)
                ret = fun(*args)
                # self.lock.acquire()
                self.retList.append(ret)
                # self.lock.release()
            except Exception, data:
                break


class exec_thread(threading.Thread):
    def __init__(self, target, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        self.target = target
        self.exception = None
        threading.Thread.__init__(self)

    def run(self):
        try:
            self.retval = self.target(*self.args, **self.kwargs)
        except Exception as e:
            self.exception = e
            dlog("exec_thread err:%s" % e, lever="ERROR")


def run_in_thread(target, *args, **kwargs):
    interrupt = False
    timeout = kwargs.pop('timeout', 0)
    countdown = timeout
    t = exec_thread(target, *args, **kwargs)
    t.daemon = True
    t.start()
    try:
        while t.is_alive():
            t.join(POLL_TIME_INCR)
            if timeout and t.is_alive():
                countdown = countdown - POLL_TIME_INCR
                if countdown <= 0:
                    raise KeyboardInterrupt
        t.join()
    except KeyboardInterrupt:
        dlog("method:%s timeout" % target.func_name, lever="ERROR")
        interrupt = True
    if interrupt:
        t.retval = -errno.EINTR
    if t.exception:
        raise t.exception
    return t.retval


# 异常日志记录，做装饰符使用
def plog(method_name):
    def logs(func):
        def catch_log(*args, **kwargs):
            try:
                ret = 0
                dlog("start %s" % method_name, lever="DEBUG")
                ret = func(*args, **kwargs)
                dlog("finsh %s" % method_name, lever="DEBUG")
            except Exception, err:
                ret = 1
                dlog("%s err:%s" % (method_name, err), lever="ERROR")
            return ret

        return catch_log

    return logs
