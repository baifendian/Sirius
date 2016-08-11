# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='spaceuserrole',
            name='pemission',
        ),
        migrations.AddField(
            model_name='account',
            name='ftp_password',
            field=models.CharField(default=b'', max_length=512),
        ),
        migrations.AddField(
            model_name='space',
            name='address',
            field=models.CharField(default=b'', max_length=512),
        ),
        migrations.AddField(
            model_name='space',
            name='capacity',
            field=models.IntegerField(default=0, blank=True),
        ),
        migrations.AddField(
            model_name='spaceuserrole',
            name='permission',
            field=models.IntegerField(null=True),
        ),
    ]
