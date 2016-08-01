# Register your models here.
from user_auth.models import Account,Role,Space,SpaceUserRole
from django.contrib import admin 
class AccountAdmin(admin.ModelAdmin):
    list_display=('id','name','password','email','is_active')

class RoleAdmin(admin.ModelAdmin):
    list_display=('id','name','is_active')

class SpaceAdmin(admin.ModelAdmin):
    list_display=('id','name','create_time','is_active')

class SpaceUserRoleAdmin(admin.ModelAdmin):
    list_display=('id','user','space','role','permission')

admin.site.register(Account,AccountAdmin)
admin.site.register(Role,RoleAdmin)
admin.site.register(Space,SpaceAdmin)
admin.site.register(SpaceUserRole,SpaceUserRoleAdmin)
