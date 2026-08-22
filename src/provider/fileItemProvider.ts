import * as vscode from 'vscode';
import * as fs from 'fs';

export class FileTreeItemsProvider implements vscode.TreeDataProvider<FileItem> {
	fileTree:FileItem[] | undefined;
	private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;
	workspaceRoots:vscode.WorkspaceFolder[] = [];

	constructor(workspaceRoots: vscode.WorkspaceFolder[]) { 
		this.workspaceRoots = workspaceRoots;
	}

	getTreeItem(element: FileItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: FileItem): Thenable<FileItem[]> {
		if(element === undefined){
			// for workspace root case
			const newFileColState:vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded;
			const workspaceRootFileItems:FileItem[] = [];
			for (const ws of this.workspaceRoots) {
				workspaceRootFileItems.push(new FileItem("${workspaceRoot} " + `(${ws.name})`, ws.uri, newFileColState));
			}
				
			this.fileTree = workspaceRootFileItems;
			return Promise.resolve(workspaceRootFileItems);
		}else{
			// for folder or file case
			return new Promise((resolve)=>{
				this.getFiles(element.resourceUri).then((children:FileItem[])=>{
					children = this.sortFileItems(children);
					element.child = children;
					resolve(children);
				});
			});
		}
	}

	treeCmd(rootElement: FileItem): FileItem[]{
		const ret:FileItem[] = [rootElement];

		if(rootElement.collapsibleState === vscode.TreeItemCollapsibleState.Expanded){
			// rootから下を探索して列挙
			for(const c of rootElement.child){
				if((c.collapsibleState === vscode.TreeItemCollapsibleState.Expanded) &&
					(c.child.length > 0)){
					// 折りたたみ解除 && 子供があったら再帰的にtree
					const add = this.treeCmd(c);
					ret.push(...add);
				}else{
					ret.push(c);
				}
			}
		}

		return ret;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
	sortFileItems(fileItems:FileItem[]): FileItem[] {
		const folders:FileItem[] = [];
		const files:FileItem[] = [];
		let ret:FileItem[] = [];
		// select folder/file
		fileItems.forEach((f:FileItem)=>{
			const filePath = f.resourceUri.fsPath;
			if(fs.lstatSync(filePath).isDirectory() ){
				folders.push(f);
			}else{
				files.push(f);
			}
		});
		// sort folder group
		folders.sort((a:FileItem, b:FileItem)=>{
			return a.label.localeCompare(b.label);
		});

		// sort file group
		files.sort((a:FileItem, b:FileItem)=>{
			return a.label.localeCompare(b.label);
		});

		// merge
		ret = folders.concat(files);

		return ret;
	}
	private getFiles(rootUri: vscode.Uri): Thenable<FileItem[]>{
		return new Promise((resolve)=>{
			const fileItems:FileItem[] = [];
		
			vscode.workspace.fs.readDirectory(rootUri).then((value)=>{
				value.forEach((entry)=>{
					let newFileName = entry[0];
					const newFileType:vscode.FileType = entry[1];
					const newFileFullUri:vscode.Uri = vscode.Uri.joinPath(rootUri,newFileName);
					let newFileColState:vscode.TreeItemCollapsibleState;
					if(newFileType === vscode.FileType.Directory){
						newFileColState = vscode.TreeItemCollapsibleState.Collapsed;
						newFileName += "/";
					}else{
						newFileColState = vscode.TreeItemCollapsibleState.None;
					}
					const newFileItem:FileItem =
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
		} catch {
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
