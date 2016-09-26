#!/bin/bash
cat /opt/script/hosts >> /etc/hosts
cat /etc/hosts
/opt/Sirius/sbin/Aries.sh start 
