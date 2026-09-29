# Agent 入口：从 Java 源码生成 trace JSON

这是随 Git 和便携包分发的公开入口，不依赖本地 `AGENTS.md`，也不需要以前的对话。

1. 完整阅读 [CSE116-TRACE-GUIDE.md](CSE116-TRACE-GUIDE.md)，确定课程表示法、工具默认值、输入和追踪终点。
2. 阅读 [SCHEMA.md](SCHEMA.md)，使用原生 `trace` JSON 编写完整对象题。普通数字/布尔值也写字符串；所有 ID 全局唯一。
3. 独立执行 Java 语义推导，再编码帧、作用域、堆、历史值、返回箭头和 I/O。不要仅从预期输出倒推一张末态图。
4. 对照 [对象参考](examples/agent-oop.trace.json) 与 [递归参考](examples/agent-recursion.trace.json)。父构造器共享同一个对象；不同调用有不同帧；普通递归返回到直接调用者。
5. 注意 v0.1 的显示/转换限制：简化 diagram 不保留构造器关联；Java 界面不显示 globalVariables；返回到 Heap 字段的跨列箭头可能被面板裁切。完整对象题使用原生格式，static 按共享类存储区显示；Heap 返回保留真实目标 ID 并在文字中注明。
6. 运行 `runtime/node.exe tools/import.mjs <答案.json> --output <输出.json>` 校验结构；再独立核对程序语义。导入成功不等于自动判分通过。
7. 交付可导入 JSON，说明追踪终点、采用的例外、已做的验证。只有真实缺失的源码、输入或题意才需要追问；其余采用详细指引中的确定默认值。

本项目附有 [Summer 2026 原创练习](practice/README.md)，题目与答案分开。练习答案是教学参考，不是官方试题或评分标准。

## 可直接发给 ChatGPT、Claude 或其他 agent 的提示词

> 请先完整阅读 AGENT-START.md、CSE116-TRACE-GUIDE.md 和 SCHEMA.md，再为我提供的完整 Java 源码生成 ub-trace-offline/v1 的原生 trace JSON。按指南保留调用帧、作用域、赋值历史、堆对象、构造器关联、返回箭头和 I/O，除非题目另有规定，否则追踪到程序正常结束。独立核对 Java 执行结果，不把 JSON 结构校验当作正确性证明。提供可直接保存和导入的 JSON，并说明验证范围。

使用没有本地文件访问能力的聊天工具时，把上述三份文档与源码一起上传；仅提文件名或电脑路径不能让该工具读到内容。启动本地应用后，在默认地址 [http://127.0.0.1:4173](http://127.0.0.1:4173/) 点击“导入 JSON”或“粘贴图表”；修改过端口时使用启动器显示的地址。
