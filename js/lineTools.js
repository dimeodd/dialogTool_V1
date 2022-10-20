var lt_canvas = document.getElementById('');
var ns = 'http://www.w3.org/2000/svg';

class LineTools {
    /**Создаёт данные для рисования линий */
    static CreateLines(nodes, drawElements) {
        for (const node of nodes) {
            if (node.nextNode !== undefined) {
                var nodeB = nodes[node.nextNode];
                CreateLine(node, nodeB);
            }
            else switch (node.type) {
                case 'dialog':
                    if (node.subtype == 'shiffle' || node.subtype == 'cycle') {
                        alert('Не реализованый Нод');
                        throw 'Не реализовано';
                    }
                    CreateAnswerLines(node);
                    break;
                case 'branch':
                    CreateBranchLines(node);
                    break;
                case 'exit':
                    break;
                default:
                    alert('Не реализованый Нод type:' + node.type);
                    throw 'Не реализовано type:' + node.type;
            }
        }

        function CreateLine(nodeA, nodeB) {
            var drawE = new DrawElement_line(
                nodeA.pos,
                QuestTools.getOffset_Out(nodeA),
                nodeB.pos,
                QuestTools.getOffset_In(nodeB));
            drawElements.push(drawE)
        }

        function CreateBranchLines(nodeA) {
            var arr = QuestTools.getOffset_Out(nodeA);

            var nodeB = nodes[nodeA.trueNode];
            var drawE = new DrawElement_line(
                nodeA.pos,
                arr[0],
                nodeB.pos,
                QuestTools.getOffset_In(nodeB));
            drawElements.push(drawE)

            var nodeB = nodes[nodeA.falseNode];
            var drawE = new DrawElement_line(
                nodeA.pos,
                arr[1],
                nodeB.pos,
                QuestTools.getOffset_In(nodeB));
            drawElements.push(drawE)
        }
        function CreateAnswerLines(nodeA) {
            var arr = QuestTools.getOffset_Out(nodeA);
            let i = 0;
            for (const answer of nodeA.answerArray) {
                var nodeB = nodes[answer.nextNode];
                var drawE = new DrawElement_line(
                    nodeA.pos,
                    arr[i],
                    nodeB.pos,
                    QuestTools.getOffset_In(nodeB));
                drawElements.push(drawE)
                i++;
            }
        }
    }

}

class DrawElement_line {
    posA;
    offsetA;
    posB;
    offsetB;

    constructor(posA, offsetA, posB, offsetB) {
        this.posA = posA;
        this.offsetA = offsetA;
        this.posB = posB;
        this.offsetB = offsetB;
    }

    draw() {
        var a = Vector2.Sum(this.posA, this.offsetA);
        var b = Vector2.Sum(this.posB, this.offsetB);
        lt_drawLine(a, b);
        lt_drawArrow(b);
    }
}

class fastLine {
    posA;
    posB;
    line;
    arrow;
    constructor(posA, posB) {
        this.posA = posA;
        this.posB = posB;

        this.line = lt_drawLine(posA, posB, true);
        this.arrow = lt_drawArrow(posB, true);
    }

    draw() {
        this.line.remove();
        this.arrow.remove();

        this.line = lt_drawLine(this.posA, this.posB, true);
        this.arrow = lt_drawArrow(this.posB, true);
    }
    clear() {
        this.line.remove();
        this.arrow.remove();
        this.posA = null;
        this.posB = null;
        this.line = null;
        this.arrow = null;
    }
}

function lt_Init() {
    lt_canvas = document.getElementById('content_svg').firstElementChild;
}

function lt_Clear() {
    lt_canvas.innerHTML = '';
}

function lt_drawArrow(pos, colored = false) {
    const size = 10;
    var d = 'M'
    addZ(pos.x - size);
    addZ(pos.y + size);
    addZ('L');
    addZ(pos.x);
    addZ(pos.y);
    addZ(pos.x - size);
    addZ(pos.y - size);

    var path = document.createElementNS(ns, 'path');
    path.setAttributeNS(null, 'd', d);
    if (colored) {
        path.setAttributeNS(null, 'stroke', 'blue');
    }
    lt_canvas.appendChild(path);

    return path;
    function addZ(z) {
        d += ' ' + z;
    }
}
function lt_drawLine(posA, posB, colored = false) {

    var d = 'M'
    addZ(posA.x);
    addZ(posA.y);

    if (posA.x + 30 <= posB.x) {
        var h1_x = (posB.x + posA.x) / 2
        var pos1 = new Vector2(h1_x, posA.y);
        var pos2 = new Vector2(h1_x, posB.y);

        addZ('C');
        addZ(pos1.x);
        addZ(pos1.y);
        addZ(pos2.x);
        addZ(pos2.y);
        addZ(posB.x);
        addZ(posB.y);
    } else {
        const isHight = posB.y < posA.y;
        const h_x = (posB.x + posA.x) / 2;
        const h_y = (posB.y + posA.y) / 2;

        // const h2_x = (posB.x + posA.x) / 4;
        // const h2_y = (posB.y + posA.y) / 4;
        // const h1_x = h2_x * 3;
        // const h1_y = h2_y * 3;

        const posEnd = new Vector2(posB.x - 20, isHight ? posB.y + 40 : posB.y - 40)

        addZ('Q');
        addZ(posA.x + 20);
        addZ(posA.y);
        addZ(posA.x + 20);
        isHight ? addZ(posA.y - 40) : addZ(posA.y + 40);

        addZ('T' + h_x); addZ(h_y);
        addZ('T' + posEnd.x); addZ(posEnd.y);

        addZ('Q');
        addZ(posEnd.x);
        addZ(posB.y);
        addZ(posB.x);
        addZ(posB.y);
    }
    var path = document.createElementNS(ns, 'path');
    path.setAttributeNS(null, 'd', d);
    if (colored) {
        path.setAttributeNS(null, 'stroke', 'blue');
    }
    lt_canvas.appendChild(path);

    return path;
    function addZ(z) {
        d += ' ' + z;
    }
}