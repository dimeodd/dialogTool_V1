class MousePos {
    static x = 0;
    static y = 0;

    static Init() {
        window.addEventListener('mousemove', MousePos.onMouseUpdate, false);
        window.addEventListener('mouseenter', MousePos.onMouseUpdate, false);
    }

    static onMouseUpdate(e) {
        MousePos.x = e.pageX;
        MousePos.y = e.pageY;
    }
}