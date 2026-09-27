import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { PreviewPanelManager } from '../../view/previewPanelManager';
import { FileItem, FileTreeItemsProvider } from '../../provider/fileItemProvider';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Preview panel renders sanitized tree HTML for UI smoke test', () => {
		const html = PreviewPanelManager.renderTreeHtml('src\\file.ts\n<script>alert(1)</script>', 'demo/project');
		assert.match(html, /<title>Tree from: demo\/project<\/title>/);
		assert.match(html, /<h3>File Tree<\/h3>/);
		assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
		assert.match(html, /default-src 'none'; style-src 'unsafe-inline';/);
	});

	test('File tree provider sorts directories before files', () => {
		const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tree-ui-'));
		const root = vscode.Uri.file(tempRoot);
		const alphaDir = path.join(tempRoot, 'alpha');
		const gammaDir = path.join(tempRoot, 'gamma');
		fs.mkdirSync(alphaDir, { recursive: true });
		fs.mkdirSync(gammaDir, { recursive: true });
		fs.writeFileSync(path.join(tempRoot, 'beta.txt'), 'beta');
		fs.writeFileSync(path.join(tempRoot, 'zeta.txt'), 'zeta');

		try {
			const provider = new FileTreeItemsProvider([]);
			const target = [
				new FileItem('zeta.txt', vscode.Uri.joinPath(root, 'zeta.txt'), vscode.TreeItemCollapsibleState.None),
				new FileItem('alpha/', vscode.Uri.joinPath(root, 'alpha'), vscode.TreeItemCollapsibleState.Collapsed),
				new FileItem('beta.txt', vscode.Uri.joinPath(root, 'beta.txt'), vscode.TreeItemCollapsibleState.None),
				new FileItem('gamma/', vscode.Uri.joinPath(root, 'gamma'), vscode.TreeItemCollapsibleState.Collapsed)
			];

			const sorted = provider.sortFileItems(target);
			assert.deepStrictEqual(sorted.map(item => item.label), ['alpha/', 'gamma/', 'beta.txt', 'zeta.txt']);
		} finally {
			fs.rmSync(tempRoot, { recursive: true, force: true });
		}
	});
});
