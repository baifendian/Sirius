<# if (isProduction) { #>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<# } #>
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <title>PROJECT NAME</title>
</head>
<body>
  <# if (isProduction) { #>
  <script>
  // window.user = ${user}
  window.user = {
    name: 'demo'
  }
  </script>
  <# } #>
  <div id="app"></div>
  <script src="<#= publicPath #>app<#= isProduction ? '.' + hash : '' #>.js"></script>
</body>
</html>
