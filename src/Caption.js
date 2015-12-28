function Caption(parent, text, input){
    this.parent = parent;
    this.input = Boolean(input);
    this.xy = V2();
    this.wh = V2(100, 30);
    this.text = text || "";
    this.bg = this.input ? new Shape(this) : false;
    this.cursor1 = 0;
    this.cursor2 = 0;
    this.anchor = 0;
    this.dirty = () => {
        this.parent.dirty();
    };
    this.xs = [];
}
Caption.prototype = {
    draw:function(g){
        var p = this.xy.copy(), s = this.wh.mult(.5);
        if(this.bg) this.bg.draw(g);
        g.fillStyle=Chartizard.colors.text;
        g.fillText(this.text, p.x, p.y);
        if(this == Chartizard.focusInput){
            p.x += g.measureText(this.chunk1()).width;
            var w = this.cursor1 != this.cursor2 ? g.measureText(this.chunk2()).width : 1;
            g.fillRect(p.x, p.y - s.y/2, w, s.y);
        }
    },
    cache:function(g){
        this.xs = [];
        var x = this.xy.x;
        this.xs.push(x);
        var temp = "";
        this.text.split('').forEach(c=>{
            temp += c;
            var w = x + g.measureText(temp).width;
            this.xs.push(w);
        });
    },
    lookup:function(x){
        var i = 0;
        var r = 0;
        var m = 2000;
        this.xs.forEach(n=>{
            var d = Math.abs(x - n);
            if(d < m) {
                m = d;
                r = i;
            }
            i++;
        });
        return r;
    },
    chunk1:function(){
        return this.text.substring(0,this.cursor1);
    },
    chunk2:function(){
        return this.text.substring(this.cursor1, this.cursor2);
    },
    chunk3:function(){
        return this.text.substring(this.cursor2);
    },
    calc:function(g){
        if(this.input) this.cache(g);
        this.wh.x = g.measureText(this.text).width;
        if(this.bg) this.bg.calc();
    },
    focus:function(){
    },
    blur:function(){
    },
    clamp:function(){
        var m = this.text.length, c1 = this.cursor1, c2 = this.cursor2, a = this.anchor;
        if(c1 < 0) c1 = 0;
        if(c2 < 0) c2 = 0;
        if(c1 > m) c1 = m;
        if(c2 > m) c2 = m;
        if(c1 > c2) {
            // swap:
            var t = c1;
            c1 = c2, c2 = t, a = (a == 2) ? 1 : 2;
        }
        this.cursor1 = c1, this.cursor2 = c2, this.anchor = a;
    },
    key:function(e){
        var multi = this.cursor1 != this.cursor2;
        if(e.keyCode == 37){ // left:
            if(e.shiftKey){
                if(!multi) this.anchor = 2;
                if(this.anchor == 1) this.cursor2--;
                if(this.anchor == 2) this.cursor1--;
            } else {
                this.anchor = 0;
                this.cursor2 = --this.cursor1;
            }
            this.clamp();
            return;
        }
        if(e.keyCode == 39){ // right:
            if(e.shiftKey){
                if(!multi) this.anchor = 1;
                if(this.anchor == 1) this.cursor2++;
                if(this.anchor == 2) this.cursor1++;
            } else {
                this.anchor = 0;
                this.cursor1 = ++this.cursor2;
            }
            this.clamp();
            return;
        }
        if(e.keyCode == 38){ // up:
            if(e.shiftKey){
                if(!multi) this.anchor = 2;
                if(this.anchor == 1) this.cursor2 = 0;
                if(this.anchor == 2) this.cursor1 = 0;
            } else {
                this.anchor = 0;
                this.cursor1 = this.cursor2 = 0;
            }
            this.clamp();
            return;
        }
        if(e.keyCode == 40){ // down:
            if(e.shiftKey){
                if(!multi) this.anchor = 1;
                if(this.anchor == 1) this.cursor2 = this.text.length;
                if(this.anchor == 2) this.cursor1 = this.text.length;
            } else {
                this.anchor = 0;
                this.cursor1 = this.cursor2 = this.text.length;
            }
            this.clamp();
            return;
        }
        var c = "",
            t1 = this.chunk1(),
            t2 = this.chunk3();
        if(e.keyCode == 8 && !multi) t1 = t1.substr(0,t1.length-1);   
        if(e.keyCode == 46 && !multi) t2 = t2.substr(1);
        t1 += c;
        this.text = t1 + t2;
        this.cursor1 = this.cursor2 = t1.length;
        this.clamp();
        this.dirty();
    },
    char:function(c){        
        var t1 = this.chunk1(),
            t2 = this.chunk3();

        t1 += c;
        this.text = t1 + t2;
        this.cursor1 = this.cursor2 = t1.length;
        this.clamp();
        this.dirty();
    },
    onclick:function(m){
        if(this.bg && this.bg.big.hit(m)){
            Chartizard.focus(this);
            this.cursor1 = this.cursor2 = this.lookup(m.x)
            return true;
        }
        return false;
    },
    drag:function(m){
        var index = this.lookup(m.x),
            c1 = this.cursor1,
            c2 = this.cursor2,
            a = this.anchor
        if(c1 == c2){
            if(index < c1) a = 2, c1 = index;
            else if(index > c1) a = 1, c2 = index;
        }
        else if(a == 1) c2 = index;
        else if(a == 2) c1 = index;
        this.cursor1 = c1, this.cursor2 = c2, this.anchor = a;
        this.clamp();
    }
};