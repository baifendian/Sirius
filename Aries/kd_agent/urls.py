from django.conf.urls import patterns, url

from kd_agent import views

urlpatterns = patterns('',

    url(r'^api/v1/namespaces/(?P<namespace>\w{1,64})/pods$',views.get_pod_list),
    url(r'^api/v1/namespaces/(?P<namespace>\w{1,64})/services$',views.get_service_list),
    url(r'^api/v1/namespaces/(?P<namespace>\w{1,64})/replicationcontrollers$',views.get_rc_list),
    url(r'^api/v1/namespaces/mytasklist$',views.get_mytask_list),

)
