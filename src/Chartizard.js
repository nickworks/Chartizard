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

        // why declare a function? recursion!
        const drawNodes = nodes=>{
            if(!nodes.length) return;
            nodes.forEach(n=>{
                if(n.nodes.length > 0) { // if the node has children
                    this.drawLines2(n.nodes, n.xy, n.type == Node.type.iterate); // draw lines
                    drawNodes(n.nodes); // draw children
                }
                n.draw(g); // draw the node
            });
        };

        this.drawLines2(this.nodes);
        drawNodes(this.nodes); // draw this node (and child nodes)
    },
    drawLines2(nodes,sp=null,isLoop=false){
        if(!nodes.length) return;
        const g = this.graphics;
        
        // previous point
        let pp = null;
        if(sp&&sp.copy) pp = sp.copy();

        const radius = 5;

        nodes.forEach(n=>{

            // current point
            const cp = n.xy.copy();
            
            if(pp==null){
                pp=cp.copy();
                return;
            }

            // draw straight line:
            g.beginPath();
            g.moveTo(pp.x, pp.y);

            if(pp.x < cp.x) { // draw elbow
                g.lineTo(cp.x-radius, pp.y); 
                g.arc(cp.x-radius, pp.y+radius, radius, -Math.PI/2, 0, false);
            }

            g.lineTo(cp.x, cp.y);
            g.stroke();

            // draw an arrowhead from above:
            g.fillStyle = 'red';
            g.beginPath();
            g.ellipse(cp.x, cp.y-20, 5, 5, 0, 0, Math.PI*2);
            g.fill();

            // cache point
            pp=cp.copy();

        });

        if(sp){
            if(isLoop){
                // draw path back to beginning of loop:
                g.beginPath();
                g.moveTo(pp.x, pp.y);
                g.lineTo(pp.x, pp.y+50-radius);
                g.arc(pp.x-radius, pp.y+50-radius, radius, 0, Math.PI/2, false);

                g.lineTo(sp.x+10, pp.y+50);
                g.arc(sp.x, pp.y+50, 10, 0, Math.PI, true);
                
                g.lineTo(sp.x-50+radius, pp.y+50);
                g.arc(sp.x-50+radius, pp.y+50-radius, radius, Math.PI/2, Math.PI, false);
                g.lineTo(sp.x-50,sp.y+radius);
                g.arc(sp.x-50+radius, sp.y+radius, radius, -Math.PI, -Math.PI/2, false);
                g.lineTo(sp.x,sp.y);
                g.stroke();

                // draw an arrowhead from the left:
                g.fillStyle = 'red';
                g.beginPath();
                g.ellipse(sp.x-30, sp.y, 5, 5, 0, 0, Math.PI*2);
                g.fill();
            } else {
                // draw merge with parent branch:
                g.beginPath();
                g.moveTo(pp.x, pp.y);
                g.lineTo(pp.x, pp.y+50-radius);
                g.arc(pp.x-radius, pp.y+50-radius, 10, 0, Math.PI/2, false);
                g.lineTo(sp.x+radius, pp.y+50);
                g.arc(sp.x+radius, pp.y+50+radius, 10, -Math.PI/2, -Math.PI, true);
                g.stroke();
            }
        }
    },
    onclick:function(){
        var hit = false;
        this.nodes.forEach(n=>{
            if(n.onclick(this.mouse)) hit = true;
        });
    }
};