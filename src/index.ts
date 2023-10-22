import { join, basename } from "path";
import { GetNotes, NoteAndBuilder } from "./noteGetter";
import { appendFileSync, copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import Note from "./note";

function main(): void {
    const config = JSON.parse(readFileSync('./config.json').toString());
    const notes = GetNotes(config.InputFolder, '.', config.FolderToExclude);
    PrepareFolder(config, notes);
    CreateIndex(notes, config);
    CreateNotes(notes, config);
    CreateGraph(notes, config);
}

function PrepareFolder(config:any, notes:NoteAndBuilder){
    const outputFoler = config.OutputFolder;
    rmSync(outputFoler, {recursive: true, force: true});
    mkdirSync(outputFoler);
    mkdirSync(join(outputFoler, "css"));
    mkdirSync(join(outputFoler, "js"));
    mkdirSync(join(outputFoler, "notes"));

    copyFileSync(join("template","css", "style.css"), join(config.OutputFolder,"css", "style.css"));
    appendFileSync(join(config.OutputFolder,"css", "style.css"), notes.Builder.GetCss())
}

function CreateIndex(notes:NoteAndBuilder, config:any){
    let home = readFileSync('./template/home.html').toString();
    home = home.replaceAll('{VAULT_NAME}', config.VaultName);
    writeFileSync(join(config.OutputFolder, 'index.html'), home);
    copyFileSync('./template/js/functions.js', join(config.OutputFolder, 'js', 'functions.js'));
    writeFileSync(join(config.OutputFolder, 'js', 'files.js'),`
const files = ${JSON.stringify(notes.Structure)}
`);

}

function CreateNotes(notes:NoteAndBuilder, config:any){
    const note_template = readFileSync('./template/note_template.html').toString().replaceAll('{HOMEURL}', config.BaseUrl);
    const keys = Object.keys(notes.Notes);
    for(let i = 0; i < keys.length; i ++){
        const currentFile = notes.Notes[keys[i]];
        if(currentFile instanceof Note){
            writeFileSync(join(config.OutputFolder, "notes", currentFile.FileName + '.html'), 
                note_template.replaceAll('{TITLE}', currentFile.NoteName).replaceAll('{TEXT}', currentFile.Content));
        }else if(typeof currentFile === "string"){
            try{
                const dest = currentFile.replaceAll(" ","_").replaceAll(config.InputFolder,"").replaceAll("/","_");
                copyFileSync(currentFile, join(config.OutputFolder,"notes", dest));
            }catch{}
        }
    }
}

function CreateGraph(notes:NoteAndBuilder, config:any){
    let graph_html = readFileSync('./template/graph.html').toString();
    graph_html = graph_html.replaceAll('{VAULT_NAME}', config.VaultName);
    graph_html = graph_html.replaceAll('{HOMEURL}', './index.html');
    writeFileSync(join(config.OutputFolder, 'graph.html'), graph_html);
    const graph = notes.Builder.GetGraph();
    const nodes = JSON.stringify(graph.Nodes.filter(x => 
        notes.Notes[x.replaceAll(config.inputFolder,"").replaceAll(" ", "_").replaceAll("/","_")] !== undefined).map(x => { 
        const key = x.replaceAll(config.inputFolder,"").replaceAll(" ", "_").replaceAll("/","_");
        const file = notes.Notes[key];
        if(file instanceof Note)
            return { 'id': join("notes", file.FileName + '.html'), 'name': file.NoteName }
    }));
    const edges = JSON.stringify(graph.Edges.filter(x =>{
        return notes.Notes[x.From] !== undefined && notes.Notes[x.To] !== undefined;
    }).map(x => { 
        const fileSource = notes.Notes[x.From];
        const fileTo = notes.Notes[x.To];
        if(fileSource instanceof Note && fileTo instanceof Note)
            return { 'source': join("notes", fileSource.FileName + '.html'), 'target': join("notes", fileTo.FileName + '.html') }
        return {};
    }));
    copyFileSync('./template/js/graph.js', join(config.OutputFolder, 'js', 'graph.js'));
    writeFileSync(join(config.OutputFolder, 'js', 'graphData.js'), `
const nodes = ${nodes};
const edges = ${edges};
`);
}


main();
