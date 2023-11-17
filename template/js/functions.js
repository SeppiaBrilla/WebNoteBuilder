var currentTheme = "dark";
function CheckIn(item, query){
    return item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.folder.some(x => CheckIn(x,query));
}

function CreateFolder(itemName, subElements){
    return `<li class='note-folder'><i class='fas fa-folder'></i> ${itemName} <button class='hideButton' id='${itemName}' onclick="collapse(this.id)"><i id='${itemName}-icon' class='fa fa-angle-down'></i></button><ul id='${itemName}-ul' class='main-note-list'>
${subElements}
</ul></li>
`;
}

function CreateFile(itemName, link){
    return `<li class='note-item'><i class='fas fa-file'> </i> <a class='link' href='${link}'>${itemName}</a>
`;
}

function collapse(name){
    const ul = document.getElementById(name+'-ul');
    const icon = document.getElementById(name+'-icon');
    if(Array.from(ul.classList).includes('hide')){
        ul.classList.remove('hide');
        icon.classList.remove('fa-angle-up');
        icon.classList.add('fa-angle-down');
    }else{
        ul.classList.add('hide');
        icon.classList.remove('fa-angle-down');
        icon.classList.add('fa-angle-up');
    }
}

function CreateEntry(item, query){
    const itemName = item.name;
    query = itemName.toLowerCase().includes(query.toLowerCase()) ? '' : query;
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
