function toolbar_Init() {
    var x_s = localStorage.getItem('toolbarX');
    var y_s = localStorage.getItem('toolbarY');

    if (x_s && y_s) {
        var element = document.getElementById('toolbar')
        element.style.left = x_s;
        element.style.top = y_s;
    }
}

function toolbar_OnClose() {
    var element = document.getElementById('toolbar')
    var x_s = element.style.left;
    var y_s = element.style.top;

    if (x_s && y_s) {
        localStorage.setItem('toolbarX', x_s);
        localStorage.setItem('toolbarY', y_s);
    }
}