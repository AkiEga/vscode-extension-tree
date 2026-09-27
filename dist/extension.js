/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/formatter/fileTreeFormatter.ts"
/*!********************************************!*\
  !*** ./src/formatter/fileTreeFormatter.ts ***!
  \********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileTreeFormatter = exports.FORMAT_MODE = void 0;
const path = __webpack_require__(/*! path */ "path");
var FORMAT_MODE;
(function (FORMAT_MODE) {
    FORMAT_MODE[FORMAT_MODE["TAB"] = 0] = "TAB";
    FORMAT_MODE[FORMAT_MODE["LINE"] = 1] = "LINE";
    FORMAT_MODE[FORMAT_MODE["KEISEN"] = 2] = "KEISEN";
    FORMAT_MODE[FORMAT_MODE["NUM"] = 3] = "NUM";
})(FORMAT_MODE || (exports.FORMAT_MODE = FORMAT_MODE = {}));
const formatStrSet = [
    // for TAB mode
    {
        U___: "    ",
        UB__: "    ",
        U_R_: "    ",
        UBR_: "    ",
        ____: "    "
    },
    // LINE mode
    {
        U___: "    ",
        UB__: "|   ",
        U_R_: " `--",
        UBR_: "|`--",
        ____: "    "
    },
    // keisen mode
    {
        U___: "　　",
        UB__: "│　",
        U_R_: "└─",
        UBR_: "├─",
        ____: "　　"
    }
];
class FileTreeFormatter {
    constructor(fileItems) {
        this.fileItems = fileItems;
        this.rootFolder = fileItems[0];
        this.rootFolderPath = this.rootFolder.resourceUri.path;
        this.rootRootFolderPath = path.dirname(this.rootFolderPath);
        this.rootRetPath
            = path.relative(this.rootFolderPath, this.rootFolder.resourceUri.path).replace(/\\/g, "/");
    }
    exec(mode) {
        let header;
        if (process.platform === 'win32') {
            header = `${this.rootFolderPath.replace(/\//s, "")}/\n`;
        }
        else {
            header = `${this.rootFolderPath}/\n`;
        }
        const fileNum = this.fileItems.length;
        let body = "";
        let belowLinePreFixs = [];
        for (let index = fileNum - 1; index > 0; index--) {
            const current = this.fileItems[index];
            const past = this.fileItems[index - 1];
            const next = this.fileItems[index + 1];
            const pastVsCurr = this.pathElemDiff(this.rPath(current), this.rPath(past));
            let currVsNext = [];
            const depth = pastVsCurr.length - 1;
            if (next) {
                currVsNext = this.pathElemDiff(this.rPath(current), this.rPath(next));
            }
            else {
                for (let i = 0; i <= depth; i++) {
                    currVsNext.push(false);
                }
            }
            const currentPreFixs = [];
            const line = [];
            for (let d = 0; d <= depth; d++) {
                const Upper = pastVsCurr[d] === true ? "U" : "_";
                const Bottom = currVsNext[d] === true ? "B" : "_";
                const Right = (d === depth) ? "R" : "_";
                const preFixId = `${Upper}${Bottom}${Right}_`;
                currentPreFixs.push(preFixId);
                if (index === fileNum - 1) {
                    line.push(formatStrSet[mode][currentPreFixs[d]]);
                }
                else {
                    let preFix = formatStrSet[mode][currentPreFixs[d]];
                    if (belowLinePreFixs[d] === formatStrSet[mode]["____"]) {
                        if ((currentPreFixs[d] === "UB__")) {
                            preFix = formatStrSet[mode]["____"];
                        }
                        else if ((currentPreFixs[d] === "UBR_")) {
                            preFix = formatStrSet[mode]["U_R_"];
                        }
                    }
                    line.push(preFix);
                }
            }
            belowLinePreFixs = line;
            body = line.join("") + current.label + "\n" + body;
        }
        return header + body;
    }
    genPrefixIdx(past, current, next) {
        const ret = [];
        const pastVsCurr = this.pathElemDiff(this.rPath(current), this.rPath(past));
        let currVsNext = [];
        const endIdx = pastVsCurr.length - 1;
        if (next) {
            currVsNext = this.pathElemDiff(this.rPath(current), this.rPath(next));
        }
        else {
            for (let i = 0; i <= endIdx; i++) {
                currVsNext.push(false);
            }
        }
        for (let i = 0; i <= endIdx; i++) {
            const Upper = pastVsCurr[i] === true ? "U" : "_";
            const Bottom = currVsNext[i] === true ? "B" : "_";
            const Right = (i === endIdx) ? "R" : "_";
            const preFixId = `${Upper + Bottom + Right}_`;
            ret.push(preFixId);
        }
        return ret;
    }
    rPath(file) {
        return "./" + path.relative(this.rootFolderPath, file.resourceUri.path).replace(/\\/g, "/");
    }
    pathElemDiff(aPath, bPath) {
        const ret = [];
        const aElems = aPath.split("/");
        const bElems = bPath.split("/");
        for (let i = 0; i < aElems.length - 1; i++) {
            if (bElems[i]) {
                if (aElems[i] === bElems[i]) {
                    ret.push(true);
                }
                else {
                    ret.push(false);
                }
            }
            else {
                ret.push(false);
            }
        }
        return ret;
    }
    countFolderDepth(str) {
        let ret = 1;
        const m = str.match(/(\\|\/)/g);
        if (m !== null) {
            ret += m.length;
        }
        return ret;
    }
}
exports.FileTreeFormatter = FileTreeFormatter;


/***/ },

/***/ "./src/provider/fileItemProvider.ts"
/*!******************************************!*\
  !*** ./src/provider/fileItemProvider.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileItem = exports.FileTreeItemsProvider = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const fs = __webpack_require__(/*! fs */ "fs");
class FileTreeItemsProvider {
    constructor(workspaceRoots) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.workspaceRoots = [];
        this.workspaceRoots = workspaceRoots;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element === undefined) {
            // for workspace root case
            const newFileColState = vscode.TreeItemCollapsibleState.Expanded;
            const workspaceRootFileItems = [];
            for (const ws of this.workspaceRoots) {
                workspaceRootFileItems.push(new FileItem("${workspaceRoot} " + `(${ws.name})`, ws.uri, newFileColState));
            }
            this.fileTree = workspaceRootFileItems;
            return Promise.resolve(workspaceRootFileItems);
        }
        else {
            // for folder or file case
            return new Promise((resolve) => {
                this.getFiles(element.resourceUri).then((children) => {
                    children = this.sortFileItems(children);
                    element.child = children;
                    resolve(children);
                });
            });
        }
    }
    treeCmd(rootElement) {
        const ret = [rootElement];
        if (rootElement.collapsibleState === vscode.TreeItemCollapsibleState.Expanded) {
            // rootから下を探索して列挙
            for (const c of rootElement.child) {
                if ((c.collapsibleState === vscode.TreeItemCollapsibleState.Expanded) &&
                    (c.child.length > 0)) {
                    // 折りたたみ解除 && 子供があったら再帰的にtree
                    const add = this.treeCmd(c);
                    ret.push(...add);
                }
                else {
                    ret.push(c);
                }
            }
        }
        return ret;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    sortFileItems(fileItems) {
        const folders = [];
        const files = [];
        let ret = [];
        // select folder/file
        fileItems.forEach((f) => {
            const path = f.resourceUri.fsPath;
            if (fs.lstatSync(path).isDirectory()) {
                folders.push(f);
            }
            else {
                files.push(f);
            }
        });
        // sort folder group
        folders.sort((a, b) => {
            return a.label.localeCompare(b.label);
        });
        // sort file group
        files.sort((a, b) => {
            return a.label.localeCompare(b.label);
        });
        // merge
        ret = folders.concat(files);
        return ret;
    }
    getFiles(rootUri) {
        return new Promise((resolve) => {
            const fileItems = [];
            vscode.workspace.fs.readDirectory(rootUri).then((value) => {
                value.forEach((entry) => {
                    let newFileName = entry[0];
                    const newFileType = entry[1];
                    const newFileFullUri = vscode.Uri.joinPath(rootUri, newFileName);
                    let newFileColState;
                    if (newFileType === vscode.FileType.Directory) {
                        newFileColState = vscode.TreeItemCollapsibleState.Collapsed;
                        newFileName += "/";
                    }
                    else {
                        newFileColState = vscode.TreeItemCollapsibleState.None;
                    }
                    const newFileItem = new FileItem(newFileName, newFileFullUri, newFileColState);
                    fileItems.push(newFileItem);
                });
                resolve(fileItems);
            });
        });
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch {
            return false;
        }
        return true;
    }
}
exports.FileTreeItemsProvider = FileTreeItemsProvider;
class FileItem extends vscode.TreeItem {
    constructor(label, resourceUri, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.resourceUri = resourceUri;
        this.collapsibleState = collapsibleState;
        this.child = [];
    }
}
exports.FileItem = FileItem;


/***/ },

/***/ "./src/view/previewPanelManager.ts"
/*!*****************************************!*\
  !*** ./src/view/previewPanelManager.ts ***!
  \*****************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PreviewPanelManager = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
class PreviewPanelManager {
    show(treeViewStr, title) {
        const panel = vscode.window.createWebviewPanel('treePreview', `Tree from "${title}"`, vscode.ViewColumn.Beside, {});
        panel.webview.html = PreviewPanelManager.renderTreeHtml(treeViewStr, title);
    }
    static renderTreeHtml(treeViewStr, title) {
        const escapedTree = PreviewPanelManager.escapeHtml(treeViewStr);
        const escapedTitle = PreviewPanelManager.escapeHtml(title);
        return PreviewPanelManager.buildHtml(`Tree from: ${escapedTitle}`, `<h3>File Tree</h3><pre>${escapedTree}</pre>`);
    }
    static buildHtml(title, bodyInner) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
body{font-family:var(--vscode-font-family,Arial);padding:12px;line-height:1.4;}
pre{background:var(--vscode-editor-background,#1e1e1e);color:var(--vscode-editor-foreground,#d4d4d4);padding:8px 10px;border-radius:4px;overflow:auto;font-size:12px;}
code{font-family:var(--vscode-editor-font-family,Consolas,monospace);}
h3{margin-top:0;}
</style>
</head>
<body>
${bodyInner}
</body>
</html>`;
    }
    static escapeHtml(src) {
        return src
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}
exports.PreviewPanelManager = PreviewPanelManager;


/***/ },

/***/ "vscode"
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
(module) {

module.exports = require("vscode");

/***/ },

/***/ "fs"
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
(module) {

module.exports = require("fs");

/***/ },

/***/ "path"
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
(module) {

module.exports = require("path");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const fileTreeFormatter_1 = __webpack_require__(/*! ./formatter/fileTreeFormatter */ "./src/formatter/fileTreeFormatter.ts");
const vscode = __webpack_require__(/*! vscode */ "vscode");
const fileItemProvider_1 = __webpack_require__(/*! ./provider/fileItemProvider */ "./src/provider/fileItemProvider.ts");
const previewPanelManager_1 = __webpack_require__(/*! ./view/previewPanelManager */ "./src/view/previewPanelManager.ts");
function activate(context) {
    let fileTreeItemsProvider = null;
    let fileTreeView;
    // get workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    // Create Tree View UI Components
    if (workspaceFolders) {
        // if exist workspace, show a file tree item
        fileTreeItemsProvider = new fileItemProvider_1.FileTreeItemsProvider(workspaceFolders);
        fileTreeView = vscode.window.createTreeView('fileTree', {
            showCollapseAll: false,
            treeDataProvider: fileTreeItemsProvider
        });
        fileTreeView.onDidCollapseElement((e) => {
            e.element.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        });
        fileTreeView.onDidExpandElement((e) => {
            e.element.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        });
    }
    // Add `tree` cmd to show tree view in vscode
    let disposable = vscode.commands.registerCommand('tree.cmd', (fileItem) => {
        if (fileTreeItemsProvider) {
            const ret = fileTreeItemsProvider.treeCmd(fileItem);
            const treeViewStr = new fileTreeFormatter_1.FileTreeFormatter(ret).exec(fileTreeFormatter_1.FORMAT_MODE.KEISEN);
            // show tree view
            const config = vscode.workspace.getConfiguration();
            if (config) {
                const viewType = config.get("tree.view-type");
                switch (viewType) {
                    case "TextEditor":
                        vscode.commands.executeCommand("workbench.action.files.newUntitledFile").then(() => {
                            showTreeViewTextEditor(treeViewStr.trimEnd(), fileItem.resourceUri.fsPath);
                        });
                        break;
                    case "WebViewPanel":
                        new previewPanelManager_1.PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
                        break;
                    default:
                        new previewPanelManager_1.PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
                        break;
                }
            }
            else {
                new previewPanelManager_1.PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
            }
        }
        else {
            vscode.window.showInformationMessage('Open a folder or workspace to use Tree view.');
        }
    });
    context.subscriptions.push(disposable);
    // add refresh cmd
    disposable = vscode.commands.registerCommand('tree.refreshEntry', () => fileTreeItemsProvider?.refresh());
    context.subscriptions.push(disposable);
}
async function showTreeViewTextEditor(treeViewStr, rootPath) {
    const editor = vscode.window.activeTextEditor;
    const doc = editor?.document;
    if (doc) {
        vscode.languages.setTextDocumentLanguage(doc, "markdown");
        vscode.window.activeTextEditor?.edit((editBuilder) => {
            const startPos = new vscode.Position(0, 0);
            const mdTxt = `# Tree View
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
function deactivate() { }

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUNwRCxNQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sS0FBSyxHQUFXOztFQUV2QixRQUFROzs7O0VBSVIsV0FBVzs7Q0FFWixDQUFDO1lBQ0MsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBQ0QsT0FBTztBQUNSLENBQUM7QUFFRCwyREFBMkQ7QUFDM0QsU0FBZ0IsVUFBVSxLQUFLLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvZm9ybWF0dGVyL2ZpbGVUcmVlRm9ybWF0dGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9wcm92aWRlci9maWxlSXRlbVByb3ZpZGVyLnRzIiwid2VicGFjazovLy8uL3NyYy92aWV3L3ByZXZpZXdQYW5lbE1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIGNvbW1vbmpzIFwidnNjb2RlXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJmc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwicGF0aFwiIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vLi9zcmMvZXh0ZW5zaW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiAqL1xyXG5pbXBvcnQge0ZpbGVJdGVtfSBmcm9tICcuLi9wcm92aWRlci9maWxlSXRlbVByb3ZpZGVyJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmV4cG9ydCBlbnVtIEZPUk1BVF9NT0RFe1xyXG5cdFRBQiA9IDAsXHJcblx0TElORSxcclxuXHRLRUlTRU4sXHJcblx0TlVNXHJcbn1cclxuXHJcbmludGVyZmFjZSBTdHJpbmdNYXAgeyBba2V5OiBzdHJpbmddOiBzdHJpbmc7IH1cclxuXHJcbmNvbnN0IGZvcm1hdFN0clNldDpTdHJpbmdNYXBbXSA9IFtcclxuXHQvLyBmb3IgVEFCIG1vZGVcclxuXHR7XHJcblx0XHRVX19fOlwiICAgIFwiLFxyXG5cdFx0VUJfXzpcIiAgICBcIixcclxuXHRcdFVfUl86XCIgICAgXCIsXHJcblx0XHRVQlJfOlwiICAgIFwiLFxyXG5cdFx0X19fXzpcIiAgICBcIlxyXG5cdH0sXHJcblx0Ly8gTElORSBtb2RlXHJcblx0e1xyXG5cdFx0VV9fXzpcIiAgICBcIixcclxuXHRcdFVCX186XCJ8ICAgXCIsXHJcblx0XHRVX1JfOlwiIGAtLVwiLFxyXG5cdFx0VUJSXzpcInxgLS1cIixcclxuXHRcdF9fX186XCIgICAgXCJcclxuXHR9LFxyXG5cdC8vIGtlaXNlbiBtb2RlXHJcblx0e1xyXG5cdFx0VV9fXzpcIuOAgOOAgFwiLFxyXG5cdFx0VUJfXzpcIuKUguOAgFwiLFxyXG5cdFx0VV9SXzpcIuKUlOKUgFwiLFxyXG5cdFx0VUJSXzpcIuKUnOKUgFwiLFxyXG5cdFx0X19fXzpcIuOAgOOAgFwiXHJcblx0fVxyXG5dO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVUcmVlRm9ybWF0dGVye1xyXG5cdGZpbGVJdGVtczpGaWxlSXRlbVtdO1xyXG5cdHJvb3RGb2xkZXI6RmlsZUl0ZW07XHJcblx0cm9vdEZvbGRlclBhdGg6c3RyaW5nO1xyXG5cdHJvb3RSb290Rm9sZGVyUGF0aDpzdHJpbmc7XHJcblx0cm9vdFJldFBhdGg6c3RyaW5nIDtcclxuXHRjb25zdHJ1Y3RvcihmaWxlSXRlbXM6RmlsZUl0ZW1bXSl7XHJcblx0XHR0aGlzLmZpbGVJdGVtcyA9IGZpbGVJdGVtcztcclxuXHRcdHRoaXMucm9vdEZvbGRlciA9IGZpbGVJdGVtc1swXTtcdFx0XHJcblx0XHR0aGlzLnJvb3RGb2xkZXJQYXRoID0gdGhpcy5yb290Rm9sZGVyLnJlc291cmNlVXJpLnBhdGg7XHJcblx0XHR0aGlzLnJvb3RSb290Rm9sZGVyUGF0aCA9IHBhdGguZGlybmFtZSh0aGlzLnJvb3RGb2xkZXJQYXRoKTtcclxuXHRcdHRoaXMucm9vdFJldFBhdGggXHJcblx0XHRcdD0gcGF0aC5yZWxhdGl2ZSh0aGlzLnJvb3RGb2xkZXJQYXRoLCB0aGlzLnJvb3RGb2xkZXIucmVzb3VyY2VVcmkucGF0aCkucmVwbGFjZSgvXFxcXC9nLFwiL1wiKTtcclxuXHR9XHJcblx0cHVibGljIGV4ZWMobW9kZTpGT1JNQVRfTU9ERSk6c3RyaW5ne1xyXG5cdFx0bGV0IGhlYWRlcjpzdHJpbmc7XHJcblx0XHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xyXG5cdFx0XHRoZWFkZXIgPSBgJHt0aGlzLnJvb3RGb2xkZXJQYXRoLnJlcGxhY2UoL1xcLy9zLCBcIlwiKX0vXFxuYDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGhlYWRlciA9IGAke3RoaXMucm9vdEZvbGRlclBhdGh9L1xcbmA7XHJcblx0XHR9XHJcblx0XHRjb25zdCBmaWxlTnVtOm51bWJlciA9IHRoaXMuZmlsZUl0ZW1zLmxlbmd0aDtcclxuXHRcdGxldCBib2R5OnN0cmluZyA9IFwiXCI7XHJcblx0XHRsZXQgYmVsb3dMaW5lUHJlRml4czpzdHJpbmdbXSA9IFtdO1xyXG5cdFx0Zm9yKGxldCBpbmRleD1maWxlTnVtLTE7IGluZGV4PjA7IGluZGV4LS0pe1xyXG5cdFx0XHRjb25zdCBjdXJyZW50OkZpbGVJdGVtID0gdGhpcy5maWxlSXRlbXNbaW5kZXhdO1xyXG5cdFx0XHRjb25zdCBwYXN0OkZpbGVJdGVtfG51bGwgPSB0aGlzLmZpbGVJdGVtc1tpbmRleC0xXTtcclxuXHRcdFx0Y29uc3QgbmV4dDpGaWxlSXRlbXxudWxsID0gdGhpcy5maWxlSXRlbXNbaW5kZXgrMV07XHJcblxyXG5cdFx0XHRjb25zdCBwYXN0VnNDdXJyOmJvb2xlYW5bXSBcclxuXHRcdFx0PSB0aGlzLnBhdGhFbGVtRGlmZih0aGlzLnJQYXRoKGN1cnJlbnQpLHRoaXMuclBhdGgocGFzdCkpO1xyXG5cdFx0XHRsZXQgY3VyclZzTmV4dDpib29sZWFuW10gPSBbXTtcclxuXHRcdFx0Y29uc3QgZGVwdGg6bnVtYmVyID0gcGFzdFZzQ3Vyci5sZW5ndGgtMTtcclxuXHRcdFx0aWYobmV4dCl7XHJcblx0XHRcdFx0Y3VyclZzTmV4dCA9IHRoaXMucGF0aEVsZW1EaWZmKHRoaXMuclBhdGgoY3VycmVudCksdGhpcy5yUGF0aChuZXh0KSk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdGZvcihsZXQgaT0wO2k8PWRlcHRoO2krKyl7XHJcblx0XHRcdFx0XHRjdXJyVnNOZXh0LnB1c2goZmFsc2UpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRjb25zdCBjdXJyZW50UHJlRml4czpzdHJpbmdbXSA9IFtdO1xyXG5cdFx0XHRjb25zdCBsaW5lOnN0cmluZ1tdID0gW107XHJcblx0XHRcdGZvcihsZXQgZD0wO2Q8PWRlcHRoO2QrKyl7XHJcblx0XHRcdFx0Y29uc3QgVXBwZXI6c3RyaW5nID0gcGFzdFZzQ3VycltkXT09PXRydWU/XCJVXCI6XCJfXCI7XHJcblx0XHRcdFx0Y29uc3QgQm90dG9tOnN0cmluZyA9IGN1cnJWc05leHRbZF09PT10cnVlP1wiQlwiOlwiX1wiO1xyXG5cdFx0XHRcdGNvbnN0IFJpZ2h0OnN0cmluZyA9IChkID09PSBkZXB0aCk/XCJSXCI6XCJfXCI7XHJcblx0XHRcdFx0Y29uc3QgcHJlRml4SWQ6c3RyaW5nPSBgJHtVcHBlcn0ke0JvdHRvbX0ke1JpZ2h0fV9gO1xyXG5cdFx0XHRcdGN1cnJlbnRQcmVGaXhzLnB1c2gocHJlRml4SWQpO1xyXG5cdFx0XHRcdGlmKGluZGV4PT09ZmlsZU51bS0xKXtcclxuXHRcdFx0XHRcdGxpbmUucHVzaChmb3JtYXRTdHJTZXRbbW9kZV1bY3VycmVudFByZUZpeHNbZF1dKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGxldCBwcmVGaXggPSBmb3JtYXRTdHJTZXRbbW9kZV1bY3VycmVudFByZUZpeHNbZF1dO1xyXG5cdFx0XHRcdFx0aWYoYmVsb3dMaW5lUHJlRml4c1tkXSA9PT0gZm9ybWF0U3RyU2V0W21vZGVdW1wiX19fX1wiXSl7XHJcblx0XHRcdFx0XHRcdGlmKChjdXJyZW50UHJlRml4c1tkXSA9PT0gXCJVQl9fXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0cHJlRml4ID0gZm9ybWF0U3RyU2V0W21vZGVdW1wiX19fX1wiXTtcclxuXHRcdFx0XHRcdFx0fWVsc2UgaWYoIChjdXJyZW50UHJlRml4c1tkXSA9PT0gXCJVQlJfXCIpICl7XHJcblx0XHRcdFx0XHRcdFx0cHJlRml4ID0gZm9ybWF0U3RyU2V0W21vZGVdW1wiVV9SX1wiXTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGxpbmUucHVzaChwcmVGaXgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRiZWxvd0xpbmVQcmVGaXhzID0gbGluZTtcclxuXHRcdFx0Ym9keSA9IGxpbmUuam9pbihcIlwiKSArIGN1cnJlbnQubGFiZWwgKyBcIlxcblwiICsgYm9keTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGhlYWRlcitib2R5O1xyXG5cdH1cclxuXHRwcml2YXRlIGdlblByZWZpeElkeChwYXN0OkZpbGVJdGVtLCBjdXJyZW50OkZpbGVJdGVtLCBuZXh0OkZpbGVJdGVtfG51bGwpOnN0cmluZ1tde1xyXG5cdFx0Y29uc3QgcmV0OnN0cmluZ1tdID0gW107XHJcblx0XHRjb25zdCBwYXN0VnNDdXJyOmJvb2xlYW5bXSBcclxuXHRcdD0gdGhpcy5wYXRoRWxlbURpZmYodGhpcy5yUGF0aChjdXJyZW50KSx0aGlzLnJQYXRoKHBhc3QpKTtcclxuXHRcdGxldCBjdXJyVnNOZXh0OmJvb2xlYW5bXSA9IFtdO1xyXG5cdFx0Y29uc3QgZW5kSWR4Om51bWJlciA9IHBhc3RWc0N1cnIubGVuZ3RoLTE7XHJcblx0XHRpZihuZXh0KXtcclxuXHRcdFx0Y3VyclZzTmV4dCA9IHRoaXMucGF0aEVsZW1EaWZmKHRoaXMuclBhdGgoY3VycmVudCksdGhpcy5yUGF0aChuZXh0KSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0Zm9yKGxldCBpPTA7aTw9ZW5kSWR4O2krKyl7XHJcblx0XHRcdFx0Y3VyclZzTmV4dC5wdXNoKGZhbHNlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvcihsZXQgaT0wO2k8PWVuZElkeDtpKyspe1xyXG5cdFx0XHRjb25zdCBVcHBlcjpzdHJpbmcgPSBwYXN0VnNDdXJyW2ldPT09dHJ1ZT9cIlVcIjpcIl9cIjtcclxuXHRcdFx0Y29uc3QgQm90dG9tOnN0cmluZyA9IGN1cnJWc05leHRbaV09PT10cnVlP1wiQlwiOlwiX1wiO1xyXG5cdFx0XHRjb25zdCBSaWdodDpzdHJpbmcgPSAoaSA9PT0gZW5kSWR4KT9cIlJcIjpcIl9cIjtcclxuXHRcdFx0Y29uc3QgcHJlRml4SWQ6c3RyaW5nPSBgJHtVcHBlciArIEJvdHRvbSArIFJpZ2h0fV9gO1xyXG5cdFx0XHRyZXQucHVzaChwcmVGaXhJZCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG5cdHByaXZhdGUgclBhdGgoZmlsZTpGaWxlSXRlbSk6c3RyaW5nIHtcclxuXHRcdHJldHVybiBcIi4vXCIrcGF0aC5yZWxhdGl2ZSh0aGlzLnJvb3RGb2xkZXJQYXRoLCBmaWxlLnJlc291cmNlVXJpLnBhdGgpLnJlcGxhY2UoL1xcXFwvZyxcIi9cIik7XHJcblx0fVxyXG5cdHByaXZhdGUgcGF0aEVsZW1EaWZmKGFQYXRoOnN0cmluZywgYlBhdGg6c3RyaW5nKTpib29sZWFuW117XHJcblx0XHRjb25zdCByZXQ6Ym9vbGVhbltdPVtdO1xyXG5cdFx0Y29uc3QgYUVsZW1zOnN0cmluZ1tdID0gYVBhdGguc3BsaXQoXCIvXCIpO1xyXG5cdFx0Y29uc3QgYkVsZW1zOnN0cmluZ1tdID0gYlBhdGguc3BsaXQoXCIvXCIpO1xyXG5cclxuXHRcdGZvcihsZXQgaT0wO2k8YUVsZW1zLmxlbmd0aC0xO2krKyl7XHJcblx0XHRcdGlmKGJFbGVtc1tpXSl7XHJcblx0XHRcdFx0aWYoYUVsZW1zW2ldID09PSBiRWxlbXNbaV0pe1xyXG5cdFx0XHRcdFx0cmV0LnB1c2godHJ1ZSk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRyZXQucHVzaChmYWxzZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRyZXQucHVzaChmYWxzZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG5cdHByaXZhdGUgY291bnRGb2xkZXJEZXB0aChzdHI6c3RyaW5nKTpudW1iZXJ7XHJcblx0XHRsZXQgcmV0Om51bWJlciA9IDE7XHJcblx0XHRjb25zdCBtOlJlZ0V4cE1hdGNoQXJyYXl8bnVsbCA9IHN0ci5tYXRjaCgvKFxcXFx8XFwvKS9nKTtcclxuXHRcdGlmKG0gIT09IG51bGwpe1xyXG5cdFx0XHRyZXQgKz0gbS5sZW5ndGg7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxufSIsImltcG9ydCAqIGFzIHZzY29kZSBmcm9tICd2c2NvZGUnO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZVRyZWVJdGVtc1Byb3ZpZGVyIGltcGxlbWVudHMgdnNjb2RlLlRyZWVEYXRhUHJvdmlkZXI8RmlsZUl0ZW0+IHtcclxuXHRmaWxlVHJlZTpGaWxlSXRlbVtdIHwgdW5kZWZpbmVkO1xyXG5cdHByaXZhdGUgX29uRGlkQ2hhbmdlVHJlZURhdGE6IHZzY29kZS5FdmVudEVtaXR0ZXI8RmlsZUl0ZW0gfCB1bmRlZmluZWQgfCBudWxsIHwgdm9pZD4gPSBuZXcgdnNjb2RlLkV2ZW50RW1pdHRlcjxGaWxlSXRlbSB8IHVuZGVmaW5lZCB8IG51bGwgfCB2b2lkPigpO1xyXG5cdHJlYWRvbmx5IG9uRGlkQ2hhbmdlVHJlZURhdGE6IHZzY29kZS5FdmVudDxGaWxlSXRlbSB8IHVuZGVmaW5lZCB8IG51bGwgfCB2b2lkPiA9IHRoaXMuX29uRGlkQ2hhbmdlVHJlZURhdGEuZXZlbnQ7XHJcblx0d29ya3NwYWNlUm9vdHM6dnNjb2RlLldvcmtzcGFjZUZvbGRlcltdID0gW107XHJcblxyXG5cdGNvbnN0cnVjdG9yKHdvcmtzcGFjZVJvb3RzOiB2c2NvZGUuV29ya3NwYWNlRm9sZGVyW10pIHsgXHJcblx0XHR0aGlzLndvcmtzcGFjZVJvb3RzID0gd29ya3NwYWNlUm9vdHM7XHJcblx0fVxyXG5cclxuXHRnZXRUcmVlSXRlbShlbGVtZW50OiBGaWxlSXRlbSk6IHZzY29kZS5UcmVlSXRlbSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudDtcclxuXHR9XHJcblxyXG5cdGdldENoaWxkcmVuKGVsZW1lbnQ/OiBGaWxlSXRlbSk6IFRoZW5hYmxlPEZpbGVJdGVtW10+IHtcclxuXHRcdGlmKGVsZW1lbnQgPT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdC8vIGZvciB3b3Jrc3BhY2Ugcm9vdCBjYXNlXHJcblx0XHRcdGNvbnN0IG5ld0ZpbGVDb2xTdGF0ZTp2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlID0gdnNjb2RlLlRyZWVJdGVtQ29sbGFwc2libGVTdGF0ZS5FeHBhbmRlZDtcclxuXHRcdFx0Y29uc3Qgd29ya3NwYWNlUm9vdEZpbGVJdGVtczpGaWxlSXRlbVtdID0gW107XHJcblx0XHRcdGZvciAoY29uc3Qgd3Mgb2YgdGhpcy53b3Jrc3BhY2VSb290cykge1xyXG5cdFx0XHRcdHdvcmtzcGFjZVJvb3RGaWxlSXRlbXMucHVzaChuZXcgRmlsZUl0ZW0oXCIke3dvcmtzcGFjZVJvb3R9IFwiICsgYCgke3dzLm5hbWV9KWAsIHdzLnVyaSwgbmV3RmlsZUNvbFN0YXRlKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0dGhpcy5maWxlVHJlZSA9IHdvcmtzcGFjZVJvb3RGaWxlSXRlbXM7XHJcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUod29ya3NwYWNlUm9vdEZpbGVJdGVtcyk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0Ly8gZm9yIGZvbGRlciBvciBmaWxlIGNhc2VcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKT0+e1xyXG5cdFx0XHRcdHRoaXMuZ2V0RmlsZXMoZWxlbWVudC5yZXNvdXJjZVVyaSkudGhlbigoY2hpbGRyZW46RmlsZUl0ZW1bXSk9PntcclxuXHRcdFx0XHRcdGNoaWxkcmVuID0gdGhpcy5zb3J0RmlsZUl0ZW1zKGNoaWxkcmVuKTtcclxuXHRcdFx0XHRcdGVsZW1lbnQuY2hpbGQgPSBjaGlsZHJlbjtcclxuXHRcdFx0XHRcdHJlc29sdmUoY2hpbGRyZW4pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHRyZWVDbWQocm9vdEVsZW1lbnQ6IEZpbGVJdGVtKTogRmlsZUl0ZW1bXXtcclxuXHRcdGNvbnN0IHJldDpGaWxlSXRlbVtdID0gW3Jvb3RFbGVtZW50XTtcclxuXHJcblx0XHRpZihyb290RWxlbWVudC5jb2xsYXBzaWJsZVN0YXRlID09PSB2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlLkV4cGFuZGVkKXtcclxuXHRcdFx0Ly8gcm9vdOOBi+OCieS4i+OCkuaOoue0ouOBl+OBpuWIl+aMmVxyXG5cdFx0XHRmb3IoY29uc3QgYyBvZiByb290RWxlbWVudC5jaGlsZCl7XHJcblx0XHRcdFx0aWYoKGMuY29sbGFwc2libGVTdGF0ZSA9PT0gdnNjb2RlLlRyZWVJdGVtQ29sbGFwc2libGVTdGF0ZS5FeHBhbmRlZCkgJiZcclxuXHRcdFx0XHRcdChjLmNoaWxkLmxlbmd0aCA+IDApKXtcclxuXHRcdFx0XHRcdC8vIOaKmOOCiuOBn+OBn+OBv+ino+mZpCAmJiDlrZDkvpvjgYzjgYLjgaPjgZ/jgonlho3luLDnmoTjgat0cmVlXHJcblx0XHRcdFx0XHRjb25zdCBhZGQgPSB0aGlzLnRyZWVDbWQoYyk7XHJcblx0XHRcdFx0XHRyZXQucHVzaCguLi5hZGQpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0cmV0LnB1c2goYyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9XHJcblxyXG5cdHJlZnJlc2goKTogdm9pZCB7XHJcblx0XHR0aGlzLl9vbkRpZENoYW5nZVRyZWVEYXRhLmZpcmUoKTtcclxuXHR9XHJcblx0c29ydEZpbGVJdGVtcyhmaWxlSXRlbXM6RmlsZUl0ZW1bXSk6IEZpbGVJdGVtW10ge1xyXG5cdFx0Y29uc3QgZm9sZGVyczpGaWxlSXRlbVtdID0gW107XHJcblx0XHRjb25zdCBmaWxlczpGaWxlSXRlbVtdID0gW107XHJcblx0XHRsZXQgcmV0OkZpbGVJdGVtW10gPSBbXTtcclxuXHRcdC8vIHNlbGVjdCBmb2xkZXIvZmlsZVxyXG5cdFx0ZmlsZUl0ZW1zLmZvckVhY2goKGY6RmlsZUl0ZW0pPT57XHJcblx0XHRcdGNvbnN0IHBhdGggPSBmLnJlc291cmNlVXJpLmZzUGF0aDtcclxuXHRcdFx0aWYoZnMubHN0YXRTeW5jKHBhdGgpLmlzRGlyZWN0b3J5KCkgKXtcclxuXHRcdFx0XHRmb2xkZXJzLnB1c2goZik7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdGZpbGVzLnB1c2goZik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Ly8gc29ydCBmb2xkZXIgZ3JvdXBcclxuXHRcdGZvbGRlcnMuc29ydCgoYTpGaWxlSXRlbSwgYjpGaWxlSXRlbSk9PntcclxuXHRcdFx0cmV0dXJuIGEubGFiZWwubG9jYWxlQ29tcGFyZShiLmxhYmVsKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIHNvcnQgZmlsZSBncm91cFxyXG5cdFx0ZmlsZXMuc29ydCgoYTpGaWxlSXRlbSwgYjpGaWxlSXRlbSk9PntcclxuXHRcdFx0cmV0dXJuIGEubGFiZWwubG9jYWxlQ29tcGFyZShiLmxhYmVsKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIG1lcmdlXHJcblx0XHRyZXQgPSBmb2xkZXJzLmNvbmNhdChmaWxlcyk7XHJcblxyXG5cdFx0cmV0dXJuIHJldDtcclxuXHR9XHJcblx0cHJpdmF0ZSBnZXRGaWxlcyhyb290VXJpOiB2c2NvZGUuVXJpKTogVGhlbmFibGU8RmlsZUl0ZW1bXT57XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpPT57XHJcblx0XHRcdGNvbnN0IGZpbGVJdGVtczpGaWxlSXRlbVtdID0gW107XHJcblx0XHRcclxuXHRcdFx0dnNjb2RlLndvcmtzcGFjZS5mcy5yZWFkRGlyZWN0b3J5KHJvb3RVcmkpLnRoZW4oKHZhbHVlKT0+e1xyXG5cdFx0XHRcdHZhbHVlLmZvckVhY2goKGVudHJ5KT0+e1xyXG5cdFx0XHRcdFx0bGV0IG5ld0ZpbGVOYW1lID0gZW50cnlbMF07XHJcblx0XHRcdFx0XHRjb25zdCBuZXdGaWxlVHlwZTp2c2NvZGUuRmlsZVR5cGUgPSBlbnRyeVsxXTtcclxuXHRcdFx0XHRcdGNvbnN0IG5ld0ZpbGVGdWxsVXJpOnZzY29kZS5VcmkgPSB2c2NvZGUuVXJpLmpvaW5QYXRoKHJvb3RVcmksbmV3RmlsZU5hbWUpO1xyXG5cdFx0XHRcdFx0bGV0IG5ld0ZpbGVDb2xTdGF0ZTp2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlO1xyXG5cdFx0XHRcdFx0aWYobmV3RmlsZVR5cGUgPT09IHZzY29kZS5GaWxlVHlwZS5EaXJlY3Rvcnkpe1xyXG5cdFx0XHRcdFx0XHRuZXdGaWxlQ29sU3RhdGUgPSB2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlLkNvbGxhcHNlZDtcclxuXHRcdFx0XHRcdFx0bmV3RmlsZU5hbWUgKz0gXCIvXCI7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0bmV3RmlsZUNvbFN0YXRlID0gdnNjb2RlLlRyZWVJdGVtQ29sbGFwc2libGVTdGF0ZS5Ob25lO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Y29uc3QgbmV3RmlsZUl0ZW06RmlsZUl0ZW0gPVxyXG5cdFx0XHRcdFx0XHRuZXcgRmlsZUl0ZW0obmV3RmlsZU5hbWUsIG5ld0ZpbGVGdWxsVXJpLCBuZXdGaWxlQ29sU3RhdGUpO1xyXG5cdFx0XHRcdFx0ZmlsZUl0ZW1zLnB1c2gobmV3RmlsZUl0ZW0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJlc29sdmUoZmlsZUl0ZW1zKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0cHJpdmF0ZSBwYXRoRXhpc3RzKHA6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0ZnMuYWNjZXNzU3luYyhwKTtcclxuXHRcdH0gY2F0Y2gge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlSXRlbSBleHRlbmRzIHZzY29kZS5UcmVlSXRlbSB7XHJcblx0cHVibGljIGNoaWxkOkZpbGVJdGVtW10gPSBbXTtcclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHB1YmxpYyByZWFkb25seSBsYWJlbDogc3RyaW5nLCBcclxuXHRcdHB1YmxpYyByZWFkb25seSByZXNvdXJjZVVyaTogdnNjb2RlLlVyaSxcclxuXHRcdHB1YmxpYyBjb2xsYXBzaWJsZVN0YXRlOiB2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlKXtcclxuXHRcdHN1cGVyKGxhYmVsLCBjb2xsYXBzaWJsZVN0YXRlKTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgdnNjb2RlIGZyb20gJ3ZzY29kZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUHJldmlld1BhbmVsTWFuYWdlciB7XHJcblx0cHVibGljIHNob3codHJlZVZpZXdTdHI6IHN0cmluZywgdGl0bGU6IHN0cmluZykge1xyXG5cdFx0Y29uc3QgcGFuZWwgPSB2c2NvZGUud2luZG93LmNyZWF0ZVdlYnZpZXdQYW5lbChcclxuXHRcdFx0J3RyZWVQcmV2aWV3JyxcclxuXHRcdFx0YFRyZWUgZnJvbSBcIiR7dGl0bGV9XCJgLFxyXG5cdFx0XHR2c2NvZGUuVmlld0NvbHVtbi5CZXNpZGUsXHJcblx0XHRcdHt9XHJcblx0XHQpO1xyXG5cclxuXHRcdHBhbmVsLndlYnZpZXcuaHRtbCA9IFByZXZpZXdQYW5lbE1hbmFnZXIucmVuZGVyVHJlZUh0bWwodHJlZVZpZXdTdHIsIHRpdGxlKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgcmVuZGVyVHJlZUh0bWwodHJlZVZpZXdTdHI6IHN0cmluZywgdGl0bGU6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRjb25zdCBlc2NhcGVkVHJlZSA9IFByZXZpZXdQYW5lbE1hbmFnZXIuZXNjYXBlSHRtbCh0cmVlVmlld1N0cik7XHJcblx0XHRjb25zdCBlc2NhcGVkVGl0bGUgPSBQcmV2aWV3UGFuZWxNYW5hZ2VyLmVzY2FwZUh0bWwodGl0bGUpO1xyXG5cdFx0cmV0dXJuIFByZXZpZXdQYW5lbE1hbmFnZXIuYnVpbGRIdG1sKGBUcmVlIGZyb206ICR7ZXNjYXBlZFRpdGxlfWAsIGA8aDM+RmlsZSBUcmVlPC9oMz48cHJlPiR7ZXNjYXBlZFRyZWV9PC9wcmU+YCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIGJ1aWxkSHRtbCh0aXRsZTogc3RyaW5nLCBib2R5SW5uZXI6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gYDwhRE9DVFlQRSBodG1sPlxyXG48aHRtbCBsYW5nPVwiZW5cIj5cclxuPGhlYWQ+XHJcbjxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XHJcbjxtZXRhIGh0dHAtZXF1aXY9XCJDb250ZW50LVNlY3VyaXR5LVBvbGljeVwiIGNvbnRlbnQ9XCJkZWZhdWx0LXNyYyAnbm9uZSc7IHN0eWxlLXNyYyAndW5zYWZlLWlubGluZSc7XCI+XHJcbjxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsaW5pdGlhbC1zY2FsZT0xXCIgLz5cclxuPHRpdGxlPiR7dGl0bGV9PC90aXRsZT5cclxuPHN0eWxlPlxyXG5ib2R5e2ZvbnQtZmFtaWx5OnZhcigtLXZzY29kZS1mb250LWZhbWlseSxBcmlhbCk7cGFkZGluZzoxMnB4O2xpbmUtaGVpZ2h0OjEuNDt9XHJcbnByZXtiYWNrZ3JvdW5kOnZhcigtLXZzY29kZS1lZGl0b3ItYmFja2dyb3VuZCwjMWUxZTFlKTtjb2xvcjp2YXIoLS12c2NvZGUtZWRpdG9yLWZvcmVncm91bmQsI2Q0ZDRkNCk7cGFkZGluZzo4cHggMTBweDtib3JkZXItcmFkaXVzOjRweDtvdmVyZmxvdzphdXRvO2ZvbnQtc2l6ZToxMnB4O31cclxuY29kZXtmb250LWZhbWlseTp2YXIoLS12c2NvZGUtZWRpdG9yLWZvbnQtZmFtaWx5LENvbnNvbGFzLG1vbm9zcGFjZSk7fVxyXG5oM3ttYXJnaW4tdG9wOjA7fVxyXG48L3N0eWxlPlxyXG48L2hlYWQ+XHJcbjxib2R5PlxyXG4ke2JvZHlJbm5lcn1cclxuPC9ib2R5PlxyXG48L2h0bWw+YDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgZXNjYXBlSHRtbChzcmM6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gc3JjXHJcblx0XHRcdC5yZXBsYWNlKC8mL2csICcmYW1wOycpXHJcblx0XHRcdC5yZXBsYWNlKC88L2csICcmbHQ7JylcclxuXHRcdFx0LnJlcGxhY2UoLz4vZywgJyZndDsnKVxyXG5cdFx0XHQucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xyXG5cdH1cclxufSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInZzY29kZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGV4aXN0cyAoZGV2ZWxvcG1lbnQgb25seSlcblx0aWYgKF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IEZpbGVUcmVlRm9ybWF0dGVyLCBGT1JNQVRfTU9ERSB9IGZyb20gJy4vZm9ybWF0dGVyL2ZpbGVUcmVlRm9ybWF0dGVyJztcclxuaW1wb3J0ICogYXMgdnNjb2RlIGZyb20gJ3ZzY29kZSc7XHJcbmltcG9ydCB7IEZpbGVUcmVlSXRlbXNQcm92aWRlciwgRmlsZUl0ZW0gfSBmcm9tICcuL3Byb3ZpZGVyL2ZpbGVJdGVtUHJvdmlkZXInO1xyXG5pbXBvcnQge1ByZXZpZXdQYW5lbE1hbmFnZXJ9IGZyb20gJy4vdmlldy9wcmV2aWV3UGFuZWxNYW5hZ2VyJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShjb250ZXh0OiB2c2NvZGUuRXh0ZW5zaW9uQ29udGV4dCkge1xyXG5cdGxldCBmaWxlVHJlZUl0ZW1zUHJvdmlkZXI6IEZpbGVUcmVlSXRlbXNQcm92aWRlciB8IG51bGwgPSBudWxsO1xyXG5cdGxldCBmaWxlVHJlZVZpZXc6IHZzY29kZS5UcmVlVmlldzxGaWxlSXRlbT47XHJcblxyXG5cdC8vIGdldCB3b3Jrc3BhY2UgZm9sZGVyc1xyXG5cdGNvbnN0IHdvcmtzcGFjZUZvbGRlcnM6IHZzY29kZS5Xb3Jrc3BhY2VGb2xkZXJbXSB8IHVuZGVmaW5lZCBcclxuXHRcdD0gdnNjb2RlLndvcmtzcGFjZS53b3Jrc3BhY2VGb2xkZXJzIGFzIHZzY29kZS5Xb3Jrc3BhY2VGb2xkZXJbXSB8IHVuZGVmaW5lZDtcclxuXHJcblx0Ly8gQ3JlYXRlIFRyZWUgVmlldyBVSSBDb21wb25lbnRzXHJcblx0aWYgKHdvcmtzcGFjZUZvbGRlcnMpIHtcclxuXHRcdC8vIGlmIGV4aXN0IHdvcmtzcGFjZSwgc2hvdyBhIGZpbGUgdHJlZSBpdGVtXHJcblx0XHRmaWxlVHJlZUl0ZW1zUHJvdmlkZXIgPSBuZXcgRmlsZVRyZWVJdGVtc1Byb3ZpZGVyKHdvcmtzcGFjZUZvbGRlcnMpO1xyXG5cdFx0ZmlsZVRyZWVWaWV3ID0gdnNjb2RlLndpbmRvdy5jcmVhdGVUcmVlVmlldygnZmlsZVRyZWUnLCB7XHRcclxuXHRcdFx0c2hvd0NvbGxhcHNlQWxsOmZhbHNlLFxyXG5cdFx0XHR0cmVlRGF0YVByb3ZpZGVyOiBmaWxlVHJlZUl0ZW1zUHJvdmlkZXJcclxuXHRcdH0pO1xyXG5cdFx0ZmlsZVRyZWVWaWV3Lm9uRGlkQ29sbGFwc2VFbGVtZW50KChlOiB2c2NvZGUuVHJlZVZpZXdFeHBhbnNpb25FdmVudDxGaWxlSXRlbT4pID0+IHtcclxuXHRcdFx0ZS5lbGVtZW50LmNvbGxhcHNpYmxlU3RhdGUgPSB2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlLkNvbGxhcHNlZDtcclxuXHRcdH0pO1xyXG5cdFx0ZmlsZVRyZWVWaWV3Lm9uRGlkRXhwYW5kRWxlbWVudCgoZTogdnNjb2RlLlRyZWVWaWV3RXhwYW5zaW9uRXZlbnQ8RmlsZUl0ZW0+KSA9PiB7XHJcblx0XHRcdGUuZWxlbWVudC5jb2xsYXBzaWJsZVN0YXRlID0gdnNjb2RlLlRyZWVJdGVtQ29sbGFwc2libGVTdGF0ZS5FeHBhbmRlZDtcclxuXHRcdH0pO1x0XHJcblx0fVxyXG5cclxuXHQvLyBBZGQgYHRyZWVgIGNtZCB0byBzaG93IHRyZWUgdmlldyBpbiB2c2NvZGVcclxuXHRsZXQgZGlzcG9zYWJsZSA9IHZzY29kZS5jb21tYW5kcy5yZWdpc3RlckNvbW1hbmQoJ3RyZWUuY21kJywgKGZpbGVJdGVtOiBGaWxlSXRlbSkgPT4ge1xyXG5cdFx0aWYgKGZpbGVUcmVlSXRlbXNQcm92aWRlcikge1xyXG5cdFx0XHRjb25zdCByZXQ6IEZpbGVJdGVtW10gPSBmaWxlVHJlZUl0ZW1zUHJvdmlkZXIudHJlZUNtZChmaWxlSXRlbSk7XHJcblx0XHRcdGNvbnN0IHRyZWVWaWV3U3RyOnN0cmluZyA9IG5ldyBGaWxlVHJlZUZvcm1hdHRlcihyZXQpLmV4ZWMoRk9STUFUX01PREUuS0VJU0VOKTtcclxuXHJcblx0XHRcdC8vIHNob3cgdHJlZSB2aWV3XHJcblx0XHRcdGNvbnN0IGNvbmZpZyA9IHZzY29kZS53b3Jrc3BhY2UuZ2V0Q29uZmlndXJhdGlvbigpO1xyXG5cdFx0XHRpZiAoY29uZmlnKSB7XHJcblx0XHRcdFx0Y29uc3Qgdmlld1R5cGUgPSBjb25maWcuZ2V0PHN0cmluZz4oXCJ0cmVlLnZpZXctdHlwZVwiKTtcclxuXHRcdFx0XHRzd2l0Y2ggKHZpZXdUeXBlKSB7XHJcblx0XHRcdFx0XHRjYXNlIFwiVGV4dEVkaXRvclwiOlxyXG5cdFx0XHRcdFx0XHR2c2NvZGUuY29tbWFuZHMuZXhlY3V0ZUNvbW1hbmQoXCJ3b3JrYmVuY2guYWN0aW9uLmZpbGVzLm5ld1VudGl0bGVkRmlsZVwiKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRzaG93VHJlZVZpZXdUZXh0RWRpdG9yKHRyZWVWaWV3U3RyLnRyaW1FbmQoKSwgZmlsZUl0ZW0ucmVzb3VyY2VVcmkuZnNQYXRoKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBcIldlYlZpZXdQYW5lbFwiOlxyXG5cdFx0XHRcdFx0XHRuZXcgUHJldmlld1BhbmVsTWFuYWdlcigpLnNob3codHJlZVZpZXdTdHIsIGZpbGVJdGVtLnJlc291cmNlVXJpLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRcdG5ldyBQcmV2aWV3UGFuZWxNYW5hZ2VyKCkuc2hvdyh0cmVlVmlld1N0ciwgZmlsZUl0ZW0ucmVzb3VyY2VVcmkucGF0aCk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRuZXcgUHJldmlld1BhbmVsTWFuYWdlcigpLnNob3codHJlZVZpZXdTdHIsIGZpbGVJdGVtLnJlc291cmNlVXJpLnBhdGgpO1xyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2c2NvZGUud2luZG93LnNob3dJbmZvcm1hdGlvbk1lc3NhZ2UoJ09wZW4gYSBmb2xkZXIgb3Igd29ya3NwYWNlIHRvIHVzZSBUcmVlIHZpZXcuJyk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0Y29udGV4dC5zdWJzY3JpcHRpb25zLnB1c2goZGlzcG9zYWJsZSk7XHJcblxyXG5cdC8vIGFkZCByZWZyZXNoIGNtZFxyXG5cdGRpc3Bvc2FibGUgPSB2c2NvZGUuY29tbWFuZHMucmVnaXN0ZXJDb21tYW5kKCd0cmVlLnJlZnJlc2hFbnRyeScsICgpID0+XHJcblx0XHRmaWxlVHJlZUl0ZW1zUHJvdmlkZXI/LnJlZnJlc2goKVxyXG5cdCk7XHJcblx0Y29udGV4dC5zdWJzY3JpcHRpb25zLnB1c2goZGlzcG9zYWJsZSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUcmVlVmlld1RleHRFZGl0b3IodHJlZVZpZXdTdHI6IHN0cmluZywgcm9vdFBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG5cdGNvbnN0IGVkaXRvciA9IHZzY29kZS53aW5kb3cuYWN0aXZlVGV4dEVkaXRvcjtcclxuXHRjb25zdCBkb2MgPSBlZGl0b3I/LmRvY3VtZW50O1xyXG5cdGlmIChkb2MpIHtcclxuXHRcdHZzY29kZS5sYW5ndWFnZXMuc2V0VGV4dERvY3VtZW50TGFuZ3VhZ2UoZG9jLCBcIm1hcmtkb3duXCIpO1xyXG5cdFx0dnNjb2RlLndpbmRvdy5hY3RpdmVUZXh0RWRpdG9yPy5lZGl0KChlZGl0QnVpbGRlcikgPT4ge1xyXG5cdFx0XHRjb25zdCBzdGFydFBvcyA9IG5ldyB2c2NvZGUuUG9zaXRpb24oMCwgMCk7XHJcblx0XHRcdGNvbnN0IG1kVHh0OiBzdHJpbmcgPSBgIyBUcmVlIFZpZXdcclxuIyMgUm9vdCBwYXRoOiBcclxuJHtyb290UGF0aH1cclxuXHJcbiMjIENvbnRlbnRcclxuXFxgXFxgXFxgYmFzaFxyXG4ke3RyZWVWaWV3U3RyfVxyXG5cXGBcXGBcXGBcclxuYDtcclxuXHRcdFx0ZWRpdEJ1aWxkZXIuaW5zZXJ0KHN0YXJ0UG9zLCBtZFR4dCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0cmV0dXJuO1xyXG59XHJcblxyXG4vLyB0aGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiB5b3VyIGV4dGVuc2lvbiBpcyBkZWFjdGl2YXRlZFxyXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHsgfVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=