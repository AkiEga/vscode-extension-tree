import { FileTreeFormatter, FORMAT_MODE } from './formatter/fileTreeFormatter';
import * as vscode from 'vscode';
import { FileTreeItemsProvider, FileItem } from './provider/fileItemProvider';
import {PreviewPanelManager} from './view/previewPanelManager';

export function activate(context: vscode.ExtensionContext) {
	let fileTreeItemsProvider: FileTreeItemsProvider | null = null;
	let fileTreeView: vscode.TreeView<FileItem>;

	// get workspace folders
	const workspaceFolders: vscode.WorkspaceFolder[] | undefined 
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
			const ret: FileItem[] = fileTreeItemsProvider.treeCmd(fileItem);
			const treeViewStr:string = new FileTreeFormatter(ret).exec(FORMAT_MODE.KEISEN);

			// show tree view
			const config = vscode.workspace.getConfiguration();
			if (config) {
				const viewType = config.get<string>("tree.view-type");
				switch (viewType) {
					case "TextEditor":
						vscode.commands.executeCommand("workbench.action.files.newUntitledFile").then(() => {
							showTreeViewTextEditor(treeViewStr.trimEnd(), fileItem.resourceUri.fsPath);
						});
						break;
					case "WebViewPanel":
						new PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
						break;
					default:
						new PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
						break;
				}
			} else {
				new PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
			}			
		} else {
			vscode.window.showInformationMessage('Open a folder or workspace to use Tree view.');
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
	const editor = vscode.window.activeTextEditor;
	const doc = editor?.document;
	if (doc) {
		vscode.languages.setTextDocumentLanguage(doc, "markdown");
		vscode.window.activeTextEditor?.edit((editBuilder) => {
			const startPos = new vscode.Position(0, 0);
			const mdTxt: string = `# Tree View
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
