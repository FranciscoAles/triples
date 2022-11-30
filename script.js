// game variables
let gridItemArray = [];
let columnCount = 6;
let checkCount = 0;
let checkedArray = [];
let completedCount = 0;
let completedArray = [];

// main elements of website
let grid = document.getElementById("grid-container");
let bar = document.getElementById("title-bar");
let undoButton = document.getElementById("undo-button");

// each item of the grid needs its own properties and stuff
class gridItem {
    constructor(element, x, y, checkbox, label) {
        this.item = element;
        this.x = x;
        this.y = y;
        this.checkbox = checkbox;
        this.label = label;

        this.checkbox.addEventListener("input", itemChecked);

        this.disable = function() {
            this.label.style.animation = "disable 0.5s forwards";
            this.checkbox.disabled = true;
            this.label.style.cursor = "default";
            completedCount++;

            if (completedCount == gridItemArray.length) {
                winPopup.openPopup();
            }
        };

        this.enable = function() {
            this.label.style.animation = "enable 0.5s forwards";
            this.checkbox.disabled = false;
            this.label.style.cursor = "pointer";
            completedCount--;
        };
    }
}

// we need to create the items every time the game restarts
function createItems(numberOfColumns) {
    for (let i = 0; i < gridItemArray.length; i++) {
        gridItemArray[i].item.remove();
    }
    
    gridItemArray = [];
    
    grid.style.gridTemplateColumns = "auto" + " auto".repeat(numberOfColumns - 1);
    
    for (let x = 1; x <= numberOfColumns; x++) {
        for (let y = x + 1; y <= numberOfColumns + 1; y++) {
            
            let element = document.createElement("div");
            element.classList.add("grid-item");
            grid.appendChild(element);
            
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            let cbid = ("set" + x) + y;
            checkbox.id = cbid;
            element.appendChild(checkbox);
            
            let label = document.createElement("label");
            label.innerHTML = `<span class='brace'>{</span>${x}, ${y}<span class='brace'>}</span>`;
            label.htmlFor = cbid;
            element.appendChild(label);
            
            element.style.gridColumn = (y - 1) + " / " + y;
            
            gridItemArray.push(new gridItem(element, x, y, checkbox, label));
        }
    }
}

createItems(columnCount);

// we need to size everything perfectly, and this function will let us do that
function size() {
    if (window.innerWidth < window.innerHeight) {
        bar.style.fontSize = 0.1 * window.innerWidth + "px";
    } else {
        bar.style.fontSize = 0.07 * window.innerHeight + "px";
    }
    let yMargins = bar.offsetHeight / 2;
    grid.style.marginTop = yMargins + "px";
    grid.style.marginBottom = yMargins + "px";
    let gdHeight = window.innerHeight - bar.offsetHeight * 2;
    let gdWidth = grid.offsetWidth;
    grid.style.height = gdHeight + "px";
    let itemWidth;
    let itemHeight;
    let itemFontSize;

    if (gdWidth > gdHeight) {
        itemHeight = gdHeight / (columnCount * 1.1);
        itemWidth = itemHeight * 1.2;
        itemFontSize = itemWidth / 4;
    } else {
        itemWidth = gdWidth / (columnCount * 1.1);
        itemHeight = itemWidth;
        itemFontSize = itemWidth / 4.5;
    }
    
    for (let i = 0; i < gridItemArray.length; i++) {
        let elmnt = gridItemArray[i].item;
        elmnt.style.width = itemWidth + "px";
        elmnt.style.height = itemHeight + "px";
        elmnt.style.fontSize = itemFontSize + "px";
    }

    undoButton.style.bottom = yMargins + "px";
    undoButton.style.left = gridItemArray[0].label.offsetLeft + "px";
}

// size everything
window.addEventListener("resize", size);
document.body.onload = size();

// undo
undoButton.addEventListener("click", undo);
function undo() {
    if (completedCount >= 3) {
        for (let i of completedArray.slice(-3)) {
            i.enable();
            completedArray.pop();
        }
    }
}

// this function is called when any input is checked
function itemChecked(event) {
    if (event.target.checked) {
        checkCount++;
    } else {
        checkCount--;
    }
    
    if (checkCount > 3) {
        checkedArray[checkedArray.length - 1].checkbox.checked = false;
        checkCount--;
    }
    
    checkedArray = [];
    
    for (let i of gridItemArray) {
        if (i.checkbox.checked) {
            checkedArray.push(i);
        }
    }
    
    if (checkCount == 3) {
        let first = [checkedArray[0].x, checkedArray[0].y];
        let second = [checkedArray[1].x, checkedArray[1].y];
        let third = [checkedArray[2].x, checkedArray[2].y];
        let last = getLastSet(first, second);
        
        if (last[0] == third[0] && last[1] == third[1]) {
            for (let i of checkedArray) {
                i.disable();
                i.checkbox.checked = false;
                completedArray.push(i);
            }
            
            checkCount = 0;
            checkedArray = [];
        }
    }
}


// this function get's the last set of a set when given the first two
function getLastSet(set1, set2) {
  let set3 = [];

  if (set1[0] == set2[0]) {
    set3.push(set1[1], set2[1]);
  } else if (set1[0] == set2[1]) {
    set3.push(set1[1], set2[0]);
  } else if (set1[1] == set2[0]) {
    set3.push(set1[0], set2[1]);
  } else if (set1[1] == set2[1]) {
    set3.push(set1[0], set2[0]);
  } else {
  	return undefined;
  }
  
  if (set3[0] > set3[1]) {
    [set3[0], set3[1]] = [set3[1], set3[0]];
  }
  
  return set3;
}

// open fullscreen
let fullButton = document.getElementById("fullscreen-button");
fullButton.addEventListener("click", toggleFullscreen);
let elem = document.documentElement;
function toggleFullscreen() {
    if (fullButton.textContent == "fullscreen") {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

// when fullscreen change is done:
// Standard syntax
document.addEventListener("fullscreenchange", fullscreenChange);
// Firefox
document.addEventListener("mozfullscreenchange", fullscreenChange);
// Chrome, Safari and Opera
document.addEventListener("webkitfullscreenchange", fullscreenChange);
// IE / Edge
document.addEventListener("msfullscreenchange", fullscreenChange);
// function
function fullscreenChange() {
    if (screen.width == window.innerWidth && screen.height == window.innerHeight) {
        fullButton.textContent = "fullscreen_exit";
    } else {
        fullButton.textContent = "fullscreen";
    }
}

// dark thing (like a shadow)
let overlay = document.getElementById("overlay");

// menu
let menu = document.getElementById("menu");
let menuButton = document.getElementById("menu-button");
menuButton.addEventListener("click", openMenu);
function openMenu() {
    menu.style.display = "block";
}

// close menu
let closeMenuButton = document.getElementById("close-menu-button");
closeMenuButton.addEventListener("click", closeMenu);
function closeMenu() {
    menu.style.display = "none";
}

// Popup
class Popup {
    constructor(popup, activator) {
        this.popup = popup;

        if (activator != undefined) {
            this.activator = activator;
        }

        this.openPopup = function () {
            overlay.style.display = "block";
            popup.style.display = "block";
            closeMenu();
        };

        this.closeButton = document.createElement("span");
        this.closeButton.classList.add("material-symbols-outlined");
        this.closeButton.classList.add("close-button");
        this.closeButton.textContent = "close";

        popup.appendChild(this.closeButton);

        this.closePopup = function () {
            overlay.style.display = "none";
            popup.style.display = "none";
        };
    }
}

// connects a button to a popup so that it can open by the clicking of the button
function intoPopup(p, a) {
    createdPopup = new Popup(p, a);
    if (createdPopup.activator != undefined) {
        createdPopup.activator.addEventListener("click", createdPopup.openPopup);
    }
    createdPopup.closeButton.addEventListener("click", createdPopup.closePopup);
    return createdPopup;
}

// popups
let winPopup = intoPopup(document.getElementById("win-popup"));
let infoPopup = intoPopup(document.getElementById("help-popup"), document.getElementById("help-button"));
let settingsPopup = intoPopup(document.getElementById("settings-popup"), document.getElementById("settings-button"));

// restart game with button
let restartButton = document.querySelector("#win-popup button");
restartButton.addEventListener("click", restart);
function restart() {
    winPopup.closePopup();
    settingsPopup.closePopup();
    createItems(columnCount);
    size();
    completedCount = 0;
    checkCount = 0;
}

// settings
selectGridSize = document.getElementById("select-grid-size");
selectGridSize.addEventListener("input", changeGridSize);
function changeGridSize() {
    columnCount = parseInt(selectGridSize.value);
    restart();
    size();
}