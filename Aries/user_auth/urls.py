from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework_jsonp.renderers import JSONPRenderer
from django.conf.urls import patterns,url,include
import views
import rests
urlpatterns = format_suffix_patterns(patterns('user_auth.views',
    url(r'^$', 'api_root'),
    url(r'^login/$', 'login'),
    ## space
    url(r'^spaces/$',rests.spaceList.as_view(),name="space-list"), 
    url(r'^spaces/info/(?P<pk>[0-9]+)/$',rests.spaceInfo.as_view(),name="space-info"),
    url(r'^spaces/member/(?P<pk>[0-9]+)/$',rests.spaceMember.as_view(),name='space-member'),
    ## role
    url(r'^roles/',rests.roleList.as_view(),name="role-list")
 ))


