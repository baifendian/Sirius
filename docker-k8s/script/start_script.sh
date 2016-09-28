#!/bin/bash
cat /opt/Sirius/docker-k8s/hosts >> /etc/hosts
cat /etc/hosts
/opt/Sirius/sbin/Aries.sh start
