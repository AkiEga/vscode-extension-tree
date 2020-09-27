import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileTreeItemsProvider implements vscode.TreeDataProvider<FileItem> {
	// _onDidChangeTreeData: vscode.EventEmitter<FileItem> = new vscode.EventEmitter<FileItem>();
	// onDidChangeTreeData: vscode.Event<FileItem> = this._onDidChangeTreeData.event;
	fileTree:FileItem[] | undefined;

	constructor(private workspaceRoot: string) { 
	}

	getTreeItem(element: FileItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: FileItem): Thenable<FileItem[]> {
		if(element === undefined){
			// for workspace root case
			let newFileColState:vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded;
			let workspaceRootFileItem:FileItem =
				new FileItem("${workspaceRoot}", this.workspaceRoot, newFileColState);
			this.fileTree = [workspaceRootFileItem];
			return Promise.resolve([workspaceRootFileItem]);
		}else{
			let children:FileItem[] = this.getFiles(element.fullPath);
			element.child = children;
			return Promise.resolve(children);
		}
	}

	treeCmd(rootElement: FileItem, depth:number): string{
		let depthTab:string = "\t".repeat(depth);
		let ret:string = `${depthTab}${rootElement.label}\n`;

		// if(rootElement.collapsibleState === vscode.TreeItemCollapsibleState.Expanded){
			// rootから下を探索して列挙
			for(let c of rootElement.child){
				// 子供があったら再帰的にtree
				// if(c.collapsibleState === vscode.TreeItemCollapsibleState.Expanded){
					ret += this.treeCmd(c,depth+1);
				// }
			}
		// }

		return ret;
	}

	private getFiles(cwd: string): FileItem[]{
		let fileItems:FileItem[] = [];
		let files:string[] = fs.readdirSync(cwd);
		
		for(let newFileName of files){
			let fileFullPath:string = path.join(cwd,newFileName);
			let newFileColState:vscode.TreeItemCollapsibleState;
			if(fs.statSync(fileFullPath).isDirectory() === true){
				newFileColState = vscode.TreeItemCollapsibleState.Collapsed;
			}else{
				newFileColState = vscode.TreeItemCollapsibleState.None;
			}
			let newFileItem:FileItem =
				new FileItem(newFileName, fileFullPath, newFileColState);
			fileItems.push(newFileItem);
		}

		return fileItems;
	}
	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}
		return true;
	}
}

export class FileItem extends vscode.TreeItem {
	public child:FileItem[] = [];
	// public fullPath:string= "";
	constructor(
		public readonly label: string, 
		public readonly fullPath: string, 
		public readonly collapsibleState: vscode.TreeItemCollapsibleState){
		super(label, collapsibleState);
	}
	
}
