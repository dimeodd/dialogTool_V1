var workspace;
var lastSaveQuest_txt;
const newWorkspace = '{"name":"QuestName","nodeArray":[{"type":"start","pos":{"x":655,"y":442},"nextNode":1},{"type":"exit","pos":{"x":1013,"y":445}}],"text":{"RU":["Далее"],"EN":["Next"]}}';

//Init
function workspace_Init() {
    workspace = new Workspace();
    workspace.quest = JSON.parse(newWorkspace);
    lastSaveQuest_txt = newWorkspace;
    workspace.UpdateView();
}

function createDialogNode() {
    workspace.addNode(new DialogNode());
};
function createBranchNode() {
    workspace.addNode(new BranchNode());
};
function createCommandNode() {
    workspace.addNode(new CommandNode());
};

function setNextNode(targetA, targetB) {
    var elementB = element.closest('div.node_item');
    if (!elementB) {
        console.log('wrong target');
        return;
    }
    var idB = parseInt(elementB.id);


    throw ('not implemented');
};

function deleteNode(target) {
    var element = target.closest('div.node_item');
    if (!element) {
        alert('wrong target');
        throw ('wrong target');
    }

    var id = parseInt(element.id.substring(9));
    if (id == undefined) throw 'ошибка удаления элемента по elementId'

    if (confirm('Вы действительно хотите БЕЗВОЗВРАТНО удалить это?')) {
        workspace.deleteNode(id)
    }
}
function addAnswer(element) {
    var nodeElement = element.closest('div.node_item');
    if (!nodeElement) {
        alert('wrong target');
        throw ('wrong target');
    }

    var node = workspace.GetNodeByHtmlId(nodeElement.id);
    workspace.addAnswer(node);
    workspace.UpdateView();
}

function newFile() {
    if (!workspace.isSaved()) {
        if (!confirm('Есть несохранённые данные. Продолжить?')) {
            return;
        }
    }
    workspace_Init();
}
function openFile() {
    workspace.open();
}
function saveFile() {
    workspace.save();
}

function ws_openSave() {
    var data = localStorage.getItem('exSave');
    if (data) {
        var button = document.createElement('button');
        button.innerText = 'восстановить сессию';
        button.onclick = function () {
            if (confirm('Восстановить предыдущую сессию?')) {
                workspace.loadData(data);
                button.remove();
            }
        }
        var header = document.getElementById('header');
        header.appendChild(button);
    }
}
function ws_closeSave() {
    var data = JSON.stringify(workspace.quest);
    localStorage.setItem('exSave', data);
}

class Workspace {
    quest = new Quest();
    nodeElements = document.getElementById('content_node');
    drawElements = [];

    constructor() {
        lastSaveQuest_txt = JSON.stringify(this.quest);
        this.UpdateView();
    }

    /**переименовать*/
    rename(text) {
        this.quest.name = text;

    }

    /** добавление элемента */
    addNode(node) {
        const quest = this.quest;

        if (!(node instanceof MyNode)) return;
        quest.nodeArray.push(node);

        if (node instanceof DialogNode) {

            if (node.subtype == 'shiffle' || node.subtype == 'cycle') {
                alert('Не реализованый Нод');
                throw 'Не реализовано';
            }

            node.textID = QuestTools.createText(quest);

            //FIXME узнать как лучше сделать
            // for (const asw of node.answerArray) {
            //     asw.textID = QuestTools.createText(quest);
            // }
        }
        this.UpdateView();
    }

    /**удаление нода по id*/
    deleteNode(id) {
        if (id == 0 || id == 1) throw 'Попытка удаления важного нода. id=' + id;

        var quest = this.quest;
        var nodes = quest.nodeArray
        var delNode = nodes[id];
        if (delNode.type == 'dialog') {
            if (delNode.subtype == 'shiffle' || delNode.subtype == 'cycle') {
                alert('Не реализованый Нод');
                throw 'Не реализовано';
            }
            QuestTools.deleteText(quest, delNode.textID);
            for (const answer of delNode.answerArray) {
                QuestTools.deleteText(quest, answer.textID);
            }
        }

        //удалить элемент
        nodes.splice(id, 1);

        //заменить ссылки
        for (const node of nodes) {
            switch (node.type) {
                case 'dialog':
                    if (node.subtype == 'shiffle' || node.subtype == 'cycle') {
                        alert('Не реализованый Нод');
                        throw 'Не реализовано';
                    }
                    for (const answer of node.answerArray) {
                        if (answer.nextNode == id) {
                            answer.nextNode = 1;
                        }
                        else if (answer.nextNode > id) {
                            answer.nextNode--;
                        }
                    }
                    break;
                case 'branch':
                    if (node.trueNode == id)
                        node.trueNode = 1;
                    else if (node.trueNode > id)
                        node.trueNode--;

                    if (node.falseNode == id)
                        node.falseNode = 1;
                    else if (node.falseNode > id)
                        node.falseNode--;
                    break;
                case 'command':
                case 'start':
                    if (node.nextNode == id)
                        node.nextNode = 1;
                    else if (node.nextNode > id)
                        node.nextNode--;
                    break;
                case 'exit':
                    break;
                default:
                    alert('Не реализованый Нод type:' + node.type);
                    throw 'Не реализовано type:' + node.type;

                // case 'checkpoint':
                //     if (node.nextNode == id)
                //         node.nextNode = 1;
                //     else if (node.nextNode > id)
                //         node.nextNode--;

                //     if (node.saveNode == id)
                //         node.saveNode = 0;
                //     else if (node.saveNode > id)
                //         node.saveNode--;
                //     break;
            }
        }

        this.UpdateView();
    }

    //TODO перемещение элемента в пространстве

    isSaved() {
        return lastSaveQuest_txt == JSON.stringify(this.quest);
    }
    /**сохранить*/
    save() {
        var errors = Workspace.checkDataError(this.quest);
        if (errors !== null) {
            //TODO вывести список ошибок
            if (confirm('Данные некорректны, требуется исправление. Хотите сохранить?')) {
                var data = JSON.stringify(this.quest);
                download('corrupted_quest_' + this.quest.name + '.json', data, 'text/json');
            }
        } else {
            var data = JSON.stringify(this.quest);
            download('quest_' + this.quest.name + '.json', data, 'text/json');
            console.log('флаг данных');
            lastSaveQuest_txt = data;
        }
        function download(name, text, type) {
            var a = window.document.createElement('a');
            var file = new Blob([text], { type: type });
            a.href = URL.createObjectURL(file);
            a.download = name;

            a.click();
            a.remove();
        }
    }

    /**открыть*/
    open() {
        if (!this.isSaved()) {
            if (!confirm('Есть несохранённые данные. Продолжить?')) {
                return;
            }
        }

        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = readText;
        fileInput.accept = '.json';

        fileInput.click();
        fileInput.remove();

        async function readText(event) {
            const file = event.target.files.item(0);
            const text = await file.text();

            workspace.loadData(text);
        }
    }

    loadData(text) {
        var temp = workspace.quest;
        try {
            //TODO убрать или сделать в виде отдельного окна
            this.quest = JSON.parse(text);

            var a = Workspace.checkDataCurrupt(this.quest);
            if (a !== null) throw 'quest errors';

            lastSaveQuest_txt = JSON.stringify(this.quest)
            this.UpdateView();
        }
        catch (ex) {
            this.quest = temp;
            this.UpdateView();
            alert('ошибка данных. Некорретеный файл: ' + ex);
            throw ex;
        }
    }

    /** Обновить элементы */
    UpdateView() {
        var quest = this.quest;

        var inElement = document.getElementById('questName');
        inElement.value = this.quest.name;

        const nodes = this.quest.nodeArray;
        this.nodeElements.innerHTML = '';

        var i = 0;
        for (const node of nodes) {
            var element = createViewNode(node, i);
            var idEl = document.createElement('div');
            idEl.innerText = 'id:' + i;
            element.firstElementChild.appendChild(idEl);

            this.nodeElements.appendChild(element);
            i++;
        }

        this.drawElements = [];
        LineTools.CreateLines(nodes, this.drawElements);
        this.UpdateLines();

        function createViewNode(node = new MyNode(), id = -1) {

            var element = QuestTools.creareNodeEl(quest, node); //заменить на QuestTools.createElement

            element.classList.add('draggable');
            element.style.position = 'absolute';
            element.id = 'questNode' + id;
            element.style.left = node.pos.x + 'px';
            element.style.top = node.pos.y + 'px';

            addMoveArea(element);

            //TODO сделать частью QuestTools.getInnerHtml
            if (node.type !== 'start' & node.type !== 'exit') {
                addDelButton(element);
            }

            return element;
        }
    }

    /** Обновить линии */
    UpdateLines() {
        const de = this.drawElements;
        lt_Clear();
        for (const line of de) {
            line.draw();
        }
    }


    GetNodeByHtmlId(htmlId = 'none') {
        if (htmlId === 'none') throw 'htmlId = none';

        var id = htmlId.substring(9);
        return this.quest.nodeArray[id];
    }

    GetAnswerByHtmlElement(element) {
        throw ('not implemented');
    }

    static checkDataError(quest) {
        //TODO проверка актуальности данных

        return null;
    }

    static checkDataCurrupt(quest) {
        //TODO проверка ошибок в данных

        //warn нет ссылки на ноду => удалить ноду
        //warn текст заглушка
        //warn диалог заглушка
        //warn ответ заглушка
        //warn нет диалогов
        //warn textID == 0; => создать текст заглушку
        //warn commandsNode не содержит executeCommands => удалить ноду
        //error ссылка на несуществующую ноду
        //error ошибка в команде

        return null;
    }

    static setNextNode(nextNodeOwner, idB) {
        if (nextNodeOwner.nextNode !== undefined) {
            nextNodeOwner.nextNode = idB;
        }
        else {
            alert('Не реализованый Нод type:' + nextNodeOwner.type);
            throw 'Не реализовано type:' + nextNodeOwner.type;
        }
    }
    static setNextNode_Branch(branchNode, idB, isTrue) {
        if (branchNode.type == 'branch') {
            if (isTrue)
                branchNode.trueNode = idB;
            else
                branchNode.falseNode = idB;
        }
        else {
            alert('Не реализованый Нод type:' + branchNode.type);
            throw 'Не реализовано type:' + branchNode.type;
        }
    }

    swapAnswers(node, index1, index2) {
        if (node.type !== 'dialog') throw 'wrong type';
        if (node.subtype == 'shiffle' || node.subtype == 'cycle') {
            alert('Не реализованый Нод');
            throw 'Не реализовано';
        }
        var answersLength = node.answerArray.length;
        if (index1 >= answersLength || index2 >= answersLength
            || index1 < 0 || index2 < 0)
            throw 'out of range';

        var temp = node.answerArray[index1];
        node.answerArray[index1] = node.answerArray[index2];
        node.answerArray[index2] = temp;
    }
    addAnswer(node) {
        if (node.type !== 'dialog') throw 'wrong type';
        if (node.subtype == 'shiffle' || node.subtype == 'cycle') {
            alert('Не реализованый Нод');
            throw 'Не реализовано';
        }

        var answer = new Answer();
        //FIXME узнать как лучше сделать
        answer.textID = QuestTools.createText(this.quest);
        node.answerArray.push(answer);
    }
    deleteAnswer(answer) {
        var nodes = this.quest.nodeArray;
        for (const node of nodes) {
            if (node.type !== 'dialog') continue;
            if (node.subtype == 'shiffle' || node.subtype == 'cycle') {
                alert('Не реализованый Нод');
                throw 'Не реализовано';
            }

            var index = node.answerArray.indexOf(answer)
            if (index == -1) continue;

            node.answerArray.splice(index, 1);
            QuestTools.deleteText(this.quest, answer.textID);

            if (node.answerArray.length == 0) {
                this.addAnswer(node);
            }
            return;
        }

        throw 'невозможная ошибка';
    }

}