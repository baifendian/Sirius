# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DataOperator',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('source_path', models.CharField(default=b'', max_length=256)),
                ('target_path', models.CharField(default=b'', max_length=256)),
                ('o_time', models.DateTimeField(auto_now_add=True)),
                ('o_user', models.CharField(default=b'', max_length=60)),
                ('status', models.IntegerField(default=0, max_length=1, choices=[(0, b'\xe6\x88\x90\xe5\x8a\x9f'), (1, b'\xe5\xa4\xb1\xe8\xb4\xa5'), (2, b'\xe8\xbf\x9b\xe8\xa1\x8c\xe4\xb8\xad')])),
            ],
        ),
        migrations.CreateModel(
            name='DataShare',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('source_path', models.CharField(default=b'', max_length=256)),
                ('proxy_path', models.CharField(default=b'', max_length=256)),
                ('share_type', models.CharField(default=b'private', max_length=20, choices=[(b'public', b'\xe5\x85\xac\xe6\x9c\x89'), (b'private', b'\xe7\xa7\x81\xe6\x9c\x89')])),
                ('share_time', models.DateTimeField(auto_now_add=True)),
                ('share_user', models.CharField(default=b'', max_length=60)),
                ('share_validity', models.IntegerField(default=15, max_length=6)),
            ],
        ),
        migrations.CreateModel(
            name='FileDownload',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('source_path', models.CharField(default=b'', max_length=256)),
                ('target_path', models.CharField(default=b'', max_length=256)),
                ('d_time', models.DateTimeField(auto_now_add=True)),
                ('d_model', models.CharField(default=b'http', max_length=10, choices=[(b'http', b'http'), (b'ftp', b'ftp'), (b'client', b'client')])),
                ('user', models.CharField(default=b'', max_length=60)),
                ('status', models.IntegerField(default=0, max_length=1, choices=[(0, b'\xe6\x88\x90\xe5\x8a\x9f'), (1, b'\xe5\xa4\xb1\xe8\xb4\xa5'), (2, b'\xe8\xbf\x9b\xe8\xa1\x8c\xe4\xb8\xad')])),
            ],
        ),
        migrations.CreateModel(
            name='FileOperatorType',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(default=b'', max_length=30)),
                ('title', models.CharField(default=b'', max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='FileUpload',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True)),
                ('source_path', models.CharField(default=b'', max_length=256)),
                ('target_path', models.CharField(default=b'', max_length=256)),
                ('filename', models.CharField(default=b'', max_length=60)),
                ('u_time', models.DateTimeField(auto_now_add=True)),
                ('u_model', models.CharField(default=b'http', max_length=10, choices=[(b'http', b'http'), (b'ftp', b'ftp'), (b'client', b'client')])),
                ('user', models.CharField(default=b'', max_length=60)),
                ('status', models.IntegerField(default=0, max_length=1, choices=[(0, b'\xe6\x88\x90\xe5\x8a\x9f'), (1, b'\xe5\xa4\xb1\xe8\xb4\xa5'), (2, b'\xe8\xbf\x9b\xe8\xa1\x8c\xe4\xb8\xad')])),
            ],
        ),
        migrations.AddField(
            model_name='dataoperator',
            name='o_type',
            field=models.ForeignKey(to='hdfs.FileOperatorType'),
        ),
    ]
