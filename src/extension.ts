import * as vscode from 'vscode';
import { treeCmd } from './treeCmd';
import { FileTreeItemsProvider, FileItem } from './provider/fileItemProvider';

export function activate(context: vscode.ExtensionContext) {
	let fileTreeItemsProvider: FileTreeItemsProvider | null = null;
	let fileTreeView: vscode.TreeView<FileItem>;
	if (vscode.workspace.rootPath) {
		fileTreeItemsProvider = new FileTreeItemsProvider(vscode.workspace.rootPath);
		fileTreeView = vscode.window.createTreeView('fileTree', { treeDataProvider: fileTreeItemsProvider });
		fileTreeView.onDidCollapseElement((e: vscode.TreeViewExpansionEvent<FileItem>) => {
			e.element.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		});
		fileTreeView.onDidExpandElement((e: vscode.TreeViewExpansionEvent<FileItem>) => {
			e.element.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
		});
	}

	let disposable = vscode.commands.registerCommand('tree.cmd', (fileItem: FileItem) => {
		if (fileTreeItemsProvider) {
			let ret: string = fileTreeItemsProvider.treeCmd(fileItem, 0);
			console.log(ret);
			let retForHtml: string = escape(ret);
			const panel = vscode.window.createWebviewPanel(
				'treePreview',
				`Tree from \"${fileItem.fullPath}\"`,
				vscode.ViewColumn.Beside,
				{}
			);
			const marked = require('marked');
			let mdTxt:string =
`
### File Tree
\`\`\`bash
${ret}
\`\`\`
`;
			panel.webview.html = marked(mdTxt);

		}

	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
