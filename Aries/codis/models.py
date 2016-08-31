from django.db import models

# Create your models here.

class Host(models.Model):
    host_id = models.AutoField(primary_key=True)
    host_ip = models.CharField(max_length=30)
    host_user = models.CharField(default='root',max_length=20)
    host_pass = models.CharField(default='123',max_length=20)
    memory_total = models.IntegerField(default=0)
    codis_home = models.CharField(default='/root/',max_length=100)
    memory_used = models.IntegerField(default=0)

class Codis(models.Model):
    codis_id = models.AutoField(primary_key=True)
    product_id = models.CharField(unique=True,default='-',max_length=25)
    key_num = models.IntegerField(default=0)
    memory_total = models.IntegerField(default=0)
    memory_used = models.IntegerField(default=0)
    dashboard_port = models.IntegerField(default=0)
    available = models.CharField(max_length=10)
    dashboard_proxy_addr = models.CharField(max_length=120,default='http://0.0.0.0')
    dashboard_ip = models.CharField(max_length=30,default='')
    server_memory = models.IntegerField(default=0)

class Proxy(models.Model):
    proxy_id = models.AutoField(primary_key=True)
    codis = models.ForeignKey(Codis)
    host = models.ForeignKey(Host)
    proxy_ip = models.CharField(max_length=30)
    proxy_port = models.IntegerField()
    http_ip = models.CharField(max_length=30)
    http_port = models.IntegerField()

class Servers(models.Model):
    server_id = models.AutoField(primary_key=True)
    codis = models.ForeignKey(Codis)
    host = models.ForeignKey(Host)
    server_ip = models.CharField(max_length=30)
    role = models.CharField(default='master',max_length=10)
    server_port = models.IntegerField(default=0)

