#encoding=utf8
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
import logging
ac_logger = logging.getLogger("access_log")


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'spaces': reverse('space-list', request=request, format=format),
        'roles': reverse('role-list', request=request, format=format),      
    })


