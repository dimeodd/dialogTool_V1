const dialogOffset = 35;
const answersOffset = dialogOffset + 135;
var answersOffsetCustom = 170;

var showRU = true;
var showEN = true;

function toggleRU(value) {
    showRU = value;
    workspace.UpdateView();
    localStorage.setItem('showRU', showRU);
}
function toggleEN(value) {
    showEN = value;
    workspace.UpdateView();
    localStorage.setItem('showEN', showEN);
}

function toggle_Init() {
    var ru = localStorage.getItem('showRU') === 'true';
    var en = localStorage.getItem('showEN') === 'true';

    if (localStorage.length < 1) {
        alert('новый браузер');

        localStorage.setItem('showRU', true);
        localStorage.setItem('showEN', true);

        ru = true;
        en = true;
    }

    if (ru != undefined && en != undefined) {
        document.getElementById('checkRU').checked = ru;
        showRU = ru;
        document.getElementById('checkEN').checked = en;
        showEN = en;
    }
}

class QuestTools {
    static creareNodeEl(quest, node) {
        switch (node.type) {
            case 'dialog':
                switch (node.subtype) {
                    case 'def':
                        return DialogNode.getElement(quest, node);
                    default:
                        alert('Не реализованый Нод type:' + node.type);
                        throw 'Не реализовано type:' + node.type;
                }
            case 'branch':
                return BranchNode.getElement(node);
            case 'command':
                return CommandNode.getElement(node);
            case 'start':
                return StartNode.getElement(node);
            case 'exit':
                return ExitNode.getElement(node);

            default:
                alert('Не реализованый Нод type:' + node.type);
                throw 'Не реализовано type:' + node.type;
        }
    }

    /**создаёт текст в массиве*/
    static createText(quest) {
        var id = quest.text.RU.length;
        quest.text.RU.push('empty RU[' + id + ']');
        quest.text.EN.push('empty EN[' + id + ']');
        return id;
    }
    /**удаляет текст из массива и обновляет ссылки*/
    static deleteText(quest, id) {
        if (id == undefined) throw 'undefined id'
        if (id == 0) return;

        var texts = quest.text;
        texts.RU.splice(id, 1);
        texts.EN.splice(id, 1);

        for (const node of quest.nodeArray) {
            if (node.type == 'dialog') {
                switch (node.subtype) {
                    case 'def':
                        if (node.textID > id) node.textID--;

                        for (const answer of node.answerArray) {
                            if (answer.textID > id) answer.textID--;
                        }
                        break;
                    default:
                        alert('Не реализованый Нод type:' + node.subtype);
                        throw 'Не реализовано type:' + node.subtype;
                }
            }
        }
    }

    /**добавить LinkZone */
    static addLinkZone_NextNodeOwner(element, ownerNextNode, pos) {
        var zone = CreateHelper.createLinkZone(ownerNextNode);
        zone.style.left = pos.x - 10;
        zone.style.top = pos.y - 10;

        element.appendChild(zone);
    }
    /**добавить LinkZone для Branch*/
    static addLinkZone_Branch(element, ownerBranch, poses) {
        var pos = poses[0];
        var zone = CreateHelper.createLinkZone(ownerBranch, true);
        zone.style.left = pos.x - 10;
        zone.style.top = pos.y - 10;

        element.appendChild(zone);

        //================================
        pos = poses[1];
        zone = CreateHelper.createLinkZone(ownerBranch, false);
        zone.style.left = pos.x - 10;
        zone.style.top = pos.y - 10;

        element.appendChild(zone);
    }

    static getOffset_Out(node) {
        const w = 230;
        switch (node.type) {
            case 'dialog':
                let arr = [];
                let iMax = node.answerArray.length
                for (let i = 0; i < iMax; i++) {
                    let answerOffset = 23;
                    let answCount = 0;
                    if (showRU) answCount++;
                    if (showEN) answCount++;

                    if (answCount > 0) {
                        answerOffset += 21;
                        answerOffset += 21 * (answCount - 1);
                    }
                    arr.push(new Vector2(w, answersOffsetCustom + 10 + answerOffset * i));
                }
                return arr;
            case 'branch':
                return [new Vector2(w, 50), new Vector2(w, 75)];
            case 'command':
                return new Vector2(w, 40);
            case 'start':
                return new Vector2(100, 25);
            default:
                alert('Не реализованый Нод type:' + node.type);
                throw 'Не реализовано type:' + node.type;
        }
    }
    static getOffset_In(node) {
        switch (node.type) {
            case 'dialog':
            case 'branch':
            case 'command':
                return new Vector2(0, 25);
            case 'exit':
                return new Vector2(0, 10);
            default:
                alert('Не реализованый Нод type:' + node.type);
                throw 'Не реализовано type:' + node.type;
        }
    }
}

class Langs {
    RU = ['Далее'];
    EN = ['Next'];
}

class Answer {
    canHide = false;
    checkCommands = [];
    textID = 0;
    nextNode = 1;
}
class Vector2 {
    x = 0;
    y = 0;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static Sum(a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    }
}

//==========================

class Quest {
    name = 'QuestName';
    nodeArray = [new StartNode(), new ExitNode()];
    text = new Langs();
}

var node_movearea;
function node_ResizeStart(e) {
    window.addEventListener('mousemove', node_ResizeMove, true);
    window.addEventListener('mouseup', node_ResizeEnd, true);
    node_movearea.ta2.style.top = parseInt(node_movearea.ta1.style.height) + 25 + 'px';
}
function node_ResizeMove(e) {
    node_movearea.ta2.style.top = parseInt(node_movearea.ta1.style.height) + 25 + 'px';
}
function node_ResizeEnd(e) {
    window.removeEventListener('mousemove', node_ResizeMove, true);
    window.removeEventListener('mouseup', node_ResizeEnd, true);
}

class MyNode {
    type = 'none';

    //TODO проверять есть ли элемент с теми же координатами
    // если есть, то сместить на 10px
    pos = document.body ?
        new Vector2(
            document.body.clientWidth / 2,
            document.body.clientHeight / 2)
        : new Vector2();

    static getElement(node) {
        var element = document.createElement('div');
        element.classList.add('node_item');
        element.innerHTML = 'Empty';

        return element;
    }
}
class DialogNode extends MyNode {
    type = 'dialog';
    subtype = 'def';
    textID = 0;
    answerArray = [new Answer()];

    static getElement(quest, node) {
        var text = quest.text;

        answersOffsetCustom = answersOffset;
        if (!showRU) answersOffsetCustom -= 65;
        if (!showEN) answersOffsetCustom -= 65;

        var element = super.getElement(node);
        element.innerText = '[PH] Dialog ';
        element.style.height = answersOffsetCustom + 'px';


        //ответы
        let zonesEl = document.createElement('div');
        let answersEl = document.createElement('div');
        answersEl.classList.add('answers');

        answersEl.style.top = answersOffsetCustom + 'px';;

        let i = 0;
        var posesB = QuestTools.getOffset_Out(node);
        for (const answer of node.answerArray) {
            let newElement = createAnswerElement(answer, i);
            answersEl.appendChild(newElement);
            QuestTools.addLinkZone_NextNodeOwner(zonesEl, answer, posesB[i]);
            i++;
        }
        var addAnswerEl = document.createElement('button');
        addAnswerEl.setAttribute('onclick', 'addAnswer(this)');
        addAnswerEl.innerText = 'add answer';

        answersEl.appendChild(addAnswerEl);
        element.appendChild(answersEl);
        element.appendChild(zonesEl);

        //текст нода
        var offset = 0;
        if (node.textID == 0) {
            let foo = document.createElement('div');
            foo.innerText = text.EN[node.textID];
            element.appendChild(foo)
        }
        else {
            if (showRU) {
                var dialogRU = CreateHelper.createTextarea(text.RU, 'RU', node);
                dialogRU.style.position = 'absolute';
                dialogRU.style.left = '0px';
                dialogRU.style.top = dialogOffset + 'px';

                element.appendChild(dialogRU)
            }
            if (showEN) {
                var dialogEN = CreateHelper.createTextarea(text.EN, 'EN', node);
                dialogEN.style.position = 'absolute';
                dialogEN.style.left = '0px';
                if (dialogRU != undefined) {
                    dialogEN.style.top = '65px';
                    dialogRU.appendChild(dialogEN);
                }
                else {
                    dialogEN.style.top = dialogOffset + 'px';
                    element.appendChild(dialogEN);
                }
            }
            if (dialogRU != undefined && dialogEN != undefined) {
                var elements = dialogRU.getElementsByTagName('textarea');

                elements[0].parentElement.onmousedown = function (e) {
                    node_movearea = {
                        ta1: elements[0],
                        ta2: elements[1].parentElement,
                        node: node
                    };
                    node_ResizeStart();
                }
            }
        }

        return element;

        function createAnswerElement(answer, index) {
            var answersLength = node.answerArray.length;

            var element = document.createElement('div');
            element.style.border = '1px solid grey';

            if (index % 2 == 0)
                element.classList.add('answer0');
            else
                element.classList.add('answer1');

            if (answer.textID == 0)
                element.innerText = index + ':' + text.EN[answer.textID];
            else
                element.innerText = index + ':';


            // команды проверки
            if (answer.checkCommands.length == 0) {
                var addComm = document.createElement('button');
                addComm.innerText = '|';
                addComm.style.backgroundColor = '#0000';
                //TODO открыть окно комманд со ссылкой на answer.checkCommands
                element.insertBefore(addComm, element.firstChild);
            } else {

                var addComm = document.createElement('button');
                addComm.innerText = '#';
                //TODO открыть окно комманд со ссылкой на answer.checkCommands
                element.insertBefore(addComm, element.firstChild);
            }

            //кнопка удаление ответа
            var del = document.createElement('button');
            del.innerText = 'Del';
            del.addEventListener('mousedown', function (e) {
                workspace.deleteAnswer(answer);
                workspace.UpdateView();
            }, true);
            element.appendChild(del);

            //кнопки перемещения ответа в списке
            if (answersLength > 0) {
                if (index < answersLength - 1) {
                    var downEl = document.createElement('button');
                    downEl.innerText = '\\/';
                    downEl.addEventListener('mousedown', function (e) {
                        workspace.swapAnswers(node, index, index + 1)
                        workspace.UpdateView();
                    }, true);
                    element.appendChild(downEl);
                }
                if (index > 0) {
                    var upEl = document.createElement('button');
                    upEl.innerText = '/\\';
                    upEl.addEventListener('mousedown', function (e) {
                        workspace.swapAnswers(node, index, index - 1)
                        workspace.UpdateView();
                    }, true);
                    element.appendChild(upEl);
                }
            }

            // текст ответа
            if (answer.textID == 0) {
                element.style.backgroundColor = 'yellow';

                var fixMe = document.createElement('button');
                fixMe.innerText = 'Fix';
                fixMe.addEventListener('mousedown', function (e) {
                    answer.textID = QuestTools.createText(quest);
                    workspace.UpdateView();
                }, true);

                element.appendChild(fixMe);
            }
            else {
                if (showRU) {
                    var br = document.createElement('br');
                    element.appendChild(br);
                    let input = CreateHelper.createTextField(text.RU, 'RU', answer);
                    element.appendChild(input);
                }
                if (showEN) {
                    var br = document.createElement('br');
                    element.appendChild(br);
                    let input = CreateHelper.createTextField(text.EN, 'EN', answer);
                    element.appendChild(input);
                }
            }

            return element;
        }
    }
}
class BranchNode extends MyNode {
    type = 'branch';
    checkCommands = [];
    trueNode = 1;
    falseNode = 1;

    static getElement(node) {
        var element = super.getElement(node);
        element.innerHTML = '[PH] Branch';

        var posesB = QuestTools.getOffset_Out(node);
        QuestTools.addLinkZone_Branch(element, node, posesB);

        return element;
    }
}
class CommandNode extends MyNode {
    type = 'command';
    nextNode = 1;
    executeCommands = [];

    static getElement(node) {
        var element = super.getElement(node);
        element.innerText = '[PH] Command';

        var posB = QuestTools.getOffset_Out(node);
        QuestTools.addLinkZone_NextNodeOwner(element, node, posB);

        var addButton = elFactory.CreateButton(
            'add answer', CommandNode.CreateContextMenu);
        element.appendChild(addButton);

        return element;
    }

    static CreateContextMenu() {
        var elArr = [];
        elArr.push(CmdHelper.GetExeCmdList()); //TODO перенести в тело нода
        conMenu.Create(elArr);
    }
}
class StartNode extends MyNode {
    // id = 0
    type = 'start';
    nextNode = 1;

    static getElement(node) {
        var element = super.getElement(node);
        element.innerHTML = '[PH] Start';
        element.classList.add('start_node');

        var posB = QuestTools.getOffset_Out(node);
        QuestTools.addLinkZone_NextNodeOwner(element, node, posB);

        return element;
    }
}
class ExitNode extends MyNode {
    // id = 1
    type = 'exit';
    static getElement(node) {
        var element = super.getElement(node);
        element.innerHTML = '[PH] Exit';
        element.classList.add('exit_node');

        return element;
    }
}

//=============================================

class CheckpointNode extends MyNode {
    type = 'checkpoint';
    nextNode = 1;
    saveNode = 0;

    static getElement(node) {
        var element = super.getElement(node);
        element.innerText = '[PH] Checkpoint';
        return element;
    }
}

class ShiffleDialogNode extends DialogNode {
    subtype = 'shiffle';
    textIDArray = []

    static getElement(node) {
        var element = super.getElement(node);
        element.innerText = '[PH] Shiffle';
        return element;
    }
}

class CycleDialogNode extends DialogNode {
    subtype = 'cycle';
    textIDArray = []

    static getElement(node) {
        var element = super.getElement(node);
        element.innerText = '[PH] Cycle';
        return element;
    }
}