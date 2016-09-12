cd $PWD/package/Aries
npm install
mv $PWD/node_modules/bfd-ui/lib/Confirm $PWD/node_modules/bfd-ui/lib/confirm #解决bfd-ui0.7.7 confirm的bug
npm run build