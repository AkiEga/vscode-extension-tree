import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileTreeItemsProvider implements vscode.TreeDataProvider<FileItem> {
	// _onDidChangeTreeData: vscode.EventEmitter<FileItem> = new vscode.EventEmitter<FileItem>();
	// onDidChangeTreeData: vscode.Event<FileItem> = this._onDidChangeTreeData.event;
	fileTree:FileItem[] | undefined;

	constructor(private workspaceRoot: vscode.Uri) { 
		this.workspaceRoot = workspaceRoot;
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
			return new Promise((resolve)=>{
				this.getFiles(element.resourceUri).then((children:FileItem[])=>{
					element.child = children;
					resolve(children);
				});
			});
		}
	}

	treeCmd(rootElement: FileItem): FileItem[]{
		let ret:FileItem[] = [rootElement];

		if(rootElement.collapsibleState === vscode.TreeItemCollapsibleState.Expanded){
			// rootから下を探索して列挙
			for(let c of rootElement.child){
				if((c.collapsibleState === vscode.TreeItemCollapsibleState.Expanded) &&
					(c.child.length > 0)){
					// 折りたたみ解除 && 子供があったら再帰的にtree
					let add = this.treeCmd(c);
					ret.push(...add);
				}else{
					ret.push(c);
				}
			}
		}

		return ret;
	}

	private getFiles(rootUri: vscode.Uri): Thenable<FileItem[]>{
		return new Promise((resolve)=>{
			let fileItems:FileItem[] = [];
		
			vscode.workspace.fs.readDirectory(rootUri).then((value)=>{
				value.forEach((value,index,array)=>{
					let newFileName = value[0];
					let newFileType:vscode.FileType = value[1];
					let newFileFullUri:vscode.Uri = vscode.Uri.joinPath(rootUri,newFileName);
					let newFileColState:vscode.TreeItemCollapsibleState;
					if(newFileType === vscode.FileType.Directory){
						newFileColState = vscode.TreeItemCollapsibleState.Collapsed;
						newFileName += "/";
					}else{
						newFileColState = vscode.TreeItemCollapsibleState.None;
					}
					let newFileItem:FileItem =
						new FileItem(newFileName, newFileFullUri, newFileColState);
					fileItems.push(newFileItem);
				});
				resolve(fileItems);
			});
		});
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
	constructor(
		public readonly label: string, 
		public readonly resourceUri: vscode.Uri,
		public collapsibleState: vscode.TreeItemCollapsibleState){
		super(label, collapsibleState);

	}
	
}
