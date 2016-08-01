import os
import pwd
import subprocess
import sys

def main(my_args=None,user_name="hadoop",operator="ls",args=["/user/hadoop"]):
    pw_record = pwd.getpwnam(user_name)
    user_name      = pw_record.pw_name
    user_home_dir  = pw_record.pw_dir
    user_uid       = pw_record.pw_uid
    user_gid       = pw_record.pw_gid
    env = os.environ.copy()
    env[ 'HOME'     ]  = user_home_dir
    env[ 'LOGNAME'  ]  = user_name
    #env[ 'PWD'      ]  = cwd
    env[ 'USER'     ]  = user_name
    cmd=["sh hadoop-run.sh",operator]
    cmd= cmd + args
    cmd = " ".join(cmd)
    process = subprocess.Popen(
        cmd,shell=True, preexec_fn=demote(user_uid, user_gid), env=env,stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    result = process.wait()
    if result != 0:
        return  "{1} run error".format(cmd)
    else:
        return  process.stdout.read()

def demote(user_uid, user_gid):
    def result():
        os.setgid(user_gid)
        os.setuid(user_uid)
    return result

if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(-1)
    args= sys.argv[1:]
    print args
    username=args[0]
    operator = args[1]
    args = args[2:]
    print username
    print operator
    print args
    print main(user_name=username,operator=operator,args=args)
