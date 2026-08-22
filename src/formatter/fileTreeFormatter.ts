/* eslint-disable @typescript-eslint/naming-convention */
import {FileItem} from '../provider/fileItemProvider';
import * as path from 'path';

export enum FORMAT_MODE{
	TAB = 0,
	LINE,
	KEISEN,
	NUM
}

interface StringMap { [key: string]: string; }

const formatStrSet:StringMap[] = [
	// for TAB mode
	{
		U___:"    ",
		UB__:"    ",
		U_R_:"    ",
		UBR_:"    ",
		____:"    "
	},
	// LINE mode
	{
		U___:"    ",
		UB__:"|   ",
		U_R_:" `--",
		UBR_:"|`--",
		____:"    "
	},
	// keisen mode
	{
		U___:"　　",
		UB__:"│　",
		U_R_:"└─",
		UBR_:"├─",
		____:"　　"
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
		this.rootFolderPath = this.rootFolder.resourceUri.path;
		this.rootRootFolderPath = path.dirname(this.rootFolderPath);
		this.rootRetPath 
			= path.relative(this.rootFolderPath, this.rootFolder.resourceUri.path).replace(/\\/g,"/");
	}
	public exec(mode:FORMAT_MODE):string{
		let header:string;
		if (process.platform === 'win32') {
			header = `${this.rootFolderPath.replace(/\//s, "")}/\n`;
		} else {
			header = `${this.rootFolderPath}/\n`;
		}
		const fileNum:number = this.fileItems.length;
		let body:string = "";
		let belowLinePreFixs:string[] = [];
		for(let index=fileNum-1; index>0; index--){
			const current:FileItem = this.fileItems[index];
			const past:FileItem|null = this.fileItems[index-1];
			const next:FileItem|null = this.fileItems[index+1];

			const pastVsCurr:boolean[] 
			= this.pathElemDiff(this.rPath(current),this.rPath(past));
			let currVsNext:boolean[] = [];
			const depth:number = pastVsCurr.length-1;
			if(next){
				currVsNext = this.pathElemDiff(this.rPath(current),this.rPath(next));
			}else{
				for(let i=0;i<=depth;i++){
					currVsNext.push(false);
				}
			}
			const currentPreFixs:string[] = [];
			const line:string[] = [];
			for(let d=0;d<=depth;d++){
				const Upper:string = pastVsCurr[d]===true?"U":"_";
				const Bottom:string = currVsNext[d]===true?"B":"_";
				const Right:string = (d === depth)?"R":"_";
				const preFixId:string= `${Upper}${Bottom}${Right}_`;
				currentPreFixs.push(preFixId);
				if(index===fileNum-1){
					line.push(formatStrSet[mode][currentPreFixs[d]]);
				}else{
					let preFix = formatStrSet[mode][currentPreFixs[d]];
					if(belowLinePreFixs[d] === formatStrSet[mode]["____"]){
						if((currentPreFixs[d] === "UB__")) {
							preFix = formatStrSet[mode]["____"];
						}else
						if( (currentPreFixs[d] === "UBR_") ){
							preFix = formatStrSet[mode]["U_R_"];
						}
					}

					line.push(preFix);
				}
			}
			belowLinePreFixs = line;
			body = line.join("") + current.label + "\n" + body;
		}
		
		return header+body;
	}
	private genPrefixIdx(past:FileItem, current:FileItem, next:FileItem|null):string[]{
		const ret:string[] = [];
		const pastVsCurr:boolean[] 
		= this.pathElemDiff(this.rPath(current),this.rPath(past));
		let currVsNext:boolean[] = [];
		const endIdx:number = pastVsCurr.length-1;
		if(next){
			currVsNext = this.pathElemDiff(this.rPath(current),this.rPath(next));
		}else{
			for(let i=0;i<=endIdx;i++){
				currVsNext.push(false);
			}
		}

		for(let i=0;i<=endIdx;i++){
			const Upper:string = pastVsCurr[i]===true?"U":"_";
			const Bottom:string = currVsNext[i]===true?"B":"_";
			const Right:string = (i === endIdx)?"R":"_";
			const preFixId:string= `${Upper + Bottom + Right}_`;
			ret.push(preFixId);
		}
		
		return ret;
	}
	private rPath(file:FileItem):string {
		return "./"+path.relative(this.rootFolderPath, file.resourceUri.path).replace(/\\/g,"/");
	}
	private pathElemDiff(aPath:string, bPath:string):boolean[]{
		const ret:boolean[]=[];
		const aElems:string[] = aPath.split("/");
		const bElems:string[] = bPath.split("/");

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
		const m:RegExpMatchArray|null = str.match(/(\\|\/)/g);
		if(m !== null){
			ret += m.length;
		}
		return ret;
	}
}