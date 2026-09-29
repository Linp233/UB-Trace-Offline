# Tracing Offline — Windows Portable

**English** | [简体中文](README.zh-CN.md)

**Version: v0.1.1** · [Release notes](CHANGELOG.md) · [Download Windows portable ZIP](https://github.com/Linp233/UB-Trace-Offline/releases/download/v0.1.1/Tracing-Offline-v0.1.1-windows-x64.zip)

A local editor for practicing stack, heap and I/O diagrams. This distribution retains the published UB Trace Tool frontend and adds local saving, JSON import/export and PNG export. It does not execute or grade source code.

**Project license:** [MIT](LICENSE) for the project's own contributions. Third-party material retains its original terms; see [license scope](LICENSE-STATUS.md).

## Why make this version?

This version grew out of a need to practice off campus during Fall 2026. The project author reports needing UB VPN to access [UB Trace](https://tracing.cse.buffalo.edu/) from off campus, adding a network requirement to everyday practice. The offline version keeps trace editing, saving, importing and exporting on the user's computer so practice can continue without a campus connection or VPN.

The distribution also includes a public [AI / Agent starting guide (AGENT-START.md)](AGENT-START.md). Give that guide, its linked tracing rules and JSON specification, and the complete Java source to a third-party AI tool such as ChatGPT or Claude to generate a trace JSON with stack frames, heap objects, value histories and I/O under explicit conventions. After starting the app, open the default address [http://127.0.0.1:4173/](http://127.0.0.1:4173/) and choose “Import JSON” or “Paste diagram” to view, edit and compare it with your own trace. If you changed the port, use the address opened by the launcher. AI answers still need review; the editor displays diagrams and does not grade program semantics.

## Quick start

1. Extract the complete Windows x64 ZIP into a folder you can write to. Do not run it from inside the ZIP.
2. Double-click **Start-Tracing.cmd**. Your default browser opens the local editor. Keep the launcher console window open while using the editor.
3. On first launch, choose **English** (the default) or **简体中文**, then select **Continue**. Use **Language** in the toolbar to change it later.
4. Close that console window or press **Ctrl+C** in it to stop the local service. **Stop-Tracing.cmd** can also stop it. Closing only the browser does not stop the service.

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

- **Save copy:** save a named snapshot to the local library.
- **Open:** open a saved local document.
- **Examples:** load a generic variable-update, aliasing or loop demonstration.
- **New:** create an empty diagram.
- **Import JSON / Paste diagram:** load editable diagram data.
- **Export JSON:** back up the complete editable document.
- **Export PNG:** export the currently visible diagram area.

**Interface language:** English is the default, including the offline toolbar, dialogs, help and status messages. The first visit opens a language chooser with English preselected. Choose English or Simplified Chinese; the **Language** button lets you change your choice without reloading or altering the current title, code, diagram, value histories or Java/Python setting. The original diagram editor retains its English labels. Existing exercise content, the Chinese practice collection and authoring guides are not translated by this setting.

Your choice is saved in this browser for the current local address. A different browser or port, cleared site storage, or an invalid preference opens the chooser again. If browser storage is unavailable, the choice lasts for the current page session; disk saving remains available. JSON data authoring is documented in [SCHEMA.md](SCHEMA.md).

For an agent authoring a Java trace, start with [AGENT-START.md (Chinese)](AGENT-START.md). It includes a ready-to-copy AI prompt and links to the [CSE116 trace authoring guide](CSE116-TRACE-GUIDE.md) and [JSON specification](SCHEMA.md). These public files do not depend on the local AGENTS.md. The detailed guide separates sourced course conventions from explicit tool defaults and documents complete native JSON, constructor links, recursion and verification. Its sources include Spring/Summer 2026 material; it is not a confirmed Fall exam rubric. Two original reference programs and importable JSON documents are in `examples/agent-*.trace.json`.

## Summer 2026 practice collection

The collection follows the 10 instructional units on [cse116.com Summer 2026](https://cse116.com/), with 5 original Java trace exercises per chapter: **50 exercises** in total. Midterm and final exam days are excluded. Topics cover Java basics, collections and files, classes, linked lists/stacks/queues, inheritance, polymorphism and comparators, testing, trees, graphs and runtime.

- [Collection index](practice/README.md): course mapping and usage instructions.
- [Separate question booklet](practice/QUESTIONS.md): complete Java source, fixed inputs and blank practice JSON for each exercise.
- [Separate answer booklet](practice/ANSWERS.md): frames, scopes, complete value histories, heap objects, I/O and importable answer JSON.
- [Verification record](practice/VERIFICATION.md): compilation and execution of all 50 programs, 701 runtime value observations and source checksums.

Import a question from `practice/blank/` and work through it first, then import its answer from `practice/answers/` to compare. The collection and answers are in Chinese. They are original supplementary practice, not an official question bank.

## Local data and limitations

On first use the app creates `data/`. The current draft is saved in `data/draft.json`, copies in `data/library/`, and images in `data/exports/`. The browser also stores the draft. These are plaintext local files, not encrypted storage; protect them as you would other coursework. The release ZIP contains no pre-existing draft or library.

Use one editing window at a time. There is no multi-user account isolation. Documents are manually authored; symbolic addresses and retained histories are teaching conventions. PNG export captures the visible area rather than all scrollable content. The included examples are generic demonstrations and contain no classroom photos, assignments or personal answers.

## Maintenance and packaging

The commands below are for the source checkout, with the bundled runtime available. Maintenance scripts and tests are not included in the smaller end-user ZIP.

The root `VERSION` file is the release version source. Packaging uses it for the archive name and release manifest; `/api/health` exposes it as `appVersion`. The separate health field `version: 1` identifies the API format. When preparing a new release, update `VERSION`, both README version lines and `CHANGELOG.md` together.

```powershell
.\runtime\node.exe scripts\examples.mjs
.\runtime\node.exe scripts\practice\build.mjs
.\runtime\node.exe --test tests\document.test.mjs tests\agent-examples.test.mjs tests\practice.test.mjs tests\privacy.test.mjs tests\i18n.test.mjs
.\runtime\node.exe --test tests\launcher.test.mjs
.\runtime\node.exe scripts\validate.mjs
.\runtime\node.exe scripts\audit.mjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\package.ps1
```

After editing the practice collection, also run `.\runtime\node.exe scripts\practice\verify.mjs` to compile and execute every Java program and compare its answer histories. This maintenance step requires JDK 11 or later with `javac` and `java` on PATH. Structural tests and ordinary editor use do not need a JDK.

The runtime executable is intentionally not committed to Git. To populate it from an official release, run `scripts/prepare-runtime.ps1`; it verifies the official ZIP checksum and records runtime provenance. Downloads are needed only for this preparation step, not for use of the completed ZIP.

The packaging script includes only reviewed runtime files, documentation, licenses, generic examples and original exercises. It never copies the working `data/` folder or local `AGENTS.md`. The public `AGENT-START.md`, detailed guide and `practice/` directory are on the package allowlist. Artifacts, per-file checksums and the ZIP checksum are written to `releases/`, which is ignored by Git. The static privacy audit checks forbidden file locations, personal paths and common credential patterns; it is not an exhaustive security audit.

## License and attribution

The project's own contributions are available under the [MIT License](LICENSE). Third-party code and assets are excluded from that grant and retain their original rights; details are in [LICENSE-STATUS.md](LICENSE-STATUS.md) and [THIRD-PARTY.md](THIRD-PARTY.md). The upstream frontend's redistribution permission remains unresolved.

Original frontend metadata credits Zaid Arshad and Robby Pruzan on behalf of the University at Buffalo. This is an unofficial local adaptation; it is not a university service and cannot submit coursework.
