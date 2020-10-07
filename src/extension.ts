import { FileTreeFormatter, FORMAT_MODE } from './formatter/fileTreeFormatter';
import * as vscode from 'vscode';
import { FileTreeItemsProvider, FileItem } from './provider/fileItemProvider';
import {PreviewPanelManager} from './view/previewPanelManager';

export function activate(context: vscode.ExtensionContext) {
	let fileTreeItemsProvider: FileTreeItemsProvider | null = null;
	let fileTreeView: vscode.TreeView<FileItem>;

	if (vscode.workspace.workspaceFolders) {
		fileTreeItemsProvider = new FileTreeItemsProvider(vscode.workspace.workspaceFolders[0].uri);
		fileTreeView = vscode.window.createTreeView('fileTree', { showCollapseAll:false,treeDataProvider: fileTreeItemsProvider });
		fileTreeView.onDidCollapseElement((e: vscode.TreeViewExpansionEvent<FileItem>) => {
			e.element.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		});
		fileTreeView.onDidExpandElement((e: vscode.TreeViewExpansionEvent<FileItem>) => {
			e.element.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
		});
	}

	let disposable = vscode.commands.registerCommand('tree.cmd', (fileItem: FileItem) => {
		if (fileTreeItemsProvider) {
			let ret: FileItem[] = fileTreeItemsProvider.treeCmd(fileItem);
			let treeViewStr:string = new FileTreeFormatter(ret).exec(FORMAT_MODE.KEISEN);
			console.log(treeViewStr);
			new PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
		}
	});
	context.subscriptions.push(disposable);

	
}

// this method is called when your extension is deactivated
export function deactivate() { }
