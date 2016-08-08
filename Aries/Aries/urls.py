#encoding=utf8
from django.contrib import admin
from rest_framework.urlpatterns import format_suffix_patterns
from django.conf.urls import patterns,url,include
import settings
from django.contrib import admin
admin.autodiscover()
import views
urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^v1/user_auth/', include('user_auth.urls')),
    url(r'^v1/hdfs/', include('hdfs.urls')),
    url(r'^k8s/', include('kd_agent.urls')),
    url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT, 'show_indexes': True}),
    url(r'^$',views.login),
    url(r'^login$',views.login),
    url(r'^logout$',views.logout),
    url(r'^HDFS/.*$',views.index),
    url(r'^CalcManage/.*$',views.index)
]

# 可浏览式登录API
urlpatterns += patterns('',
    url(r'^api-auth/',include('rest_framework.urls',namespace='rest_framework')),
)
