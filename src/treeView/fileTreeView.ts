import * as vscode from 'vscode';
import { FileTreeItemsProvider, FileItem } from '../provider/fileItemProvider';

// export class FileTreeView implements vscode.TreeView<FileItem> {
// 	onDidExpandElement: vscode.Event<vscode.TreeViewExpansionEvent<FileItem>>;
// 	onDidCollapseElement: vscode.Event<vscode.TreeViewExpansionEvent<FileItem>>;
// 	selection: FileItem[];
// 	onDidChangeSelection: vscode.Event<vscode.TreeViewSelectionChangeEvent<FileItem>>;
// 	visible: boolean;
// 	onDidChangeVisibility: vscode.Event<vscode.TreeViewVisibilityChangeEvent>;
// 	message?: string | undefined;
// 	title?: string | undefined;
// 	constructor(){
// 	}
// 	reveal(element: FileItem, options?: { select?: boolean | undefined; focus?: boolean | undefined; expand?: number | boolean | undefined; }): Thenable<void> {
// 		throw new Error('Method not implemented.');
// 	}
// 	dispose() {
// 		throw new Error('Method not implemented.');
// 	}
// }