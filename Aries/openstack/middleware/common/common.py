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
import copy
import ConfigParser
from Aries.settings import BASE_DIR, IP_CINDER, PORT_CINDER, IP_KEYSTONE, PORT_KEYSTONE, IP_NOVA, PORT_NOVA, DATABASES, \
    OPENSTACK_KEY_PATH

# from openstack.views import openstack_log
openstack_log = logging.getLogger("openstack_log")
pro_path = os.path.join(BASE_DIR, "openstack/middleware/common")
# pro_path = os.path.split(os.path.realpath(__file__))[0]    //模块测试时用这个
LOG_PATH = os.path.join(pro_path, "log")  # 日志路径
POLL_TIME_INCR = 0.5
# opensatck配置
IP_keystone = IP_KEYSTONE
PORT_keystone = PORT_KEYSTONE
IP_nova = IP_NOVA
PORT_nova = PORT_NOVA
IP_cinder = IP_CINDER
PORT_cinder = PORT_CINDER
# 数据库配置
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


# logger = init_log()


def dlog(log, lever="INFO"):
    '''
    日志打印方法
    :param log:
    :param lever:
    :return:
    '''
    try:
        lever = lever.upper()
        if lever == "INFO":
            openstack_log.info(log)
        elif lever == "DEBUG":
            openstack_log.debug(log)
        elif lever == "WARNING":
            openstack_log.warning(log)
        elif lever == "ERROR":
            openstack_log.error(log)
        elif lever == "CRITICAL":
            openstack_log.critical(log)
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
        assert res.status in [200, 201, 202, 203, 204], "send_request status=%s,reason=%s,path=%s,params=%s" % (
            res.status, res.reason, path, params_str)
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
    event = threading.Event()
    timeout = kwargs.pop('timeout', 0)
    countdown = timeout
    kwargs.update({"event":event})
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
        event.set()
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


# 测试时使用，计算执行时间，如果需要得到更具体的时间消耗，使用@profile
def times(method_name):
    def get_time(func):
        def catch_time(*args, **kwargs):
            time_start = time.time()
            ret = func(*args, **kwargs)
            time_end = time.time()
            time_cost = time_end - time_start
            dlog("%s cost time:%s" % (method_name, time_cost))
            return ret

        return catch_time

    return get_time


def cache(cache_dict={}, del_cache="",username="",func_str=""):
    '''
    函数缓存装饰器，限制缓存长度，限制缓存大小，只用来作为获取信息方法的缓存
    设置每个的缓存的最大生存时间，默认120s(根据实际情况来调整)
    cache_dict:{
                    func:{
                        username:{
                            tuple_tmp:(fun(*args,**kwargs),time)
                            }
                    }
                }
    在用户登入时先清空用户的缓存
    :param cache:
    :return:
    '''

    def _cache(fun):
        def _exec_fun(*args, **kwargs):
            time_now = int(time.time())
            tuple_tmp = args + tuple(kwargs.itervalues())
            if len(cache_dict) >= 100 or cache_dict.__sizeof__() >= (10<<20):   #限制cache长度小于100，容量小于100M
                cache_dict.clear()
            username = kwargs.get("username","")
            if fun not in cache_dict or username not in cache_dict[fun] or tuple_tmp not in cache_dict[fun][username] or (
                time_now - cache_dict[fun][username][tuple_tmp][1]) > 120:
                if not cache_dict.has_key(fun):
                    cache_dict[fun] = {username:{}}
                elif not cache_dict[fun].has_key(username):
                    cache_dict[fun][username] = {}
                cache_dict[fun][username][tuple_tmp] = (fun(*args, **kwargs), time_now)
            return cache_dict[fun][username][tuple_tmp][0]
        return _exec_fun
    if del_cache == "*":  # 切换用户或项目时调用，由于现在一个用户只有一个项目，所以只在切换用户时调用了，后面如果可以对应多个项目，需要加上这个调用
        cache_dict.clear()
    if del_cache and del_cache in cache_dict: #删除对应对象的缓存
        cache_dict.pop(del_cache)
    if func_str:  #删除对应方法的缓存
        for func_object in list(cache_dict.iterkeys()):
            if func_object.__str__().find(func_str) != -1:
                cache_dict.pop(func_object)
    if username:  #清空对应用户缓存
        for func in cache_dict.itervalues():
            if func.has_key(username):
                func.pop(username)
    return _cache

def get_origin_addr(func):
    '''
    返回带有装饰器函数的原始地址
    查找的函数只能带一个装饰器，如果有多个装饰器需要用别的方法
    :param func:
    :return:
    '''
    return func.__closure__[1].cell_contents
