version_token = "v3"
version_nova = "v2.1"
version_cinder = "v2"

common_nova = "/%s/{project_id}/"%version_nova
common_cinder = "/%s/{project_id}/"%version_cinder

#login
url_get_token = "/%s/auth/tokens"%version_token
url_project_id = "/%s/auth/projects"%version_token

#flavor
url_flavor_list = common_nova + "flavors"
url_flavor_action = common_nova + "flavors/{flavor_id}"
url_flavor_list_detail = common_nova + "flavors/detail"

#image
url_image_list = common_nova + "images"
url_image_action = common_nova + "images/{image_id}"
url_image_list_detail = common_nova + "images/detail"

#vm
url_vm_list = url_vm_create = common_nova + "servers"
url_vm_action = common_nova + "servers/{vm_id}"
url_vm_list_detail = common_nova + "servers/detail"
url_vm_control_action = common_nova + "servers/{vm_id}/action"

#volume
url_volume_list = url_volume_create = common_nova + "os-volumes"
url_volume_action = common_nova + "os-volumes/{volume_id}"
url_volume_list_detail = common_nova + "os-volumes/detail"
url_volume_extend = common_cinder + "volumes/{volume_id}/action"
url_volume_change = common_cinder + "volumes/{volume_id}"

#volumes_snap
url_volume_snap_list = url_volume_snap_create = common_nova + "os-snapshots"
url_volume_snap_list_detail = common_nova + "os-snapshots/detail"
url_volume_snap_action = common_nova + "os-snapshots/{snapshot_id}"
url_volume_snap_change = common_cinder + "snapshots/{snapshot_id}"

#volume_attach
url_volume_attach_list =url_volume_attach_create = common_nova + "servers/{vm_id}/os-volume_attachments"
url_volume_attach_action = common_nova + "servers/{vm_id}/os-volume_attachments/{attach_id}"

#volume_backup
url_volume_backup_list = url_volume_backup_create = common_cinder + "backups"
url_volume_backup_list_detail = common_cinder + "backups/detail"
url_volume_backup_action = common_cinder + "backups/{backup_id}"
url_volume_backup_restore = common_cinder + "backups/{backup_id}/restore"

#common api
url_keypairs = common_nova + "os-keypairs"
url_az_info = common_nova + "os-aggregates"
url_hv_info = common_nova + "os-hypervisors/detail"

#user api
url_user_common = "/%s/users"%version_token
url_user_action = "/%s/users/{user_id}"%version_token
url_user_project = "/%s/users/{user_id}/projects"%version_token
url_project_member = "/%s/role_assignments"%version_token
url_project_user_action = "/%s/projects/{project_id}/users/{user_id}/roles/{role_id}"%version_token
url_project_user_del = "/%s/projects/{project_id}/users/{user_id}/roles/{role_id}"%version_token
url_project_list = "/%s/projects"%version_token








