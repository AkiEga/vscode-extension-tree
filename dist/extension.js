/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileTreeFormatter = exports.FORMAT_MODE = void 0;
const path = __webpack_require__(2);
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
/* 2 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileItem = exports.FileTreeItemsProvider = void 0;
const vscode = __webpack_require__(3);
const fs = __webpack_require__(5);
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
/* 5 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PreviewPanelManager = void 0;
const vscode = __webpack_require__(3);
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


/***/ })
/******/ 	]);
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

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const fileTreeFormatter_1 = __webpack_require__(1);
const vscode = __webpack_require__(3);
const fileItemProvider_1 = __webpack_require__(4);
const previewPanelManager_1 = __webpack_require__(6);
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
//# sourceMappingURL=extension.js.map