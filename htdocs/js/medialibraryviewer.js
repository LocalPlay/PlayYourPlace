function MediaLibraryViewer() {
    this.library = null;
    this.view = new View(new Rectangle(),this);
    this.view.visible = false;
    this.scrollposition = 0;
    this.scrollspeed = 0.0;
    this.scrollwidth = 0;
    this.leftbutton = null;
    this.rightbutton = null;
    this.selectaction = null;
}

MediaLibraryViewer.prototype.setup = function (bounds, library) {
    //
    // create ui
    //
    var _this = this;
    this.view.bounds = bounds;
    this.leftbutton = new Button('{ "images" : [ "images/medialibraryleftbutton-up.png", "images/medialibraryleftbutton-down.png", "images/medialibraryleftbutton-over.png" ] }');
    this.leftbutton.view.bounds.height = 128;
    this.leftbutton.view.bounds.width = 48;
    this.leftbutton.action[Button.state.down] = function () { _this.startscrolling('left'); };
    this.rightbutton = new Button('{ "images" : [ "images/medialibraryrightbutton-up.png", "images/medialibraryrightbutton-down.png", "images/medialibraryrightbutton-over.png" ] }');
    this.rightbutton.view.bounds.height = 128;
    this.rightbutton.view.bounds.width = 48;
    this.rightbutton.view.bounds.x = bounds.width - 48;
    this.rightbutton.action[Button.state.down] = function () { _this.startscrolling('right'); };

    this.view.addchild(this.leftbutton.view);
    this.view.addchild(this.rightbutton.view);
    this.view.visible = true;
    //
    //
    //
    this.library = library;
}

MediaLibraryViewer.prototype.update = function () {
    //
    // update scroll width
    //
    if (this.library.items) {
        //
        //
        //
        var width = 0;
        var itemHeight = this.view.bounds.height - 16;
        for (var i = 0; i < this.library.items.length; i++) {
            if (!this.library.items[i].loaded) continue;
            var image = this.library.items[i].image;
            if (image.complete) {
                var scale = itemHeight / image.height;
                var itemWidth = image.width * scale;
                width += itemWidth + 8;
            }
        }
        this.scrollwidth = width;
    }
    if (this.scrollspeed > 0.0 || this.scrollspeed < 0.0) {
        if (this.leftbutton.state == Button.state.down || this.rightbutton.state == Button.state.down) {
            this.scrollposition += this.scrollspeed;
            if (Math.abs(this.scrollspeed) < 10.0) {
                this.scrollspeed *= 1.5;
            }
        } else {
            this.scrollspeed /= 2.0;
            if (this.scrollspeed < 0.5) {
                this.scrollspeed = 0.0;
            }
        }
        if (this.scrollposition > 0.0) {
            this.scrollposition = 0.0;
        } else if (Math.abs(this.scrollposition) > this.scrollwidth) {
            this.scrollposition = -this.scrollwidth
        }
    }

}

MediaLibraryViewer.prototype.draw = function (context) {
    context.save();
    //
    // clear background
    //
    context.fillStyle = 'rgba( 128,128, 128, 0.75 )';
    context.fillRect(0, 0, this.view.bounds.width, this.view.bounds.height);
    //
    // draw media items
    //
    if (this.library.items) {
        //
        //
        //
        context.beginPath();
        context.rect(48, 0, this.view.bounds.width - 96, this.view.bounds.height);
        context.closePath();
        context.clip();

        var offsetX = this.scrollposition + 48 + 8;
        var offsetY = 8;
        var itemHeight = this.view.bounds.height - 16;
        for (var i = 0; i < this.library.items.length; i++) {
            var image = this.library.items[i].image;
            if (image.complete) {
                var scale = itemHeight / image.naturalHeight;
                var itemWidth = image.naturalWidth * scale;
                context.drawImage(image, offsetX, offsetY, itemWidth, itemHeight);
                if (i == this.hoveritem) {
                    //
                    // draw hover ui
                    //
                    soda.graphicsutils.drawaddcontrol(context, offsetX + (itemWidth / 2), offsetY + (itemHeight / 2), itemHeight / 4.0, 8.0);
                }
                offsetX += itemWidth + 8;
            }
        }
    }
    context.restore();
}

MediaLibraryViewer.prototype.startscrolling = function (direction) {
    if (direction === 'left') {
        this.scrollspeed = 1.0;
    } else if ( direction === 'right' ) {
        this.scrollspeed = -1.0;
    }
}

MediaLibraryViewer.prototype.stopscrolling = function () {
    this.scrollspeed = 0;
}

MediaLibraryViewer.prototype.itematglobalpoint = function (x, y) {
    var p = this.view.globaltolocal(new Point(x, y));
    /*
    p.x -= this.view.bounds.x;
    p.y -= this.view.bounds.y;
    */
    var itemBounds = new Rectangle();
    itemBounds.x = this.scrollposition + 48 + 8;
    itemBounds.y = 8;
    itemBounds.height = this.view.bounds.height - 16;
    for (var i = 0; i < this.library.items.length; i++) {
        var image = this.library.items[i].image;
        if (image.complete) {
            var scale = itemBounds.height / image.height;
            itemBounds.width = image.width * scale;
            if (itemBounds.contains(p)) {
                return i;
                break;
            }
            itemBounds.x += itemBounds.width + 8;
        }
    }

    return -1;
}

MediaLibraryViewer.prototype.onmouseup = function (evt) {
    if (this.selectaction && this.view.isglobalpointinside(evt.offsetX,evt.offsetY)) {
        var i = this.itematglobalpoint(evt.offsetX, evt.offsetY);
        if (i > -1) {
            this.selectaction(this.library.items[i]);
        }
    }
}

MediaLibraryViewer.prototype.onmousemove = function (evt) {
    if (this.selectaction && this.view.isglobalpointinside(evt.offsetX, evt.offsetY)) {
        this.hoveritem = this.itematglobalpoint(evt.offsetX, evt.offsetY);
    } else {
        this.hoveritem = -1;
    }
}