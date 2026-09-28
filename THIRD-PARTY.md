# Third-party components

| Component | Source / version | License status |
| --- | --- | --- |
| UB Trace Tool published practice frontend | https://tracing.cse.buffalo.edu/student/tracing/practice ; snapshot retrieved 2026-09-22 | Upstream redistribution permission unresolved; see LICENSE-STATUS.md. Published minified assets are retained in dist/_next, with a modified HTML entrypoint. |
| Monaco Editor | Microsoft; 0.43.0; npm distribution | MIT; full text in licenses/monaco-MIT.txt. Runtime assets in dist/vendor/monaco. |
| html-to-image | 1.11.13; npm distribution | MIT; full text in licenses/html-to-image-MIT.txt. Runtime asset in dist/vendor/html-to-image.js. |
| Node.js (portable ZIP only) | Official Windows x64 Node.js 24 LTS distribution; exact version and SHA-256 in runtime/PROVENANCE.json | Full upstream license and bundled dependency notices in runtime/LICENSE. |

The upstream frontend metadata credits Zaid Arshad and Robby Pruzan on behalf of the University at Buffalo. Preserve this attribution. Bundled upstream framework/library notices are retained in their JavaScript files; a complete upstream dependency/license inventory is still needed before public release. This file does not grant redistribution rights to the original application.

Offline adaptation: local toolbar, disk persistence, JSON conversion/validation, PNG integration and local layout thumbnails. Analytics and monitoring are disabled; the server restricts resource connections to its local origin. Static source-map references and deployment-specific telemetry identifiers were removed from the distribution assets. Published upstream code is still present and is not claimed as newly authored code.