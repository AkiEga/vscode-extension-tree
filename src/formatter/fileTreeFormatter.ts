/* eslint-disable @typescript-eslint/naming-convention */
import {FileItem} from '../provider/fileItemProvider';
import * as path from 'path';

enum FORMAT_OPTION{
	TAB = 0,
	LINE
}

export class FileTreeFormatter{
	fileItems:FileItem[];
	rootFolder:FileItem;
	rootRootFolderPath:string;
	rootRetPath:string ;
	constructor(fileItems:FileItem[]){
		this.fileItems = fileItems;
		this.rootFolder = fileItems[0];
		this.rootRootFolderPath = path.dirname(this.rootFolder.fullPath);
		this.rootRetPath 
			= path.relative(this.rootRootFolderPath, this.rootFolder.fullPath).replace(/\\/g,"/");
	}
	public exec():string{
		let ret:string = `${this.rootFolder.fullPath}\n`;
		ret += `${this.rootRetPath}/\n`;

		for(let index=1; index<this.fileItems.length; index++){		
			let currentFile:FileItem = this.fileItems[index];
			
			let preFix:string = "";

			let pastFile:FileItem|null = this.fileItems[index-1];
			let nextFile:FileItem|null = this.fileItems[index+1];

			preFix = this.genPrefix(pastFile, currentFile, nextFile,FORMAT_OPTION.TAB);
			ret += `${this.rPath(currentFile)}\n`;
			ret += `${preFix}${currentFile.label}\n`;	
		}
		
		return ret;
	}
	private genPrefix(past:FileItem, current:FileItem, next:FileItem, mode:FORMAT_OPTION):string{
		let ret:string = "";
		if(mode === FORMAT_OPTION.TAB){
			let retPathDepth:number = this.countFolderDepth(this.rPath(current));

			ret += "    ".repeat(retPathDepth);
		}else if(mode === FORMAT_OPTION.LINE){
			let p = this.rPath(past).split("/");
			let c = this.rPath(current).split("/");
			let n = this.rPath(next).split("/");
			for(let i=0;i<c.length;i++){
				if(p[i] === c[i] ){
					ret += "┼";
				}else{
					ret += "　";
				}
				if(i === c.length-1){
					ret += "─";
				}
			}
			
		}
		return ret;
	}
	private rPath(file:FileItem):string {
		return path.relative(this.rootRootFolderPath, file.fullPath).replace(/\\/g,"/");
	}
	private countFolderDepth(str:string):number{
		let ret:number = 1;
		let m:RegExpMatchArray|null = str.match(/(\\|\/)/g);
		if(m !== null){
			ret += m.length;
		}
		return ret;
	}
}