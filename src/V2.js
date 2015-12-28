function V2(x, y){
    if(window === this) return new V2(x, y);
    this.x = x || 0;
    this.y = y === 0 ? 0 : y || 0;
    return this;
}
V2.prototype = {
    add:function(x, y){
        var v = this.copy();
        if(x instanceof V2){
            v.x += x.x;
            v.y += x.y;
        } else {
            v.x += x;
            v.y += y === 0 ? y : y || x;
        }
        return v;
    },
    sub:function(x, y){
        if(x instanceof V2) return this.add(x.mult(-1));
        return this.add(-x, -y);
    },
    mult:function(n){
        var v = this.copy();
        if(typeof n === "number"){
            v.x *= n;
            v.y *= n;
        }
        return v;
    },
    copy:function(){
        return V2(this.x, this.y);
    }
};