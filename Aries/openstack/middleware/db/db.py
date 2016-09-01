# coding:utf-8
import sqlite3
import json
from Aries.openstack.middleware.common.common import DB_PATH, plog


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
    def exec_cmd(self, cmd):
        self.connect()
        cmd = cmd.encode("utf8")
        self.command.execute(cmd)
        self.conn.commit()
        ret = self.command.fetchall()
        self.command.close()
        self.conn.close()
        return ret
