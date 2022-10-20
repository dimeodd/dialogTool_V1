class conMenu {
    static keyEnum = {
        DOWN: 40,
        UP: 38,
        ENTER: 13
    };

    static cMenu;
    static cMenu_sel = 0;
    static cMenu_count = 0;

    /**Создаёт менюшку*/
    static Create(innerElenents) {
        if (conMenu.cMenu) conMenu.cMenu.remove();

        conMenu.cMenu_sel = 0;
        conMenu.cMenu_count = innerElenents.lenght;

        var cMenu = document.createElement('div');
        cMenu.id = 'context_menu';
        cMenu.style.top = MousePos.y;
        cMenu.style.left = MousePos.x;

        window.addEventListener('mousedown', conMenu.onMouseDown, false);
        //   window.onkeydown = conMenu.keys;

        cMenu.innerText = 'context menu'
        for (const el of innerElenents) {
            cMenu.appendChild(document.createElement('br'));
            cMenu.appendChild(el);
        }

        document.body.appendChild(cMenu);
        conMenu.cMenu = cMenu
    }

    static onMouseDown(e) {
        if (e.target.closest('#context_menu')) {
            return;
        }

        if (conMenu.cMenu) conMenu.cMenu.remove();
        //  window.onkeydown = null;
        window.removeEventListener('mousedown', conMenu.onMouseDown);
    }

    static keys(e) {
        // e.preventDefault();
        // e.stopPropagation();

        if (e.keyCode == conMenu.keyEnum.UP) {
            alert("up");
        }
        if (e.keyCode == conMenu.keyEnum.DOWN) {
            alert("down");
        }
        if (e.keyCode == conMenu.keyEnum.ENTER) {
            alert("ENTER");
        }
    }
}