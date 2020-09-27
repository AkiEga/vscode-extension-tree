import { execSync } from 'child_process';

export function treeCmd(_cwd: string | undefined): string {
	let ret = "";
	if (_cwd) {
		// if(os.platform === os.platform.)
		ret = `${_cwd}\n`;
		ret += execSync("wsl tree .", { cwd: _cwd }).toString();
	}

	return ret;
}
