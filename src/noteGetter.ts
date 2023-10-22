import { WebObsidianBuilder, ObsidianLink, ObsidianlinkArray } from 'web-obsidian-builder';
import { lstatSync, readFileSync, readdirSync } from 'fs'
import { basename, extname, join } from 'path';
import Note from './note';

export function GetNotes(noteFolder:string, uri:string, folderToExclude:Array<string>){
    const linkArrays = CreateObsidianLinksFromFolder(noteFolder, uri, false);
    let files:Array<string> = [];
    const callback = (filename:string) => {
        if(extname(filename) !== '.md' && extname(filename) !== '.png')
            return;
        files.push(filename);
    }
    walk(noteFolder,callback);
    const structure = GetStructure(noteFolder, linkArrays, folderToExclude, noteFolder);
    let builder = new WebObsidianBuilder(linkArrays[0], linkArrays[1])
    let new_file = "";
    const new_notes: {[noteName:string]: Note|string } = {};
    for(let file of files){
        if(extname(file) === '.md'){
            const name = basename(file).replace('.md','');
            const fullname = file.replaceAll(noteFolder,"").replace('.md','').replaceAll(" ", "_").replaceAll("/","_");
            console.log(`analyzing note ${name} `)
            new_file = builder.AddAndConvert(name, readFileSync(file).toString());
            new_notes[fullname] = new Note(fullname, name, new_file);
            new_notes[name] = new Note(fullname, name, new_file);
        }else{
            const name = basename(file).replace(extname(file),'');
            new_notes[name] = file;
        }
    }
    return new NoteAndBuilder(builder, new_notes, structure);
}

export class NoteAndBuilder{
    Builder: WebObsidianBuilder;
    Notes: {[noteName:string]: Note|string };
    Structure: Array<object>;
    constructor(builder:WebObsidianBuilder, notes:{[noteName:string]: Note|string }, structure: Array<object>){
        this.Builder = builder;
        this.Notes = notes;
        this.Structure = structure;
    }
}

function CreateObsidianLinksFromFolder(folderName:string, baseUri:string, keepStructure:boolean = true): Array<ObsidianlinkArray>{
    let links: Array<ObsidianLink> = [];
    let notlinks: Array<ObsidianLink> = [];
    const nameToRemove = folderName.replaceAll('./','').replaceAll('../','');
    const callback = (filename: string) => {
        let uri = baseUri;
        if(uri[ uri.length - 1] != "/"){
            uri += "/"
        }
        if(keepStructure){
            let name = filename.replace(".md", ".html").replace(nameToRemove,'').replaceAll(" ", "_");
            if(name[0] === "/"){
                name = name.substring(1);
            }
            uri += name;
        }else{
            uri += filename.replaceAll(folderName,"").replaceAll("/","_").replaceAll(".md",".html").replaceAll(" ","_");
        }
        if(extname(filename) === ".md") {
            links.push(new ObsidianLink(basename(filename).replace(".md", ""), uri));
            links.push(new ObsidianLink(filename.replaceAll(folderName,"").replace(".md", ""), uri));
        }else if(extname(filename) === ".png"){
            notlinks.push(new ObsidianLink(basename(filename), uri));
        }
    }
    walk(folderName, callback);
    return [new ObsidianlinkArray(links), new ObsidianlinkArray(notlinks)];
}

function walk(currentDirPath:string, callback:Function) {
    for(let file of readdirSync(currentDirPath)){
        const filePath = join(currentDirPath, file);
        const stat = lstatSync(filePath);
        if (stat.isFile()) {
            callback(filePath);
        } else if (stat.isDirectory()) {
            walk(filePath, callback);
        }
    }
}

function GetStructure(currentDirPath:string, links:Array<ObsidianlinkArray>, folderToExclude: Array<string>, toRemove:string): Array<object>{
    const files = [];
    for(let file of readdirSync(currentDirPath)){
        const filePath = join(currentDirPath, file);
        const stat = lstatSync(filePath);
        if (stat.isFile() && file[0] != ".") {
            const fileName = file.replace(extname(file), '');
            files.push({"name":fileName, "folder": [], "link": GetLink(filePath.replaceAll(toRemove,"").replace(extname(file), ''), fileName, links)});
        } else if (stat.isDirectory() && file[0] != '.' && !folderToExclude.includes(file)) {
            files.push({"name":file, "folder": GetStructure(filePath, links, folderToExclude, toRemove)})
        }
    }
    return files;
}

export function GetLink(filePath:string, filename:string, links:Array<ObsidianlinkArray>){
    for(let i = 0; i < links.length; i ++){
        const dict = links[i].toDict();
        if(dict[filePath] !== undefined)
            return "notes/" + dict[filePath];
        if(dict[filename] !== undefined)
            return "notes/" + dict[filename];
    }
}
