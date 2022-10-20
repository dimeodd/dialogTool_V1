class elFactory {
    static CreateButton(name, func) {
        var button = document.createElement('button');
        button.innerText = name;
        button.onclick = func;

        return button;
    }

}