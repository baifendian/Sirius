
import traceback

from user_auth.models import Account,Role,Space,SpaceUserRole
from hdfs.models import FileOperatorType


# Role
def insert_user_auth_role():
    info = [
        ('superAdmin',1),
        ('spaceViewer',1),
        ('spaceDev',1),
        ('spaceAdmin',1),
        ('guest',1)
    ]
    try:
        for item in info:
            Role(name=item[0],is_active=item[1]).save()
            print 'insert user_auth role (name : %s , is_active : %s) success' % item
        return True
    except Exception as e:
        print traceback.format_exc()
        return False

# Space
def insert_user_auth_space():
    info = [{
        'name':'hadoop',
        'create_time':'2016-05-24 03:08:39', 
        'title':'tt111', 
        'is_active':1, 
        'address':'/user/hadoop', 
        'capacity':{'total': u'2791000', 'plan': 10000000, 'used': 1000000},
        'exec_user':'hadoop'
    },{
        'name':'bae',
        'create_time':'2016-05-24 03:08:46', 
        'title':'22', 
        'is_active':1, 
        'address':'/user/bae', 
        'capacity':{'total': u'296100', 'plan': 100000000, 'used':100086},
        'exec_user':'bae'
    },{
        'name':'bre',
        'create_time':'2016-05-24 03:08:53', 
        'title':'rr', 
        'is_active':1, 
        'address':'/user/bre', 
        'capacity':{'total': u'1000', 'plan': 100000000, 'used': 100},
        'exec_user':'bre'
    },{
        'name':'default',
        'create_time':'2016-09-21 11:27:31', 
        'title':'www', 
        'is_active':1, 
        'address':'/user/hadoop', 
        'capacity':{'total': u'5048', 'plan': 10240, 'used': 2000},
        'exec_user':'hadoop'
    },{
        'name':'openstack',
        'create_time':'2016-10-20 05:54:53', 
        'title':'openstack', 
        'is_active':1, 
        'address':'/user/openstack', 
        'capacity':{'total': u'800', 'plan':900, 'used':100},
        'exec_user':'openstack'
    }]
    try:
        for item in info:
            Space( **item ).save()
            print 'insert user_auth space %s success' % item
        return True
    except Exception as e:
        print traceback.format_exc()
        return False

# Account
def insert_user_auth_account():
    info = [{
        'name':'yi.wu',
        'email':'yi.wu@baifendian.com', 
        'is_active':1, 
        'role':'superAdmin'
    },{
        'name':'lifeng.zhang',
        'email':'lifeng.zhang@baifendian.com', 
        'is_active':1, 
        'role':'guest'
    },{
        'name':'yining.he',
        'email':'yining.he@baifendian.com', 
        'is_active':1, 
        'role':'guest' 
    },{
        'name':'ping.zhang',
        'email':'ping.zhang@baifendian.com', 
        'is_active':1, 
        'role':'guest' 
    },{
        'name':'xu.yan',
        'email':'xu.yan@baifendian.com', 
        'is_active':1, 
        'role':'guest' 
    },{
        'name':'shengui.luo',
        'email':'shengui.luo@baifendian.com', 
        'is_active':1, 
        'role':'guest' 
    },{
        'name':'zhijie.lv',
        'email':'zhijie.lv@baifendian.com', 
        'is_active':1, 
        'role':'superAdmin' 
    },{
        'name':'pan.guo',
        'email':'pan.guo@baifendian.com', 
        'is_active':1, 
        'role':'guest'
    },{
        'name':'pan.lu',
        'email':'pan.lu@baifendian.com', 
        'is_active':1, 
        'role':'superAdmin' 
    },{
        'name':'jingxia.sun',
        'email':'jingxia.sun@baifendian.com', 
        'is_active':1, 
        'role':'superAdmin' 
    },{
        'name':'ding.zhang',
        'email':'ding.zhang@baifendian.com', 
        'is_active':1, 
        'role':'superAdmin' 
    }]
    try:
        for item in info:
            item['role'] = Role.objects.get(name=item['role'])
            Account( **item ).save()
            print 'insert user_auth account %s success' % item
        return True
    except Exception as e:
        print traceback.format_exc()
        return False

# SpaceUserRole
def insert_user_auth_spaceuserrole():
    info = [{
        'role':'spaceDev',
        'space':'hadoop', 
        'user':'yining.he'
    },{
        'role':'spaceViewer',
        'space':'bre', 
        'user':'yining.he'
    },{
        'role':'spaceDev',
        'space':'bae', 
        'user':'yining.he'
    },{
        'role':'spaceViewer',
        'space':'openstack', 
        'user':'ping.zhang'
    },{
        'role':'spaceAdmin',
        'space':'hadoop', 
        'user':'xu.yan'
    },{
        'role':'spaceDev',
        'space':'bre', 
        'user':'xu.yan'
    },{
        'role':'spaceAdmin',
        'space':'bae', 
        'user':'xu.yan'
    },{
        'role':'spaceAdmin',
        'space':'hadoop', 
        'user':'zhijie.lv'
    },{
        'role':'spaceAdmin',
        'space':'hadoop', 
        'user':'pan.guo'
    },{
        'role':'spaceViewer',
        'space':'bae', 
        'user':'pan.guo'
    },{
        'role':'spaceDev',
        'space':'default', 
        'user':'pan.guo'
    },{
        'role':'spaceAdmin',
        'space':'hadoop', 
        'user':'lifeng.zhang'
    },{
        'role':'spaceDev',
        'space':'hadoop', 
        'user':'shengui.luo'
    },{
        'role':'spaceAdmin',
        'space':'bae', 
        'user':'jingxia.sun'
    },{
        'role':'spaceAdmin',
        'space':'hadoop', 
        'user':'ding.zhang'
    },{
        'role':'spaceAdmin',
        'space':'bae', 
        'user':'ding.zhang'
    },{
        'role':'spaceAdmin',
        'space':'openstack', 
        'user':'ding.zhang'
    }]
    try:
        for item in info:
            item['role'] = Role.objects.get(name=item['role'])
            item['space'] = Space.objects.get(name=item['space'])
            item['user'] = Account.objects.get(name=item['user'])
            SpaceUserRole( **item ).save()
            print 'insert user_auth SpaceUserRole %s success' % item
        return True
    except Exception as e:
        print traceback.format_exc()
        return False

# hdfs_fileoperatortype
def insert_hdfs_fileoperatortype():
    info = [{
        'name':'mv',
        'title':'mv' 
    },{
        'name':'delete',
        'title':'delete' 
    },{
        'name':'cp',
        'title':'cp' 
    },{
        'name':'recovery',
        'title':'recovery' 
    },{
        'name':'compress',
        'title':'compress' 
    },{
        'name':'merge',
        'title':'merge' 
    },{
        'name':'mkdir',
        'title':'mkdir' 
    },{
        'name':'share',
        'title':'share' 
    },]
    try:
        for item in info:
            FileOperatorType( **item ).save()
            print 'insert hdfs FileOperatorType %s success' % item
        return True
    except Exception as e:
        print traceback.format_exc()
        return False


def run():
    insert_user_auth_role()
    insert_user_auth_space()
    insert_user_auth_account()
    insert_user_auth_spaceuserrole()
    insert_hdfs_fileoperatortype()












