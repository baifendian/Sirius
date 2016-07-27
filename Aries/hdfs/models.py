# -*-coding: utf-8 -*-

from django.db import models


class FileOperatorType(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=30, default='')
    title = models.CharField(max_length=100, default='')


class DataOperator(models.Model):
    STATUS_CHOICES = (
        (0, '成功'),
        (1, '失败'),
        (2, '进行中'),
    )

    id = models.AutoField(primary_key=True)
    source_path = models.CharField(max_length=256, default='')
    target_path = models.CharField(max_length=256, default='')
    o_time = models.DateTimeField(auto_now_add=True)
    o_type = models.ForeignKey(FileOperatorType)
    o_user = models.CharField(max_length=60, default='')
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)


class DataShare(models.Model):
    SHARE_TYPE_CHOICES = (
        ('public', '公有'),
        ('private', '私有'),
    )

    id = models.AutoField(primary_key=True)
    source_path = models.CharField(max_length=256, default='')
    proxy_path = models.CharField(max_length=256, default='')
    share_type = models.CharField(max_length=20, choices=SHARE_TYPE_CHOICES, default='private')
    share_time = models.DateTimeField(auto_now_add=True)
    share_user = models.CharField(max_length=60, default='')
    share_validity = models.IntegerField(default=15)
    space_name = models.CharField(max_length=512, default='')
    desc = models.CharField(max_length=1024, default='')    

class FileUpload(models.Model):
    UPLOAD_MODEL_CHOICES = (
        ("http", 'http'),
        ("ftp", "ftp"),
        ("client", "client"),
    )

    STATUS_CHOICES = (
        (0, '成功'),
        (1, '失败'),
        (2, '进行中'),
    )

    id = models.AutoField(primary_key=True)
    source_path = models.CharField(max_length=256, default='')
    target_path = models.CharField(max_length=256, default='')
    filename = models.CharField(max_length=60, default='')
    u_time = models.DateTimeField(auto_now_add=True)
    u_model = models.CharField(max_length=10, choices=UPLOAD_MODEL_CHOICES, default='http')
    user = models.CharField(max_length=60, default='')
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)


class FileDownload(models.Model):
    DOWNLOAD_MODEL_CHOICES = (
        ("http", 'http'),
        ("ftp", "ftp"),
        ("client", "client"),
    )

    STATUS_CHOICES = (
        (0, '成功'),
        (1, '失败'),
        (2, '进行中'),
    )

    id = models.AutoField(primary_key=True)
    source_path = models.CharField(max_length=256, default='')
    target_path = models.CharField(max_length=256, default='')
    d_time = models.DateTimeField(auto_now_add=True)
    d_model = models.CharField(max_length=10, choices=DOWNLOAD_MODEL_CHOICES, default='http')
    user = models.CharField(max_length=60, default='')
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
