/**
 * 自动换肤，改变 bfd-bootstrap、bfd-ui、App.less 的色值
 * node bin/theme.js -#42a5f5:#ff7043 -#2196f3:#ff5722 -#1e88e5:#f4511e
 * 自定义颜色替换规则，语法：-原颜色:目标颜色，支持多个，空格隔开
 * 
 * package.json 已定义快捷方式, npm run theme 执行任务
 */

'use strict'

var fs = require('fs')
var path = require('path')

var option = process.argv.slice(2)
var colorRule = {}
var sourceColors = []
option.forEach(function(item) {
  item = item.slice(1).split(':')
  colorRule[item[0]] = item[1]
  sourceColors.push(item[0])
})

var sheets = []
sheets.push(path.join(__dirname, '../node_modules/bfd-bootstrap/lib/dist/bfd-bootstrap.min.css'))
sheets.push(path.join(__dirname, '../src/App.less'))
sheets.push(path.join(__dirname, '../src/functions/Login/index.less'))

function pushSheet(dir) {
  fs.readdirSync(dir).forEach(function(item) {
    var _dir = path.join(dir, item)
    if (fs.statSync(_dir).isDirectory()) {
      pushSheet(_dir)
    } else {
      if (path.extname(item) === '.less') {
        sheets.push(_dir)
      }
    }
  })
}
pushSheet(path.join(__dirname, '../node_modules/bfd-ui/lib'))

var reg = new RegExp(sourceColors.join('|'), 'gi')
sheets.forEach(function(sheet) {
  var content = fs.readFileSync(sheet, 'utf-8')
  content = content.replace(reg, function(match) {
    return colorRule[match]
  })
  fs.writeFileSync(sheet, content)
})