#/usr/bin/bash
version=$1
if [ ! $version ] ; then
  echo "please input current sirius version!"
  echo "thanks! bye!"
  exit 1
fi
mv Aries.yaml.k8s Aries.yaml
sed -i '/daemonize/d' Aries.xml
cd ..
docker build -t docker.baifendian.com/lupan/sirius_lugu:${version} .
docker push docker.baifendian.com/lupan/sirius_lugu:${version}
