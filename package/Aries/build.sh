#/bin/bash
npm run build
HOME=`dirname $(cd "$(dirname "$0")"; pwd)`
echo $HOME
indexHome="$HOME/../Aries/user_auth/templates/index/"
echo $indexHome
staticHome="$HOME/../Aries/static/aries/"
echo $staticHome
buildHome="$HOME/Aries/build/"
echo $buildHome
echo "rm -rf ${staticHome}/*"
echo ${buildHome}
echo "mv ${buildHome}/* ${staticHome}"
echo "mv ${HOME}/Aries/index.html ${indexHome}"
if [ -n "${staticHome}" ];then
  rm -rf ${staticHome}/*
fi
if [ -n "${buildHome}" ];then
  mv ${buildHome}/* ${staticHome}
fi
if [ -n "${HOME}" ];then
  mv ${HOME}/Aries/index.html ${indexHome}
fi
