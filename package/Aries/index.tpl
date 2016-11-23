<!DOCTYPE html>
<# if (isProduction) { #>
  {% load staticfiles %}
<# } #>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <# if (isProduction) { #>
    <link rel="icon" href="{% static 'images/bitbug_favicon_whit.ico' %}" type="image/x-icon">
  <# } #>
  <# if (isProduction) { #>
    <link rel="shortcut icon" href="{% static 'images/bitbug_favicon_whit.ico' %}" type="image/x-icon">
  <# } #>
  <title>百分点云中心</title>
</head>
<body>
  <# if (isProduction) { #>
  <script>
    {% autoescape off %}
      window.user = {{user}};
    {% endautoescape %}
  </script>
  <# }#>
  <div id="app"></div>
  <# if (isProduction) { #>
    <script src="{% static 'aries/app<#= isProduction ? '.' + hash : '' #>.js' %}"></script>
  <# } else{ #>
    <script src="<#= publicPath #>app<#= isProduction ? '.' + hash : '' #>.js"></script>
  <# } #>
</body>
</html>
