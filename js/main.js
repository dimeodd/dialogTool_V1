window.onload = function () {
    MousePos.Init();
    lt_Init();

    toggle_Init();
    toolbar_Init();

    drag_Init();
    go_Init();
    workspace_Init();

    setTimeout(ws_openSave, 100);

    document.onmouseup = function (e) {
        drag_End(e);
        go_endDrag(e);
        link_End(e);
    }
}
window.onbeforeunload = function () {
    toolbar_OnClose();
    ws_closeSave();
}

//#region Drag

var dragObj = document.getElementById('');
var xOffset = 0;
var yOffset = 0;

function drag_Init() {
    var elements = document.querySelectorAll('.draggable');

    for (var parentElement of elements) {
        addMoveArea(parentElement);
    }
}

function drag_Begin(e) {
    e.preventDefault();
    e.stopPropagation();

    dragObj = e.target.closest('div.draggable');
    if (!dragObj) return;

    dragObj.style.position = 'absolute';
    var rect = dragObj.getBoundingClientRect();

    xOffset = e.clientX - rect.left;
    yOffset = e.clientY - rect.top;

    window.addEventListener('mousemove', drag_Move, true);
}
function drag_Move(e) {
    var x = e.clientX - xOffset;
    var y = e.clientY - yOffset;

    setElementPosition(dragObj, x, y);
    workspace.UpdateLines();
}
function drag_End(e) {
    if (dragObj) {
        dragObj = null;
        window.removeEventListener('mousemove', drag_Move, true);
    }
}
//#endregion

//#region GlobalOffset

var go_tempPosX = 0;
var go_tempPosY = 0;
var go_dragObject
var go_itemsList;

function go_ToStart() {
    var clientCenterX = document.body.clientWidth / 2 - 50;
    var clientCenterY = document.body.clientHeight / 2;

    var startNode = document.getElementById('questNode0');

    var offsetX = clientCenterX - parseInt(startNode.style.left);
    var offsetY = clientCenterY - parseInt(startNode.style.top);

    let items = document.querySelectorAll('.node_item');
    for (var item of items) {
        var x = parseInt(item.style.left) + offsetX;
        var y = parseInt(item.style.top) + offsetY;
        setElementPosition(item, x, y)
    }

    workspace.UpdateLines();
}
function go_Init() {
    var workSpace = document.getElementById('content_node');

    workSpace.addEventListener('mousedown', go_startDrag, true);
    document.onmouseup += go_endDrag;
}
function go_startDrag(e) {
    if (e.which != 3) return;

    e.preventDefault();
    e.stopPropagation();

    go_dragObject = e.target;
    if (go_dragObject.id !== 'content_node') return;

    document.body.oncontextmenu = function () { return false; };

    go_dragObject.style.cursor = 'move';

    go_tempPosX = e.clientX;
    go_tempPosY = e.clientY;

    go_itemsList = document.querySelectorAll('.node_item');
    window.addEventListener('mousemove', go_moveDrag, true);
}
function go_moveDrag(e) {

    e.preventDefault();
    e.stopPropagation();

    var offsetX = e.clientX - go_tempPosX;
    var offsetY = e.clientY - go_tempPosY;

    for (var item of go_itemsList) {
        var x = parseInt(item.style.left) + offsetX;
        var y = parseInt(item.style.top) + offsetY;
        setElementPosition(item, x, y)
    }
    go_tempPosX = e.clientX;
    go_tempPosY = e.clientY;

    workspace.UpdateLines();
}

function go_endDrag() {
    if (go_dragObject) go_dragObject.style.cursor = '';
    if (go_itemsList) {
        go_itemsList = null;
        go_dragObject = null;
        window.removeEventListener('mousemove', go_moveDrag, true);
    }

    setTimeout(repare, 100);

    function repare() {
        document.body.oncontextmenu = null;
    }
}

//#endregion

//#region LinkLine

var link_FastLine;
var link_nextNodeOwner;
var link_startTarget;
var link_isTrueNode;
function link_Begin_NextNode(e, ownerNextNode, isTrue = undefined) {
    // isTrue !== undefined - значит это Branch
    // isTrue - это изменяется true или facle линк в ноде
    if (isTrue !== undefined) link_isTrueNode = isTrue;

    console.log('link_startDrag');

    e.preventDefault();
    e.stopPropagation();
    var node = e.target.closest('div.node_item');
    if (!node) return;

    link_startTarget = e.target;
    link_nextNodeOwner = ownerNextNode;
    link_FastLine = new fastLine(new Vector2(e.clientX, e.clientY), new Vector2(e.clientX, e.clientY));
    window.addEventListener('mousemove', link_Move, true);
}

function link_Move(e) {
    link_FastLine.posB = new Vector2(e.clientX, e.clientY);
    link_FastLine.draw();
}
function link_End(e) {
    if (link_FastLine) {
        window.removeEventListener('mousemove', link_Move, true);
        link_FastLine.clear();
        link_FastLine = null;


        var nextNodeEl = e.target.closest('div.node_item');
        if (!nextNodeEl) return;
        var id = parseInt(nextNodeEl.id.substring(9));
        var nextNode = workspace.quest.nodeArray[id];
        try {

            if (link_startTarget == e.target) {
                if (nextNode.type != 'dialog') throw 'циклическая ссылка'
                
                //FIXME Сейчас оно отображается, если направлено на синюю зону 
                if (!confirm('Вы точно хотите создать замкнутый цикл?')) {
                    return;
                }
            }

            switch (nextNode.type) {
                case 'dialog':
                    switch (nextNode.subtype) {
                        case 'def':
                            break;
                        default:
                            alert('Не реализованый Нод type:' + node.type);
                            throw 'Не реализовано type:' + node.type;
                    }
                    break;
                case 'branch':
                case 'command':
                case 'exit':
                    break;
                default:
                    throw 'Не реализовано type:' + node.type;
            }


            if (link_nextNodeOwner.type == 'branch') {
                Workspace.setNextNode_Branch(link_nextNodeOwner, id, link_isTrueNode);
            } else {
                Workspace.setNextNode(link_nextNodeOwner, id);
            }

        } catch (ex) {
            alert('Невозможно создать ссылку на нод')
            throw ex
        }
        finally {
            console.log("finnaly");
            link_nextNodeOwner = null;
            workspace.UpdateView();
        }
    }
}

//#endregion


function addDelButton(element) {
    var del_button = document.createElement('button');
    del_button.innerText = 'X';
    del_button.classList.add('del_button');
    del_button.setAttribute('onclick', 'deleteNode(this)');

    element.firstElementChild.appendChild(del_button);
}

function addMoveArea(element) {
    // Get a reference to the first child
    var theFirstChild = element.firstChild;

    // Create a new element
    var newElement = document.createElement('div');
    newElement.classList.add('move_bar');
    newElement.addEventListener('mousedown', drag_Begin, true);

    // Insert the new element before the first child
    element.insertBefore(newElement, theFirstChild);
    return newElement;
}
function deleteMoveArea(element) {
    if (!element.classList.contains('draggable')) throw 'Ошибка типа элемента'
    var area = element.querySelector('.move_bar');
    area.removeEventListener('mousedown', drag_Begin, true);
    area.remove();
}

//TODO перенести в Workspace
function setElementPosition(element, viewX, viewY) {
    element.style.left = viewX + 'px';
    element.style.top = viewY + 'px';

    if (element.classList.contains('node_item')) {
        //TODO переделать под глобальную сетку
        var globalX = viewX;
        var globalY = viewY;

        var node = workspace.GetNodeByHtmlId(element.id);
        node.pos.x = globalX;
        node.pos.y = globalY;
    }
}