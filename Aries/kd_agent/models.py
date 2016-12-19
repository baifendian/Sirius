# -*- coding: UTF-8 -*-

from django.db import models
import math


from kd_agent.toolsmanager import InfluxDBQueryStrManager as ISM

class ResourceUsageDailyCache(models.Model):
    datetime = models.DateTimeField()
    namespace = models.CharField( max_length=1024 )

    cpu_request = models.BigIntegerField( default=0 )
    cpu_limit = models.BigIntegerField( default=0 )
    cpu_usage = models.BigIntegerField( default=0 )

    # 这里的memory的workingset指标没有被保存。如果有需要，这里再保存一下即可
    memory_request = models.BigIntegerField( default=0 )
    memory_limit = models.BigIntegerField( default=0 )
    memory_usage = models.BigIntegerField( default=0 )

    # 注意，上面的 cpu、memory 指标数据是相对比较原始的数据，即将 1 天内 1440 个分钟的采样数据全部加起来
    # 但是下面的 request、limit、usage 数据是经过计算之后得到的（calc_virtual_machine_day）

    request = models.FloatField()
    limit = models.FloatField()
    usage = models.FloatField()
    
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
        RUDC = ResourceUsageDailyCache

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
        
        # 根据提供的cpu、memory、usage数据来计算资源用量
        obj['usage'] = RUDC.calc_virtual_machine_day( obj['cpu_usage'],obj['memory_usage'] )
        obj['limit'] = RUDC.calc_virtual_machine_day( obj['cpu_limit'],obj['memory_limit'] )
        obj['request'] = RUDC.calc_virtual_machine_day( obj['cpu_request'],obj['memory_request'] )
        
        return RUDC( datetime=datetime,namespace=namespace,**obj )

    def to_measurement_keys(self):
        return {
            ISM.M_CPU_REQUEST:self.cpu_request,
            ISM.M_CPU_LIMIT:self.cpu_limit,
            ISM.M_CPU_USAGE:self.cpu_usage,
            ISM.M_MEMORY_REQUEST:self.memory_request,            
            ISM.M_MEMORY_LIMIT:self.memory_limit,
            ISM.M_MEMORY_USAGE:self.memory_usage,
            'request':self.request,
            'limit':self.limit,
            'usage':self.usage,
        }

    # u 多少个0.5VCPU   （1VCPU == cpu/1000 ，0.5VCPU是预设的值）
    # v 多少个128MB内存  （ 128MB是预设的值 ）
    # 计算公式为： u*0.025 + 0.003*v / (8*u)
    # 同时，这个结果保留两位有效小数（0.01）（且直接进位）
    # 即如果结果是 0.0212 则，应该显示 0.03
    @staticmethod
    def calc_virtual_machine_day( cpu_value,memory_value ):
        # 先计算出来平均值
        cpu_value = float(cpu_value)/(24*60)
        memory_value = float(memory_value)/(24*60)

        u = cpu_value/1000/0.5
        v = memory_value/128/1024/1024
        try:
            v = u*0.025 + 0.003*v / (8*u)
        except:
            v = 0
        
        # 先放大100倍，然后向上取整。之后再缩小100倍。由于缩小之后，获取的数不会严格100倍，因此round一下
        # 如：
        # >>> 1.3/10000
        # 0.00013000000000000002
        return round( math.ceil(v/0.01)*0.01,2 )




