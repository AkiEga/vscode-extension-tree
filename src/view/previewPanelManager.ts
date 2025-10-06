import * as vscode from 'vscode';

export class PreviewPanelManager {
	public show(treeViewStr: string, title: string) {
		const panel = vscode.window.createWebviewPanel(
			'treePreview',
			`Tree from "${title}"`,
			vscode.ViewColumn.Beside,
			{}
		);

		const escaped = this.escapeHtml(treeViewStr);
		panel.webview.html = this.buildHtml(`Tree from: ${this.escapeHtml(title)}`, `<h3>File Tree</h3><pre>${escaped}</pre>`);
	}

	private buildHtml(title: string, bodyInner: string): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
body{font-family:var(--vscode-font-family,Arial);padding:12px;line-height:1.4;}
pre{background:var(--vscode-editor-background,#1e1e1e);color:var(--vscode-editor-foreground,#d4d4d4);padding:8px 10px;border-radius:4px;overflow:auto;font-size:12px;}
code{font-family:var(--vscode-editor-font-family,Consolas,monospace);}
h3{margin-top:0;}
</style>
</head>
<body>
${bodyInner}
</body>
</html>`;
	}

	private escapeHtml(src: string): string {
		return src
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}
}