from django.db import models
# Create your models here.
class Role(models.Model):
    name = models.CharField(default='',max_length=100)
    is_active = models.IntegerField(blank=True)
    def __unicode__(self):
        return self.name

class Account(models.Model):
    name = models.CharField(default='',max_length=100)
    password = models.CharField(default='',max_length=512)
    email = models.EmailField()
    role = models.ForeignKey(Role)
    is_active = models.IntegerField(blank=True)
    ftp_password = models.CharField(default='',max_length=512)
    cur_space = models.CharField(default='',max_length=512)
    def __unicode__(self):
        return self.name

class SpaceType(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(default='',max_length=100)
    def __unicode__(self):
        return self.name

class Space(models.Model):
    name = models.CharField(default='',max_length=100)
    create_time = models.DateTimeField(auto_now_add=True)
    title = models.CharField(default='',max_length=512)
    capacity = models.CharField(default='',max_length=512)
    address = models.CharField(default='',max_length=512)
    is_active = models.IntegerField(blank=True)
    exec_user = models.CharField(default='',max_length=512)
    space_type = models.ForeignKey(SpaceType);
    def __unicode__(self):
        return self.name


class SpaceUserRole(models.Model):
    user = models.ForeignKey(Account)
    space = models.ForeignKey(Space)
    role = models.ForeignKey(Role)
    permission = models.IntegerField(null=True)
