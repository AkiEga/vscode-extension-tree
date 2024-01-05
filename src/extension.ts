import { FileTreeFormatter, FORMAT_MODE } from './formatter/fileTreeFormatter';
import * as vscode from 'vscode';
import { FileTreeItemsProvider, FileItem } from './provider/fileItemProvider';
import {PreviewPanelManager} from './view/previewPanelManager';

export function activate(context: vscode.ExtensionContext) {
	let fileTreeItemsProvider: FileTreeItemsProvider | null = null;
	let fileTreeView: vscode.TreeView<FileItem>;

	// get workspace folders
	let workspaceFolders: vscode.WorkspaceFolder[] | undefined 
		= vscode.workspace.workspaceFolders as vscode.WorkspaceFolder[] | undefined;

	// Create Tree View UI Components
	if (workspaceFolders) {
		// if exist workspace, show a file tree item
		fileTreeItemsProvider = new FileTreeItemsProvider(workspaceFolders);
		fileTreeView = vscode.window.createTreeView('fileTree', {	
			showCollapseAll:false,
			treeDataProvider: fileTreeItemsProvider
		});
		fileTreeView.onDidCollapseElement((e: vscode.TreeViewExpansionEvent<FileItem>) => {
			e.element.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		});
		fileTreeView.onDidExpandElement((e: vscode.TreeViewExpansionEvent<FileItem>) => {
			e.element.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
		});	
	}

	// Add `tree` cmd to show tree view in vscode
	let disposable = vscode.commands.registerCommand('tree.cmd', (fileItem: FileItem) => {
		if (fileTreeItemsProvider) {
			let ret: FileItem[] = fileTreeItemsProvider.treeCmd(fileItem);
			let treeViewStr:string = new FileTreeFormatter(ret).exec(FORMAT_MODE.KEISEN);

			// show tree view
			let config = vscode.workspace.getConfiguration();
			if (config?.get<string>("tree.view-type") === "TextEditor") {
				vscode.commands.executeCommand("workbench.action.files.newUntitledFile").then(() => {
					showTreeViewTextEditor(treeViewStr.trimEnd(), fileItem.resourceUri.fsPath);
				});	
			} else if (config?.get<string>("tree.view-type") === "WebViewPanel") {
				new PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
			} else {
				new PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
			}
		}
	});
	context.subscriptions.push(disposable);

	// add refresh cmd
	disposable = vscode.commands.registerCommand('tree.refreshEntry', () =>
		fileTreeItemsProvider?.refresh()
	);
	context.subscriptions.push(disposable);
}

async function showTreeViewTextEditor(treeViewStr: string, rootPath: string): Promise<void> {
	let editor = vscode.window.activeTextEditor;
	let doc = editor?.document;
	if (doc) {
		vscode.languages.setTextDocumentLanguage(doc, "markdown");
		vscode.window.activeTextEditor?.edit((editBuilder) => {
			let startPos = new vscode.Position(0, 0);
			let mdTxt: string = `# Tree View
## Root path: 
${rootPath}

## Content
\`\`\`bash
${treeViewStr}
\`\`\`
`;
			editBuilder.insert(startPos, mdTxt);
		});
	}
	return;
}

// this method is called when your extension is deactivated
export function deactivate() { }
