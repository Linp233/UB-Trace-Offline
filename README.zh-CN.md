# Tracing Offline — Windows 便携版

[English](README.md) | **简体中文**

**版本：v0.1** · [更新记录](CHANGELOG.md) · [下载 Windows 便携 ZIP](https://github.com/Linp233/UB-Trace-Offline/releases/download/v0.1/Tracing-Offline-v0.1-windows-x64.zip)

用于练习 Stack、Heap 和 I/O 图的本地编辑器。保留 UB Trace Tool 已发布的前端，增加本地保存、JSON 导入导出和 PNG 导出。工具不会执行源码或自动判分。

**项目许可：** 本项目自行贡献的部分采用 [MIT 许可证](LICENSE)。第三方内容保留原有许可条件，详见[许可范围](LICENSE-STATUS.md)。

## 为什么要做这个版本？

这个版本源于 Fall 2026 学期的校外练习需求。根据项目作者的使用反馈，校外访问 [UB Trace](https://tracing.cse.buffalo.edu/) 时需要先连接 UB VPN，这让日常练习多了一道网络门槛。离线版将 trace 编辑、保存和导入导出放到本机，让学生在没有校园网络或 VPN 的情况下也能继续练习。

此外，离线版提供了一份可随仓库和便携包分发的 [AI / Agent 使用指引（AGENT-START.md）](AGENT-START.md)。将这份入口指引、它链接的详细规则与 JSON 格式说明，以及完整 Java 源码交给 ChatGPT、Claude 等第三方 AI 工具，即可按统一约定生成包含 Stack、Heap、变量历史和 I/O 的 trace JSON。启动离线版后，在默认地址 [http://127.0.0.1:4173/](http://127.0.0.1:4173/) 点击“导入 JSON”或“粘贴图表”，便可查看、编辑并对照自己的推导，辅助学习和核对 trace 结果。修改过端口时，以启动器打开的地址为准。AI 生成的答案仍需核对；本工具负责显示图表，不会自动判定程序语义是否正确。

## 快速开始

1. 将 Windows x64 ZIP 完整解压到有写入权限的文件夹，不要直接从压缩包内启动。
2. 双击 **Start-Tracing.cmd**，默认浏览器会打开本地编辑器。使用期间请保持启动命令行窗口打开。
3. 使用结束后关闭该命令行窗口，或在窗口中按 **Ctrl+C**，本地服务会自动停止。也可以双击 **Stop-Tracing.cmd** 停止服务。仅关闭网页不会停止服务。

重复双击启动器只会打开已有服务的页面；服务仍由最初的启动窗口控制。运行信息与错误直接显示在启动窗口中。

便携 ZIP 已包含 Node.js 24 LTS。日常使用不需要安装 Node.js、运行 npm install、安装 Java、Python 或 Git，也不需要账户或联网。需要现代浏览器和 Windows PowerShell。启动器优先使用随包运行时；从源码目录运行且未带运行时时，才查找系统已安装的 Node.js。

本包针对 Windows x64。其他架构和全新电脑上的兼容性尚未认证。请保留 node.exe 随附的许可证和来源记录。

## 修改端口

根目录的 `config.json` 是唯一端口设置，默认 `4173`。先停止服务，再修改并重新启动：

```json
{
  "port": 4173
}
```

端口应为未被占用的 1–65535 整数。服务只监听 `127.0.0.1`。改端口会改变浏览器缓存所属的地址，但磁盘练习仍保存在原 data 目录。不需要配置防火墙规则或连接学校系统。

## 使用方法

- **保存副本：** 将命名快照存入本地练习库。
- **打开：** 打开已保存的本地文档。
- **示例 / Examples：** 加载变量更新、共享引用或循环作用域的通用演示。
- **新练习：** 创建空白图。
- **导入 JSON / 粘贴图表：** 加载可编辑图表数据。
- **导出 JSON：** 备份完整的可编辑文档。
- **导出 PNG：** 导出当前可见的图表区域。

离线工具栏目前主要为中文，原画图编辑器保留现有标签。启动说明提供中英文两份。手动编写图表数据的格式见 [SCHEMA.md](SCHEMA.md)。

让 agent 编写 Java trace 时，从 [AGENT-START.md](AGENT-START.md) 开始；其中有可直接复制给 AI 的提示词，再链接到 [CSE116 trace 编写指引](CSE116-TRACE-GUIDE.md) 和 [JSON 字段说明](SCHEMA.md)。这些公开文件不依赖本地 AGENTS.md。详细指引区分有来源的课程约定与本工具的明确默认值，说明完整原生 JSON、构造器关联、递归和验证方法。来源包括 Spring/Summer 2026 资料，不代表已确认的 Fall 考试评分细则。`examples/agent-*.trace.json` 提供两份原创参考程序对应的可导入 JSON。

## Summer 2026 练习题库

按照 [cse116.com Summer 2026](https://cse116.com/) 的 10 个授课单元，每章编写 5 道原创 Java trace 题，共 **50 题**；期中、期末考试日不计为章节。内容覆盖 Java 基础、集合与文件、类与对象、链表/栈/队列、继承、多态与比较器、测试、树、图和运行时间。

- [题库目录](practice/README.md)：课程单元对应关系和使用方法。
- [独立题目册](practice/QUESTIONS.md)：完整 Java 源码、确定输入及每题的空白练习 JSON。
- [独立答案册](practice/ANSWERS.md)：调用帧、作用域、完整值历史、堆对象、I/O 和每题可导入的答案 JSON。
- [验证记录](practice/VERIFICATION.md)：50 个原程序的编译与执行、701 次运行时值观测，以及源码校验值。

建议先导入 `practice/blank/` 中的题目独立作答，再导入 `practice/answers/` 中对应的答案对照。这些练习是本项目原创的补充材料，不是官方题库。

## 本地数据与限制

第一次使用会创建 `data/`。当前草稿位于 `data/draft.json`，副本位于 `data/library/`，图片位于 `data/exports/`；浏览器也保存草稿。这些是明文本地文件，并未加密，请像保护其他学习资料一样保护它们。发行 ZIP 不包含任何已有草稿或练习库。

同一时间建议只用一个编辑窗口。工具没有多用户账户隔离。图表由使用者手动推导；符号地址和历史值用于教学表示。PNG 只捕获可见区域，不包括全部滚动内容。内置示例为通用演示，不包含课堂照片、作业或个人答案。

## 维护与打包

以下命令用于运行时已就绪的源码工作目录。面向使用者的精简 ZIP 不包含维护脚本和测试。

根目录的 `VERSION` 是发行版本来源，打包时用于 ZIP 名称和发行清单；`/api/health` 的 `appVersion` 字段也读取该文件。健康检查中独立的 `version: 1` 表示接口格式。准备新版本时，请同步更新 `VERSION`、两份 README 的版本说明及 `CHANGELOG.md`。

```powershell
.\runtime\node.exe scripts\examples.mjs
.\runtime\node.exe scripts\practice\build.mjs
.\runtime\node.exe --test tests\document.test.mjs tests\agent-examples.test.mjs tests\practice.test.mjs tests\privacy.test.mjs
.\runtime\node.exe --test tests\launcher.test.mjs
.\runtime\node.exe scripts\validate.mjs
.\runtime\node.exe scripts\audit.mjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\package.ps1
```

修改题库后，另运行 `.\runtime\node.exe scripts\practice\verify.mjs`，实际编译执行全部 Java 程序并比对答案历史；此维护步骤需要 PATH 中有 JDK 11 或以上版本的 `javac` 和 `java`。结构测试和日常练习不需要 JDK。

Git 不跟踪运行时可执行文件。需要准备运行时时执行 `scripts/prepare-runtime.ps1`；脚本从官方地址下载、校验 ZIP 的 SHA-256 并记录来源。只有准备运行时的步骤需要下载，完成后的便携包日常使用不需要联网。

打包脚本仅复制经过审查的运行文件、文档、许可、通用示例及原创练习题库，绝不复制工作目录的 `data/` 或本地 `AGENTS.md`。公开入口 `AGENT-START.md`、详细指引及 `practice/` 已纳入打包清单。ZIP、逐文件清单和 ZIP 校验值写入 Git 忽略的 `releases/`。静态隐私检查涵盖禁止的文件位置、个人路径和常见凭据模式，不等于完整安全审计。

## 许可与来源

本项目自行贡献的部分采用 [MIT 许可证](LICENSE)。第三方代码和资源不纳入这项授权，保留原有权利；详见 [LICENSE-STATUS.md](LICENSE-STATUS.md) 和 [THIRD-PARTY.md](THIRD-PARTY.md)。原站前端的再分发许可仍未确认。

原站元数据署名为 Zaid Arshad 和 Robby Pruzan，代表 University at Buffalo。本项目是非官方本地适配，不是学校服务，不能提交课程作业。
