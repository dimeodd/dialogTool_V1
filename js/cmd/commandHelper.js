class CmdListProp {
    select = 0;
    length = 1;
}
const keyEnum = {
    DOWN: 40,
    UP: 38,
    ENTER: 13
};

class CmdHelper {
    static GetExeCmdList() { //TODO добавить нод в качестве параметра и изменять его
        var el = document.createElement('div');
        var list = commandsList.execute;

        var input = document.createElement('input');
        input.setAttribute('list', 'brow');
        input.oninput = onInput;
        el.appendChild(input);

        var datalist = document.createElement('datalist');
        datalist.id = "brow";
        el.appendChild(datalist);

        for (const command of list) {
            let option = document.createElement('option');
            option.value = command.text;
            datalist.appendChild(option);
        }

        return el;

        function onInput() {
            var val = input.value;
            var opts = datalist.childNodes;
            for (var i = 0; i < opts.length; i++) {
                if (opts[i].value === val) {
                    //TODO изменять внутренности нода тут
                    // типа проверить values у command, и создать поля меняющие значение команды

                    // An item was selected from the list!
                    // yourCallbackHere()
                    alert(opts[i].value);
                    break;
                }
            }
        }
    }
}