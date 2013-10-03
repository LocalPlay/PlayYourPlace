
function Point(x, y) {
    if (x === undefined) {
        this.x = 0.0;
    } else {
        this.x = x;
    }
    if (y === undefined) {
        this.y = 0.0;
    } else {
        this.y = y;
    }
}

Point.prototype.set = function (x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.tostring = function () {
    return this.x + "," + this.y;
}

Point.prototype.duplicate = function () {
    return new Point(this.x, this.y);
}

Point.prototype.tween = function (to, u) {
    return new Point(this.x + ((to.x - this.x) * u), this.y + ((to.y - this.y) * u));
}

Point.prototype.scale = function (s) {
    this.x *= s;
    this.y *= s;
}

Point.prototype.moveby = function (p) {
    this.x += p.x;
    this.y += p.y;
}

//
// vector functions
//
Point.prototype.lengthsquared = function() {
    return this.x * this.x + this.y * this.y;
}

Point.prototype.length = function() {
    return Math.sqrt(this.lengthsquared());
}

Point.prototype.distance = function( to ) {
    var d = new Point( to.x - this.x, to.y - this.y );
    return d.length(); 
}

Point.prototype.distancesquared = function( to ) {
    var d = new Point( to.x - this.x, to.y - this.y );
    return d.lengthsquared(); 
}

Point.prototype.normalise = function () {
    var length = this.length();
    this.x /= length;
    this.y /= length;
}

Point.prototype.subtract = function (other) {
    return new Point(this.x - other.x, this.y - other.y);
}

function Triangle(a, b, c) {
    if (a === undefined) {
        this.a = new Point();
    } else {
        this.a = a;
    }
    if (b === undefined) {
        this.b = new Point();
    } else {
        this.b = b;
    }
    if (c === undefined) {
        this.c = new Point();
    } else {
        this.c = c;
    }
}
Triangle.prototype.duplicate = function () {
    return new Triangle(this.a.duplicate(), this.b.duplicate(), this.c.duplicate());
}

Triangle.prototype.tostring = function () {
    return "[" + this.a.tostring() + "," + this.b.tostring() + "," + this.c.tostring() + "]";
}
Triangle.prototype.set = function (a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
}

Triangle.prototype.scale = function(s) {
    this.a.scale(s);
    this.b.scale(s);
    this.c.scale(s);
}

Triangle.prototype.tween = function (to, u) {
    return new Triangle(this.a.tween(to.a, u), this.b.tween(to.b, u), this.c.tween(to.c, u));
}

function Rectangle(x,y,width,height) {
    if (x === undefined) {
        this.x = 0.0;
    } else {
        this.x = x;
    }
    if (y === undefined) {
        this.y = 0.0;
    } else {
        this.y = y;
    }
    if (width === undefined) {
        this.width = 0.0;
    } else {
        this.width = width;
    }
    if (height === undefined) {
        this.height = 0.0;
    } else {
        this.height = height;
    }
}

Rectangle.prototype.duplicate = function () {
    return new Rectangle(this.x, this.y, this.width, this.height);
}

Rectangle.prototype.tostring = function() {
    return "{ x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + " }";
}

Rectangle.prototype.set = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Rectangle.prototype.top = function () {
    return this.y;
}

Rectangle.prototype.bottom = function () {
    return this.y + this.height;
}

Rectangle.prototype.left = function () {
    return this.x;
}

Rectangle.prototype.right = function () {
    return this.x + this.width;
}

Rectangle.prototype.getcenter = function () {
    var p = new Point();
    p.set(this.x + this.width / 2.0, this.y + this.height / 2.0);
    return p;
}

Rectangle.prototype.grow = function (dx, dy) {
    this.x -= dx;
    this.y -= dy;
    this.width += dx * 2.0;
    this.height += dy * 2.0;
}

Rectangle.prototype.moveto = function (p) {
    this.x = p.x - (this.width / 2.0);
    this.y = p.y - (this.height / 2.0);
}
Rectangle.prototype.moveby = function (p) {
    this.x += p.x;
    this.y += p.y;
}
Rectangle.prototype.scale = function (s) {
    this.x *= s;
    this.y *= s;
    this.width *= s;
    this.height *= s;
}

Rectangle.prototype.scalefromcenter = function (s) {
    var cp = this.getcenter();
    this.width *= s;
    this.height *= s;
    this.x = cp.x - this.width / 2.0;
    this.y = cp.y - this.height / 2.0;
}


Rectangle.prototype.contains = function (p) {
    return !(p.x < this.x || p.x > this.x + this.width || p.y < this.y || p.y > this.y + this.height);
}

Rectangle.prototype.intersects = function (other) {
    return !(other.x > this.x + this.width || other.x + other.width < this.x || other.y > this.y + this.height || other.y + other.height < this.y);
}

Rectangle.prototype.tween = function (to, u) {
    return new Rectangle(this.x + ((to.x - this.x) * u), this.y + ((to.y - this.y) * u), this.width + ((to.width - this.width) * u), this.height + ((to.height - this.height) * u));
}

function Colour(r, g, b, a) {
    if (r === undefined) {
        this.r = 0;
    } else {
        this.r = r;
    }
    if (g === undefined) {
        this.g = this.r;
    } else {
        this.g = g;
    }
    if (b === undefined) {
        this.b = this.g;
    } else {
        this.b = b;
    }
    if (a === undefined) {
        this.a = 255;
    } else {
        this.a = a;
    }

}

Colour.prototype.tostring = function () {
    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
}

Colour.prototype.tween = function( to, u ) {
    return new Colour(this.r + ((to.r - this.r) * u), this.g + ((to.g - this.g) * u), this.b + ((to.b - this.b) * u));
}
function Transform() {
    this.reset();
}

Transform.prototype.reset = function () {
    this.m = [1, 0, 0, 1, 0, 0];
}

Transform.prototype.multiply = function (matrix) {
    var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
    var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];


    var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
    var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];


    var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
    var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];


    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    this.m[4] = dx;
    this.m[5] = dy;
}


Transform.prototype.invert = function () {
    var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
    var m0 = this.m[3] * d;
    var m1 = -this.m[1] * d;
    var m2 = -this.m[2] * d;
    var m3 = this.m[0] * d;
    var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
    var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
    this.m[0] = m0;
    this.m[1] = m1;
    this.m[2] = m2;
    this.m[3] = m3;
    this.m[4] = m4;
    this.m[5] = m5;
}

Transform.prototype.rotate = function (rad) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    var m11 = this.m[0] * c + this.m[2] * s;
    var m12 = this.m[1] * c + this.m[3] * s;
    var m21 = this.m[0] * -s + this.m[2] * c;
    var m22 = this.m[1] * -s + this.m[3] * c;
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
}

Transform.prototype.translate = function (x, y) {
    this.m[4] += this.m[0] * x + this.m[2] * y;
    this.m[5] += this.m[1] * x + this.m[3] * y;
}

Transform.prototype.scale = function (sx, sy) {
    this.m[0] *= sx;
    this.m[1] *= sx;
    this.m[2] *= sy;
    this.m[3] *= sy;
}

Transform.prototype.transformPoint = function (p) {
    var x = p.x;
    var y = p.y;
    p.x = x * this.m[0] + y * this.m[2] + this.m[4];
    p.y = x * this.m[1] + y * this.m[3] + this.m[5];
    return p;
}
