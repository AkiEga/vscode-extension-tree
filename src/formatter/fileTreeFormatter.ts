import {FileItem} from '../provider/fileItemProvider';
import * as path from 'path';

export class FileTreeFormatter{
	constructor(){

	}
	public static exec(fileItems:FileItem[]):string{
		let ret:string = "";		
		let rootFolder:FileItem = fileItems[0];
		fileItems.forEach((currentFile:FileItem, index:number)=>{
			let pastFile:FileItem|null = fileItems[index-1];
			let nextFile:FileItem|null = fileItems[index+1];

			if(index === 0){
				ret += currentFile.label + "\n";
			}else{
				let retPath:string = path.relative(rootFolder.fullPath, currentFile.fullPath);
				let retPathDepth:number = this.countFolderDepth(retPath);
				ret += "    ".repeat(retPathDepth) + currentFile.label + "\n";
			}
		});
		console.log(ret);
		return ret;
	}
	private static countFolderDepth(str:string):number{
		let ret:number = 1;
		let m:RegExpMatchArray|null = str.match(/(\\|\/)/g);
		if(m !== null){
			ret += m.length;
		}
		return ret;
	}
}