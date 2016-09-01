from rest_framework.urlpatterns import format_suffix_patterns
from django.conf.urls import patterns,url,include
import views
import rests
urlpatterns = format_suffix_patterns(patterns('hdfs.views',
    url('^state/$', rests.HostState.as_view(), name='HostState-list' ),
    url('^relation/(?P<host_name>.+)/$', rests.Relation.as_view(), name='relation-info'),
    url('^operator/$', rests.OperateService.as_view(), name='operate'),
    url(r'^(?P<host_name>[\w|\-.\d-]+)/(?P<component_name>[A-Z]+)/(?P<operate>[A-Z]+)/$', rests.OperateComponent.as_view(),name="operate-component"),
    url(r'^capacity/(?P<space_name>.*)/$',rests.capacityRecovery.as_view()),
    url(r'^share/(?P<path>.*)/$',rests.share.as_view()),
    url(r'^upload/(?P<path>.*)/$',rests.upload),
    url(r'^(?P<path>.*)/$',rests.pathOp.as_view()),
 ))


