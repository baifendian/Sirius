# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Codis',
            fields=[
                ('codis_id', models.AutoField(serialize=False, primary_key=True)),
                ('product_id', models.CharField(default=b'-', unique=True, max_length=25)),
                ('key_num', models.IntegerField(default=0)),
                ('memory_total', models.IntegerField(default=0)),
                ('memory_used', models.IntegerField(default=0)),
                ('dashboard_port', models.IntegerField()),
                ('available', models.CharField(max_length=10)),
                ('dashboard_ip', models.CharField(max_length=30)),
                ('server_memory', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Host',
            fields=[
                ('host_id', models.AutoField(serialize=False, primary_key=True)),
                ('host_ip', models.CharField(max_length=30)),
                ('host_user', models.CharField(default=b'root', max_length=20)),
                ('host_pass', models.CharField(default=b'123', max_length=20)),
                ('memory_total', models.IntegerField(default=0)),
                ('codis_home', models.CharField(default=b'/root/', max_length=100)),
                ('memory_used', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Proxy',
            fields=[
                ('proxy_id', models.AutoField(serialize=False, primary_key=True)),
                ('proxy_ip', models.CharField(max_length=30)),
                ('proxy_port', models.IntegerField()),
                ('http_ip', models.CharField(max_length=30)),
                ('http_port', models.IntegerField()),
                ('codis', models.ForeignKey(to='codis.Codis')),
                ('host', models.ForeignKey(to='codis.Host')),
            ],
        ),
        migrations.CreateModel(
            name='Servers',
            fields=[
                ('server_id', models.AutoField(serialize=False, primary_key=True)),
                ('server_ip', models.CharField(max_length=30)),
                ('role', models.CharField(default=b'master', max_length=10)),
                ('server_port', models.IntegerField(default=0)),
                ('codis', models.ForeignKey(to='codis.Codis')),
                ('host', models.ForeignKey(to='codis.Host')),
            ],
        ),
    ]
