export default class Note {
    FileName: string;
    Content: string;
    constructor(filename:string, content:string){
        this.FileName = filename;
        this.Content = content;
    }
}
