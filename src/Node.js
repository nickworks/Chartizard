function Node(type, text){
    this.xy = V2(50);
    this.wh = V2(0, 44);
    this.nodes = [];
    this.type = type;
    this.cc = new CaptionCollection(this, text);
    this.isdirty = true;
    this.bg = new Shape(this);
    
    this.dirty=function(){
        this.isdirty = true;  
    };
    this.draw=function(g){  
        g.font = "18px Arial";
        g.textBaseline = "middle";
        
        const isPicked = (this == Chartizard.focusInput);

        this.bg.color = isPicked ? Chartizard.colors.picked : Chartizard.colors.nodes;
        this.bg.stroke = isPicked ? 2 : 0;

        if(this.isdirty) this.calc(g);
        this.bg.draw(g); // draw background
        this.cc.draw(g); // draw captions
        if(this.child) this.child.draw();


    };
    this.calc=function(g){
        this.cc.calc(g);
        var w = this.wh.x = this.cc.wh.x;
        var padding = 15;
        switch(this.type){
            case Node.type.start:
            case Node.type.end:
                padding = 0;
                this.bg.type = Shape.type.pill;
                break;
            case Node.type.assign:
                this.bg.type = Shape.type.rect;
                break;
            case Node.type.output:
            case Node.type.input:
                this.bg.type = Shape.type.slant;
                break;
            case Node.type.branch:
            case Node.type.iterate:
                this.bg.type = Shape.type.diamond;
                break;
        }
        this.bg.padding = padding + this.cc.padding;
        this.bg.calc();
        this.isdirty = false;
    };
    this.move=function(p){
        this.xy = p.copy();
        this.dirty();
    };
    this.onclick=function(m){
        
        // check selectable captions:
        if(this.cc.onclick(m)) return true;
        
        // check this node:
        if(this.bg&&this.bg.big.hit(m)){
            Chartizard.focus(this);
            return true;
        }
        // check child nodes:
        for(let i = 0; i < this.nodes.length; i++){
            if(this.nodes[i].onclick(m)) return true;
        }

        return false;
    };
    this.focus=function(){
    };
    this.blur=function(){
    };
    this.drag=function(m){
    };
}
Node.type = {
    start:1,
    end:2,
    assign:3,
    output:4,
    input:5,
    branch:6,
    iterate:7,
};