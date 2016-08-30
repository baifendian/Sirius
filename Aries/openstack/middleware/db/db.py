#coding:utf-8
import sqlite3
import json
from middleware.common.common import DB_PATH, plog


class Db:
    def __init__(self):
        self.db_path = DB_PATH
        self.table_name = "vm_snap"
        pass

    @plog("Db.connect")
    def connect(self):
        self.conn = sqlite3.connect(self.db_path)
        self.command = self.conn.cursor()

    @plog("Db.exec_cmd")
    def exec_cmd(self,cmd):
        self.connect()
        self.command.execute(cmd)
        self.conn.commit()
        tmp_ret = self.command.fetchone()
        if tmp_ret:
            ret = tmp_ret[0]
        else:
            ret = '{}'
        self.command.close()
        self.conn.close()
        return ret

    @plog("Db.get_snap")
    def get_snap(self,vm_id):
        '''
        获取对应虚拟机的快照树
        :param vm_id:
        :return:
        '''
        cmd = "select json_str from %s where vm_id=%s"%(self.table_name,vm_id)
        tmp_ret = self.exec_cmd(cmd)
        ret = json.loads(tmp_ret)
        return ret

    @plog("Db.insert_snap")
    def insert_snap(self,vm_id,snap_info,status):
        '''
        向对应快照树中插入数据
        :param vm_id:
        :param snap_info:
        :return:
        '''
        ret = 0
        json_str = json.dumps(snap_info)
        cmd = "insert into %s values('%s','%s','%s')"%(self.table_name,vm_id,json_str,status)
        self.exec_cmd(cmd)
        return ret

    @plog("Db.update_snap")
    def update_snap(self,vm_id,snap_info={},status=''):
        '''
        更新数据库
        :param vm_id:
        :param snap_info:
        :return:
        '''
        ret = 0
        cmd = "update %s set "%self.table_name
        if snap_info:
            json_str = json.dumps(snap_info)
            # cmd = "update %s set json_str='%s' where vm_id=%s"%(self.table_name,json_str,vm_id)
            cmd += "json_str=%s"%json_str
        if status:
            cmd += ",status=%s"%status
        cmd += " where vm_id=%s"%vm_id
        self.exec_cmd(cmd)
        return ret

    @plog("Db.get_node_status")
    def get_node_status(self,vm_id):
        '''
        获取现在在哪个快照节点下面，返回的是此快照节点的路径
        :return:
        '''
        cmd = "select status from %s where vm_id=%s"%(self.table_name,vm_id)
        tmp_ret = self.exec_cmd(cmd)
        ret = json.loads(tmp_ret)
        return ret

