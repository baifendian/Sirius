#encoding=utf8
"""
Django settings for Aries project.

Generated by 'django-admin startproject' using Django 1.8.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""
#LDAP
AUTHENTICATION_BACKENDS = (
'django_auth_ldap.backend.LDAPBackend',
'django.contrib.auth.backends.ModelBackend',
)

CORS_ORIGIN_WHITELIST = (
    'google.com',
    '192.168.164.120:4001'
)

#import ldap
#from django_auth_ldap.config import LDAPSearch
AUTH_LDAP_SERVER_URI = 'ldap://172.24.3.170:389'
AUTH_LDAP_USER_DN_TEMPLATE = 'uid=%(user)s,ou=wiki,dc=bfdabc,dc=com'
AUTH_LDAP_BIND_AS_AUTHENTICATING_USER = True
AUTH_LDAP_CACHE_GROUPS = True
AUTH_LDAP_GROUP_CACHE_TIMEOUT = 3600
AUTH_LDAP_USER_ATTR_MAP = {
"username": "givenName",
"password": "password"
}

REST_BASE_URI="172.24.3.64:10010"
SHARE_PROXY_BASE_URI="http://172.24.3.64:10086"
#which shell
# HADOOP_RUN_SCRIPT = "/home/jinzhu.wang/Aries/Aries/hdfs/hadoop-run.sh"
# WEBHDFS_USER = "hadoop"

HDFS_URL="http://172.24.3.156:50070/webhdfs/v1/"
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os,sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '4q+z5arz(+!__dtzxpn*n7g@3w0s7x)xtr+v!ts9m!-vzp=^)4'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []
APPEND_SLASH=False

# Application definition
INSTALLED_APPS = (
    'django_admin_bootstrapped.bootstrap3',
    'django_admin_bootstrapped',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'user_auth',
    'hdfs',
    'kd_agent',
    #'Aries',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    #'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

ROOT_URLCONF = 'Aries.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Aries.wsgi.application'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
        'complete': {
            'format': '[%(levelname)s %(asctime)s @ %(process)d] (%(pathname)s/%(funcName)s:%(lineno)d) - %(message)s'
        },
        'online': {
            'format': '[%(levelname)s %(asctime)s @ %(process)d] - %(message)s'
        }
    },
    'handlers': {
        'null': {
            'level':'DEBUG',
            'class':'django.utils.log.NullHandler',
        },
        'file': {
            'level':'DEBUG',
            'class':'logging.FileHandler',
            'formatter': 'online',
            'filename' : '/opt/pan.lu/gitsource/Sirius/log/error.log'.replace('\\','/')
        },
        'ac_file': {
            'level':'DEBUG',
            'class':'logging.FileHandler',
            'formatter': 'complete',
            'filename' :'/opt/pan.lu/gitsource/Sirius/log/service.log'.replace('\\','/')
        },
        'hdfs_file': {
            'level':'DEBUG',
            'class':'logging.FileHandler',
            'formatter': 'complete',
            'filename' :'/opt/pan.lu/gitsource/Sirius/log/hdfs.log'.replace('\\','/')
        },
        'kd_agent_file': {
            'level':'DEBUG',
            'class':'logging.FileHandler',
            'formatter': 'complete',
            'filename' :'/opt/pan.lu/gitsource/Sirius/log/service.log'.replace('\\','/')
        },
        'console':{
            'level':'DEBUG',
            'class':'logging.StreamHandler',
            'formatter': 'complete'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
        }
    },
    'loggers': {
        '': {
            'handlers':['file'],
            'propagate': False,
            'level':'DEBUG',
        },
        'access_log': {
            'handlers':['ac_file', 'console'],
            'propagate': False,
            'level':'DEBUG',
        },
        'hdfs_log': {
            'handlers':['hdfs_file', 'console'],
            'propagate': False,
            'level':'DEBUG',
        },
        'kd_agent_log': {
            'handlers':['kd_agent_file','console'],
            'propagate': False,
            'level':'DEBUG',
        },
        'django.request': {
            'handlers': ['ac_file', 'mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}



# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

# 提供k8s服务的地址
K8S_IP = '172.24.3.150'
K8S_PORT = 8080

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'aries',
        'HOST':'172.24.3.64',
        'PORT':'3306',
        'USER':'root',
        'PASSWORD':'baifendian'
    },
    # used by app : kd_agent 
    'kd_agent_bdms': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'bdms_web',                   # Or path to database file if using sqlite3.
        'USER': 'bdms',                       # Not used with sqlite3.
        'PASSWORD': 'bdms',                   # Not used with sqlite3.
        'HOST': '172.24.2.114',             # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '3306',                       # Set to empty string for default. Not used with sqlite3.
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static/")

########################
#   webhdfs settigns   #
########################

# the webhdfs node maybe more than one node, so webhdfs hosts is a list
# the item of webhdfs hosts list is "ip:port", default port is 50070
WEBHDFS_HOSTS = [
    "172.24.3.155:50070",
    "172.24.3.156:50070",
]
# webhdfs port, it`s default value is 50070
WEBHDFS_PORT = 50070
WEBHDFS_PATH = "/webhdfs/v1"
WEBHDFS_USER = "hadoop"
WEBHDFS_TIMEOUT = 10
WEBHDFS_MAX_TRIES = 2
WEBHDFS_RETRY_DELAY = 3
# HADOOP_RUN_SCRIPT = os.path.join(BASE_DIR, os.path.pardir, 'sbin/hadoop-run.sh')
HADOOP_RUN_SCRIPT = "/opt/pan.lu/gitsource/Aries/Aries/hdfs/hadoop-run.sh"

# ftp settings
FTP_SERVER = "117.121.7.29"
FTP_PORT = 990
FTP_BUFFER_SIZE = 1024
FTP_TIMEOUT = 10
FTP_LOCAL_DIR = "/tmp/Aries/ftp/"
FTP_ACCT = ""
FTP_KEYFILE = None
FTP_CERTFILE = None

