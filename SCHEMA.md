# 可编写的 tracing 图表格式

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

从简化格式转换并保存：

```powershell
node tools/import.mjs examples/practice2.source.json
```

服务未启动时，只做转换：

```powershell
node tools/import.mjs examples/practice2.source.json --output data/generated.json
```

本地接口：

- `GET /api/draft`：读取当前自动保存的代码和图表。
- `GET /api/library`：列出已保存副本。
- `GET /api/library/<id>`：读取一个副本。
- `POST /api/library`：校验并创建副本，响应包含打开该图的 URL。
- `POST /api/draft`：写磁盘草稿；不会自动替换已打开浏览器的状态。要在浏览器显示新图，应创建副本并打开返回的 URL，或用导入按钮。

不要让助手通过执行 `window.__offlineTraceBridge` 修改页面。这个桥接对象由应用自身使用；助手通过文件、明确的本地接口和 UI 导入完成操作。
