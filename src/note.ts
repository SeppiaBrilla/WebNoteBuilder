export default class Note {
    FileName: string;
    Content: string;
    NoteName: string;
    constructor(filename:string, noteName:string, content:string){
        this.FileName = filename;
        this.Content = content;
        this.NoteName = noteName;
    }
}
