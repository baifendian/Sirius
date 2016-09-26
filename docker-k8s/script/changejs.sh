FROM_FILE="/opt/Sirius/package/Aries/index.jsp"
TO_FILE="/opt/Sirius/Aries/user_auth/templates/index/index.html"
str1=`cat $FROM_FILE | grep "app.*.js"`
str2=${str1##*"app."}
str3=${str2%%".js"*}
app_name="app."$str3".js"
sed -i "s/app.*.js/$app_name/g" $TO_FILE

