# -*- coding: UTF-8 -*-

from django.core.management.base import BaseCommand

from Aries import sumSpace

POLL_TIME = 600

#启动一个线程开始定时统计配额. default: 10m

class Command(BaseCommand):
    help = 'start a thread to calc statistical quota every 10 minutes'

    # 由于该脚本执行的命令较为简单，因此不接受参数
    def add_arguments(self, parser):
        return None

    def handle(self, *args, **options):
        sumSpace.run( POLL_TIME )
