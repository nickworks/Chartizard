function Chartizard(id, width, height){
    if(id){
        if(window === this) return new Chartizard(id, width, height);
        return this.init(id);
    }
    return {
        Version:0.1,
        Author:"Nick Pattison",
        Updated:"16 December 2015"
    };
}
Chartizard.colors = {
    bg:"#D7D7D7",
    nodes:"#959595",
    lines:"#2568A8",
    text:"#464646",
    input:"#D7D7D7",
    error:"#972425",
    accent:"#92CEF0",
    tray:"#92CEF0"
};
Chartizard.focus = function(f){
    Chartizard.blur();
    f.focus();
    Chartizard.focusInput = f;
};
Chartizard.blur = function() {
    if(Chartizard.focusInput) Chartizard.focusInput.blur();
    Chartizard.focusInput = null;
}
Chartizard.prototype = {
    mouse:V2(),
    mousedown:false,
    nodes:[],
    init:function(id, width, height){
        this.canvas = document.createElement("canvas");
        this.canvas.width = width || 500;
        this.canvas.height = height || 400;
        this.graphics = this.canvas.getContext("2d");
        document.getElementById(id).appendChild(this.canvas);
        (function(chart){
            var f = function(){
                chart.draw();
                window.requestAnimationFrame(f);
            };
            f();
            chart.canvas.addEventListener('mousedown', function(e){
                chart.mousedown = true;
                Chartizard.blur();
                chart.onclick();
                return false;
            });
            chart.canvas.addEventListener('mousemove',function(e){
                chart.mouse.x = e.pageX - chart.canvas.offsetLeft;
                chart.mouse.y = e.pageY - chart.canvas.offsetTop;
                if(chart.mousedown && Chartizard.focusInput) Chartizard.focusInput.drag(chart.mouse); 
            });
            chart.canvas.addEventListener('mouseup', function(e){
                chart.mousedown = false;
            });
            document.addEventListener('keydown', function(e){
                //console.log(e.keyCode);
                // 8 - backspace
                // 27 - escape
                // 46 - delete
                var k = e.keyCode;
                var cancel = (k == 8 || k == 37 || k == 38 || k == 39 || k == 40 || k == 46);
                if(cancel) {
                    e.returnValue = false;
                    e.cancelBubble = true;
                    if(e.stopPropagation) e.stopPropagation();
                    if(e.preventDefault) e.preventDefault();
                    if(Chartizard.focusInput) Chartizard.focusInput.key(e);
                }
            });
            document.addEventListener('keypress', function(e){
                //console.log(e.keyCode);
                if(e.keyCode == 13) Chartizard.blur(); // enter
                if(Chartizard.focusInput) Chartizard.focusInput.char(String.fromCharCode(e.keyCode));
            });
        })(this);
        
        this.nodes.push(new Node(1, "start"));
        this.nodes.push(new Node(3, "@ = @"));
        this.nodes.push(new Node(4, "output @"));
        this.nodes.push(new Node(2, "end"));
        this.calc();
        
        return this;
    },
    clear:function(){
        this.graphics.fillStyle = Chartizard.colors.bg;
        this.graphics.fillRect(0,0,this.canvas.width,this.canvas.height);
    },
    calc:function(){
        // layout the nodes:
        var xy = V2(50, 50);
        var layout = n=>{
            n.move(xy);
            xy.y += 50;
        };
        this.nodes.forEach(layout);
    },
    draw:function(){
        var g = this.graphics;
        this.clear();
        var drawNodeList = nodes=>{
            for(var i = 0; i < nodes.length; i++){
                var n1 = nodes[i], n2 = i < nodes.length - 1 ? nodes[i+1] : null;
                if(n2) this.line(n1.xy, n2.xy);
                n1.draw(g);
            }
        };
        drawNodeList(this.nodes);
    },
    line:function(p1, p2){
        var g = this.graphics;
        g.lineWidth = 2;
        g.strokeStyle = Chartizard.colors.lines;
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.stroke();
    },
    onclick:function(){
        var hit = false;
        this.nodes.forEach(n=>{
            if(n.onclick(this.mouse)) hit = true;
        });
    }
};