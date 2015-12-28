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
            document.addEventListener('mousedown', function(e){
                chart.mousedown = true;
                Chartizard.blur();
                chart.onclick();
                return false;
            });
            document.addEventListener('mousemove',function(e){
                chart.mouse.x = e.pageX - chart.canvas.offsetLeft;
                chart.mouse.y = e.pageY - chart.canvas.offsetTop;
                if(chart.mousedown && Chartizard.focusInput) Chartizard.focusInput.drag(chart.mouse); 
            });
            document.addEventListener('mouseup', function(e){
                chart.mousedown = false;
            });
            document.addEventListener('keydown', function(e){
                if(!Chartizard.focusInput) return;
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
                    Chartizard.focusInput.key(e);
                }
            });
            document.addEventListener('keypress', function(e){
                //console.log(e.keyCode);
                if(e.keyCode == 13) Chartizard.blur(); // enter
                if(Chartizard.focusInput) Chartizard.focusInput.char(String.fromCharCode(e.keyCode));
            });
        })(this);
        
        this.nodes.push(new Node(1, "start @"));
        this.nodes.push(new Node(3, "set @ = @ value"));
        this.nodes.push(new Node(7, "@ == @"));
        this.nodes.push(new Node(2, "end"));
        
        this.nodes[2].nodes.push(new Node(3, "hello!"));
        this.nodes[2].nodes.push(new Node(4, "@ = @"));
        this.calc();
        
        return this;
    },
    clear:function(){
        this.graphics.fillStyle = Chartizard.colors.bg;
        this.graphics.fillRect(0,0,this.canvas.width,this.canvas.height);
    },
    calc:function(){
        // layout the nodes:
        this.nodes.forEach(n=>n.calc(this.graphics));
        var layout = (nodes,xy)=>{
            nodes.forEach(n=>{
                n.move(xy);
                if(n.nodes.length > 0){
                    xy.y = layout(n.nodes, xy.add(n.wh.x + 60, 35)).y;
                }
                xy.y += 55;
            });
            return xy;
        };
        layout(this.nodes, V2(60,50));
    },
    draw:function(){
        var g = this.graphics;
        this.clear();
        var drawNodes = nodes=>{
            if(!nodes.length) return;
            nodes.forEach(n=>{
                if(n.nodes.length > 0) {
                    this.lines(n.nodes, n.xy, n.type == Node.type.iterate);
                    drawNodes(n.nodes);
                }
                n.draw(g);
            });
        };
        this.lines(this.nodes);
        drawNodes(this.nodes);
    },
    lines:function(nodes, p4, loop){
        
        if(!nodes.length) return;
        
        var p1 = nodes[0].xy.copy();
        var p2 = nodes[nodes.length-1].xy.copy();
        
        var g = this.graphics;
        g.lineWidth = 2;
        g.strokeStyle = Chartizard.colors.lines;
        g.beginPath();
        if(p4){
            // draw loops and branches:
            p1.y = p4.y;
            p2.y += 55;
            g.moveTo(p4.x, p4.y);
            g.lineTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            if(loop){
                var p3 = p4.sub(40, 0);
                g.lineTo(p4.x + 10, p2.y);
                g.arc(p4.x, p2.y, 10, 0, Math.PI, true)
                g.moveTo(p4.x - 10, p2.y);
                g.lineTo(p3.x, p2.y);
                g.lineTo(p3.x, p3.y);
                g.lineTo(p4.x, p4.y);
                g.stroke();
            } else {
                g.lineTo(p4.x, p2.y);
                g.stroke();
                g.fillStyle=Chartizard.colors.nodes;
                g.beginPath();
                g.arc(p4.x, p2.y, 10, 0, Math.PI * 2);
                g.fill();
                g.stroke();
            }
        } else {
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.stroke();
        }
    },
    onclick:function(){
        var hit = false;
        this.nodes.forEach(n=>{
            if(n.onclick(this.mouse)) hit = true;
        });
    }
};