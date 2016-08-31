# -*- coding: utf-8 -*-

import json
import os
import threading
import logging
import datetime
import subprocess
from django.conf import settings
from hdfs.libs.ftp_operator import FTPOperator
from hdfs.libs.hdfs_operator import HdfsClient
from hdfs.models import *
from hdfs.libs.hdfs_operator import HdfsClient, HdfsException
from user_auth.models import *
from tools import *
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
hdfs_logger = logging.getLogger("access_log")
StatusCode = {
    "OK": 200,
    "InternalServerError": 500,
}

class HDFS(object):
    def __init__(self):
        self.hdfs = HdfsClient(
                hosts=settings.WEBHDFS_HOSTS,
                user_name=settings.WEBHDFS_USER,
                timeout=settings.WEBHDFS_TIMEOUT,
                max_tries=settings.WEBHDFS_MAX_TRIES,
                retry_delay=settings.WEBHDFS_RETRY_DELAY
        )
        self.returned = dict(code=200, msg='OK', data=None, proxy_link=None)

    def _insert_operate_log(self, source_path, target_path, o_time, o_type, o_user, status):
        operator_log = DataOperator()
        operator_log.source_path = source_path
        operator_log.target_path = target_path
        operator_log.o_time = o_time
        operator_log.o_type = o_type
        operator_log.o_user = o_user
        operator_log.status = status

        operator_log.save()
        return operator_log.pk

    def _update_operate_log(self, pk, status):
        operator_log = DataOperator.objects.get(pk=pk)
        operator_log.status = status
        operator_log.save()

    def _insert_share_log(self, source_path, proxy_path, share_type, share_time, share_user, share_validity):
        share_log = DataShare()
        share_log.source_path = source_path
        share_log.proxy_path = proxy_path
        share_log.share_type = share_type
        share_log.share_time = share_time
        share_log.share_user = share_user
        share_log.share_validity = share_validity

        share_log.save()
        return share_log.pk

    def _update_share_log(self):
        pass

    def _insert_upload_log(self, source_path, target_path, filename, u_time, u_model, user, status):
        upload_log = FileUpload()
        upload_log.source_path = source_path
        upload_log.target_path = target_path
        upload_log.filename = filename
        upload_log.u_time = u_time
        upload_log.u_model = u_model
        upload_log.user = user
        upload_log.status = status

        upload_log.save()
        return upload_log.pk

    def _update_upload_log(self, pk, status):
        update_log = FileUpload.objects.get(pk=pk)
        update_log.status = status
        update_log.save()

    def _insert_download_log(self, source_path, target_path, d_time, d_model, user, status):
        download_log = FileDownload()
        download_log.source_path = source_path
        download_log.target_path = target_path
        download_log.d_time = d_time
        download_log.d_model = d_model
        download_log.user = user
        download_log.status = status

        download_log.save()
        return download_log.pk

    def _update_download_log(self, pk, status):
        download_log = FileDownload.objects.get(pk=pk)
        download_log.status = status
        download_log.save()

    def _upload_file_by_http(self, upload_file, dest_path, username):
        pass

    def upload_file_by_http(self, path, request):
        space_name = request.GET.get("space_name","")
        exec_user,space_path = getSpaceExecUserPath(space_name)
        ac_logger.info("request.FILES:{0}".format(request.FILES))
        ac_logger.info("request:{0}".format(request))
        f = request.FILES["files"]
        filename = f.name
        hdfs_logger.info("space_path:{0},path:{1}".format(space_path,path))
        target_path = os.path.realpath("/%s/%s/%s/%s/" % (os.path.sep,space_path, path,filename))
        hdfs_logger.info("target_path:{0}".format(target_path))
        local_file = os.path.join(settings.FTP_LOCAL_DIR, filename)
        with open(local_file,"wb+") as info:
            for chunk in f.chunks():
                info.write(chunk)
                hdfs_logger.info(chunk)
        username =exec_user
        log_pk = self._insert_upload_log(
            source_path=filename,
            target_path = target_path,
            filename = f.name,
            u_time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            u_model = "http",
            user=username,
            status =2
        )

        try:
            upload_file = open(local_file, 'rb')
            self.hdfs.create(target_path, upload_file)
        except HdfsException, e:
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['data'] = "上传失败"
            hdfs_logger.error("%s使用http上传%s发生异常: %s" % (username, local_file, str(e)))
            self._update_upload_log(pk=log_pk, status=1)
        else:
            if os.path.exists(local_file):
                os.remove(local_file)
            self._update_upload_log(pk=log_pk, status=0)
            self.returned['code'] = StatusCode["OK"]
            self.returned['data'] = "上传成功"
        return self.returned

    def _upload_file_by_ftp(self, src_path, dest_path,exec_user,username):
        hdfs_logger.info("src_path:{0},dest_path:{1},exec_user:{2},username:{3}".format(src_path,dest_path,exec_user,username))
        filename = os.path.split(src_path)[-1]
        log_pk = self._insert_upload_log(
            source_path=src_path,
            target_path=dest_path,
            filename=filename,
            u_time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            u_model="ftp",
            user=username,
            status=2
        )
        real_dest = os.path.join(dest_path, filename)
        if self.hdfs.exists(real_dest):
            self._update_upload_log(pk=log_pk, status=0)
        else:
            # download file from ftp
            local_file = os.path.join(settings.FTP_LOCAL_DIR, filename)
            try:
                ftp_password = Account.objects.get(name=username).ftp_password
                hdfs_logger.info("ftp_server:{0},username:{1},password:{2},port:{3},timeout:{4},acct:{5},keyfile:{6},certfile:{7}"\
                             .format(settings.FTP_SERVER,username,ftp_password,settings.FTP_PORT,settings.FTP_TIMEOUT,settings.FTP_ACCT,settings.FTP_KEYFILE,settings.FTP_CERTFILE))
                # for testing
                #username = "pan.lu"
                #ftp_password = "iXp8Qt2T"
                ftp_operator = FTPOperator(
                    ftp_server=settings.FTP_SERVER,
                    username=username,
                    password=ftp_password,
                    port=settings.FTP_PORT,
                    timeout=settings.FTP_TIMEOUT,
                    acct=settings.FTP_ACCT,
                    keyfile=settings.FTP_KEYFILE,
                    certfile=settings.FTP_CERTFILE
                )
                ftp_operator.connect()
                ftp_operator.download_file(src_path, local_file)
            except Exception, e:
                hdfs_logger.error(u"%s使用ftp上传%s发生异常: %s" % (username, src_path, str(e)))
                self._update_upload_log(pk=log_pk, status=1)
            else:
                # upload file to hdfs
                try:
                    upload_file = open(local_file, 'rb')
                    self.hdfs.create(real_dest, upload_file)
                except HdfsException, e:
                    hdfs_logger.error("%s使用ftp上传%s发生异常: %s" % (username, src_path, str(e)))
                    self._update_upload_log(pk=log_pk, status=1)
                else:
                    if os.path.exists(local_file):
                        os.remove(local_file)
                    self._update_upload_log(pk=log_pk, status=0)

    def upload_file_by_ftp(self, path, request):
        space_name = request.GET.get("space_name","")
        exec_user,space_path = getSpaceExecUserPath(space_name)
        src_path = request.GET.get("source_path", "")
        path = os.path.realpath("/%s/%s/%s/%s" % (os.path.sep,space_path, path,src_path))
        src_path = os.path.realpath("/%s/%s/" %(os.path.sep,src_path))
        if not src_path:
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = "missing source path param when UPLOAD by ftp"
            return self.returned
        username = getUser(request).username
        task = threading.Thread(target=self._upload_file_by_ftp, args=(src_path, path, exec_user,username))
        task.start()
        self.returned['code'] = StatusCode["OK"]
        self.returned['msg'] = "OK"
        return self.returned

    def _upload_file_by_client(self, src_path, dest_path,exec_user,username):
        filename = os.path.split(src_path)[-1]
        hdfs_logger.info("src_path:{0},dest_path:{1},exec_user:{2},username:{3}".format(src_path,dest_path,exec_user,username))
        log_pk = self._insert_upload_log(
            source_path=src_path,
            target_path=dest_path,
            filename=filename,
            u_time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            u_model="client",
            user=username,
            status=2
        )

        #real_dest = os.path.join(dest_path, filename)
        #put file or dir
        exitCode,data = run_hadoop(user_name=exec_user,operator="put",args=[src_path,dest_path])
        if exitCode == 0:
            self._update_upload_log(pk=log_pk, status=0)
            hdfs_logger.info("data:{0}".format(data))
        else:
            self._update_upload_log(pk=log_pk, status=1)
            hdfs_logger.error("data:{0}".format(data))
        #if self.hdfs.exists(real_dest):
        #    self._update_upload_log(pk=log_pk, status=0)
        #else:
        #    try:
        #        real_dest = os.path.join(dest_path, filename)
        #        self.hdfs.copy_from_local(src_path, real_dest)
        #    except HdfsException, e:
        #        hdfs_logger.error(u"%s使用client上传%s发生异常: %s" % (username, src_path, str(e)))
        #        self._update_upload_log(pk=log_pk, status=1)
        #    else:
        #        self._update_upload_log(pk=log_pk, status=0)

    def upload_file_by_client(self, path, request):
        src_path = request.GET.get('source_path', "")
        if not src_path:
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = "missing source path param when UPLOAD by client"
            return self.returned
        space_name = request.GET.get("space_name","")
        exec_user,space_path = getSpaceExecUserPath(space_name)
        path = os.path.realpath("/%s/%s/%s" % (os.path.sep,space_path, path))
        username = getUser(request)
        task = threading.Thread(target=self._upload_file_by_client, args=(src_path, path,exec_user,username))
        task.start()

        self.returned['code'] = StatusCode["OK"]
        self.returned['msg'] = "OK"
        return self.returned

    def download_file_by_http(self, path, request):
        space_name = request.GET.get("space_name","")
        exec_user,space_path = getSpaceExecUserPath(space_name)
        hdfs_logger.info("space_path:{0},path:{1}".format(space_path,path))
        path = os.path.realpath("/%s/%s/%s" % (os.path.sep,space_path, path))
        hdfs_logger.info("target_path:{0}".format(path))
        result =  self.hdfs.open(path)
        hdfs_logger.info("download:{0}".format(result))
        return result

    def _download_file_by_ftp(self, src_path, dest_path, username):
        filename = os.path.split(src_path)[-1]
        log_pk = self._insert_download_log(
            source_path=src_path,
            target_path=dest_path,
            d_time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            d_model="ftp",
            user=username,
            status=2
        )

        # download file from hdfs
        local_file = os.path.join(settings.FTP_LOCAL_DIR, filename)
        try:
            self.hdfs.copy_to_local(src_path, local_file)
        except HdfsException, e:
            hdfs_logger.error(u"%s使用ftp下载%s发生异常: %s" % (username, src_path, str(e)))
            self._update_download_log(pk=log_pk, status=1)

        # upload file to ftp
        try:
            real_dest = os.path.join(dest_path, filename)
            ftp_password = Account.objects.get(name=username).ftp_password
            # for testing
            username = "pan.lu"
            ftp_password = "iXp8Qt2T"
            ftp_operator = FTPOperator(
                ftp_server=settings.FTP_SERVER,
                username=username,
                password=ftp_password,
                port=settings.FTP_PORT,
                timeout=settings.FTP_TIMEOUT,
                acct=settings.FTP_ACCT,
                keyfile=settings.FTP_KEYFILE,
                certfile=settings.FTP_CERTFILE
            )
            ftp_operator.connect()
            ftp_operator.upload_file(real_dest, local_file)
        except Exception, e:
            hdfs_logger.error(u"%s使用ftp下载%s发生异常: %s" % (username, src_path, str(e)))
            self._update_download_log(pk=log_pk, status=1)
        else:
            if os.path.exists(local_file):
                os.remove(local_file)
            self._update_download_log(pk=log_pk, status=0)

    def download_file_by_ftp(self, path, request):
        ftp_path = request.GET.get("destination", "")
        if not ftp_path:
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = "missing destination path param when DOWNLOAD by ftp"
            return self.returned

        # hdfs_path = os.path.join(path, os.path.split(ftp_path)[-1])
        username = getUser(request).username
        task = threading.Thread(target=self._download_file_by_ftp, args=(path, ftp_path, username))
        task.start()

        self.returned['code'] = StatusCode["OK"]
        self.returned['msg'] = "OK"
        return self.returned

    def _download_file_by_client(self, src_path, dest_path, username):
        filename = os.path.split(src_path)[-1]
        log_pk = self._insert_download_log(
            source_path=src_path,
            target_path=dest_path,
            d_time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            d_model="client",
            user=username,
            status=2
        )

        try:
            real_dest = os.path.join(dest_path, filename)
            self.hdfs.copy_to_local(src_path, real_dest)
        except HdfsException, e:
            hdfs_logger.error(u"%s使用client下传%s发生异常: %s" % (username, src_path, str(e)))
            self._update_download_log(pk=log_pk, status=1)
        else:
            self._update_download_log(pk=log_pk, status=0)

    def download_file_by_client(self, path, request):
        client_path = request.GET.get('destination', '')
        if not client_path:
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = "missing destination path param when DOWNLOAD by ftp"
            return self.returned

        # hdfs_path = os.path.join(path, os.path.split(ftp_path)[-1])
        username = request.user.username
        task = threading.Thread(target=self._download_file_by_client, args=(path, client_path, username))
        task.start()

        self.returned['code'] = StatusCode["OK"]
        self.returned['msg'] = "OK"
        return self.returned

    def upload(self, path, request):
        _type = request.GET.get('type', 'http')
        if _type.lower() == 'ftp':
            return self.upload_file_by_ftp(path, request)
        elif _type.lower() == 'client':
            return self.upload_file_by_client(path, request)
        elif _type.lower() == 'http':
            return self.upload_file_by_http(path, request)
        else:
            hdfs_logger.error("sorry! the type is not support now! type:{0}" %_type)   

    def download(self, path, request):
        _type = request.GET.get('type', 'http')
        if _type == 'ftp':
            return self.download_file_by_ftp(path, request)
        elif _type == 'client':
            return self.download_file_by_client(path, request)
        elif _type.lower() == 'http':
            return self.download_file_by_http(path, request)
        else:
            hdfs_logger.error("sorry! the type is not support now! type:{0}" %_type)

    def make_dir(self, path, request):
        # if request.method != "PUT":
        #     self.returned['code'] = StatusCode["MethodNotAllow"]
        #     self.returned['msg'] = "Method not allow (expect 'PUT' method)"
        #     return self.returned
        space_name = request.GET.get("spaceName", '') 
        space_path = self.spaceNamePathMapping(space_name)
        path = os.path.realpath("/%s/%s/%s" %(os.path.sep,space_path,path))
        if self.hdfs.exists(path):
            return self.returned

        try:
            result = self.hdfs.mkdirs(path)
        except HdfsException, e:
            hdfs_logger.error("%s创建文件夹%s发生异常: %s" % (getUser(request).username, path, str(e)))
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = str(e)
            return self.returned

        if result:
            o_type = FileOperatorType.objects.get(name='mkdir')
            self._insert_operate_log(
                source_path='',
                target_path=path,
                o_time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                o_type=o_type,
                o_user=getUser(request).username,
                status=0
            )
            return self.returned
        else:
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = "unknown error when MKDIRS"
            return self.returned
    
    def spaceNamePathMapping(self,spaceName): 
        space = getObjByAttr(Space,"name",spaceName);
        space_path = space[0].address 
        return space_path   
    
    def list_status_share(self,real_path):
        try:
            result = self.hdfs.list_status(real_path)     
        except HdfsException,e:
            hdfs_logger.error("%s列出文件夹%s发生异常: %s" % (getUser(request).username,space_path, str(e)))
            self.returned['code'] = StatusCode["OK"]
            self.returned['data'] = {"totalList":[],"totalPageNum":0,"currentPage":1}
            return self.returned
        else:
            self.returned['code'] = StatusCode["OK"]
            self.returned['msg'] = "OK"
            # get custom file status
            # self.return['data'] = [{custom_key: item.get('expect_key')} for item in self.returned]
            unit = ["B","KB","MB","GB","TB"]
            totalList = [
                {
                    'name': item.get('pathSuffix'),
                    'create_time': datetime.datetime.fromtimestamp(item.get('modificationTime')/1000).strftime("%Y-%m-%d %H:%M:%S"),
                    'is_dir': 0 if item.get('type') == "FILE" else 1,
                    'size': unitTransform(item.get('length'),0,unit) if item.get('type') == "FILE" else "-",
                } for item in result if item.get('pathSuffix') != ".Trash"
            ]
            self.returned['data'] = {"totalList":totalList,"totalPageNum":len(totalList),"currentPage":1}
            hdfs_logger.info("liststatus:%s" %self.returned['data'])
            return self.returned
        
    def list_status(self, path, request):
        space_name = request.GET.get("spaceName", '')
        if not space_name:
            self.returned['code'] = StatusCode["OK"]
            self.returned['data'] = {
                                     "totalList": [], 
                                     "currentPage": 1,
                                     "totalPageNum": 500
                                   }
            return self.returned
        #spaceName, hdfs path mapping
        try:
            space = getObjByAttr(Space,"name",space_name)
            space_path = space[0].address
        except Exception,e:
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['data'] = "不存在该space: {0}".format(space_name)
            return self.returned
        isTrash = request.GET.get("isTrash",0)
        if isTrash != 0:
            #path =  os.path.realpath("/%s/%s/%s" % ("/.Trash/Current/",space_path, path))
            space_path = trashPath(space_path)
        real_path = os.path.realpath("/%s/%s" % (space_path, path))
        hdfs_logger.info("list_status: real_path:{0}".format(real_path))
        try:
            result = self.hdfs.list_status(real_path)
        except HdfsException, e:
            hdfs_logger.error("%s列出文件夹%s发生异常: %s" % (getUser(request).username,space_path, str(e)))
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['data'] = {"totalList":[],"totalPageNum":0,"currentPage":1}
            #self.returned['data'] = "暂无数据"
            return self.returned
        else:
            self.returned['code'] = StatusCode["OK"]
            unit = ["B","KB","MB","GB","TB"]
            totalList = [
                {
                    'name': item.get('pathSuffix'),
                    'create_time': datetime.datetime.fromtimestamp(item.get('modificationTime')/1000).strftime("%Y-%m-%d %H:%M:%S"),
                    'is_dir': 0 if item.get('type') == "FILE" else 1,
                    'size': unitTransform(item.get('length'),0,unit) if item.get('type') == "FILE" else "-",
                } for item in result if item.get('pathSuffix') != ".Trash"
            ]
            self.returned['data'] = {"totalList":totalList,"totalPageNum":len(totalList),"currentPage":1}
            hdfs_logger.info("liststatus:%s" %self.returned['data'])
            return self.returned

    def upset_capacity(self, request):
        pass

    def get_capacity_info(self, request):
        pass

    def rename_dir(self, request):
        pass

    def _copy_file(self, src_path, dest_path, username):
        o_type = FileOperatorType.objects.get(name='cp')
        log_pk = self._insert_operate_log(
            source_path=src_path,
            target_path=dest_path,
            o_time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            o_type=o_type,
            o_user=username,
            status=2
        )

        real_dest = os.path.join(dest_path, os.path.split(src_path)[-1])
        try:
            result, msg = self.hdfs.copy_file(src_path, real_dest)
        except HdfsException, e:
            hdfs_logger.error("%s复制%s到%s发生异常: %s" % (username, src_path, dest_path, str(e)))
            self._update_operate_log(pk=log_pk, status=1)

        if result:
            self._update_operate_log(pk=log_pk, status=0)
        else:
            self._update_operate_log(pk=log_pk, status=1)

    def copy_file(self, path, request):
        dest = request.GET.get('destination', None)
        if not dest:
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = "missing destination param when COPY"
            return self.returned

        if not self.hdfs.exists(path):
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = "%s not exists when COPY" % path
            return self.returned

        file_name = os.path.split(path)[-1]
        real_dest = os.path.join(dest, file_name)
        if self.hdfs.exists(real_dest):
            self.returned['code'] = StatusCode["InternalServerError"]
            self.returned['msg'] = "%s already exists %s when COPY" % (dest, file_name)
            return self.returned

        username = getUser(request).username
        task = threading.Thread(target=self._copy_file, args=(path, dest, username))
        task.start()

        self.returned['code'] = StatusCode["OK"]
        self.returned['msg'] = "OK"
        return self.returned
