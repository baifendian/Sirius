# -*- coding: UTF-8 -*-

from django.db import models

from kd_agent.toolsmanager import InfluxDBQueryStrManager as ISM

class ResourceUsageCache(models.Model):
    datetime = models.DateTimeField()
    namespace = models.CharField( max_length=1024 )

    cpu_request = models.BigIntegerField( default=0 )
    cpu_limit = models.BigIntegerField( default=0 )
    cpu_usage = models.BigIntegerField( default=0 )

    # 这里的memory的workingset指标没有被保存。如果有需要，这里再保存一下即可
    memory_request = models.BigIntegerField( default=0 )
    memory_limit = models.BigIntegerField( default=0 )
    memory_usage = models.BigIntegerField( default=0 )


    # 方便地生成一个对象
    # data_json 是一个json对象，其中的key应该与 ISM 中定义的一致，如下
    # ISM.M_CPU_USAGE
    # ISM.M_CPU_LIMIT
    # ISM.M_CPU_REQUEST
    # ISM.M_MEMORY_USAGE
    # ISM.M_MEMORY_LIMIT
    # ISM.M_MEMORY_REQUEST
    @staticmethod
    def generate_obj_by_measurement_key( datetime,namespace,data_json ):
        keys_map = {
            ISM.M_CPU_REQUEST:'cpu_request',
            ISM.M_CPU_LIMIT:'cpu_limit',
            ISM.M_CPU_USAGE:'cpu_usage',
            ISM.M_MEMORY_REQUEST:'memory_request',
            ISM.M_MEMORY_LIMIT:'memory_limit',
            ISM.M_MEMORY_USAGE:'memory_usage',
        }
        obj = {}
        for k,v in keys_map.items():
            obj[ v ] = data_json.get(k,0)
        return ResourceUsageCache( datetime=datetime,namespace=namespace,**obj )

    def to_measurement_keys(self):
        return {
            ISM.M_CPU_REQUEST:self.cpu_request,
            ISM.M_CPU_LIMIT:self.cpu_limit,
            ISM.M_CPU_USAGE:self.cpu_usage,
            ISM.M_MEMORY_REQUEST:self.memory_request,            
            ISM.M_MEMORY_LIMIT:self.memory_limit,
            ISM.M_MEMORY_USAGE:self.memory_usage,
        }


