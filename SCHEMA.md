# 可编写的 tracing 图表格式

首次使用请从公开入口 [AGENT-START.md](AGENT-START.md) 开始，编写 CSE116 Java 答案前完整阅读 [agent 指引](CSE116-TRACE-GUIDE.md)。本文件定义数据结构；课程画法、默认追踪时点及返回箭头决策在指引中。校验成功不代表程序语义正确。

## 选择格式

- **简化 `diagram`：** 适合已有三个基础示例；转换器生成原生 ID。能表示值历史、作用域、普通返回目标和堆对象。
- **原生 `trace`：** 完整 Java 对象题的推荐交付格式。支持构造器关联、未赋值变量和导出状态的无损往返。
- 两种格式择一，不同时填写。若同时存在原生 `trace` 和 `diagram`，实现会优先使用原生 `trace`，不会合并。
- v0.1 简化转换器把每个堆对象的 `constructorStackFrameId` 固定为 `null`；不要向 `diagram.heap` 随意加这个字段，以为它会生效。构造器关联必须写在原生 `trace.heapObjects` 中。
- `returnsToVariableId` 可以指向堆字段/元素 ID，但 v0.1 跨 Stack / Heap 的连线可能被面板裁切；保留正确 ID，并用 notes/答案文字补充目标映射。视觉上没有完整连线不等于 JSON 中没有关联。

## 简化 diagram

提供源码、标题、语言、图表即可。值一律写为字符串；Java 字符串字面量保留双引号，例如 `"\"hello\""`。顶层格式名为 `ub-trace-offline/v1`。

```json
{
  "format": "ub-trace-offline/v1",
  "title": "示例：返回引用",
  "language": "java",
  "code": "// 在这里放完整源码\n",
  "notes": "程序结束时；保留历史值与已结束作用域",
  "diagram": {
    "stack": [
      {
        "id": "main",
        "name": "main",
        "released": true,
        "items": [
          {"name": "answer", "values": ["0x100"]},
          {"name": "sum", "values": ["0", "3", "8"]},
          {"released": true, "scope": [
            {"name": "i", "values": ["0", "1", "2"]}
          ]}
        ]
      },
      {
        "id": "make",
        "name": "makeList",
        "released": true,
        "returnsTo": "main.answer",
        "items": [{"name": "result", "values": ["0x100"]}]
      }
    ],
    "heap": [
      {
        "address": "0x100",
        "type": "ArrayList<Integer>",
        "items": [
          {"name": "0", "values": ["3"]},
          {"name": "1", "values": ["5"]}
        ]
      }
    ],
    "io": ["8"]
  }
}
```

这是格式演示，不对应一段经过执行验证的程序。

`values` 依时间顺序记录赋值；原界面会划掉最后一项以前的值。`released: true` 将整个方法/作用域画红叉。嵌套 `scope` 形成代码块。

返回目标默认使用 `<frame.id>.<变量名>`，如 `main.answer`。位于嵌套作用域的变量建议显式设置全局唯一的 `id`，再在 `returnsTo` 中引用该 ID。

地址完全相同即表示同一个对象；必须确保所有 `heap.address` 唯一。原界面会为匹配堆对象地址的值绘制引用边框。`returnsTo` 是函数返回值的箭头，不是普通对象引用箭头。

也接受 `trace` 字段下的原生格式（`kind: "trace"`, `version: "1_0_0"`），适合保留从页面导出的完整状态。导出的 JSON 默认使用原生格式。

补充字段和约束：

- `diagram.globals` 是全局变量/作用域的 items 数组，默认 `[]`。v0.1 前端只在 Python 模式显示此区；Java static 字段应按 agent 指引映射到有明确标签的共享类存储区。
- 每个 frame 推荐显式、唯一的 `id`；它是简化格式的引用前缀，不会原样成为原生 `stackFrameId`。重复调用要使用不同 frame.id。
- 变量可以有全局唯一的 `id`。例如 `{"id":"loop-result","name":"result","values":["5","11"]}`，返回目标写 `"returnsTo":"loop-result"`。若显式写了变量 id，引用就用此 id，不再使用默认 `frame.id.name`。
- 嵌套 scope 的隐式路径受 items 索引影响。所有需要从返回箭头引用的块变量和堆字段都应显式赋 id，不猜路径。
- `released` 默认 false；作用域 items 数组可为空。简化变量 values 必须至少一个字符串；原生变量的 valueUpdates 可为空。
- 不支持自行添加 `type` 到变量来标识声明类型，也不支持自造 `returnValue`/`steps`/`deleted` 字段。额外字段可能被丢弃，不能依赖它们承载必须保留的信息。

## 原生 trace 完整字段契约

顶层固定写 `format`、`title`、`language`、`code`、`notes`、`trace`。前五个值都是字符串，`language` 为 `java` 或 `python`；本指引使用 `java`。这里的顶层格式版本与内部 trace 版本是两个不同的标识。

| 对象 | 必须填写的字段与类型 |
|---|---|
| trace | `kind: "trace"`，`version: "1_0_0"`，`globalVariables: Scope`，`stackFrames: Frame[]`，`heapObjects: HeapObject[]`，`ioLines: IOLine[]` |
| Scope | `kind: "scope"`，`scopeId: string`，`scopeState: "active" 或 "released"`，`items: (Variable 或 Scope)[]` |
| Variable | `kind: "variable"`，`variableId: string`，`name: string`，`valueUpdates: ValueUpdate[]` |
| ValueUpdate | `kind: "value-update"`，`valueUpdateId: string`，`value: string` |
| Frame | `kind: "stack-frame"`，`stackFrameId: string`，`name: string`，`totalStackFramesAtInsert: 非负整数`，`returnsToVariableId: string 或 null`，`scope: Scope` |
| HeapObject | `kind: "heap-object"`，`heapObjectId: string`，`memoryAddress: string`，`objectType: string`，`constructorStackFrameId: string 或 null`，`variables: Variable[]` |
| IOLine | `kind: "io-line"`，`ioLineId: string`，`value: string` |

这里规定作者总是填全字段，不依赖校验器对某些缺省项的容忍。限制与关联规则：

1. 所有 ID 都是非空字符串，跨 scope/frame/heap/variable/value-update/io **全局唯一**。每次重复赋值也必须有新的 valueUpdateId。
2. returnsToVariableId 非 null 时必须是文档中某个 Variable 的 variableId；它不能是 frame ID、地址或 valueUpdateId。
3. constructorStackFrameId 非 null 时必须是已有 Frame 的 stackFrameId；堆对象及指向它的引用框会使用该帧的颜色。库容器不展开构造帧时用 null。
4. memoryAddress 不重复；引用值与它**逐字匹配**才会显示引用框。用 `0x100` 时，不要在另一处写 `0X100`、添加空格或另一个大小写形式。
5. stackFrames 按进入顺序存放。totalStackFramesAtInsert 写 0、1、2……，这是显示颜色序号，不是当前栈深度；方法返回后也不复用序号。
6. 空全局区仍要提供一个 active Scope；无堆或 I/O 时用空数组。heap.variables 只能放 Variable，不能嵌套 Scope。
7. 每个被校验数组最多 10000 项，字符串最多 300000 个字符；从 scope 深度 0 开始，嵌套深度不得超过 30。不要依赖此模型存储无限轨迹。
8. 空 valueUpdates 表示尚无赋值；`value: "null"` 表示已经赋 Java null；链接字段的 JSON null 表示无链接。三者不能混用。

以下是完整、可导入、对应实际源码的最小原生文档：

```json
{
  "format": "ub-trace-offline/v1",
  "title": "Native minimum",
  "language": "java",
  "code": "class Main { public static void main(String[] args) { int x = 2; System.out.println(x); } }\n",
  "notes": "Normal program exit; unused args omitted; x = 2; output is one line: 2.",
  "trace": {
    "kind": "trace",
    "version": "1_0_0",
    "globalVariables": {"kind":"scope","scopeId":"s-global","scopeState":"active","items":[]},
    "stackFrames": [{
      "kind": "stack-frame",
      "stackFrameId": "f-main-1",
      "name": "main",
      "totalStackFramesAtInsert": 0,
      "returnsToVariableId": null,
      "scope": {
        "kind": "scope",
        "scopeId": "s-main",
        "scopeState": "released",
        "items": [{
          "kind": "variable",
          "variableId": "v-main-x",
          "name": "x",
          "valueUpdates": [{"kind":"value-update","valueUpdateId":"u-main-x-1","value":"2"}]
        }]
      }
    }],
    "heapObjects": [],
    "ioLines": [{"kind":"io-line","ioLineId":"io-1","value":"2"}]
  }
}
```

完整构造器和递归例子见 [agent-oop.trace.json](examples/agent-oop.trace.json) 与 [agent-recursion.trace.json](examples/agent-recursion.trace.json)。可以直接使用可读原生 ID，不需要生成 UUID。若从简化格式开始，先 normalize，再使用**生成后的**真实 ID 设置关联，最后再次 normalize/validate；不要把简化 id 直接塞进原生关联。

## 转换、保存和查看

从简化格式转换并保存：

```powershell
.\runtime\node.exe tools\import.mjs examples\practice2.source.json
```

服务未启动时，只做转换：

```powershell
.\runtime\node.exe tools\import.mjs examples\practice2.source.json --output "$env:TEMP\generated-trace.json"
```

本地接口：

- `GET /api/draft`：读取当前自动保存的代码和图表。
- `GET /api/library`：列出已保存副本。
- `GET /api/library/<id>`：读取一个副本。
- `POST /api/library`：校验并创建副本，响应包含打开该图的 URL。
- `POST /api/draft`：写磁盘草稿；不会自动替换已打开浏览器的状态。要在浏览器显示新图，应创建副本并打开返回的 URL，或用导入按钮。

不要让助手通过执行 `window.__offlineTraceBridge` 修改页面。这个桥接对象由应用自身使用；助手通过文件、明确的本地接口和 UI 导入完成操作。
