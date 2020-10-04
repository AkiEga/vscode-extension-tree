/* eslint-disable @typescript-eslint/naming-convention */
import {FileItem} from '../provider/fileItemProvider';
import * as path from 'path';
import { pseudoRandomBytes } from 'crypto';

enum FORMAT_OPTION{
	TAB = 0,
	LINE
}

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

			preFix = this.genPrefix(pastFile, currentFile, nextFile, FORMAT_OPTION.TAB);
			// ret += `${this.rPath(currentFile)}\n`;
			ret += `${preFix}${currentFile.label}\n`;	
		}
		
		return ret;
	}
	private genPrefix(past:FileItem, current:FileItem, next:FileItem|null, mode:FORMAT_OPTION):string{
		let ret:string = "";
		if(mode === FORMAT_OPTION.TAB){
			ret += "    ".repeat(this.countFolderDepth(this.rPath(current)));
		}else if(mode === FORMAT_OPTION.LINE){
			let pastVsCurr:boolean[] 
				= this.pathElemDiff(this.rPath(current),this.rPath(past));
			let currVsNext:boolean[] = [];
			if(next){
			 	currVsNext = this.pathElemDiff(this.rPath(current),this.rPath(next));
			}else{
				for(let i=0;i<pastVsCurr.length;i++){
					currVsNext.push(false);
				}
			}
			for(let i=0;i<pastVsCurr.length;i++){
				let situation:string = "";
				let fr:string = "";
				let rr:string = "";
				if( (pastVsCurr[i]===true) &&
					(currVsNext[i]===true)){
					fr = "│"; // same case
				}else
				if( (pastVsCurr[i]===true) &&
					(currVsNext[i]===false)){
					fr = "└"; // bottom case
				}else				
				if( (pastVsCurr[i]===false) &&
					(currVsNext[i]===true)){
					fr = "┬";	// top case
				}else				
				if( (pastVsCurr[i]===false) &&
					(currVsNext[i]===false)){
					fr = "　"; // only case
				}
				// is Path End 
				if(i!==pastVsCurr.length-1){	
					rr = "　";
				}else{
					if(fr === "│"){
						fr = "├";
					}
					rr = "─";
				}
				ret += fr + rr;
			}
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