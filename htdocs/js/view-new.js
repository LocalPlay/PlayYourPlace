function View( bounds, delegate ) {
    //
    // properties
    //
    this.bounds = ( bounds != undefined ) ? bounds : new Rectangle();
    this.visible = true;
    this.clipchildren = true;
    this.hasfocus = false;
    this.alignment = 0;
    //
    // view hierarchy
    //
    this.parent = null;
    this.children = null;
    this.lastchild = null;
    this.next = null;
    this.prev = null;
    //
    // delegate
    //
    this.delegate = delegate != undefined ? delegate : null;
}
View.alignment = {
    left    : 1,
    right   : 2,
    middle  : 4,
    top     : 8,
    center  : 16,
    bottom  : 32
};
//
// view hierarchy
//
View.prototype.layout = function () {

}

View.prototype.addchild = function (child) {
    child.parent = this;
    child.prev = null;
    child.next = this.children;
    this.children = child;
    if (this.lastchild == null) this.lastchild = child;
    this.layout();
}

View.prototype.removechild = function (child) {
    if (child.prev === null) {
        this.children = child.next;
    } else {
        child.prev.next = child.next;
    }
    if (child.next) {
        child.next.prev = child.prev;
    }
    if (this.lastchild === child) this.lastchild = child.prev;
    this.layout();
}

View.prototype.update = function () {
    //
    //
    //
    if (this.delegate && this.delegate.update != undefined) {
        this.delegate.update();
    }
    //
    // update children
    //
    for ( var child = this.children; child != null; child = child.next ) {
        child.update();
    }

}

View.prototype.draw = function (context) {
    if (!this.visible) return;
    //
    // save context state
    //
    context.save();
    //
    // clip to view
    //
    if (this.clipchildren) {
        context.beginPath();
        context.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        context.closePath();
        context.clip();
    }
    //
    // set transform
    //
    context.translate(this.bounds.x, this.bounds.y);
    //
    // draw our content
    //
    if (this.delegate && this.delegate.draw != undefined) {
        this.delegate.draw(context);
    } else {
        // debug draw bounds
        //context.strokeStyle = 'rgb( 255, 0, 0 )';
        //context.strokeRect(0, 0, this.bounds.width, this.bounds.height);
    }
    //
    // draw children
    //
    for (var child = this.children; child != null; child = child.next) {
        child.draw( context );
    }
    //
    // restore context
    //
    context.restore();
}
//
// utility methods
//
View.prototype.isglobalpointinside = function (x, y) {
    var p = new Point(x, y);
    this.globaltolocal(p);
    return this.bounds.contains(p);
}

View.prototype.globaltolocal = function (p) {
    for (var parent = this.parent; parent != null; parent = parent.parent) {
        p.x -= parent.bounds.x;
        p.y -= parent.bounds.y;
    }
    return p;
}
View.prototype.localtoglobal = function (p) {
    for (var parent = this.parent; parent != null; parent = parent.parent) {
        p.x += parent.bounds.x;
        p.y += parent.bounds.y;
    }
    return p;
}
//
// event handling
//
View.prototype.onmousedown = function (e) {
    if (this.visible) {
        for (var child = this.lastchild; child != null; child = child.prev) {
            if (child.onmousedown(e)) return true;
        }
        if (this.delegate && this.delegate.onmousedown != undefined) {
            if (this.delegate.onmousedown(e)) return true;
        }
    }
    return false;
}

View.prototype.onmouseup = function (e) {
    if (this.visible) {
        for (var child = this.lastchild; child != null; child = child.prev) {
            if (child.onmouseup(e)) return true;
        }
        if (this.delegate && this.delegate.onmouseup != undefined) {
            if (this.delegate.onmouseup(e)) return true;
        }
    }
    return false;
}

View.prototype.onmousemove = function (e) {
    if (this.visible) {
        for (var child = this.lastchild; child != null; child = child.prev) {
            if (child.onmousemove(e)) return true;
        }
        if (this.delegate && this.delegate.onmousemove != undefined) {
            if (this.delegate.onmousemove(e)) return true;
        }
    }
    return false;
}

View.prototype.onkeydown = function (e) {
    if (this.visible) {
        for (var child = this.lastchild; child != null; child = child.prev) {
            if (child.onkeydown(e)) return true;
        }
        if (this.delegate && this.delegate.onkeydown != undefined) {
            if (this.delegate.onkeydown(e)) return true;
        }
    }
    return false;
}

View.prototype.onkeyup = function (e) {
    if (this.visible) {
        for (var child = this.lastchild; child != null; child = child.prev) {
            if (child.onkeyup(e)) return true;
        }
        if (this.delegate && this.delegate.onkeyup != undefined) {
            if (this.delegate.onkeyup(e)) return true;
        }
    }
    return false;
}

View.prototype.ontouchstart = function (e) {
    if (this.visible) {
        for (var child = this.lastchild; child != null; child = child.prev) {
            if (child.ontouchstart(e)) return true;
        }
        if (this.delegate && this.delegate.ontouchstart != undefined) {
            if (this.delegate.ontouchstart(e)) return true;
        }
    }
    return false;
}

View.prototype.ontouchmove = function (e) {
    if (this.visible) {
        for (var child = this.lastchild; child != null; child = child.prev) {
            if (child.ontouchmove(e)) return true;
        }
        if (this.delegate && this.delegate.ontouchmove != undefined) {
            if (this.delegate.ontouchmove(e)) return true;
        }
    }
    return false;
}

View.prototype.ontouchend = function (e) {
    if (this.visible) {
        for (var child = this.lastchild; child != null; child = child.prev) {
            if (child.ontouchend(e)) return true;
        }
        if (this.delegate && this.delegate.ontouchend != undefined) {
            if (!this.delegate.ontouchend(e)) return true;
        }
    }
    return false;
}
