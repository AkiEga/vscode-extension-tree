import * as vscode from 'vscode';
import { FileItem } from '../provider/fileItemProvider';

export class PreviewPanelManager{
	public show(treeViewStr: string, title: string) {
		
		const panel = vscode.window.createWebviewPanel(
			'treePreview',
			`Tree from \"${title}\"`,
			vscode.ViewColumn.Beside,
			{}
		);
		const marked = require('marked');
		let mdTxt: string = `
### File Tree
\`\`\`bash
${treeViewStr}
\`\`\`
`;
		panel.webview.html = marked(mdTxt);
	}
}