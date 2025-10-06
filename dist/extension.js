/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/formatter/fileTreeFormatter.ts":
/*!********************************************!*\
  !*** ./src/formatter/fileTreeFormatter.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


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
let formatStrSet = [
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
        let fileNum = this.fileItems.length;
        let body = "";
        let belowLinePreFixs = [];
        for (let index = fileNum - 1; index > 0; index--) {
            let current = this.fileItems[index];
            let past = this.fileItems[index - 1];
            let next = this.fileItems[index + 1];
            let pastVsCurr = this.pathElemDiff(this.rPath(current), this.rPath(past));
            let currVsNext = [];
            let depth = pastVsCurr.length - 1;
            if (next) {
                currVsNext = this.pathElemDiff(this.rPath(current), this.rPath(next));
            }
            else {
                for (let i = 0; i <= depth; i++) {
                    currVsNext.push(false);
                }
            }
            let currentPreFixs = [];
            let line = [];
            for (let d = 0; d <= depth; d++) {
                let Upper = pastVsCurr[d] === true ? "U" : "_";
                let Bottom = currVsNext[d] === true ? "B" : "_";
                let Right = (d === depth) ? "R" : "_";
                let preFixId = `${Upper}${Bottom}${Right}_`;
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
        let ret = [];
        let pastVsCurr = this.pathElemDiff(this.rPath(current), this.rPath(past));
        let currVsNext = [];
        let endIdx = pastVsCurr.length - 1;
        if (next) {
            currVsNext = this.pathElemDiff(this.rPath(current), this.rPath(next));
        }
        else {
            for (let i = 0; i <= endIdx; i++) {
                currVsNext.push(false);
            }
        }
        for (let i = 0; i <= endIdx; i++) {
            let Upper = pastVsCurr[i] === true ? "U" : "_";
            let Bottom = currVsNext[i] === true ? "B" : "_";
            let Right = (i === endIdx) ? "R" : "_";
            let preFixId = `${Upper + Bottom + Right}_`;
            ret.push(preFixId);
        }
        return ret;
    }
    rPath(file) {
        return "./" + path.relative(this.rootFolderPath, file.resourceUri.path).replace(/\\/g, "/");
    }
    pathElemDiff(aPath, bPath) {
        let ret = [];
        let aElems = aPath.split("/");
        let bElems = bPath.split("/");
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
        let m = str.match(/(\\|\/)/g);
        if (m !== null) {
            ret += m.length;
        }
        return ret;
    }
}
exports.FileTreeFormatter = FileTreeFormatter;


/***/ }),

/***/ "./src/provider/fileItemProvider.ts":
/*!******************************************!*\
  !*** ./src/provider/fileItemProvider.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


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
            let newFileColState = vscode.TreeItemCollapsibleState.Expanded;
            let workspaceRootFileItems = [];
            for (let ws of this.workspaceRoots) {
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
        let ret = [rootElement];
        if (rootElement.collapsibleState === vscode.TreeItemCollapsibleState.Expanded) {
            // rootから下を探索して列挙
            for (let c of rootElement.child) {
                if ((c.collapsibleState === vscode.TreeItemCollapsibleState.Expanded) &&
                    (c.child.length > 0)) {
                    // 折りたたみ解除 && 子供があったら再帰的にtree
                    let add = this.treeCmd(c);
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
        let folders = [];
        let files = [];
        let ret = [];
        // select folder/file
        fileItems.forEach((f) => {
            let path = f.resourceUri.fsPath;
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
            let fileItems = [];
            vscode.workspace.fs.readDirectory(rootUri).then((value) => {
                value.forEach((value, index, array) => {
                    let newFileName = value[0];
                    let newFileType = value[1];
                    let newFileFullUri = vscode.Uri.joinPath(rootUri, newFileName);
                    let newFileColState;
                    if (newFileType === vscode.FileType.Directory) {
                        newFileColState = vscode.TreeItemCollapsibleState.Collapsed;
                        newFileName += "/";
                    }
                    else {
                        newFileColState = vscode.TreeItemCollapsibleState.None;
                    }
                    let newFileItem = new FileItem(newFileName, newFileFullUri, newFileColState);
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
        catch (err) {
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


/***/ }),

/***/ "./src/view/previewPanelManager.ts":
/*!*****************************************!*\
  !*** ./src/view/previewPanelManager.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PreviewPanelManager = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
class PreviewPanelManager {
    show(treeViewStr, title) {
        const panel = vscode.window.createWebviewPanel('treePreview', `Tree from "${title}"`, vscode.ViewColumn.Beside, {});
        const escaped = this.escapeHtml(treeViewStr);
        panel.webview.html = this.buildHtml(`Tree from: ${this.escapeHtml(title)}`, `<h3>File Tree</h3><pre>${escaped}</pre>`);
    }
    buildHtml(title, bodyInner) {
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
    escapeHtml(src) {
        return src
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}
exports.PreviewPanelManager = PreviewPanelManager;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("vscode");

/***/ })

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
    let workspaceFolders = vscode.workspace.workspaceFolders;
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
            let ret = fileTreeItemsProvider.treeCmd(fileItem);
            let treeViewStr = new fileTreeFormatter_1.FileTreeFormatter(ret).exec(fileTreeFormatter_1.FORMAT_MODE.KEISEN);
            // show tree view
            let config = vscode.workspace.getConfiguration();
            if (config?.get("tree.view-type") === "TextEditor") {
                vscode.commands.executeCommand("workbench.action.files.newUntitledFile").then(() => {
                    showTreeViewTextEditor(treeViewStr.trimEnd(), fileItem.resourceUri.fsPath);
                });
            }
            else if (config?.get("tree.view-type") === "WebViewPanel") {
                new previewPanelManager_1.PreviewPanelManager().show(treeViewStr, fileItem.resourceUri.path);
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
    let editor = vscode.window.activeTextEditor;
    let doc = editor?.document;
    if (doc) {
        vscode.languages.setTextDocumentLanguage(doc, "markdown");
        vscode.window.activeTextEditor?.edit((editBuilder) => {
            let startPos = new vscode.Position(0, 0);
            let mdTxt = `# Tree View
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxDQUFDO1lBQ3pDLElBQUksS0FBSyxHQUFXOztFQUVyQixRQUFROzs7O0VBSVIsV0FBVzs7Q0FFWixDQUFDO1lBQ0MsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBQ0QsT0FBTztBQUNSLENBQUM7QUFFRCwyREFBMkQ7QUFDM0QsU0FBZ0IsVUFBVSxLQUFLLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90cmVlLy4vc3JjL2Zvcm1hdHRlci9maWxlVHJlZUZvcm1hdHRlci50cyIsIndlYnBhY2s6Ly90cmVlLy4vc3JjL3Byb3ZpZGVyL2ZpbGVJdGVtUHJvdmlkZXIudHMiLCJ3ZWJwYWNrOi8vdHJlZS8uL3NyYy92aWV3L3ByZXZpZXdQYW5lbE1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vdHJlZS9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwiZnNcIiIsIndlYnBhY2s6Ly90cmVlL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vdHJlZS9leHRlcm5hbCBjb21tb25qcyBcInZzY29kZVwiIiwid2VicGFjazovL3RyZWUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHJlZS8uL3NyYy9leHRlbnNpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uICovXHJcbmltcG9ydCB7RmlsZUl0ZW19IGZyb20gJy4uL3Byb3ZpZGVyL2ZpbGVJdGVtUHJvdmlkZXInO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuZXhwb3J0IGVudW0gRk9STUFUX01PREV7XHJcblx0VEFCID0gMCxcclxuXHRMSU5FLFxyXG5cdEtFSVNFTixcclxuXHROVU1cclxufVxyXG5cclxuaW50ZXJmYWNlIFN0cmluZ01hcCB7IFtrZXk6IHN0cmluZ106IHN0cmluZzsgfVxyXG5cclxubGV0IGZvcm1hdFN0clNldDpTdHJpbmdNYXBbXSA9IFtcclxuXHQvLyBmb3IgVEFCIG1vZGVcclxuXHR7XHJcblx0XHRVX19fOlwiICAgIFwiLFxyXG5cdFx0VUJfXzpcIiAgICBcIixcclxuXHRcdFVfUl86XCIgICAgXCIsXHJcblx0XHRVQlJfOlwiICAgIFwiLFxyXG5cdFx0X19fXzpcIiAgICBcIlxyXG5cdH0sXHJcblx0Ly8gTElORSBtb2RlXHJcblx0e1xyXG5cdFx0VV9fXzpcIiAgICBcIixcclxuXHRcdFVCX186XCJ8ICAgXCIsXHJcblx0XHRVX1JfOlwiIGAtLVwiLFxyXG5cdFx0VUJSXzpcInxgLS1cIixcclxuXHRcdF9fX186XCIgICAgXCJcclxuXHR9LFxyXG5cdC8vIGtlaXNlbiBtb2RlXHJcblx0e1xyXG5cdFx0VV9fXzpcIuOAgOOAgFwiLFxyXG5cdFx0VUJfXzpcIuKUguOAgFwiLFxyXG5cdFx0VV9SXzpcIuKUlOKUgFwiLFxyXG5cdFx0VUJSXzpcIuKUnOKUgFwiLFxyXG5cdFx0X19fXzpcIuOAgOOAgFwiXHJcblx0fVxyXG5dO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVUcmVlRm9ybWF0dGVye1xyXG5cdGZpbGVJdGVtczpGaWxlSXRlbVtdO1xyXG5cdHJvb3RGb2xkZXI6RmlsZUl0ZW07XHJcblx0cm9vdEZvbGRlclBhdGg6c3RyaW5nO1xyXG5cdHJvb3RSb290Rm9sZGVyUGF0aDpzdHJpbmc7XHJcblx0cm9vdFJldFBhdGg6c3RyaW5nIDtcclxuXHRjb25zdHJ1Y3RvcihmaWxlSXRlbXM6RmlsZUl0ZW1bXSl7XHJcblx0XHR0aGlzLmZpbGVJdGVtcyA9IGZpbGVJdGVtcztcclxuXHRcdHRoaXMucm9vdEZvbGRlciA9IGZpbGVJdGVtc1swXTtcdFx0XHJcblx0XHR0aGlzLnJvb3RGb2xkZXJQYXRoID0gdGhpcy5yb290Rm9sZGVyLnJlc291cmNlVXJpLnBhdGg7XHJcblx0XHR0aGlzLnJvb3RSb290Rm9sZGVyUGF0aCA9IHBhdGguZGlybmFtZSh0aGlzLnJvb3RGb2xkZXJQYXRoKTtcclxuXHRcdHRoaXMucm9vdFJldFBhdGggXHJcblx0XHRcdD0gcGF0aC5yZWxhdGl2ZSh0aGlzLnJvb3RGb2xkZXJQYXRoLCB0aGlzLnJvb3RGb2xkZXIucmVzb3VyY2VVcmkucGF0aCkucmVwbGFjZSgvXFxcXC9nLFwiL1wiKTtcclxuXHR9XHJcblx0cHVibGljIGV4ZWMobW9kZTpGT1JNQVRfTU9ERSk6c3RyaW5ne1xyXG5cdFx0bGV0IGhlYWRlcjpzdHJpbmc7XHJcblx0XHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xyXG5cdFx0XHRoZWFkZXIgPSBgJHt0aGlzLnJvb3RGb2xkZXJQYXRoLnJlcGxhY2UoL1xcLy9zLCBcIlwiKX0vXFxuYDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGhlYWRlciA9IGAke3RoaXMucm9vdEZvbGRlclBhdGh9L1xcbmA7XHJcblx0XHR9XHJcblx0XHRsZXQgZmlsZU51bTpudW1iZXIgPSB0aGlzLmZpbGVJdGVtcy5sZW5ndGg7XHJcblx0XHRsZXQgYm9keTpzdHJpbmcgPSBcIlwiO1xyXG5cdFx0bGV0IGJlbG93TGluZVByZUZpeHM6c3RyaW5nW10gPSBbXTtcclxuXHRcdGZvcihsZXQgaW5kZXg9ZmlsZU51bS0xOyBpbmRleD4wOyBpbmRleC0tKXtcclxuXHRcdFx0bGV0IGN1cnJlbnQ6RmlsZUl0ZW0gPSB0aGlzLmZpbGVJdGVtc1tpbmRleF07XHJcblx0XHRcdGxldCBwYXN0OkZpbGVJdGVtfG51bGwgPSB0aGlzLmZpbGVJdGVtc1tpbmRleC0xXTtcclxuXHRcdFx0bGV0IG5leHQ6RmlsZUl0ZW18bnVsbCA9IHRoaXMuZmlsZUl0ZW1zW2luZGV4KzFdO1xyXG5cclxuXHRcdFx0bGV0IHBhc3RWc0N1cnI6Ym9vbGVhbltdIFxyXG5cdFx0XHQ9IHRoaXMucGF0aEVsZW1EaWZmKHRoaXMuclBhdGgoY3VycmVudCksdGhpcy5yUGF0aChwYXN0KSk7XHJcblx0XHRcdGxldCBjdXJyVnNOZXh0OmJvb2xlYW5bXSA9IFtdO1xyXG5cdFx0XHRsZXQgZGVwdGg6bnVtYmVyID0gcGFzdFZzQ3Vyci5sZW5ndGgtMTtcclxuXHRcdFx0aWYobmV4dCl7XHJcblx0XHRcdFx0Y3VyclZzTmV4dCA9IHRoaXMucGF0aEVsZW1EaWZmKHRoaXMuclBhdGgoY3VycmVudCksdGhpcy5yUGF0aChuZXh0KSk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdGZvcihsZXQgaT0wO2k8PWRlcHRoO2krKyl7XHJcblx0XHRcdFx0XHRjdXJyVnNOZXh0LnB1c2goZmFsc2UpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRsZXQgY3VycmVudFByZUZpeHM6c3RyaW5nW10gPSBbXTtcclxuXHRcdFx0bGV0IGxpbmU6c3RyaW5nW10gPSBbXTtcclxuXHRcdFx0Zm9yKGxldCBkPTA7ZDw9ZGVwdGg7ZCsrKXtcclxuXHRcdFx0XHRsZXQgVXBwZXI6c3RyaW5nID0gcGFzdFZzQ3VycltkXT09PXRydWU/XCJVXCI6XCJfXCI7XHJcblx0XHRcdFx0bGV0IEJvdHRvbTpzdHJpbmcgPSBjdXJyVnNOZXh0W2RdPT09dHJ1ZT9cIkJcIjpcIl9cIjtcclxuXHRcdFx0XHRsZXQgUmlnaHQ6U3RyaW5nID0gKGQgPT09IGRlcHRoKT9cIlJcIjpcIl9cIjtcclxuXHRcdFx0XHRsZXQgcHJlRml4SWQ6c3RyaW5nPSBgJHtVcHBlcn0ke0JvdHRvbX0ke1JpZ2h0fV9gO1xyXG5cdFx0XHRcdGN1cnJlbnRQcmVGaXhzLnB1c2gocHJlRml4SWQpO1xyXG5cdFx0XHRcdGlmKGluZGV4PT09ZmlsZU51bS0xKXtcclxuXHRcdFx0XHRcdGxpbmUucHVzaChmb3JtYXRTdHJTZXRbbW9kZV1bY3VycmVudFByZUZpeHNbZF1dKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGxldCBwcmVGaXggPSBmb3JtYXRTdHJTZXRbbW9kZV1bY3VycmVudFByZUZpeHNbZF1dO1xyXG5cdFx0XHRcdFx0aWYoYmVsb3dMaW5lUHJlRml4c1tkXSA9PT0gZm9ybWF0U3RyU2V0W21vZGVdW1wiX19fX1wiXSl7XHJcblx0XHRcdFx0XHRcdGlmKChjdXJyZW50UHJlRml4c1tkXSA9PT0gXCJVQl9fXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0cHJlRml4ID0gZm9ybWF0U3RyU2V0W21vZGVdW1wiX19fX1wiXTtcclxuXHRcdFx0XHRcdFx0fWVsc2VcclxuXHRcdFx0XHRcdFx0aWYoIChjdXJyZW50UHJlRml4c1tkXSA9PT0gXCJVQlJfXCIpICl7XHJcblx0XHRcdFx0XHRcdFx0cHJlRml4ID0gZm9ybWF0U3RyU2V0W21vZGVdW1wiVV9SX1wiXTtcclxuXHRcdFx0XHRcdFx0fWVsc2VcclxuXHRcdFx0XHRcdFx0aWYoIChjdXJyZW50UHJlRml4c1tkXSA9PT0gXCJVQlJfXCIpICl7XHJcblx0XHRcdFx0XHRcdFx0cHJlRml4ID0gZm9ybWF0U3RyU2V0W21vZGVdW1wiVV9SX1wiXTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGxpbmUucHVzaChwcmVGaXgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRiZWxvd0xpbmVQcmVGaXhzID0gbGluZTtcclxuXHRcdFx0Ym9keSA9IGxpbmUuam9pbihcIlwiKSArIGN1cnJlbnQubGFiZWwgKyBcIlxcblwiICsgYm9keTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGhlYWRlcitib2R5O1xyXG5cdH1cclxuXHRwcml2YXRlIGdlblByZWZpeElkeChwYXN0OkZpbGVJdGVtLCBjdXJyZW50OkZpbGVJdGVtLCBuZXh0OkZpbGVJdGVtfG51bGwpOnN0cmluZ1tde1xyXG5cdFx0bGV0IHJldDpzdHJpbmdbXSA9IFtdO1xyXG5cdFx0bGV0IHBhc3RWc0N1cnI6Ym9vbGVhbltdIFxyXG5cdFx0PSB0aGlzLnBhdGhFbGVtRGlmZih0aGlzLnJQYXRoKGN1cnJlbnQpLHRoaXMuclBhdGgocGFzdCkpO1xyXG5cdFx0bGV0IGN1cnJWc05leHQ6Ym9vbGVhbltdID0gW107XHJcblx0XHRsZXQgZW5kSWR4Om51bWJlciA9IHBhc3RWc0N1cnIubGVuZ3RoLTE7XHJcblx0XHRpZihuZXh0KXtcclxuXHRcdFx0Y3VyclZzTmV4dCA9IHRoaXMucGF0aEVsZW1EaWZmKHRoaXMuclBhdGgoY3VycmVudCksdGhpcy5yUGF0aChuZXh0KSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0Zm9yKGxldCBpPTA7aTw9ZW5kSWR4O2krKyl7XHJcblx0XHRcdFx0Y3VyclZzTmV4dC5wdXNoKGZhbHNlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvcihsZXQgaT0wO2k8PWVuZElkeDtpKyspe1xyXG5cdFx0XHRsZXQgVXBwZXI6c3RyaW5nID0gcGFzdFZzQ3VycltpXT09PXRydWU/XCJVXCI6XCJfXCI7XHJcblx0XHRcdGxldCBCb3R0b206c3RyaW5nID0gY3VyclZzTmV4dFtpXT09PXRydWU/XCJCXCI6XCJfXCI7XHJcblx0XHRcdGxldCBSaWdodDpTdHJpbmcgPSAoaSA9PT0gZW5kSWR4KT9cIlJcIjpcIl9cIjtcclxuXHRcdFx0bGV0IHByZUZpeElkOnN0cmluZz0gYCR7VXBwZXIgKyBCb3R0b20gKyBSaWdodH1fYDtcclxuXHRcdFx0cmV0LnB1c2gocHJlRml4SWQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxuXHRwcml2YXRlIHJQYXRoKGZpbGU6RmlsZUl0ZW0pOnN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCIuL1wiK3BhdGgucmVsYXRpdmUodGhpcy5yb290Rm9sZGVyUGF0aCwgZmlsZS5yZXNvdXJjZVVyaS5wYXRoKS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpO1xyXG5cdH1cclxuXHRwcml2YXRlIHBhdGhFbGVtRGlmZihhUGF0aDpzdHJpbmcsIGJQYXRoOnN0cmluZyk6Ym9vbGVhbltde1xyXG5cdFx0bGV0IHJldDpib29sZWFuW109W107XHJcblx0XHRsZXQgYUVsZW1zOnN0cmluZ1tdID0gYVBhdGguc3BsaXQoXCIvXCIpO1xyXG5cdFx0bGV0IGJFbGVtczpzdHJpbmdbXSA9IGJQYXRoLnNwbGl0KFwiL1wiKTtcclxuXHJcblx0XHRmb3IobGV0IGk9MDtpPGFFbGVtcy5sZW5ndGgtMTtpKyspe1xyXG5cdFx0XHRpZihiRWxlbXNbaV0pe1xyXG5cdFx0XHRcdGlmKGFFbGVtc1tpXSA9PT0gYkVsZW1zW2ldKXtcclxuXHRcdFx0XHRcdHJldC5wdXNoKHRydWUpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0cmV0LnB1c2goZmFsc2UpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0cmV0LnB1c2goZmFsc2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxuXHRwcml2YXRlIGNvdW50Rm9sZGVyRGVwdGgoc3RyOnN0cmluZyk6bnVtYmVye1xyXG5cdFx0bGV0IHJldDpudW1iZXIgPSAxO1xyXG5cdFx0bGV0IG06UmVnRXhwTWF0Y2hBcnJheXxudWxsID0gc3RyLm1hdGNoKC8oXFxcXHxcXC8pL2cpO1xyXG5cdFx0aWYobSAhPT0gbnVsbCl7XHJcblx0XHRcdHJldCArPSBtLmxlbmd0aDtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXQ7XHJcblx0fVxyXG59IiwiaW1wb3J0ICogYXMgdnNjb2RlIGZyb20gJ3ZzY29kZSc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlVHJlZUl0ZW1zUHJvdmlkZXIgaW1wbGVtZW50cyB2c2NvZGUuVHJlZURhdGFQcm92aWRlcjxGaWxlSXRlbT4ge1xyXG5cdGZpbGVUcmVlOkZpbGVJdGVtW10gfCB1bmRlZmluZWQ7XHJcblx0cHJpdmF0ZSBfb25EaWRDaGFuZ2VUcmVlRGF0YTogdnNjb2RlLkV2ZW50RW1pdHRlcjxGaWxlSXRlbSB8IHVuZGVmaW5lZCB8IG51bGwgfCB2b2lkPiA9IG5ldyB2c2NvZGUuRXZlbnRFbWl0dGVyPEZpbGVJdGVtIHwgdW5kZWZpbmVkIHwgbnVsbCB8IHZvaWQ+KCk7XHJcblx0cmVhZG9ubHkgb25EaWRDaGFuZ2VUcmVlRGF0YTogdnNjb2RlLkV2ZW50PEZpbGVJdGVtIHwgdW5kZWZpbmVkIHwgbnVsbCB8IHZvaWQ+ID0gdGhpcy5fb25EaWRDaGFuZ2VUcmVlRGF0YS5ldmVudDtcclxuXHR3b3Jrc3BhY2VSb290czp2c2NvZGUuV29ya3NwYWNlRm9sZGVyW10gPSBbXTtcclxuXHJcblx0Y29uc3RydWN0b3Iod29ya3NwYWNlUm9vdHM6IHZzY29kZS5Xb3Jrc3BhY2VGb2xkZXJbXSkgeyBcclxuXHRcdHRoaXMud29ya3NwYWNlUm9vdHMgPSB3b3Jrc3BhY2VSb290cztcclxuXHR9XHJcblxyXG5cdGdldFRyZWVJdGVtKGVsZW1lbnQ6IEZpbGVJdGVtKTogdnNjb2RlLlRyZWVJdGVtIHtcclxuXHRcdHJldHVybiBlbGVtZW50O1xyXG5cdH1cclxuXHJcblx0Z2V0Q2hpbGRyZW4oZWxlbWVudD86IEZpbGVJdGVtKTogVGhlbmFibGU8RmlsZUl0ZW1bXT4ge1xyXG5cdFx0aWYoZWxlbWVudCA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0Ly8gZm9yIHdvcmtzcGFjZSByb290IGNhc2VcclxuXHRcdFx0bGV0IG5ld0ZpbGVDb2xTdGF0ZTp2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlID0gdnNjb2RlLlRyZWVJdGVtQ29sbGFwc2libGVTdGF0ZS5FeHBhbmRlZDtcclxuXHRcdFx0bGV0IHdvcmtzcGFjZVJvb3RGaWxlSXRlbXM6RmlsZUl0ZW1bXSA9IFtdO1xyXG5cdFx0XHRmb3IgKGxldCB3cyBvZiB0aGlzLndvcmtzcGFjZVJvb3RzKSB7XHJcblx0XHRcdFx0d29ya3NwYWNlUm9vdEZpbGVJdGVtcy5wdXNoKG5ldyBGaWxlSXRlbShcIiR7d29ya3NwYWNlUm9vdH0gXCIgKyBgKCR7d3MubmFtZX0pYCwgd3MudXJpLCBuZXdGaWxlQ29sU3RhdGUpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR0aGlzLmZpbGVUcmVlID0gd29ya3NwYWNlUm9vdEZpbGVJdGVtcztcclxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh3b3Jrc3BhY2VSb290RmlsZUl0ZW1zKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHQvLyBmb3IgZm9sZGVyIG9yIGZpbGUgY2FzZVxyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpPT57XHJcblx0XHRcdFx0dGhpcy5nZXRGaWxlcyhlbGVtZW50LnJlc291cmNlVXJpKS50aGVuKChjaGlsZHJlbjpGaWxlSXRlbVtdKT0+e1xyXG5cdFx0XHRcdFx0Y2hpbGRyZW4gPSB0aGlzLnNvcnRGaWxlSXRlbXMoY2hpbGRyZW4pO1xyXG5cdFx0XHRcdFx0ZWxlbWVudC5jaGlsZCA9IGNoaWxkcmVuO1xyXG5cdFx0XHRcdFx0cmVzb2x2ZShjaGlsZHJlbik7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dHJlZUNtZChyb290RWxlbWVudDogRmlsZUl0ZW0pOiBGaWxlSXRlbVtde1xyXG5cdFx0bGV0IHJldDpGaWxlSXRlbVtdID0gW3Jvb3RFbGVtZW50XTtcclxuXHJcblx0XHRpZihyb290RWxlbWVudC5jb2xsYXBzaWJsZVN0YXRlID09PSB2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlLkV4cGFuZGVkKXtcclxuXHRcdFx0Ly8gcm9vdOOBi+OCieS4i+OCkuaOoue0ouOBl+OBpuWIl+aMmVxyXG5cdFx0XHRmb3IobGV0IGMgb2Ygcm9vdEVsZW1lbnQuY2hpbGQpe1xyXG5cdFx0XHRcdGlmKChjLmNvbGxhcHNpYmxlU3RhdGUgPT09IHZzY29kZS5UcmVlSXRlbUNvbGxhcHNpYmxlU3RhdGUuRXhwYW5kZWQpICYmXHJcblx0XHRcdFx0XHQoYy5jaGlsZC5sZW5ndGggPiAwKSl7XHJcblx0XHRcdFx0XHQvLyDmipjjgorjgZ/jgZ/jgb/op6PpmaQgJiYg5a2Q5L6b44GM44GC44Gj44Gf44KJ5YaN5biw55qE44GrdHJlZVxyXG5cdFx0XHRcdFx0bGV0IGFkZCA9IHRoaXMudHJlZUNtZChjKTtcclxuXHRcdFx0XHRcdHJldC5wdXNoKC4uLmFkZCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRyZXQucHVzaChjKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxuXHJcblx0cmVmcmVzaCgpOiB2b2lkIHtcclxuXHRcdHRoaXMuX29uRGlkQ2hhbmdlVHJlZURhdGEuZmlyZSgpO1xyXG5cdH1cclxuXHRzb3J0RmlsZUl0ZW1zKGZpbGVJdGVtczpGaWxlSXRlbVtdKTogRmlsZUl0ZW1bXSB7XHJcblx0XHRsZXQgZm9sZGVyczpGaWxlSXRlbVtdID0gW107XHJcblx0XHRsZXQgZmlsZXM6RmlsZUl0ZW1bXSA9IFtdO1xyXG5cdFx0bGV0IHJldDpGaWxlSXRlbVtdID0gW107XHJcblx0XHQvLyBzZWxlY3QgZm9sZGVyL2ZpbGVcclxuXHRcdGZpbGVJdGVtcy5mb3JFYWNoKChmOkZpbGVJdGVtKT0+e1xyXG5cdFx0XHRsZXQgcGF0aCA9IGYucmVzb3VyY2VVcmkuZnNQYXRoO1xyXG5cdFx0XHRpZihmcy5sc3RhdFN5bmMocGF0aCkuaXNEaXJlY3RvcnkoKSApe1xyXG5cdFx0XHRcdGZvbGRlcnMucHVzaChmKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0ZmlsZXMucHVzaChmKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHQvLyBzb3J0IGZvbGRlciBncm91cFxyXG5cdFx0Zm9sZGVycy5zb3J0KChhOkZpbGVJdGVtLCBiOkZpbGVJdGVtKT0+e1xyXG5cdFx0XHRyZXR1cm4gYS5sYWJlbC5sb2NhbGVDb21wYXJlKGIubGFiZWwpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gc29ydCBmaWxlIGdyb3VwXHJcblx0XHRmaWxlcy5zb3J0KChhOkZpbGVJdGVtLCBiOkZpbGVJdGVtKT0+e1xyXG5cdFx0XHRyZXR1cm4gYS5sYWJlbC5sb2NhbGVDb21wYXJlKGIubGFiZWwpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gbWVyZ2VcclxuXHRcdHJldCA9IGZvbGRlcnMuY29uY2F0KGZpbGVzKTtcclxuXHJcblx0XHRyZXR1cm4gcmV0O1xyXG5cdH1cclxuXHRwcml2YXRlIGdldEZpbGVzKHJvb3RVcmk6IHZzY29kZS5VcmkpOiBUaGVuYWJsZTxGaWxlSXRlbVtdPntcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSk9PntcclxuXHRcdFx0bGV0IGZpbGVJdGVtczpGaWxlSXRlbVtdID0gW107XHJcblx0XHRcclxuXHRcdFx0dnNjb2RlLndvcmtzcGFjZS5mcy5yZWFkRGlyZWN0b3J5KHJvb3RVcmkpLnRoZW4oKHZhbHVlKT0+e1xyXG5cdFx0XHRcdHZhbHVlLmZvckVhY2goKHZhbHVlLGluZGV4LGFycmF5KT0+e1xyXG5cdFx0XHRcdFx0bGV0IG5ld0ZpbGVOYW1lID0gdmFsdWVbMF07XHJcblx0XHRcdFx0XHRsZXQgbmV3RmlsZVR5cGU6dnNjb2RlLkZpbGVUeXBlID0gdmFsdWVbMV07XHJcblx0XHRcdFx0XHRsZXQgbmV3RmlsZUZ1bGxVcmk6dnNjb2RlLlVyaSA9IHZzY29kZS5Vcmkuam9pblBhdGgocm9vdFVyaSxuZXdGaWxlTmFtZSk7XHJcblx0XHRcdFx0XHRsZXQgbmV3RmlsZUNvbFN0YXRlOnZzY29kZS5UcmVlSXRlbUNvbGxhcHNpYmxlU3RhdGU7XHJcblx0XHRcdFx0XHRpZihuZXdGaWxlVHlwZSA9PT0gdnNjb2RlLkZpbGVUeXBlLkRpcmVjdG9yeSl7XHJcblx0XHRcdFx0XHRcdG5ld0ZpbGVDb2xTdGF0ZSA9IHZzY29kZS5UcmVlSXRlbUNvbGxhcHNpYmxlU3RhdGUuQ29sbGFwc2VkO1xyXG5cdFx0XHRcdFx0XHRuZXdGaWxlTmFtZSArPSBcIi9cIjtcclxuXHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRuZXdGaWxlQ29sU3RhdGUgPSB2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlLk5vbmU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRsZXQgbmV3RmlsZUl0ZW06RmlsZUl0ZW0gPVxyXG5cdFx0XHRcdFx0XHRuZXcgRmlsZUl0ZW0obmV3RmlsZU5hbWUsIG5ld0ZpbGVGdWxsVXJpLCBuZXdGaWxlQ29sU3RhdGUpO1xyXG5cdFx0XHRcdFx0ZmlsZUl0ZW1zLnB1c2gobmV3RmlsZUl0ZW0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJlc29sdmUoZmlsZUl0ZW1zKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0cHJpdmF0ZSBwYXRoRXhpc3RzKHA6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0ZnMuYWNjZXNzU3luYyhwKTtcclxuXHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlSXRlbSBleHRlbmRzIHZzY29kZS5UcmVlSXRlbSB7XHJcblx0cHVibGljIGNoaWxkOkZpbGVJdGVtW10gPSBbXTtcclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHB1YmxpYyByZWFkb25seSBsYWJlbDogc3RyaW5nLCBcclxuXHRcdHB1YmxpYyByZWFkb25seSByZXNvdXJjZVVyaTogdnNjb2RlLlVyaSxcclxuXHRcdHB1YmxpYyBjb2xsYXBzaWJsZVN0YXRlOiB2c2NvZGUuVHJlZUl0ZW1Db2xsYXBzaWJsZVN0YXRlKXtcclxuXHRcdHN1cGVyKGxhYmVsLCBjb2xsYXBzaWJsZVN0YXRlKTtcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgdnNjb2RlIGZyb20gJ3ZzY29kZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUHJldmlld1BhbmVsTWFuYWdlciB7XHJcblx0cHVibGljIHNob3codHJlZVZpZXdTdHI6IHN0cmluZywgdGl0bGU6IHN0cmluZykge1xyXG5cdFx0Y29uc3QgcGFuZWwgPSB2c2NvZGUud2luZG93LmNyZWF0ZVdlYnZpZXdQYW5lbChcclxuXHRcdFx0J3RyZWVQcmV2aWV3JyxcclxuXHRcdFx0YFRyZWUgZnJvbSBcIiR7dGl0bGV9XCJgLFxyXG5cdFx0XHR2c2NvZGUuVmlld0NvbHVtbi5CZXNpZGUsXHJcblx0XHRcdHt9XHJcblx0XHQpO1xyXG5cclxuXHRcdGNvbnN0IGVzY2FwZWQgPSB0aGlzLmVzY2FwZUh0bWwodHJlZVZpZXdTdHIpO1xyXG5cdFx0cGFuZWwud2Vidmlldy5odG1sID0gdGhpcy5idWlsZEh0bWwoYFRyZWUgZnJvbTogJHt0aGlzLmVzY2FwZUh0bWwodGl0bGUpfWAsIGA8aDM+RmlsZSBUcmVlPC9oMz48cHJlPiR7ZXNjYXBlZH08L3ByZT5gKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgYnVpbGRIdG1sKHRpdGxlOiBzdHJpbmcsIGJvZHlJbm5lcjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBgPCFET0NUWVBFIGh0bWw+XHJcbjxodG1sIGxhbmc9XCJlblwiPlxyXG48aGVhZD5cclxuPG1ldGEgY2hhcnNldD1cIlVURi04XCIgLz5cclxuPG1ldGEgaHR0cC1lcXVpdj1cIkNvbnRlbnQtU2VjdXJpdHktUG9saWN5XCIgY29udGVudD1cImRlZmF1bHQtc3JjICdub25lJzsgc3R5bGUtc3JjICd1bnNhZmUtaW5saW5lJztcIj5cclxuPG1ldGEgbmFtZT1cInZpZXdwb3J0XCIgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTFcIiAvPlxyXG48dGl0bGU+JHt0aXRsZX08L3RpdGxlPlxyXG48c3R5bGU+XHJcbmJvZHl7Zm9udC1mYW1pbHk6dmFyKC0tdnNjb2RlLWZvbnQtZmFtaWx5LEFyaWFsKTtwYWRkaW5nOjEycHg7bGluZS1oZWlnaHQ6MS40O31cclxucHJle2JhY2tncm91bmQ6dmFyKC0tdnNjb2RlLWVkaXRvci1iYWNrZ3JvdW5kLCMxZTFlMWUpO2NvbG9yOnZhcigtLXZzY29kZS1lZGl0b3ItZm9yZWdyb3VuZCwjZDRkNGQ0KTtwYWRkaW5nOjhweCAxMHB4O2JvcmRlci1yYWRpdXM6NHB4O292ZXJmbG93OmF1dG87Zm9udC1zaXplOjEycHg7fVxyXG5jb2Rle2ZvbnQtZmFtaWx5OnZhcigtLXZzY29kZS1lZGl0b3ItZm9udC1mYW1pbHksQ29uc29sYXMsbW9ub3NwYWNlKTt9XHJcbmgze21hcmdpbi10b3A6MDt9XHJcbjwvc3R5bGU+XHJcbjwvaGVhZD5cclxuPGJvZHk+XHJcbiR7Ym9keUlubmVyfVxyXG48L2JvZHk+XHJcbjwvaHRtbD5gO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBlc2NhcGVIdG1sKHNyYzogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBzcmNcclxuXHRcdFx0LnJlcGxhY2UoLyYvZywgJyZhbXA7JylcclxuXHRcdFx0LnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG5cdFx0XHQucmVwbGFjZSgvPi9nLCAnJmd0OycpXHJcblx0XHRcdC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XHJcblx0fVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZnNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ2c2NvZGVcIik7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IEZpbGVUcmVlRm9ybWF0dGVyLCBGT1JNQVRfTU9ERSB9IGZyb20gJy4vZm9ybWF0dGVyL2ZpbGVUcmVlRm9ybWF0dGVyJztcclxuaW1wb3J0ICogYXMgdnNjb2RlIGZyb20gJ3ZzY29kZSc7XHJcbmltcG9ydCB7IEZpbGVUcmVlSXRlbXNQcm92aWRlciwgRmlsZUl0ZW0gfSBmcm9tICcuL3Byb3ZpZGVyL2ZpbGVJdGVtUHJvdmlkZXInO1xyXG5pbXBvcnQge1ByZXZpZXdQYW5lbE1hbmFnZXJ9IGZyb20gJy4vdmlldy9wcmV2aWV3UGFuZWxNYW5hZ2VyJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShjb250ZXh0OiB2c2NvZGUuRXh0ZW5zaW9uQ29udGV4dCkge1xyXG5cdGxldCBmaWxlVHJlZUl0ZW1zUHJvdmlkZXI6IEZpbGVUcmVlSXRlbXNQcm92aWRlciB8IG51bGwgPSBudWxsO1xyXG5cdGxldCBmaWxlVHJlZVZpZXc6IHZzY29kZS5UcmVlVmlldzxGaWxlSXRlbT47XHJcblxyXG5cdC8vIGdldCB3b3Jrc3BhY2UgZm9sZGVyc1xyXG5cdGxldCB3b3Jrc3BhY2VGb2xkZXJzOiB2c2NvZGUuV29ya3NwYWNlRm9sZGVyW10gfCB1bmRlZmluZWQgXHJcblx0XHQ9IHZzY29kZS53b3Jrc3BhY2Uud29ya3NwYWNlRm9sZGVycyBhcyB2c2NvZGUuV29ya3NwYWNlRm9sZGVyW10gfCB1bmRlZmluZWQ7XHJcblxyXG5cdC8vIENyZWF0ZSBUcmVlIFZpZXcgVUkgQ29tcG9uZW50c1xyXG5cdGlmICh3b3Jrc3BhY2VGb2xkZXJzKSB7XHJcblx0XHQvLyBpZiBleGlzdCB3b3Jrc3BhY2UsIHNob3cgYSBmaWxlIHRyZWUgaXRlbVxyXG5cdFx0ZmlsZVRyZWVJdGVtc1Byb3ZpZGVyID0gbmV3IEZpbGVUcmVlSXRlbXNQcm92aWRlcih3b3Jrc3BhY2VGb2xkZXJzKTtcclxuXHRcdGZpbGVUcmVlVmlldyA9IHZzY29kZS53aW5kb3cuY3JlYXRlVHJlZVZpZXcoJ2ZpbGVUcmVlJywge1x0XHJcblx0XHRcdHNob3dDb2xsYXBzZUFsbDpmYWxzZSxcclxuXHRcdFx0dHJlZURhdGFQcm92aWRlcjogZmlsZVRyZWVJdGVtc1Byb3ZpZGVyXHJcblx0XHR9KTtcclxuXHRcdGZpbGVUcmVlVmlldy5vbkRpZENvbGxhcHNlRWxlbWVudCgoZTogdnNjb2RlLlRyZWVWaWV3RXhwYW5zaW9uRXZlbnQ8RmlsZUl0ZW0+KSA9PiB7XHJcblx0XHRcdGUuZWxlbWVudC5jb2xsYXBzaWJsZVN0YXRlID0gdnNjb2RlLlRyZWVJdGVtQ29sbGFwc2libGVTdGF0ZS5Db2xsYXBzZWQ7XHJcblx0XHR9KTtcclxuXHRcdGZpbGVUcmVlVmlldy5vbkRpZEV4cGFuZEVsZW1lbnQoKGU6IHZzY29kZS5UcmVlVmlld0V4cGFuc2lvbkV2ZW50PEZpbGVJdGVtPikgPT4ge1xyXG5cdFx0XHRlLmVsZW1lbnQuY29sbGFwc2libGVTdGF0ZSA9IHZzY29kZS5UcmVlSXRlbUNvbGxhcHNpYmxlU3RhdGUuRXhwYW5kZWQ7XHJcblx0XHR9KTtcdFxyXG5cdH1cclxuXHJcblx0Ly8gQWRkIGB0cmVlYCBjbWQgdG8gc2hvdyB0cmVlIHZpZXcgaW4gdnNjb2RlXHJcblx0bGV0IGRpc3Bvc2FibGUgPSB2c2NvZGUuY29tbWFuZHMucmVnaXN0ZXJDb21tYW5kKCd0cmVlLmNtZCcsIChmaWxlSXRlbTogRmlsZUl0ZW0pID0+IHtcclxuXHRcdGlmIChmaWxlVHJlZUl0ZW1zUHJvdmlkZXIpIHtcclxuXHRcdFx0bGV0IHJldDogRmlsZUl0ZW1bXSA9IGZpbGVUcmVlSXRlbXNQcm92aWRlci50cmVlQ21kKGZpbGVJdGVtKTtcclxuXHRcdFx0bGV0IHRyZWVWaWV3U3RyOnN0cmluZyA9IG5ldyBGaWxlVHJlZUZvcm1hdHRlcihyZXQpLmV4ZWMoRk9STUFUX01PREUuS0VJU0VOKTtcclxuXHJcblx0XHRcdC8vIHNob3cgdHJlZSB2aWV3XHJcblx0XHRcdGxldCBjb25maWcgPSB2c2NvZGUud29ya3NwYWNlLmdldENvbmZpZ3VyYXRpb24oKTtcclxuXHRcdFx0aWYgKGNvbmZpZz8uZ2V0PHN0cmluZz4oXCJ0cmVlLnZpZXctdHlwZVwiKSA9PT0gXCJUZXh0RWRpdG9yXCIpIHtcclxuXHRcdFx0XHR2c2NvZGUuY29tbWFuZHMuZXhlY3V0ZUNvbW1hbmQoXCJ3b3JrYmVuY2guYWN0aW9uLmZpbGVzLm5ld1VudGl0bGVkRmlsZVwiKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdHNob3dUcmVlVmlld1RleHRFZGl0b3IodHJlZVZpZXdTdHIudHJpbUVuZCgpLCBmaWxlSXRlbS5yZXNvdXJjZVVyaS5mc1BhdGgpO1xyXG5cdFx0XHRcdH0pO1x0XHJcblx0XHRcdH0gZWxzZSBpZiAoY29uZmlnPy5nZXQ8c3RyaW5nPihcInRyZWUudmlldy10eXBlXCIpID09PSBcIldlYlZpZXdQYW5lbFwiKSB7XHJcblx0XHRcdFx0bmV3IFByZXZpZXdQYW5lbE1hbmFnZXIoKS5zaG93KHRyZWVWaWV3U3RyLCBmaWxlSXRlbS5yZXNvdXJjZVVyaS5wYXRoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRuZXcgUHJldmlld1BhbmVsTWFuYWdlcigpLnNob3codHJlZVZpZXdTdHIsIGZpbGVJdGVtLnJlc291cmNlVXJpLnBhdGgpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2c2NvZGUud2luZG93LnNob3dJbmZvcm1hdGlvbk1lc3NhZ2UoJ09wZW4gYSBmb2xkZXIgb3Igd29ya3NwYWNlIHRvIHVzZSBUcmVlIHZpZXcuJyk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0Y29udGV4dC5zdWJzY3JpcHRpb25zLnB1c2goZGlzcG9zYWJsZSk7XHJcblxyXG5cdC8vIGFkZCByZWZyZXNoIGNtZFxyXG5cdGRpc3Bvc2FibGUgPSB2c2NvZGUuY29tbWFuZHMucmVnaXN0ZXJDb21tYW5kKCd0cmVlLnJlZnJlc2hFbnRyeScsICgpID0+XHJcblx0XHRmaWxlVHJlZUl0ZW1zUHJvdmlkZXI/LnJlZnJlc2goKVxyXG5cdCk7XHJcblx0Y29udGV4dC5zdWJzY3JpcHRpb25zLnB1c2goZGlzcG9zYWJsZSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNob3dUcmVlVmlld1RleHRFZGl0b3IodHJlZVZpZXdTdHI6IHN0cmluZywgcm9vdFBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG5cdGxldCBlZGl0b3IgPSB2c2NvZGUud2luZG93LmFjdGl2ZVRleHRFZGl0b3I7XHJcblx0bGV0IGRvYyA9IGVkaXRvcj8uZG9jdW1lbnQ7XHJcblx0aWYgKGRvYykge1xyXG5cdFx0dnNjb2RlLmxhbmd1YWdlcy5zZXRUZXh0RG9jdW1lbnRMYW5ndWFnZShkb2MsIFwibWFya2Rvd25cIik7XHJcblx0XHR2c2NvZGUud2luZG93LmFjdGl2ZVRleHRFZGl0b3I/LmVkaXQoKGVkaXRCdWlsZGVyKSA9PiB7XHJcblx0XHRcdGxldCBzdGFydFBvcyA9IG5ldyB2c2NvZGUuUG9zaXRpb24oMCwgMCk7XHJcblx0XHRcdGxldCBtZFR4dDogc3RyaW5nID0gYCMgVHJlZSBWaWV3XHJcbiMjIFJvb3QgcGF0aDogXHJcbiR7cm9vdFBhdGh9XHJcblxyXG4jIyBDb250ZW50XHJcblxcYFxcYFxcYGJhc2hcclxuJHt0cmVlVmlld1N0cn1cclxuXFxgXFxgXFxgXHJcbmA7XHJcblx0XHRcdGVkaXRCdWlsZGVyLmluc2VydChzdGFydFBvcywgbWRUeHQpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHJldHVybjtcclxufVxyXG5cclxuLy8gdGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4geW91ciBleHRlbnNpb24gaXMgZGVhY3RpdmF0ZWRcclxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7IH1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9