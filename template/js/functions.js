var currentTheme = "dark";
function CheckIn(item, query){
    return item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.folder.some(x => CheckIn(x,query));
}

function CreateFolder(itemName, subElements){
    return `<li class='note-folder'><i class='fas fa-folder'></i> ${itemName} <i class='fa fa-angle-down'></i><ul class='main-note-list'>
${subElements}
</ul></li>
`;
}

function CreateFile(itemName, link){
    return `<li class='note-item'><i class='fas fa-file'> </i> <a class='link' href='${link}'>${itemName}</a>
`;
}

function CreateEntry(item, query){
    const itemName = item.name;
    const subElements = FilterFunction(item.folder, query);
    const isFolder = subElements != "";
    if(isFolder)
        return CreateFolder(itemName, subElements);
    return CreateFile(itemName, item.link);
}

function FilterFunction(items, query){
    if(items.length < 1)
        return "";
    const item = items[0];
    const isIn = CheckIn(item,query);
    if(!isIn)
        return FilterFunction(items.slice(1), query);
    const newItem = CreateEntry(item, query);
    return newItem + FilterFunction(items.slice(1), query);
}

function LoadFiles(searchQuery){
    let filesToShow = FilterFunction(files, searchQuery);
    document.getElementById("notes").innerHTML = filesToShow;
}

function ThemeFn(){
    let futureTheme = currentTheme == "dark" ? "ligth" : "dark";
    let elements = Array.from(document.getElementsByClassName(`${currentTheme}-theme-color`));
    for(let i = 0; i < elements.length; i ++){
        elements[i].classList.remove(`${currentTheme}-theme-color`);
        elements[i].classList.add(`${futureTheme}-theme-color`);
    }
    elements = Array.from(document.getElementsByClassName(`${currentTheme}-theme-bg`));
    for(let i = 0; i < elements.length; i ++){
        elements[i].classList.remove(`${currentTheme}-theme-bg`);
        elements[i].classList.add(`${futureTheme}-theme-bg`);
    }
    currentTheme = futureTheme;
}

function BackFn(){
    history.back();
}
