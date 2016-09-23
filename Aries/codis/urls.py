from django.conf.urls import patterns,url
from rest_framework.urlpatterns import format_suffix_patterns
import rests,views
urlpatterns=patterns('codis.views',
    url(r'^$', 'api_root'),
    url(r'^rebalance/$', rests.AutoReblanceApi.as_view(), name="rebalance"),
    url(r'^getallcodisinfo/$', rests.GetAllCodisInfo.as_view(), name="allcodisinfo"),
    url(r'^serverinfo/$', rests.ServerInfo.as_view(), name="serverinfo"),
    url(r'^proxyinfo/$', rests.ProxyInfo.as_view(), name="proxyinfo"),
    url(r'^hosts/$', rests.HostInfo.as_view(), name="hosts"),
    url(r'^codis/$', rests.CodisInfo.as_view(), name="codis"),
    url(r'^codislog/$', rests.CodisLog.as_view(), name="codis-log"),
    url(r'^deleteproxy/$', rests.DeleteProxy.as_view(), name="deleteproxy"),
    url(r'^codisoverview/$', rests.CodisOverview.as_view(), name="codisoverview"),	
)
#urlpatterns = format_suffix_patterns(urlpatterns)
