function Node(type, text){
    this.xy = V2(50);
    this.wh = V2(0, 44);
    this.child = null;
    this.type = type;
    this.cc = new CaptionCollection(this, text);
    this.isdirty = true;
    this.bg = new Shape(this);
    
    this.dirty = function(){
        this.isdirty = true;  
    };
    this.draw = function(g){  
        g.font = "18px Arial";
        g.textBaseline = "middle";
        
        if(this.isdirty) this.calc(g);
        this.bg.draw(g);
        this.cc.draw(g);
        if(this.child) this.child.draw();
    };
    this.calc=function(g){
        this.cc.calc(g);
        var w = this.wh.x = this.cc.wh.x;
        switch(this.type){
            case Node.type.start:
            case Node.type.end:
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
        this.bg.calc();
        this.isdirty = false;
    };
    this.move = function(p){
        this.xy = p.copy();
        this.dirty();
    };
    this.onclick=function(m){
        // Nodes aren't selectable, so don't bother testing.
        // Instead, test against the input-type captions
        
        return this.cc.onclick(m);
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