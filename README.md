# Tracing Offline — Windows Portable

**English** | [简体中文](README.zh-CN.md)

**Version: v0.1** · [Release notes](CHANGELOG.md) · Windows package: `Tracing-Offline-v0.1-windows-x64.zip`

A local editor for practicing stack, heap and I/O diagrams. This distribution retains the published UB Trace Tool frontend and adds local saving, JSON import/export and PNG export. It does not execute or grade source code.

**Project license:** [MIT](LICENSE) for the project's own contributions. Third-party material retains its original terms; see [license scope](LICENSE-STATUS.md).

## Quick start

1. Extract the complete Windows x64 ZIP into a folder you can write to. Do not run it from inside the ZIP.
2. Double-click **Start-Tracing.cmd**. Your default browser opens the local editor. Keep the launcher console window open while using the editor.
3. Close that console window or press **Ctrl+C** in it to stop the local service. **Stop-Tracing.cmd** can also stop it. Closing only the browser does not stop the service.

Starting again opens the existing service in your browser; the original launcher window still controls its lifetime. Runtime messages and errors appear directly in the launcher window.

The portable ZIP includes Node.js 24 LTS. No Node.js installation, npm install, Java, Python, Git, account or internet connection is needed for normal use. A modern browser and Windows PowerShell are required. The launcher uses the bundled runtime first, with an installed Node.js as fallback when working from a source checkout.

The release is built for Windows x64. Other architectures and clean-machine compatibility have not been certified. Keep the runtime license and provenance files with node.exe.

## Port configuration

The root `config.json` controls the local port (default `4173`). Stop the service, edit this file, and restart:

```json
{
  "port": 4173
}
```

Choose an unused integer port from 1 to 65535. The service only listens on `127.0.0.1`. Changing the port changes the browser's storage origin; disk documents remain in the same data directory. No firewall rule or university connection is required.

## Using the editor

- **保存副本 (Save copy):** save a named snapshot to the local library.
- **打开 (Open):** open a saved local document.
- **示例 / Examples:** load a generic variable-update, aliasing or loop demonstration.
- **新练习 (New):** create an empty diagram.
- **导入 JSON / 粘贴图表 (Import / Paste):** load editable diagram data.
- **导出 JSON (Export JSON):** back up the complete editable document.
- **导出 PNG (Export PNG):** export the currently visible diagram area.

The adapter toolbar is primarily Chinese; the original diagram editor uses its existing labels. Both English and Chinese startup instructions are provided. JSON data authoring is documented in [SCHEMA.md](SCHEMA.md).

## Local data and limitations

On first use the app creates `data/`. The current draft is saved in `data/draft.json`, copies in `data/library/`, and images in `data/exports/`. The browser also stores the draft. These are plaintext local files, not encrypted storage; protect them as you would other coursework. The release ZIP contains no pre-existing draft or library.

Use one editing window at a time. There is no multi-user account isolation. Documents are manually authored; symbolic addresses and retained histories are teaching conventions. PNG export captures the visible area rather than all scrollable content. The included examples are generic demonstrations and contain no classroom photos, assignments or personal answers.

## Maintenance and packaging

The commands below are for the source checkout, with the bundled runtime available. Maintenance scripts and tests are not included in the smaller end-user ZIP.

The root `VERSION` file is the release version source. Packaging uses it for the archive name and release manifest; `/api/health` exposes it as `appVersion`. The separate health field `version: 1` identifies the API format. When preparing a new release, update `VERSION`, both README version lines and `CHANGELOG.md` together.

```powershell
.\runtime\node.exe scripts\examples.mjs
.\runtime\node.exe --test tests\document.test.mjs tests\privacy.test.mjs
.\runtime\node.exe --test tests\launcher.test.mjs
.\runtime\node.exe scripts\validate.mjs
.\runtime\node.exe scripts\audit.mjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\package.ps1
```

The runtime executable is intentionally not committed to Git. To populate it from an official release, run `scripts/prepare-runtime.ps1`; it verifies the official ZIP checksum and records runtime provenance. Downloads are needed only for this preparation step, not for use of the completed ZIP.

The packaging script includes only reviewed runtime files, documentation, licenses and generic examples. It never copies the working `data/` folder. Artifacts, per-file checksums and the ZIP checksum are written to `releases/`, which is ignored by Git. The static privacy audit checks forbidden file locations, personal paths and common credential patterns; it is not an exhaustive security audit.

## License and attribution

The project's own contributions are available under the [MIT License](LICENSE). Third-party code and assets are excluded from that grant and retain their original rights; details are in [LICENSE-STATUS.md](LICENSE-STATUS.md) and [THIRD-PARTY.md](THIRD-PARTY.md). The upstream frontend's redistribution permission remains unresolved.

Original frontend metadata credits Zaid Arshad and Robby Pruzan on behalf of the University at Buffalo. This is an unofficial local adaptation; it is not a university service and cannot submit coursework.
