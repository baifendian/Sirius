from rest_framework.urlpatterns import format_suffix_patterns
from django.conf.urls import patterns,url,include
import views
import rests
urlpatterns = format_suffix_patterns(patterns('hdfs.views',
    url(r'^capacity/(?P<space_name>.*)/$',rests.capacityRecovery.as_view()),
    url(r'^share/(?P<path>.*)/$',rests.share.as_view()),
    url(r'^(?P<path>.*)/$',rests.pathOp.as_view()),
 ))


