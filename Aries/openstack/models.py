#-*- coding: UTF-8 -*-

from __future__ import unicode_literals

from django.db import models

class DbVmSnap(models.Model):
    image_name = models.CharField(max_length=100)
    vm_id = models.CharField(max_length=100)
    parent_name = models.CharField(max_length=100,null=True)
    image_id = models.CharField(max_length=100)
    status = models.IntegerField()
    time = models.DateTimeField()

