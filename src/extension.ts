// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { treeCmd } from './treeCmd';
import { FileTreeItemsProvider, FileItem } from './provider/fileItemProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "tree" is now active!');
	let fileTreeItemsProvider:FileTreeItemsProvider|null = null;
	let fileTreeView: vscode.TreeView<FileItem>;
	if(vscode.workspace.rootPath){
		// fileTreeItemsProvider = new FileTreeItemsProvider(vscode.workspace.rootPath);
		// vscode.window.registerTreeDataProvider('fileTree', fileTreeItemsProvider);
		fileTreeItemsProvider = new FileTreeItemsProvider(vscode.workspace.rootPath);
		fileTreeView = vscode.window.createTreeView('fileTree', {treeDataProvider: fileTreeItemsProvider});
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('tree.cmd', (uri:vscode.Uri) => {
		// The code you place here will be executed every time your command is executed

		// Display tree command result
		let ret = treeCmd(uri.fsPath);
		console.log(ret);
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('tree.cmd.fromFileTreeView', (fileItem: FileItem) => {
		// The code you place here will be executed every time your command is executed

		if(fileTreeItemsProvider){
			let ret:string = fileTreeItemsProvider.treeCmd(fileItem,0);
			console.log(ret);
		}

	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
