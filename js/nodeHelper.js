/**Cоздаёт html элементы для нод */
class CreateHelper {
    static createTextarea(textLangArr, LANG, textNode) {
        let element = document.createElement('div');
        element.innerText = LANG;
        let br = document.createElement('br');

        let input = document.createElement('textarea');
        input.style.height = '40px';
        input.style.width = '200px';
        input.style.maxlength = 200;

        input.value = textLangArr[textNode.textID];
        input.oninput = function (e) {
            textLangArr[textNode.textID] = e.target.value;
        }

        let reset = document.createElement('button');
        reset.innerText = "reserSize";
        reset.setAttribute("onclick", "workspace.UpdateView()");

        element.appendChild(reset);
        element.appendChild(br);
        element.appendChild(input);

        return element;
    }

    static createTextField(textLANG, LANG, answer) {
        let label = document.createElement('label');
        label.innerText = LANG;

        let input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.value = textLANG[answer.textID];
        input.oninput = function (e) {
            textLANG[answer.textID] = e.target.value;
        }
        label.appendChild(input);

        return label;
    }

    static createLinkZone(owner, branchParam = undefined) {
        var zone = document.createElement('div');
        zone.classList.add('linkZone');
        zone.addEventListener('mousedown', function (e) {
            link_Begin_NextNode(e, owner, branchParam);
        }, true);

        if (branchParam != undefined) {
            zone.innerText = branchParam;
        }
        return zone;
    }

    static createButton(text, func) {
        var butt = document.createElement('button');
        butt.innerText = text;
        butt.onclick = func;

        return butt;
    }
}