# Changelog / 更新记录

## v0.1.1 — 2026-09-28

- English is now the default interface. Added a first-run language chooser and a persistent Language setting for English / Simplified Chinese.
- Localized the offline toolbar, dialogs, help, status messages, accessibility labels and built-in example menu. Switching languages preserves the current document and Java/Python setting. Original diagram-editor labels remain English; authored exercise content is unchanged.
- The toolbar wraps to keep actions reachable at smaller widths, and the browser tab title is English. Disk autosave continues if browser storage is unavailable.
- Added preference, catalog and early-boot tests; updated both usage guides.

- 默认使用英文界面；新增首次启动语言选择，以及可记住 English / 简体中文偏好的 Language / 语言入口。
- 离线工具栏、弹窗、帮助、提示、无障碍标签与内置示例菜单支持双语。切换语言保留当前文档与 Java/Python 设置；原画图编辑器标签仍为英文，练习内容保持原样。
- 工具栏在较窄窗口自动换行，页签标题改为英文；浏览器存储不可用时仍可自动保存到磁盘。
- 增加语言偏好、文案完整性与启动恢复测试，同步更新中英文使用说明。

## v0.1 — 2026-09-28

- Added the public AGENT-START.md entry, independent of local AGENTS.md, and documented the AI-to-local-import workflow in both READMEs.
- Added 50 original Summer 2026 exercises across 10 instructional units, separate question/answer booklets, blank and solved JSON, and Java source. Verified original output and every authored value history with 701 runtime observations; documented manual review of drawing conventions.
- Included the public entry and practice collection in the portable package allowlist.
- Added a source-linked CSE116 Java authoring guide, complete native JSON field documentation, and original inheritance/recursion reference documents. Course conventions and tool defaults are distinguished explicitly.
- Added reference-document validation and included the guide in the portable package. The application runtime and release version are v0.1.

- 新增有来源的 CSE116 Java 编写指引、完整原生 JSON 字段说明及原创继承/递归参考文档，明确区分课程约定和工具默认值。
- 新增独立于本地 AGENTS.md 的公开入口 AGENT-START.md，并在中英文 README 说明 AI 生成与本地导入流程。
- 新增按 Summer 2026 的 10 个授课单元组织的 50 道原创题，题目与答案分册，附空白/答案 JSON 和 Java 源码；实际核对输出及全部历史值，共 701 次运行时观测，并记录绘图约定的人工复核范围。
- 将公开入口与题库加入便携包文件清单。
- 增加参考文档校验，并将指引纳入便携包文件清单。应用运行逻辑及发行版本为 v0.1。

First GitHub release of the Windows x64 portable application, including the complete authoring guide and original practice collection.

- Bundled Node.js 24 LTS runtime; no separate Node.js installation is needed.
- Local stack, heap and I/O editor with generic examples, local saving, JSON import/export and PNG export.
- The Windows launcher keeps the server running until its console closes; Ctrl+C and Stop-Tracing.cmd also stop it.
- English and Simplified Chinese instructions, project MIT license and third-party notices.
- The root VERSION file identifies the release in the portable ZIP, release manifest and health endpoint's appVersion field.

Windows x64 便携版首次发布到 GitHub，包含完整编写指引和原创练习题库。

- 内置 Node.js 24 LTS，无需另行安装 Node.js。
- 本地 Stack、Heap 和 I/O 编辑器，提供通用示例、本地保存、JSON 导入导出及 PNG 导出。
- 关闭启动命令行窗口会停止服务；也支持 Ctrl+C 和 Stop-Tracing.cmd。
- 提供中英文使用说明、项目 MIT 许可证及第三方许可说明。
- 根目录 VERSION 文件统一标识便携包、发行清单和健康检查接口 appVersion 字段的版本。
