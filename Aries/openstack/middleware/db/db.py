# coding:utf-8
from openstack.middleware.common.common import plog, dlog
import MySQLdb


class Db:
    def __init__(self,db_host,db_user,db_password,db_name):
        self.db_name = db_name
        self.host = db_host
        self.user = db_user
        self.password = db_password

    @plog("Db.connect_mysql")
    def conn_mysql(self):
        self.conn = MySQLdb.connect(host=self.host,user=self.user,passwd=self.password,db=self.db_name ,charset="utf8")
        self.command = self.conn.cursor()

    @plog("Db.exec_cmd")
    def exec_cmd(self, cmd):
        '''
        :param cmd:
        :return:2 表示操作的表不存在
        '''
        ret = 0
        self.conn_mysql()
        cmd = cmd.encode("utf8")
        try:
            self.command.execute(cmd)
            self.conn.commit()
            ret = self.command.fetchall()
            self.command.close()
            self.conn.close()
        except MySQLdb.ProgrammingError,err:
            dlog("Db.exec_cmd faild err:%s"%err,lever="ERROR")
            if err.args[0] == 1146:
                ret = 2
        return ret

