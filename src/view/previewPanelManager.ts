import * as vscode from 'vscode';
import { FileItem } from '../provider/fileItemProvider';
import * as marked from 'marked';

export class PreviewPanelManager{
	public show(treeViewStr: string, title: string) {
		const panel = vscode.window.createWebviewPanel(
			'treePreview',
			`Tree from \"${title}\"`,
			vscode.ViewColumn.Beside,
			{}
		);
		let mdTxt: string = `
### File Tree
\`\`\`bash
${treeViewStr}
\`\`\`
`;
		panel.webview.html = marked.marked(mdTxt);
	}
}