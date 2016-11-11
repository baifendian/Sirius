"""management URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from openstack.views import instances,volumes,images,flavors,instances_log
import rests


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^bfddashboard/instances/$',instances,name='instances'),
    url(r'^volumes/$', volumes, name='volumes'),
    url(r'^flavors/$', flavors, name='flavors'),
    url(r'^images/$', images, name='images'),
    url(r'^volumes_post/$',rests.volumes.as_view(),name="volumes_port"),
    url(r'^project/$',rests.project.as_view(),name="project"),
    url(r'^search/$',rests.search.as_view(),name="search"),
    url(r'^home/overview/$',rests.overview.as_view(),name="home"),
    url(r'^instances_post/$',rests.instances.as_view(),name='instances_post'),
    url(r'^instances_log/(?P<id>\S*)/(?P<line>\d*)/$',instances_log,name="instances_log"),
    url(r'^monitor/$',rests.monitor.as_view(),name="monitor"),
]
