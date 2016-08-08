#!/usr/bin/python
# -*- coding: utf-8 -*-
from ftplib import FTP_TLS
import socket
import ssl

class FTPOperator(FTP_TLS):
    def __init__(self,ftp_server,username,password,port,timeout=10,acct='', keyfile=None,certfile=None,):
        FTP_TLS.__init__(self, '', '','', acct, keyfile, certfile, timeout)
        self.ftp_server = ftp_server
        self.username = username
        self.password = password
        self.port = port
        self.timeout = timeout
        self.ftp = None

    def connect(self):
        self.sock = socket.create_connection((self.ftp_server, self.port), self.timeout)
        self.af = self.sock.family
        self.sock = ssl.wrap_socket(self.sock, self.keyfile, self.certfile,ssl_version=ssl.PROTOCOL_TLSv1)
        self.file = self.sock.makefile('rb')
        self.welcome = self.getresp()
        self.login(self.username,self.password)
        FTP_TLS.prot_p(self)
        return self.welcome

    def download_file(self,remotePath,localPath,bufsize=1024):
        bufsize = bufsize
        fp = open(localPath,'wb')
        self.retrbinary('RETR ' + remotePath,fp.write,bufsize)
        fp.close()
        self.quit()

    def upload_file(self,remotePath,localPath,bufsize=1024):
        bufsize = bufsize
        file_handler = open(localPath,'rb')
        self.storbinary('STOR %s' %remotePath,file_handler,bufsize)
        file_handler.close()
        self.quit()

if __name__ == "__main__":
    ftp_operator = FTPOperator(
                    ftp_server="117.121.7.29",
                    username="pan.lu",
                    password="iXp8Qt2T",
                    port=990,
                    timeout=10,
                    acct="",
                    keyfile=None,
                    certfile=None
                )
    ftp_operator.connect()
    #ftp_operator.download_file(src_path, local_file)
