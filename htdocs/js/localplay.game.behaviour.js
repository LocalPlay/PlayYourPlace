//
// Item behaviour
//
;
localplay.game.behaviour = (function () {
    if (localplay.game.behaviour) return localplay.game.behaviour;

    var behaviour = {};
    //
    // public constants
    //
    behaviour.types = {
        none: 0,
        leftright: 1,
        updown: 2
    };

    behaviour.ranges = {
        starttime: {
            min: 0,
            max: 100
        },
        duration: {
            min: 0,
            //max: 4000
            max: 16000
        },
        extent: {
            min: 0,
            max: 500
        }
    }
    //
    //
    //
    function Behaviour(starttime, duration, extent, type, onedirection) {

        this.starttime = parseInt(starttime);
        this.duration = parseInt(duration);
        this.extent = parseFloat(extent);
        this.type = parseInt(type);
        this.loopstart = 0;
        this.onedirection = onedirection ? onedirection === "true" : false;
        //
        // check parameters
        //
        if (isNaN(this.starttime) || this.starttime < 0 || this.starttime > 100) this.starttime = 0;
        if (isNaN(this.duration) || this.duration < 0) this.duration = 0;
        if (isNaN(this.extent) || this.extent < 0) this.extent = 0;
        if (isNaN(this.type) || this.type < 0 || this.type > behaviour.types.follow) this.type = 0;

    }


    Behaviour.prototype.toJSON = function (key) {
        return this.tostring();
    }

    Behaviour.prototype.tostring = function () {

        return '"behaviour" : { "starttime" : "' + this.starttime + '", "duration" : "' + this.duration + '", "extent" : "' + this.extent + '", "type" : "' + this.type + '", "onedirection" : "' + this.onedirection + '" }';
    }

    Behaviour.prototype.setonedirection = function (onedirection) {
        this.onedirection = onedirection;
        this.loopstart = 0;
    }

    Behaviour.prototype.isonedirection = function () {
        return this.onedirection;
    }

    Behaviour.prototype.update = function (time, p, worldwidth, worldheight, spritewidth, spriteheight) {
        if (this.duration <= 0) return;
        //
        //
        //
        if (this.loopstart <= 0 || time - this.loopstart > this.duration || time - this.loopstart < 0) this.loopstart = time;
        //
        // update value
        //
        var u = (this.starttime / 100.0) + ((time - this.loopstart) / this.duration);
        while (u > 1.0) u -= 1.0;
        //
        // update target
        //
        if (this.isonedirection()) {
            var halfextent = (behaviour.ranges.extent.max - behaviour.ranges.extent.min) / 2.0;
            var direction = (this.extent - halfextent);
            switch (this.type) {
                case behaviour.types.leftright:
                    if (direction < 0.0) { // right to left
                        p.x = (worldwidth + (spritewidth / 2)) - ((worldwidth + spritewidth) * u);
                    } else if (direction > 0.0) {
                        p.x = -(spritewidth / 2) + (worldwidth + spritewidth) * u;
                    }
                    break;
                case behaviour.types.updown:
                    if (direction < 0.0) { // bottom to top
                        p.y = (worldheight + (spriteheight / 2)) - ((worldheight + spriteheight) * u);
                    } else if (direction > 0.0) {
                        p.y = -(spriteheight / 2) + ((worldheight + spriteheight) * u);
                    }
                    break;
            }
        } else {
            switch (this.type) {
                case behaviour.types.leftright:
                    p.x += this.extent * Math.cos((2.0 * Math.PI) * u);
                    break;
                case behaviour.types.updown:
                    p.y += this.extent * Math.sin((2.0 * Math.PI) * u);
                    break;
            }
        }
    }
    //
    //
    //
    //
    //
    //
    function BehaviourPreviewAnimator(canvas, item) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.item = item;
        this.worlddim = new Point(item.level.background.width, item.level.background.height);
        if (this.worlddim.x > localplay.defaultsize.width) {
            this.scale = canvas.width / this.worlddim.x;
        } else {
            this.scale = canvas.height / this.worlddim.y;
        }
        this.offset = new Point((canvas.width - (this.worlddim.x * this.scale)) / 2.0, (canvas.height - (this.worlddim.y * this.scale)) / 2.0);
        this.itemAABB = this.item.sprite.getAABB();
        this.animationframe = -1;
        this.timer = localplay.timer.createtimer();
    }
    BehaviourPreviewAnimator.prototype.destroy = function () {
        this.stop();
        this.canvas = this.context = this.item = this.timer = null;

    }
    BehaviourPreviewAnimator.prototype.start = function () {

        this.stop();
        this.animate();
        this.timer.start();
    }
    BehaviourPreviewAnimator.prototype.stop = function () {
        if (this.animationframe !== -1) {
            cancelAnimationFrame(this.animationframe);
            this.animationframe = -1;
        }
        this.timer.stop();
    }
    BehaviourPreviewAnimator.prototype.animate = function () {
        //
        // apply behaviour to point
        //
        var p = this.item.homeposition.duplicate();
        var time = this.timer.elapsed();
        for (var i = 0; i < this.item.behaviour.length; i++) {
            this.item.behaviour[i].update(time, p, this.item.level.background.width, this.item.level.background.height, this.itemAABB.width, this.itemAABB.height);
        }
        //
        // scale into canvas
        //
        p.scale(this.scale);
        p.moveby(this.offset);
        //
        // clear
        //
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeStyle = "lightgray";
        this.context.strokeRect(this.offset.x, this.offset.y, this.worlddim.x * this.scale, this.worlddim.y * this.scale);
        //
        // draw
        //
        if (this.item.sprite && this.item.sprite.isloaded()) {
            var image = this.item.sprite.image;
            var rotation = this.item.rotation;
            var size = new Point(image.naturalWidth, image.naturalHeight);
            size.scale(this.item.scale * this.scale);
            if (size.length() < 30) {
                size.scale(30 / size.length())
                if (size.x > size.y) {
                    size.x = 20;
                    size.y = image.naturalWidth * (size.x / image.naturalWidth);
                } else {
                    size.y = 20;
                    size.x = image.naturalWidth * (size.y / image.naturalHeight);
                }
            } else if (size.length() > this.canvas.height) {
                size.scale(this.canvas.height / size.length());
            }
            this.context.save();
            this.context.translate(p.x, p.y);
            this.context.rotate(rotation);
            this.context.translate(-(size.x / 2), -(size.y / 2));
            this.context.drawImage(this.item.sprite.image, 0, 0, size.x, size.y);
            this.context.restore();
        } else {
            this.context.strokeStyle = "rgb(255,143,33)";
            this.context.strokeRect(p.x - 10, p.y - 10, 20, 20);
        }
        //
        // queue next frame
        //
        var _this = this;
        this.animationframe = requestAnimFrame(function () {
            _this.animate();
        });
    }

    //
    //
    //
    behaviour.createbehaviour = function (starttime, duration, extent, type, onedirection) {
        return new Behaviour(starttime, duration, extent, type, onedirection);
    }

    behaviour.creatbehaviourpreviewanimator = function (canvas, item) {
        var preview = new BehaviourPreviewAnimator(canvas, item);

        return preview;
    }
    //
    //
    //
    return behaviour;
})();

