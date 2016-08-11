# -*- coding: utf-8 -*-

from django.http import JsonResponse


def check_request_method(method=None):
    def _wrapper(func):
        def _warpper2(request, *args, **kwargs):
            if request.method != method:
                return JsonResponse({
                    "code": 405,
                    "msg": "method not allow"
                }, safe=False)
            return func(request, *args, **kwargs)
        return _warpper2
    return _wrapper
