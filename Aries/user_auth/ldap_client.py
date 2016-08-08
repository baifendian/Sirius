#-*- coding: UTF-8 -*- 
import sys,ldap 
LDAP_HOST = 'ldap://172.24.3.170:389'
#BASE_DN = 'uid=administrator,ou=wiki,dc=bfdabc,dc=com'
BASE_DN = 'ou=wiki,dc=bfdabc,dc=com'
#用户验证，根据传递来的用户名和密码，搜索LDAP，返回boolean值 
def ldap_get_vaild1(username=None,passwd=None): 
    try:
        #conn=ldap.initialize(LDAP_HOST)
        conn=ldap.initialize(LDAP_HOST)
        conn.protocol_version = ldap.VERSION3
        conn.set_option(ldap.OPT_REFERRALS, 0)
        print conn
        conn.simple_bind_s('uid=%s,%s' % (username, BASE_DN),passwd)
        newEntry = conn.search_s("uid=%s,%s"
                             % (username,
                             BASE_DN),
                             ldap.SCOPE_BASE)
                             #attrlist=['uid'])
        return newEntry
    except Exception as e:
        print e
        print "用户名或密码错误，请重新登录！"


#ldap_get_vaild(username="administrator",passwd="redhat")
def ldap_get_vaild(username=None,passwd=None):
    from django_auth_ldap.backend import LDAPBackend
    auth = LDAPBackend()
    user = auth.authenticate(username=username,password=passwd)
    return user 
