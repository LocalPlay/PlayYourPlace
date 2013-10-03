localplay.game.layouteditor = (function () {
    var layouteditor = {};

    //
    //
    //
    var addthingtemplate = '\
      <div style="width: 200px; height: 200px; padding: 8px;"> \
        <h3>Add item as</h3> \
        <hr class="white" style="width: 100%"></hr><br /> \
        <input type="radio" id="layout.goal" name="layout.type" value="goal"><label for="layout.goal"></label>Goal<br/> \
        <input type="radio" id="layout.obstacle" name="layout.type" value="obstacle"><label for="layout.obstacle"></label>Obstacle<br/> \
        <input type="radio" id="layout.pickup" name="layout.type" value="pickup"><label for="layout.pickup"></label>Pickup<br/> \
        <input type="radio" id="layout.platform" name="layout.type"  value="platform" checked="true"><label for="layout.platform"></label>Platform<br/> \
        <input type="radio" id="layout.prop"  value="prop" name="layout.type"><label for="layout.prop"></label>Prop<br/> \
        <div style="height: 42px; width: 200px">\
            <div id="button.layout.cancel" class="menubaritem" style="float: right;" > \
                <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                &nbsp;Cancel \
            </div> \
            <div id="button.layout.add" class="menubaritem" style="float: right;" > \
                <img class="menubaritem" src="images/icons/add-01.png" /> \
                &nbsp;Add \
            </div> \
        </div> \
      </div>\
    ';
    //
    // TODO: move this to central color / pattern registry
    //
    var rolloverimage = new Image();
    rolloverimage.src = "images/icons/move-02.png";
    var selectimage = new Image();
    selectimage.src = "images/icons/move-03.png";
    //
    //
    //
    function LayoutEditor(level) {
        var _this = this;
        this.level = level;
        //
        // attach to game
        //
        localplay.game.controller.attachcontroller(level.game,this);
        this.boundstatechange = this.onstatechange.bind(this); // TODO: this should probably be moved to game.controller
        this.level.addEventListener("statechange", this.boundstatechange);
        //
        //
        //
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.top = "0px";
        this.container.style.left = "8px";
        this.container.style.bottom = "0px";
        this.container.style.right = "8px";
        //
        //
        //
        this.layoutview = document.createElement("div");
        this.layoutview.id = "layoutview";
        this.layoutview.className = "layoutview";
        //
        //
        //
        level.background.setscale(1.0);
        level.world.setscale(1.0);
        this.scale = 240.0 / level.background.height;
        this.inversescale = 1.0 / this.scale;
        this.canvas = document.createElement("canvas");
        this.canvas.className = "layoutview";
        this.canvas.height = 240;//Math.round(this.level.background.height * this.inversescale);;
        this.canvas.width = Math.round(this.level.background.width * this.scale);
        this.canvas.style.width = this.canvas.width + "px";
        //this.canvas.style.height = this.canvas.height + "px";
        this.layoutview.appendChild(this.canvas);
        this.level.game.setcanvas(this.canvas);
        //
        //
        //
        this.selection = document.createElement("div");
        this.selection.className = "editrollover";
        this.selection.onmousedown = function (e) {
            _this.selection.style.visibility = "hidden";
            _this.selectedsprite = _this.rollover;
        };
        this.layoutview.appendChild(this.selection);
        //
        // hook mouse events
        //
        this.selectedsprite = null;
        this.rollover = null;
        this.duplicate = null;
        this.layoutview.onmousedown = this.onmousedown.bind(this);
        this.layoutview.onmouseup = this.onmouseup.bind(this);
        this.layoutview.onmousemove = this.onmousemove.bind(this);
        //this.layoutview.onmouseout = this.onmouseout.bind(this);
        //
        //
        //
        this.keys = [];
        this.boundkeydown = this.onkeydown.bind(this);
        window.addEventListener("keydown", this.boundkeydown, true);
        this.boundkeyup = this.onkeyup.bind(this);
        window.addEventListener("keyup", this.boundkeyup, true);
        //
        // hook drag events
        //
        var _this = this;
        this.canvas.onselectstart =
        this.layoutview.onselectstart =
        this.canvas.ondragstart =
        this.layoutview.ondragstart = function (e) {
            localplay.domutils.preventDefault(e);
            localplay.domutils.stopPropagation(e);
            return false;
        }
        this.layoutview.ondragenter = function (e) {
            _this.layoutview.classList.add('over');

        }
        this.layoutview.ondragleave = function (e) {
            _this.layoutview.classList.remove('over');
        }
        this.layoutview.ondragover = function (e) {
            localplay.domutils.preventDefault(e);
            if (!_this.layoutview.classList.contains('over')) {
                _this.layoutview.classList.add('over');
            }
            e.dataTransfer.dropEffect = 'copy';
            return false;
        }
        this.layoutview.ondrop = function (e) {
            localplay.domutils.fixEvent(e);
            localplay.domutils.stopPropagation(e);
            _this.layoutview.classList.remove('over');
            var url = e.dataTransfer.getData("Text");
            var p = new Point(e.offsetX, e.offsetY);
            _this.addthing(url, p);
            localplay.domutils.preventDefault(e);
            return false;
        }
        //
        //
        //
        var d = new Date();
        this.prefix = "layout.medialibrary." + d.getTime();
        this.medialibrary = document.createElement("div");
        this.medialibrary.id = this.prefix;
        this.medialibrary.className = "listview";
        this.medialibrary.style.top = "260px";
        this.medialibrary.innerHTML = Mustache.render(localplay.listview.editablecontainer, { prefix: this.prefix, addlabel: "Upload drawings of things" });
        //
        //
        //
        this.container.appendChild(this.layoutview);
        this.container.appendChild(this.medialibrary);
        //
        // switch off avatar tracking and activate game
        //
        this.level.reset();
        this.level.trackavatar = false;
    }
    //
    // required editor methods
    //
    LayoutEditor.prototype.initialise = function () {
        var _this = this;
        this.medialibrary.controller = localplay.listview.createlistview(this.prefix, "getmedia.php?type=object&listview=true", 20);
        this.medialibrary.controller.onselect = function (item) {
            //
            // add sprite at the center of the current view
            //
            var p = new Point();
            p.x = _this.layoutview.scrollLeft + _this.layoutview.offsetWidth / 2.0;
            p.y = _this.layoutview.offsetHeight / 2.0;

            _this.addthing(item.data.url, p);
        };
        //
        //
        //
        var addobjectbutton = document.getElementById(this.prefix + ".localplay.addlistitem");
        if (addobjectbutton) {
            addobjectbutton.onclick = function (e) {
                var objecteditor = localplay.objecteditor.createobjecteditor("Add Thing", function () {
                    localplay.showtip("Drag things here to add them to your level<br />Click and drag to move them<br />Press the alt key then click and drag to duplicate", _this.layoutview);
                    _this.medialibrary.controller.refresh();
                });
            }
        }
        //
        //
        //
        this.scale = this.layoutview.clientHeight / localplay.defaultsize.height;
        this.inversescale = 1.0 / this.scale;

        localplay.showtip("Drag things here to add them to your level<br />Click and drag to move them<br />Press the alt key then click and drag to duplicate", this.layoutview);
    }
    LayoutEditor.prototype.dealloc = function () {
        localplay.showtip();
        window.removeEventListener("keydown", this.boundkeydown, true);
        window.removeEventListener("keyup", this.boundkeyup, true);
    }
    //
    //
    //
    LayoutEditor.prototype.draw = function () {
        if (this.rollover) {
            var dim = new Point(rolloverimage.naturalWidth, rolloverimage.naturalHeight);
            dim.scale(this.inversescale);
            var aabb = this.rollover.getAABB();
            var c = aabb.getcenter();
            this.level.world.startDrawSprites();
            this.level.world.context.drawImage(rolloverimage, c.x - (dim.x / 2), c.y - (dim.y / 2), dim.x, dim.y);
            this.level.world.endDrawSprites();
        } else if (this.selectedsprite) {
            var dim = new Point(selectimage.naturalWidth, selectimage.naturalHeight);
            dim.scale(this.inversescale);
            var c = this.selectedsprite.editPosition;
            this.level.world.startDrawSprites();
            this.level.world.context.drawImage(selectimage, c.x - (dim.x / 2), c.y - (dim.y / 2), dim.x, dim.y);
            this.level.world.endDrawSprites();
        }
    }

    LayoutEditor.prototype.detach = function () {
        this.level.removeEventListener("statechange", this.boundstatechange);
        this.level.reserialise();
        var canvas = document.getElementById("game.canvas");
        if (canvas) {
            this.level.game.setcanvas(canvas);
        }
    }

    LayoutEditor.prototype.onstatechange = function (e) {
        switch (this.level.state) {
            case localplay.game.level.states.clear:
                break;
            case localplay.game.level.states.loading:
                break;
            case localplay.game.level.states.ready:
                break;
            case localplay.game.level.states.playing:
                break;
            case localplay.game.level.states.done:
                break;
        }

    }

    LayoutEditor.prototype.addthing = function (url, position) {
        //
        // scale position into level and ensure it is within the viewport
        //
        var p = position.duplicate();
        var b = this.level.world.viewport;
        if (p.x < b.left() || p.x > b.right()) {
            p.x = b.x + b.width / 2.0;
        }
        if (p.y < b.top() || p.y > b.bottom()) {
            p.y = b.y + b.height / 2.0;
        }
        p.scale(this.inversescale);
        //
        // check to see if media has been assigned a type
        //
        var type = this.level.getTypeOfMedia(url);
        if (type) {
            this.level.newitem(type, url, p);
        } else {
            //
            // convert position into global coordinates from container
            //
            var dialogposition = localplay.domutils.elementPosition(this.layoutview);
            dialogposition.x -= layoutview.scrollLeft;
            dialogposition.moveby(position);
            //
            // prompt for type
            //
            var _this = this;
            localplay.dialogbox.pinnedpopupatpoint(dialogposition, addthingtemplate, null, function (e) {
                var selector = localplay.domutils.getButtonSelector(e);
                if (selector.length >= 3) {
                    var command = selector[2];
                    switch (command) {
                        case "add":
                            var type = localplay.domutils.valueOfRadioGroup("layout.type");
                            if (type.length > 0) {
                                _this.level.newitem(type, url, p);
                            }
                            break;
                        case "cancel":
                            break;
                    }
                    return true;
                }
            });
        }
    }

    LayoutEditor.prototype.onmousedown = function (e) {
        localplay.domutils.fixEvent(e);
        localplay.domutils.stopPropagation(e);
        var p = new Point(e.offsetX, e.offsetY);
        p.scale(this.inversescale);
        this.selectedsprite = this.level.world.spriteAtPoint(p);
        if (this.selectedsprite) {
            if (this.keys[localplay.keycode.ALT] && !this.level.isAvatar(this.selectedsprite.body)) {
                //
                // duplicate
                //
                this.duplicate = this.selectedsprite.userdata.duplicate();
                this.level.additem(this.duplicate);
                this.selectedsprite = this.duplicate.sprite;
            }
            this.selectedsprite.beginedit();
            this.rollover = null;
        }
        return false;
    }

    LayoutEditor.prototype.onmousemove = function (e) {
        //if (e.target == this.selection) return; // stops the selection from flickering
        localplay.domutils.fixEvent(e);
        localplay.domutils.stopPropagation(e);
        var p = new Point(e.offsetX, e.offsetY);
        p.scale(this.inversescale);
        if (this.selectedsprite) {
            this.selectedsprite.editPosition.x = p.x;
            this.selectedsprite.editPosition.y = p.y;
        } else {
            this.rollover = this.level.world.spriteAtPoint(p);
        }
        return false;
    }

    LayoutEditor.prototype.onmouseup = function (e) {
        localplay.domutils.fixEvent(e);
        localplay.domutils.stopPropagation(e);
        if (this.selectedsprite) {
            this.selectedsprite.commitedit();
            this.selectedsprite = null;
            this.duplicate = null;
        }
        return false;
    }

    LayoutEditor.prototype.onmouseout = function (e) {
        localplay.domutils.fixEvent(e);
        localplay.domutils.stopPropagation(e);
        if (this.selectedsprite && !this.level.isAvatar(this.selectedsprite.body)) {
            //
            // 
            //
            var _this = this;
            localplay.dialogbox.confirm("Playsouthend", "Are you sure you want to remove this thing from the game?",
                function (confirm) {
                    if (confirm) {
                        _this.level.removeitem(_this.selectedsprite,true);
                    } else {
                        _this.selectedsprite.canceledit();
                    }
                    _this.selectedsprite = null;
                    _this.duplicate = null;
                });
        }
        return false;
    }

    LayoutEditor.prototype.onkeydown = function (e) {
        this.keys[e.keyCode] = true;
        if (e.keyCode == localplay.keycode.ESC) {
            if (this.duplicate) {
                this.level.removeitem(this.duplicate, true);
            } else if (this.selectedsprite) {
                this.selectedsprite.canceledit();
            }
            this.duplicate = null;
            this.selectedsprite = null;
        }
    }

    LayoutEditor.prototype.onkeyup = function (e) {
        this.keys[e.keyCode] = false;
    }



    layouteditor.createlayouteditor = function (level) {
        return new LayoutEditor(level);
    }
    return layouteditor;

})();
