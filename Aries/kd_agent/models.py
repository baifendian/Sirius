# -*- coding: UTF-8 -*-

from django.db import models
import math


from kd_agent.toolsmanager import InfluxDBQueryStrManager as ISM

def calc_minute_ave(v):
    return float(v)/(24*60)

# 建库语句
# create database DecisionMakingSurvey default charset utf8 collate utf8_unicode_ci;

class ResourceUsageDailyCache(models.Model):
    datetime = models.DateTimeField()
    namespace = models.CharField( max_length=255 )

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
        return ResourceUsageDailyCache.generate_obj_by_base_keys( datetime,namespace,obj )

    @staticmethod
    def generate_obj_by_base_keys( datetime,namespace,obj ):
        CVMD = ResourceUsageDailyCache.calc_virtual_machine_day
        # 根据提供的cpu、memory、usage数据来计算资源用量
        obj['usage'] = CVMD( obj['cpu_usage'],obj['memory_usage'] )
        obj['limit'] = CVMD( obj['cpu_limit'],obj['memory_limit'] )
        obj['request'] = CVMD( obj['cpu_request'],obj['memory_request'] )        
        return ResourceUsageDailyCache( datetime=datetime,namespace=namespace,**obj )

    def to_minuteaverge_measurementkey_json(self):
        return {
            ISM.M_CPU_REQUEST:calc_minute_ave(self.cpu_request),
            ISM.M_CPU_LIMIT:calc_minute_ave(self.cpu_limit),
            ISM.M_CPU_USAGE:calc_minute_ave(self.cpu_usage),
            ISM.M_MEMORY_REQUEST:calc_minute_ave(self.memory_request),            
            ISM.M_MEMORY_LIMIT:calc_minute_ave(self.memory_limit),
            ISM.M_MEMORY_USAGE:calc_minute_ave(self.memory_usage),
            'request':self.request,
            'limit':self.limit,
            'usage':self.usage,
        }

    # u 多少个0.5VCPU   （1VCPU == cpu/1000 ，0.5VCPU是预设的值）
    # v 多少个128MB内存  （ 128MB是预设的值 ）
    # 计算公式为： u*0.025 + 0.003*v / (8*u)
    # 结果保留11位有效小数（1e-11）（且直接进位） 即如果结果是 1.11e-11 则，应该显示 1.2e-11
    @staticmethod
    def calc_virtual_machine_day( cpu_value,memory_value ):

        u = calc_minute_ave(cpu_value)/1000/0.5
        v = calc_minute_ave(memory_value)/128/1024/1024
        try:
            value = u*0.025 + 0.003*v / (8*u)
        except:
            value = 0
        
        # 先放大1e11倍，然后向上取整。之后再缩小1e11倍。由于缩小之后，获取的数不会严格1e11倍，因此round一下
        # 如：
        # >>> 1.3/10000
        # 0.00013000000000000002
        d = 1e-11
        return round( math.ceil(value/d)*d,11 )


# 该表中记录namespace到部门名的一个对照，只用做向运维推送集群每天某个namespace的资源用量
# 由于推送数据与Sirius的主要业务不相关，因此这里会尽量降低它与Sirius业务相关表的耦合度
class NamespaceDepartmentRef(models.Model):
    namespace = models.CharField( max_length=255,primary_key=True )
    department = models.CharField( max_length=1024 )

# 该表是为了记录推送的状态。比如某天的数据推送失败，则该表中将会有一条push_success为False的记录
# 等到下次推送的时候，将会查找这些记录并重新推送
class ClusterUsagePushFailureRecords(models.Model):
    namespace = models.ForeignKey( NamespaceDepartmentRef )
    datetime = models.DateTimeField()
    class Meta:
        unique_together = ("namespace", "datetime")



