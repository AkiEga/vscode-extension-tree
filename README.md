# About
A tool of tree command utilized vscode gui functions

# Usage
1. Access side bar section named "FILE TREE" in explorer view
2. Right-click at a folder needed to cmd `tree`
3. Done. Tree cmd result will be shown in right side editor.

## Requirements
- VS Code: version 1.104.3 or later

## Extension Settings
The extension currently exposes the following setting. You can change it in user or workspace `settings.json`.

### `tree.view-type`
Controls how the tree command result is rendered. Default: `TextEditor`.

| Value | Description |
|-------|-------------|
| `TextEditor` | Renders the output as Markdown text in a new untitled editor. You can edit or save it. |
| `WebViewPanel` | Renders the output in a lightweight read‑only webview panel beside the current editor. |

Example (`settings.json`):
```jsonc
{
  // default (can be omitted)
  "tree.view-type": "TextEditor"
}
```

Choose `WebViewPanel` when you do not want to add an extra editor tab. Choose `TextEditor` when you want to further edit / reformat or save the output as a file.

## Known Issues
T.B.D

## Release Notes
Users appreciate release notes as you update your extension.

### 0.0.1
Initial release
