/* eslint-disable @typescript-eslint/naming-convention */
import {FileItem} from '../provider/fileItemProvider';
import * as path from 'path';
import { pseudoRandomBytes } from 'crypto';

enum FORMAT_MODE{
	TAB = 0,
	LINE,
	NUM
}

interface StringMap { [key: string]: string; }

let formatStrSet:StringMap[] = [
	{
		// for TAB mode
		U___:"    ",
		U_R_:"    ",
		UBR_:"    "
	},
	{
		U___:"`---",
		UB__:"|`--",
		U_R_:"    ",
		UBR_:"|   "
	}
];

export class FileTreeFormatter{
	fileItems:FileItem[];
	rootFolder:FileItem;
	rootFolderPath:string;
	rootRootFolderPath:string;
	rootRetPath:string ;
	constructor(fileItems:FileItem[]){
		this.fileItems = fileItems;
		this.rootFolder = fileItems[0];		
		this.rootFolderPath = this.rootFolder.fullPath;
		this.rootRootFolderPath = path.dirname(this.rootFolderPath);
		this.rootRetPath 
			= path.relative(this.rootFolderPath, this.rootFolder.fullPath).replace(/\\/g,"/");
	}
	public exec():string{
		let ret:string = `${this.rootFolder.fullPath}/\n`;

		for(let index=1; index<this.fileItems.length; index++){
			let currentFile:FileItem = this.fileItems[index];
			
			let preFix:string = "";

			let pastFile:FileItem|null = this.fileItems[index-1];
			let nextFile:FileItem|null = this.fileItems[index+1];

			preFix = this.genPrefix(pastFile, currentFile, nextFile, FORMAT_MODE.LINE);
			ret += `${preFix}${currentFile.label}\n`;	
		}
		
		return ret;
	}
	private genPrefix(past:FileItem, current:FileItem, next:FileItem|null, mode:FORMAT_MODE):string{
		let ret:string = "";
		let pastVsCurr:boolean[] 
		= this.pathElemDiff(this.rPath(current),this.rPath(past));
		let currVsNext:boolean[] = [];
		let endIdx:number = pastVsCurr.length-1;
		if(next){
			currVsNext = this.pathElemDiff(this.rPath(current),this.rPath(next));
		}else{
			for(let i=0;i<=endIdx;i++){
				currVsNext.push(false);
			}
		}

		for(let i=0;i<=endIdx;i++){
			let Upper:string = pastVsCurr[i]===true?"U":"_";
			let Bottom:string = currVsNext[i]===true?"B":"_";
			let Right:String = (i !== endIdx)?"R":"_";
			let preFixId:string= `${Upper + Bottom + Right}_`;
			ret += formatStrSet[mode][preFixId];
		}
		
		return ret;
	}
	private rPath(file:FileItem):string {
		return "./"+path.relative(this.rootFolderPath, file.fullPath).replace(/\\/g,"/");
	}
	private pathElemDiff(aPath:string, bPath:string):boolean[]{
		let ret:boolean[]=[];
		let aElems:string[] = aPath.split("/");
		let bElems:string[] = bPath.split("/");

		for(let i=0;i<aElems.length-1;i++){
			if(bElems[i]){
				if(aElems[i] === bElems[i]){
					ret.push(true);
				}else{
					ret.push(false);
				}
			}else{
				ret.push(false);
			}
		}
		return ret;
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