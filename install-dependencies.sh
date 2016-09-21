cd $PWD/package/Aries
npm install
#解决bfd-ui0.7.7 confirm的bug
mv $PWD/node_modules/bfd-ui/lib/Confirm $PWD/node_modules/bfd-ui/lib/confirm 
#仅测试编译是否成功，不需要修改webpack.config.js文件
npm run build