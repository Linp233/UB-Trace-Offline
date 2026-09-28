# Changelog / 更新记录

## v0.1

Initial versioned release of the current Windows x64 portable application.

- Bundled Node.js 24 LTS runtime; no separate Node.js installation is needed.
- Local stack, heap and I/O editor with generic examples, local saving, JSON import/export and PNG export.
- The Windows launcher keeps the server running until its console closes; Ctrl+C and Stop-Tracing.cmd also stop it.
- English and Simplified Chinese instructions, project MIT license and third-party notices.
- The root VERSION file identifies the release in the portable ZIP, release manifest and health endpoint's appVersion field.

当前 Windows x64 便携版的首次编号发行。

- 内置 Node.js 24 LTS，无需另行安装 Node.js。
- 本地 Stack、Heap 和 I/O 编辑器，提供通用示例、本地保存、JSON 导入导出及 PNG 导出。
- 关闭启动命令行窗口会停止服务；也支持 Ctrl+C 和 Stop-Tracing.cmd。
- 提供中英文使用说明、项目 MIT 许可证及第三方许可说明。
- 根目录 VERSION 文件统一标识便携包、发行清单和健康检查接口 appVersion 字段的版本。
