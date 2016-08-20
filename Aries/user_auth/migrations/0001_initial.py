# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=b'', max_length=100)),
                ('password', models.CharField(default=b'', max_length=512)),
                ('email', models.EmailField(max_length=254)),
                ('is_active', models.IntegerField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=b'', max_length=100)),
                ('is_active', models.IntegerField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Space',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(default=b'', max_length=100)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('title', models.CharField(default=b'', max_length=512)),
                ('is_active', models.IntegerField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='SpaceUserRole',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('pemission', models.IntegerField()),
                ('role', models.ForeignKey(to='user_auth.Role')),
                ('space', models.ForeignKey(to='user_auth.Space')),
                ('user', models.ForeignKey(to='user_auth.Account')),
            ],
        ),
        migrations.AddField(
            model_name='account',
            name='role',
            field=models.ForeignKey(to='user_auth.Role'),
        ),
    ]
