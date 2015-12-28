function Rect(xy, wh){
    if(window === this) return new Rect(xy, wh);
    this.xy = xy || V2();
    this.wh = wh || V2();
    this.calc();
    return this;
}
Rect.prototype = {
    min:{},
    max:{},
    calc:function(){        
        this.min = this.xy.sub(this.wh.mult(.5));
        this.max = this.min.add(this.wh);
    },
    expand:function(x, y){
        var wh = this.wh.add(x * 2, y * 2);
        return Rect(this.xy, wh);
    },
    copy:function(){
        return Rect(this.xy, this.wh);
    },
    hit:function(p){
        return (p.x>=this.min.x&&p.x<=this.max.x&&p.y>=this.min.y&&p.y<=this.max.y);
    }
};