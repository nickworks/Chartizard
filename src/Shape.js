function Shape(parent,color=Chartizard.colors.nodes){
    this.parent = parent;
    this.xy = V2();
    this.wh = V2();
    this.type = Shape.type.pill;
    this.color = color;
    this.stroke = 0;
}
Shape.type = {
    pill:0,
    rect:1,
    slant:2,
    diamond:3
};
Shape.prototype = {
    padding:10,
    r:0,
    dirty:()=>{this.parent.dirty();},
    calc:function(){
        this.xy = this.parent.xy.add(this.parent.wh.x/2, 0);
        this.wh = this.parent.wh.add(this.padding, 0);
        
        var r = 20;
        if(Caption.prototype.isPrototypeOf(this.parent)){
            this.type = Shape.type.rect;
        }
        if(this.type == Shape.type.rect) r = 5;
        if(this.type == Shape.type.pill || r > this.wh.y/2) r = this.wh.y/2;
        
        this.big = new Rect(this.xy, this.wh.add(r * 2, 0));
        this.lil = this.big.expand(-r);
        this.r = r;
    },
    draw:function(g){
        g.beginPath();
        switch(this.type){
            case Shape.type.slant:
                this.drawSlant(g);
                break;
            case Shape.type.diamond:
                this.drawDiamond(g);
                break;
            default:
                this.drawRound(g);
        };
        
        g.fillStyle = this.color;//isPicked ? c.tray : c.input;
        g.fill();
        if(this.stroke){
            g.lineWidth = this.stroke;
            g.strokeStyle = Chartizard.colors.lines;
            g.stroke();  
        }

        /*
        if(Caption.prototype.isPrototypeOf(this.parent)){ // if parent is a Caption
            var f = (this.parent == Chartizard.focusInput); // if it's in focus
            g.fillStyle = f ? c.tray : c.input;
            g.fill();
            if(f)stroke();
        } else {
            g.fillStyle = c.nodes;
            g.fill();
            stroke();
        }
        */
    },
    drawDiamond:function(g){
        var lil = this.lil, big = this.big;
        g.moveTo(lil.max.x, big.min.y);
        g.lineTo(big.max.x, this.xy.y);
        g.lineTo(lil.max.x, big.max.y);
        g.lineTo(lil.min.x, big.max.y);
        g.lineTo(big.min.x, this.xy.y);
        g.lineTo(lil.min.x, big.min.y);
        g.lineTo(lil.max.x, big.min.y); 
    },
    drawSlant:function(g){
        var lil = this.lil, big = this.big;
        g.moveTo(big.max.x, big.min.y);
        g.lineTo(lil.max.x, big.max.y);
        g.lineTo(big.min.x, big.max.y);
        g.lineTo(lil.min.x, big.min.y);
        g.lineTo(big.max.x, big.min.y);
    },
    drawRound:function(g){
        var lil = this.lil, big = this.big, r = this.r;
        g.moveTo(lil.max.x, big.min.y);
        g.arcTo(big.max.x, big.min.y, big.max.x, lil.min.y, r);
        g.arcTo(big.max.x, big.max.y, lil.max.x, big.max.y, r);
        g.arcTo(big.min.x, big.max.y, big.min.x, lil.max.y, r);
        g.arcTo(big.min.x, big.min.y, lil.min.x, big.min.y, r);
        g.lineTo(lil.max.x, big.min.y);
    },
};