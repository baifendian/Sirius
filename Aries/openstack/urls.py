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
from openstack.views import instances,create_host,volumes,login,logout,images,flavors
import rests


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^login',login,name='login'),
    url(r'^logout',logout,name='logout'),
    url(r'^bfddashboard/instances/$',instances,name='instances'),
    url(r'^bfddashboard/instances/vm/$',create_host,name='create_host'),
    url(r'^volumes/$', volumes, name='volumes'),
    url(r'^flavors/$', flavors, name='flavors'),
    url(r'^images/$', images, name='images'),
    url(r'^volumes_post/$',rests.volumes.as_view(),name="volumes_port"),
    url(r'^project/$',rests.project.as_view(),name="project"),
    url(r'^search/$',rests.search.as_view(),name="search"),
    url(r'home/overview/$',rests.overview.as_view(),name="home"),
    url(r'^instances_post/$',rests.instances.as_view(),name='instances_post'),
]
