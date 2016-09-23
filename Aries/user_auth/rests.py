#encoding=utf8
#email: pan.lu@baifendian.com
from rest_framework.views import APIView
import logging
ac_logger = logging.getLogger("access_log")
from service import *
from hdfs.tools import *

class overview(APIView):
    def get(self,request):
        result = getOverview(request)
        return packageResponse(result)

class spaceList(APIView):
    '''
       展示该用户所属的spaces. superAdmin, root可以看见所有的spaces
    '''
    @print_request
    def get(self,request,format=None):
        result=spaceListGet(request)
        return packageResponse(result)

    @print_request
    def post(self,request,format=None):
        '''
           增加.增加某个space
        '''
        result=spaceListPost(request)
        return packageResponse(result)

class spaceMember(APIView):
    @print_request
    def get(self,request,pk,format=None):
        ac_logger.info("/spaceMemberGET===========================")
        result = spaceMemberGet(request,pk)
        return packageResponse(result)

    @print_request
    def post(self,request,pk,format=None):
        ac_logger.info("/spaceMemberPOST===========================")
        result = spaceMemberPost(request,pk)
        return packageResponse(result)

    @print_request
    def put(self,request,pk,format=None):
        ac_logger.info("/spaceMemberPut===========================")
        result = spaceMemberPut(request,pk)
        return packageResponse(result)

    def options(self,request,pk,format=None):    
        ac_logger.info("/spaceMemberOptions===========================")
        result = {"code":200,"data":"options"}
        #result = spaceMemberPut(request,pk)
        return packageResponse(result)

    def delete(self,request,pk,format=None):
        ac_logger.info("/spaceMemberDelete===========================")
        result ={"code":200,"data":"test"}
        return packageResponse(result)
 
class roleList(APIView):
    '''
       主要提供对role的查询,是否过滤admin
    '''
    @print_request
    def get(self,request,format=None):
        result = roleListGET(request)
        return packageResponse(result)

class userList(APIView):
    def put(self,request,space,format=None):
        ac_logger.info("put.....:{0}".format(space)) 
        result = userListPut(request,space) 
        return packageResponse(result)      

    def options(self,request,space,format=None):
        result = {"code":200,"data":"success"} 
        return packageResponse(result)   

class spaceInfo(APIView):
    '''
       主要提供对单个space 的增,删,改,查
    '''
    @print_request
    def get(self,request,pk,format=None):
        '''
           查询. 查询某个space的详细信息,以及判断是否是space管理员
        '''
        result = spaceInfoGet(request,pk)
        return packageResponse(result)         
    
    @print_request
    def put(self,request,pk,format=None):
        '''
           更新.提供需要更新的space全部信息
        '''
        #201 
        data=request.data
        ac_logger.info("data:%s" %data)  
        space = getObjById(Space,id=pk)  
        statu = updateObjById(space,data)
        result = {"msg":"space put success!"}
        return packageResponse(result)
 
    @print_request
    def delete(self,request,pk,format=None):
        '''
           删除.直接删除某个space
        '''
        statu = delObjById(Role,pk)
        return packageResponse(status=statu)      
    
    @print_request
    def patch(self,request,pk,format=None):
        result = {"error":"该接口尚未开发"}
        return packageResponse(result,status=status.HTTP_204_NO_CONTENT)

