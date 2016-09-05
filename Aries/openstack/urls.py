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
#from web.views import index,test,server_s,error_r,application,applications,login,logout,manage,manage_host,volumes
from openstack.views import test,instances,create_host,volumes,login,logout,images,flavors

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^login',login,name='login'),
    url(r'^logout',logout,name='logout'),
    url(r'^images',images),
    url(r'^bfddashboard/instances/$',instances,name='instances'),
    url(r'^bfddashboard/instances/vm/$',create_host,name='create_host'),
    url(r'^volumes/$', volumes, name='volumes'),
    url(r'^flavors/$', flavors, name='flavors'),
    url(r'^images/$', images, name='images'),
    url(r'^test',test,name='test'),
]
