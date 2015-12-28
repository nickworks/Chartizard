function CaptionCollection(parent, pattern){
    this.parent = parent;
    this.xy = parent.xy;
    this.wh = V2(0, 30);
    this.tokens = [];
    this.pattern = pattern;
    
    var tokens = this.pattern.split(/(@)/);
    tokens.forEach(str => {
        str = str.replace(/(^\s+|\s+$)/g, "");
        if(str == "") return;
        var input = str == "@";
        this.tokens.push(new Caption(this, input ? "" : str, input));
    });
    this.draw = function(g){
        this.tokens.forEach(t => t.draw(g));
    };
    this.calc = function(g){
        // get the text starting point:
        this.xy = this.parent.xy.copy();
        var xy = this.xy.copy();
        // loop through each Caption:
        var i = 0;
        this.tokens.forEach(t => {
            if(i > 0) xy.x += 15;
            t.xy = xy.copy();
            t.calc(g);
            xy.x += t.wh.x;
            i++;
        });
        this.wh.x = xy.x - this.xy.x;
    };
    this.onclick=function(m){
        var hit = false;
        this.tokens.forEach(t => {
             if(t.onclick(m)) hit = true;
        });
        return hit;
    };
    this.dirty = function(){
        this.parent.dirty();
    };
}