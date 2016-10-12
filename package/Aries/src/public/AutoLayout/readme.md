
# AutoLayout 组件的使用方式
## 导入

```
import { AutoLayoutDiv , layoutInfoGenerator } from 'public/AutoLayout'
// AutoLayoutDiv 为需要在页面 render 函数内添加的一个组件
// layoutInfoGenerator 是为了生成 AutoLayoutDiv 组件需要的数据结构的一个工具函数
```

## 使用流程
    * 找到页面（render函数中）的根节点以及根节点的所有直接子节点
    * 为根节点以及每个直接子节点添加一个 id
    * 生成 id 与高度策略的对应关系 ： layoutInfoArr
    * 在最后一个直接子节点后面，添加 <AutoLayoutDiv layoutInfos={ layoutInfoArr } />

## 样例
```
componentWillMount(){
    this.userData = {}

    # 生成ID列表
    this.userData['idList'] = {}
    this.userData['idList']['idRoot'] = Toolkit.generateGUID()
    this.userData['idList']['id1'] = Toolkit.generateGUID()
    this.userData['idList']['id2'] = Toolkit.generateGUID()
    this.userData['idList']['id3'] = Toolkit.generateGUID()

    # 生成 ID 与高度策略对应关系：
    this.userData['layoutInfoArr'] = [
        layoutInfoGenerator( 
            id:this.userData['idList']['idRoot'],
            isRoot:true
        ),
        layoutInfoGenerator( 
            id:this.userData['idList']['id1'],
            isRoot:false,
            heightProp:'Const_0' 
        ),
        layoutInfoGenerator( 
            id:this.userData['idList']['id2'],
            isRoot:false,
            heightProp:'Const'
        ),
        layoutInfoGenerator( 
            id:this.userData['idList']['id3'],
            isRoot:false,
            heightProp:'Var',
            heightChangedCallback:( newHeight )=>{
                this.onHeightChanged( newHeight )
            }
        )
    ]
}

render(){
    return (
        <div id={this.userData['idList']['idRoot']}>
            <div id={this.userData['idList']['id1']}>
                {/* 其它节点 */}
            </div>
            <div id={this.userData['idList']['id2']}>
                {/* 其它节点 */}
            </div>
            <div id={this.userData['idList']['id3']}>
                {/* 其它节点 */}
            </div>
            <AutoLayoutDiv layoutInfos={this.userData['layoutInfoArr']} />
        </div>
    )
}
```

## 数据结构
```
AutoLayoutDiv 节点配置的数据结构为：
[{
    id                          html节点的id，将该html节点与该份配置关联起来
    isRoot                      该html节点是否为root节点；如果是root节点，则将会忽视 heightProp 、 heightChangedCallback
    heightProp                  该html节点的高度策略，详解如下
    heightChangedCallback       该html节点的高度发生变化时的毁掉函数
},{
    ...
}]

其中heightProp不同值代表的不同含义
    'Const'          该节点的高度固定，为 document.getElementByID(id).clientHeight
    'Const_xxx'      该节点的高度固定为 xxx 个像素，专为某种节点定义：该节点有高度，但是它被float了，不参与到高度布局中
    'Var'            该节点的高度需要动态赋值（剩余高度：总高度 - 所有Const的高度）
                        注意 Var 与 Var_1 等价
    'Var_xxx'        该节点的高度需要动态赋值（剩余高度：总高度 - 所有Const的高度）
                        它们将会根据 xxx 所代表的比例，来分割剩余的高度
                        如传入的配置项，存在三个Var的配置，分别为 Var Var_2 Var_5
                        则它们对应的节点的高度分别为： 剩余高度*1/(1+2+5)  剩余高度*2/(1+2+5) 剩余高度*5/(1+2+5)
```

## 原理
    * 当浏览器大小发生改变时、或者组件setState导致重新render时，
        都会触发 AutoLayoutDiv 的 calcDesiredSize 函数
    * 该函数会首先通过 calcRootDivSize 计算页面应有的宽度和高度（去掉左侧导航栏、上面页头高度、下面的页尾高度），
        通过行间样式的方式将其设置到 isRoot 为 true 的html节点上
    * 取出上面计算出来的高度，减掉 heightProp 配置为 Const 或者 Const_xxx 的节点的高度，作为剩余高度
    * 再取出 heightProp 为 Var 或者 Var_xxx 的配置，按照比例分割剩余高度，作为 节点新的高度
    * 如果节点新的高度与旧有高度一致，则不作处理。否则，将 新的高度 以行间样式的方式设置到节点上，并回调 heightChangedCallback

## 注意
    * 对于直接子节点来说，如果该节点为一个bfd-ui的组件（或者是其它组件），建议用 div 标签将它包裹一层，为它降级。
        因为部分组件也会修改 style.height 这个行间样式，这样会造成冲突

