# encoding:utf-8


class InfluxDBQueryStrManager:
    TEMPLATE_STR = '''SELECT sum("value") FROM "{measurement}" 
                      WHERE "type" = '{type}' AND time > {time_start} and time < {time_end} 
                      GROUP BY time(1s) fill(null)'''

    M_CPU_USAGE = 'cpu/usage_rate'
    M_CPU_LIMIT = 'cpu/limit'
    M_CPU_REQUEST = 'cpu/request'

    M_MEMORY_USAGE = 'memory/usage'
    M_MEMORY_WORKINGSET = 'memory/working_set'
    M_MEMORY_LIMIT = 'memory/limit'
    M_MEMORY_REQUEST = 'memory/request'

    M_NETWORK_TRANSMIT = 'network/tx_rate'
    M_NETWORK_RECEIVE = 'network/rx_rate'

    M_FILESYSTEM_USAGE = 'filesystem/usage'
    M_FILESYSTEM_LIMIT = 'filesystem/limit'

    T_1H = '1h'
    T_6H = '6h'
    T_1D = '24h'

    T_NODE = 'node'
    T_POD = 'pod'

    @staticmethod
    def format_query_str(measurement,time_start ,time_end ,type = T_NODE):
        return InfluxDBQueryStrManager.TEMPLATE_STR.format( 
                measurement=measurement,
                time_start=time_start,
                time_end=time_end,
                type=type)

    @staticmethod
    def get_measurement_disname_dict():
        ISM = InfluxDBQueryStrManager
        return {
            ISM.M_CPU_USAGE:'Usage',
            ISM.M_CPU_LIMIT:'Limit',
            ISM.M_CPU_REQUEST:'Request',

            ISM.M_MEMORY_USAGE:'Usage',
            ISM.M_MEMORY_WORKINGSET:'Working Set',
            ISM.M_MEMORY_LIMIT:'Limit',
            ISM.M_MEMORY_REQUEST:'Request',

            ISM.M_NETWORK_TRANSMIT:'Transmit',
            ISM.M_NETWORK_RECEIVE:'Receive',

            ISM.M_FILESYSTEM_USAGE:'Usage',
            ISM.M_FILESYSTEM_LIMIT:'Limit'
        }
