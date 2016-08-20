#!/usr/local/bin/python
# -*- coding: utf-8 -*-
from ftplib import FTP_TLS
import socket
import ssl
class tyFTP(FTP_TLS):
    def __init__(self, host='', user='', passwd='', acct='', keyfile=None,
        certfile=None, timeout=60):
        FTP_TLS.__init__(self, host, user, passwd, acct, keyfile, certfile, timeout)
    def connect(self, host='', port=0, timeout=-999):
        '''Connect to host.  Arguments are:
        - host: hostname to connect to (string, default previous host)
        - port: port to connect to (integer, default previous port)
        '''
        if host != '':
            self.host = host
        if port > 0:
            self.port = port
        if timeout != -999:
            self.timeout = timeout
        try:
            self.sock = socket.create_connection((self.host, self.port), self.timeout)
            self.af = self.sock.family
            #add this line!!!
            self.sock = ssl.wrap_socket(self.sock, self.keyfile, self.certfile,ssl_version=ssl.PROTOCOL_TLSv1)
            #add end
            self.file = self.sock.makefile('rb')
            self.welcome = self.getresp()
        except Exception as e:
            print '服务异常',e
        return self.welcome

server = tyFTP()
server.connect(host="117.121.7.29", port=990)
server.login(user="mingfang.yang", passwd="")
server.prot_p()
print server.pwd()
server.retrlines('LIST')
#print server.retrbinary("RETR /text.txt",open("text",'wb').write)
