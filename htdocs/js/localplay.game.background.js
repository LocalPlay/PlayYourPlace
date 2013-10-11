/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.background.js
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 *  Copyright (C) 2013 Local Play
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

;
localplay.game.background = (function () {
    if (localplay.game.background) return localplay.game.background;

    var background = {};

    //
    //
    //
    function Background(level, images) {
        this.level = level;
        this.scale = 1.0;
        this.offset = 0.0;
        this.width = localplay.defaultsize.width;
        this.height = localplay.defaultsize.height;
        this.loaded = false;
        var _this = this;
        this.images = [];
        for (var i = 0; i < images.length; i++) {
            this.addimage(images[i]);
        }
    }


    Background.prototype.setscale = function (scale) {
        this.scale = scale;
        this.recalculatesize();

    }

    Background.prototype.onloaded = function () {
        this.level.onobjectloaded(this);
    }

    Background.prototype.recalculatesize = function () {
        var loaded = true;
        var width = 0.0;
        var height = 0.0;
        for (var i = 0; i < this.images.length; i++) {
            if (!this.images[i].complete) {
                loaded = false;
                break;
            }
            width += this.images[i].naturalWidth * this.scale;
            height = this.images[i].naturalHeight * this.scale > height ? this.images[i].naturalHeight * this.scale : height;
        }
        if (loaded) {
            this.width = width;
            this.height = height;
            if (!this.loaded) {
                this.loaded = true;
                this.onloaded();
            }
        }
    }

    Background.prototype.onimageloaded = function () {
        if (this.images.length > 0) {
            this.recalculatesize();
        } else {
            this.width = this.level.world.canvas.width;
            this.height = this.level.world.canvas.height;
        }
    }

    Background.prototype.update = function (time) {
        //
        // update scrolling and other behaviours
        //
        if (this.offset < this.width - this.level.world.canvas.width) {
            this.offset++;
        }
    }

    Background.prototype.draw = function () {
        var context = this.level.world.context;
        if (this.loaded) {
            var x = 0;
            var dstx = 0.0;
            var index;
            var viewport = this.level.world.viewport.duplicate();
            for (var i = 0; i < this.images.length && dstx < viewport.width; i++) {
                var imagewidth = this.images[i].naturalWidth * this.scale;
                var imageheight = this.images[i].naturalHeight * this.scale;
                if (x + imagewidth > viewport.x) {
                    var dstwidth = viewport.width - dstx;
                    //
                    // calculate src x and width in image coordinates
                    //
                    var srcx = x < viewport.x ? (viewport.x - x) / this.scale : 0.0;
                    var srcwidth = Math.min(this.images[i].naturalWidth - srcx, dstwidth / this.scale);
                    dstwidth = srcwidth * this.scale;
                    //context.drawImage(this.images[i], srcx, 0, srcwidth, this.images[i].naturalHeight, dstx, 0.0, dstwidth, imageheight);
                    context.drawImage(this.images[i], srcx, 0, srcwidth, this.images[i].naturalHeight, dstx, 0.0, dstwidth, this.level.world.canvas.height);
                    dstx += dstwidth;
                }

                //if (dstx >= viewport.width) break;
                x += imagewidth;
            }
            //
            // compensate for images not as wide as the standard canvas
            //
            if (dstx < this.level.world.canvas.width) {
                context.clearRect(dstx, 0, this.level.world.canvas.width - dstx, this.level.world.canvas.height);
            }
        } else {
            context.clearRect(0, 0, this.level.world.canvas.width, this.level.world.canvas.height);
        }
    }

    Background.prototype.getbounds = function () {
        if (this.loaded) {
            return new Rectangle(0, 0, this.width, this.height);
        }
        return new Rectangle(0, 0, localplay.defaultsize.width, localplay.defaultsize.height);
    }

    Background.prototype.getnaturalbounds = function () {
        var bounds = this.getbounds();
        bounds.scale(1.0 / this.scale);
        return bounds;
    }

    Background.prototype.addimage = function (url) {
        var _this = this;
        var image = new Image();
        this.images.push(image);
        image.onload = function () {
            _this.onimageloaded();
        };
        image.src = url;
    }

    Background.prototype.insertimage = function (i, url) {
        var _this = this;
        var image = new Image();
        this.images.splice(i, 0, image);
        image.onload = function () {
            _this.onimageloaded();
        };
        image.src = url;
    }

    Background.prototype.removeimage = function (i) {
        if (i >= 0 && i < this.images.length) {
            this.images.splice(i, 1);
            this.onimageloaded();
        }
    }
    Background.prototype.countimages = function () {
        return this.images.length;
    }
    //
    //
    //
    background.createbackground = function (level, images) {
        return new Background(level, images);
    }

    return background;
})();