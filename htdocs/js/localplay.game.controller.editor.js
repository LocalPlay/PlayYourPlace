;
//
// editor module
//
localplay.game.controller.editor = (function () {
    if (localplay.game.controller.editor) return localplay.game.controller.editor;
    //
    // resources
    //
    /*
    var info = new Image();
    info.src = "images/info.png";
    var del = new Image();
    del.src = "images/delete.png";
    var rotate = new Image();
    rotate.src = "images/rotate.png";
    var scale = new Image();
    scale.src = "images/resize.png";
    var move = new Image();
    move.src = "images/move.png";
    var hscroll = new Image();
    hscroll.src = "images/hscroll.png";
    */
    //
    // templates
    //
    var editorui =
          '<div id="editor.assetbar" class="toolbar" style="visibility: hidden;"> \
                    <div id="editor.game" class="toolbarbutton">Game</div> \
                    <div id="editor.gameplay" class="toolbarbutton">Gameplay</div> \
                    <div id="editor.background" class="toolbarbutton">Background</div> \
                    <div id="editor.items" class="toolbarbutton">Items</div> \
                    <div id="editor.sound" class="toolbarbutton">Sound</div> \
                    <span style="width: 64px; textalign: center;" >|</span> \
                   <div id="editor.save" class="toolbarbutton">Save</div> \
                   <div id="editor.preview" class="toolbarbutton">Preview</div> \
                </div>';
    var gamemetadataeditor =
           '<div style="padding: 16px"> \
            <p><h4>Title</h4><input type="text" id="editor.game.name" style="width: 232px;" value="{{name}}"/></p> \
            <p><h4>Place</h4><textarea id="editor.game.place" style="width: 232px; height: 48px;">{{place}}</textarea></p> \
            <p><h4>The change we want to see</h4><textarea id="editor.game.change" style="width: 232px; height: 48px;">{{change}}</textarea></p> \
            <p><h4>Tags</h4><input type="text" id="editor.game.tags" style="width: 232px;" value="{{tags}}"/></p> \
            </div>';

    var selectioneditor =
        '<img id="editor.item.properties" src="images/info.png" class="imagebutton" style="position: absolute; left: -8px; top: -8px; width: 16px; height: 16px;" /> \
        <img id="editor.item.delete" src="images/delete.png" class="imagebutton" style="position: absolute; right: -8px; top: -8px; width: 16px; height: 16px;" /> \
        <img id="editor.item.scale" src="images/resize.png" class="imagebutton" style="position: absolute; left: -8px; bottom: -8px; width: 16px; height: 16px;" /> \
        <img id="editor.item.move" src="images/move.png" class="imagebutton" style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; width: 16px; height: 16px; margin: auto;" /> \
        <img id="editor.item.rotate" src="images/rotate.png" class="imagebutton" style="position: absolute; right: -8px; bottom: -8px; width: 16px; height: 16px;" />';
    var itemeditor =
        '<p>Item type<br /><select id="editor.item.type" value="{{type}}"> \
            {{#types}} \
                <option value="{{type}}">{{name}}</option> \
            {{/types}} \
        </select></p> \
        <p>Image ( click to change )<br /> \
        <img id="editor.item.image" src="" /></p> \
        <p>Behaviours<br /> \
        {{#behaviours}} \
            <p>{{name}}<br /> \
            <i</p>\
        {{/behaviours}}';
            
    //
    //
    //
    var editor = {};
    //
    //
    //
    function EditorController(game) {
        //
        //
        //
        localplay.game.controller.attachcontroller(game, this);
        //
        //
        //
        this.game = game;
        //
        //
        //
        this.selectedsprite = null;
        this.rolloversprite = null;
        this.canvasoffset = new Point(this.game.canvas.offsetLeft, this.game.canvas.offsetTop);
        this.canvasbounds =
            new Rectangle(this.game.canvas.offsetLeft, this.game.canvas.offsetTop,
            this.game.canvas.offsetWidth, this.game.canvas.offsetHeight);
        this.mousetrackingmode = EditorController.mousetrackingmode.none;
        this.mousetrackingposition = new Point();
        this.mousetrackingduplicate = null;
        this.keys = [];
        //
        // build ui
        //
        this.editoverlay = document.createElement("div");
        this.editoverlay.id = "editor.overlay";
        this.editoverlay.classList.add("editoverlay");

        //this.editoverlay.innerHTML = editorui;
        this.game.canvas.offsetParent.appendChild(this.editoverlay);
        this.assetbar = document.getElementById("editor.assetbar");
        this.selection = document.createElement("div");
        this.selection.id = "editor.selection";
        this.selection.classList.add("editselection");
        this.selection.innerHTML = selectioneditor;
        this.editoverlay.appendChild(this.selection);
        this.rollover = document.createElement("div");
        this.rollover.id = "editor.rollover";
        this.rollover.classList.add("editrollover");
        this.editoverlay.appendChild(this.rollover);
        this.tip = document.createElement("div");
        this.tip.classList.add("tutorial");
        this.tip.id = "tutorial.tip";
        this.editoverlay.appendChild(this.tip);
        /*
        var indicator = document.createElement("div");
        indicator.classList.add("tutorial");
        indicator.style.top = "auto";
        indicator.style.left = "auto";
        indicator.style.right = "0px";
        indicator.style.bottom = "0px";
        indicator.style.visibility = "visible";
        indicator.innerHTML = "editing";
        this.editoverlay.appendChild(indicator);
        */
        //
        // hook events
        //
        // TODO: support for game events ( load, start, stop ) also find a more generic way of doing the binding way 
        //
        this.boundclick = this.onclick.bind(this);
        this.boundmousemove = this.onmousemove.bind(this);
        this.boundresize = this.onresize.bind(this);
        this.boundstatechange = this.onstatechange.bind(this);
        this.boundkeydown = this.onkeydown.bind(this);
        this.boundkeyup = this.onkeyup.bind(this);
        this.bounddragstart = this.ondragstart.bind(this);
        this.bounddragenter = this.ondragenter.bind(this);
        this.bounddragleave = this.ondragleave.bind(this);
        this.bounddragover = this.ondragover.bind(this);
        this.bounddrop = this.ondrop.bind(this);
        //
        //
        //
        this.editoverlay.addEventListener("click", this.boundclick);
        this.editoverlay.addEventListener("mousemove", this.boundmousemove);
        window.addEventListener("keydown", this.boundkeydown);
        window.addEventListener("keyup", this.boundkeyup);
        window.addEventListener("resize", this.boundresize);
        this.game.level.addEventListener("statechange", this.boundstatechange);
        //
        //
        //
        this.editoverlay.addEventListener("dragstart", this.bounddragstart);
        this.editoverlay.addEventListener("dragenter", this.bounddragenter);
        this.editoverlay.addEventListener("dragleave", this.bounddragleave);
        this.editoverlay.addEventListener("dragover", this.bounddragover);
        this.editoverlay.addEventListener("drop", this.bounddrop);
        //
        // hook buttons
        //
        localplay.game.controller.hookbuttons(this.editoverlay, "editor", this.boundclick);
        //
        // prevent selection and dragging
        //
        this.editoverlay.addEventListener("selectstart", function (e) {
            e.cancelBubble = true;
            localplay.domutils.preventDefault(e);
            localplay.domutils.stopPropagation(e);
            return false;
        });
        this.editoverlay.addEventListener("dragstart", function (e) {
            localplay.domutils.preventDefault(e);
            localplay.domutils.stopPropagation(e);
            return false;
        });
        //
        // go fullscreen 
        // TODO: move this somewhere more suitable
        //
        this.game.level.reset();
        this.game.level.trackavatar = false;
        //
        //
        //
        this.createmenu();
        //
        //
        //
        this.adjustscrollbar();
    }

    EditorController.prototype.createmenu = function () {
        //
        //
        //
        var _this = this;
        this.menu = new Image();
        this.menu.className = "imagebutton";
        this.menu.style.position = "absolute";
        this.menu.style.top = "8px";
        this.menu.style.left = "8px";
        this.menu.onload = function (e) {
            _this.menupopup = localplay.menu.attachmenu(e.target,
                    [
                        {
                            icon: "images/info.png",
                            name: "INFO",
                            id: "info"
                        },
                        {
                            icon: "images/blank.png",
                            name: "BACKGROUND",
                            id: "background"
                        },
                        {
                            icon: "images/blank.png",
                            name: "THINGS",
                            id: "things"
                        },
                        {
                            icon: "images/blank.png",
                            name: "GAMEPLAY",
                            id: "gameplay"
                        },
                        {
                            icon: "images/blank.png",
                            name: "SOUND",
                            id: "sound"
                        },
                        {
                            icon: "images/blank.png",
                            name: "SAVE",
                            id: "save"
                        },
                        {
                            icon: "images/play.png",
                            name: "PLAY",
                            id: "play"
                        },
                        {
                            icon: "images/new.png",
                            name: "MAKE NEW LEVEL",
                            id: "new"
                        },
                        {
                            icon: "images/home.png",
                            name: "HOME",
                            id: "home"
                        }
                    ],
                        function (id) {

                            var command = id.split(".");
                            if (command.length >= 2) {
                                switch (command[0]) {
                                    case "menu":
                                        switch (command[1]) {
                                            case "open":
                                                if (_this.game.level.state === localplay.game.level.states.playing) {
                                                    _this.game.level.pause(true);
                                                }
                                                break;
                                            case "close":
                                                if (_this.game.level.state === localplay.game.level.states.playing) {
                                                    _this.game.level.pause(false);
                                                }
                                        }
                                        break;
                                    case "menuitem":

                                        switch (command[1]) {
                                            case "info":
                                                _this.editgamemetadata();
                                                break;
                                            case "gameplay":
                                                _this.editgameplay();
                                                break;
                                            case "background":
                                                _this.editbackground();
                                                break;
                                            case "things":
                                                _this.edititems();
                                                break;
                                            case "sound":
                                                _this.editsound();
                                                break;
                                            case "save":
                                                _this.game.savelevel();
                                                break;
                                            case "play":
                                                _this.safeclose(function () {
                                                    localplay.game.controller.player.attachtogame(_this.game);
                                                    _this.game.level.play();
                                                });
                                                break;
                                            case "new":
                                                //
                                                // show level creator
                                                //
                                                _this.safeclose(function () {
                                                    localplay.game.controller.createlevel(_this.game);
                                                });
                                                break;
                                            case "home":
                                                _this.safeclose(function () {
                                                    window.location = "index.html";
                                                });
                                                break;
                                        }
                                        break;
                                }
                            }
                        },true,true);

        };
        this.menu.src = "images/edit.png";
        this.game.canvas.offsetParent.appendChild(this.menu);
    }

    EditorController.prototype.adjustscrollbar = function () {
        if (!this.scrollbar) {
            //
            // TODO: move this into generic scrollbar class
            //
            this.scrollbar = document.createElement("div");
            this.scrollbar.classList.add("scrollbar");
            this.scrollbarthumb = document.createElement("div");
            this.scrollbarthumb.classList.add("scrollbarthumb");
            this.scrollbar.appendChild(this.scrollbarthumb);
            this.scrollbar.style.width = "100%";
            this.editoverlay.appendChild(this.scrollbar);
            //
            // scroll events
            //
            var _this = this;
            var scrolltracker = {
                scrollanchor : 0,
                hookevents: function () {
                    document.addEventListener("mouseup", this, true);
                    document.addEventListener("mousemove", this, true);
                },
                unhookEvents: function () {
                    document.removeEventListener("mouseup", this, true);
                    document.removeEventListener("mousemove", this, true);
                },
                handleEvent: function (e) {
                    switch (e.type) {
                        case 'mouseup':
                            this.unhookEvents();
                            _this.adjustscrollbar();
                            break;
                        case 'mousemove':
                            if (e.target === _this.scrollbar || e.target === _this.scrollbarthumb) {
                                localplay.domutils.fixEvent(e);
                                var x = e.offsetX;
                                var offset = _this.scrollbarthumb.offsetLeft;
                                var width = _this.scrollbarthumb.offsetWidth;
                                if (e.target === _this.scrollbarthumb) {
                                    x += offset;
                                }
                                var thumbposition = Math.max( 0, Math.min( _this.scrollbar.offsetWidth - width, x - scrolltracker.scrollanchor ) );
                                _this.scrollbarthumb.style.left = thumbposition + "px";
                                var viewportoffset = (thumbposition / (_this.scrollbar.offsetWidth - width)) * ( _this.game.level.bounds.width - _this.game.level.world.viewport.width );
                                var dx = viewportoffset - _this.game.level.world.viewport.x
                                _this.game.level.scrollviewportby(dx);
                            }
                            break;
                    }
                    localplay.domutils.stopPropagation(e);
                    return false;
                }
            }
            this.scrollbar.onmousedown = function (e) {
                localplay.domutils.fixEvent(e);
                var x = e.offsetX;
                var offset = _this.scrollbarthumb.offsetLeft;
                var width = _this.scrollbarthumb.offsetWidth;
                var pagesize = _this.game.level.world.viewport.width / 4;
                if (e.target === _this.scrollbarthumb) {
                    x += offset;
                }
                if (x < offset) {
                    _this.game.level.scrollviewportby(-pagesize);
                    _this.adjustscrollbar();
                } else if (x > offset + width) {
                    _this.game.level.scrollviewportby(pagesize);
                    _this.adjustscrollbar();
                } else {
                    scrolltracker.hookevents();
                    scrolltracker.scrollanchor = x - offset;
                }
                localplay.domutils.stopPropagation(e);
                return false;
            };
        }

        var totalwidth = this.game.level.bounds.width;
        var viewportwidth = this.game.level.world.viewport.width;
        if (totalwidth > viewportwidth) {
            var viewportoffset = this.game.level.world.viewport.x;
            var thumbwidth = Math.ceil((viewportwidth / totalwidth) * this.scrollbar.offsetWidth);
            var thumboffset = Math.ceil((viewportoffset / totalwidth) * this.scrollbar.offsetWidth);
            this.scrollbarthumb.style.width = thumbwidth + "px";
            this.scrollbarthumb.style.left = thumboffset + "px";
            this.scrollbar.style.visibility = "visible";
        } else {
            this.scrollbar.style.visibility = "hidden";
        }
    }

    EditorController.prototype.safeclose = function (callback) {
        var _this = this;
        if (this.game.level.isdirty()||this.game.levelid <= 0) {
            localplay.dialogbox.confirm("Localplay", "Do you want to save changes?", function (confirm) {
                if (confirm) {
                    _this.game.savelevel(function (success) {
                        if (success) {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
                
            });
        } else {
            callback();
        }
    }
    //
    // required controller methods
    //

    EditorController.prototype.draw = function () {
        //
        //
        //
        if (this.istrackingmouse()&&!this.firstmousetrackingupdate) {
            var p1 = this.mousetrackingposition;
            var context = this.game.canvas.getContext('2d');
            context.save();
            if (this.selectedsprite) {
                var p0 = this.selectedsprite.editPosition.duplicate();
                if (p0) p0.moveby(this.game.getviewportoffset());
                
                context.strokeStyle = 'rgb( 247, 144, 41 )';
                context.fillStyle = 'rgb( 247, 144, 41 )';
                context.lineWidth = 2;

                var radius = 2;
                var offset = new Point(p1.x - p0.x, p1.y - p0.y);
                offset.normalise();
                offset.scale(radius);

                context.beginPath();
                context.moveTo(p0.x + offset.x, p0.y + offset.y);
                context.lineTo(p1.x, p1.y);
                context.stroke();

                context.beginPath();
                context.arc(p0.x, p0.y, radius, 0.0, Math.PI * 2.0);
                context.stroke();

                /*
                */
                var icon = null;
                switch (this.mousetrackingmode) {
                    case EditorController.mousetrackingmode.rotate:
                        icon = rotate;
                        break;
                    case EditorController.mousetrackingmode.scale:
                        icon = scale;
                        break;
                    case EditorController.mousetrackingmode.move:
                        icon = move;
                        break;
                }
                if (icon) {
                    context.drawImage(icon, p1.x - 8, p1.y - 8, 16, 16);
                } else {
                    context.beginPath();
                    context.arc(p1.x, p1.y, 8, 0.0, Math.PI * 2.0);
                    context.stroke();
                }


            } else {
                
                context.drawImage(hscroll, p1.x - 16, p1.y - 16, 32, 32);

            }
            context.restore();
        }
    }

    EditorController.prototype.detach = function () {
        //
        //
        //
        if (this.menupopup) {
            document.body.removeChild(this.menupopup);
        }
        this.game.canvas.offsetParent.removeChild(this.menu);
        this.game.canvas.offsetParent.removeChild(this.editoverlay);
        //
        // unhook events
        //
        this.editoverlay.removeEventListener("dragstart", this.bounddragstart);
        this.editoverlay.removeEventListener("dragenter", this.bounddragenter);
        this.editoverlay.removeEventListener("dragleave", this.bounddragleave);
        this.editoverlay.removeEventListener("dragover", this.bounddragover);
        this.editoverlay.removeEventListener("drop", this.bounddrop);

        this.editoverlay.removeEventListener("click", this.boundclick);
        this.editoverlay.removeEventListener("mousemove", this.boundmousemove);

        window.removeEventListener("keydown", this.boundkeydown);
        window.removeEventListener("keyup", this.boundkeyup);
        window.removeEventListener("resize", this.boundresize);

        this.game.level.removeEventListener("statechange", this.boundstatechange);
    }


    EditorController.prototype.onstatechange = function (e) {
        switch (this.game.level.state) {
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
    //
    //
    //
    EditorController.prototype.editgamemetadata = function () {

        var content = Mustache.render(gamemetadataeditor, this.game.metadata);
        var _this = this;
        var dialog = localplay.dialogbox.createfullscreendialogbox("Game Information", [content],
            [],
            [], function () {
                _this.game.metadata.name = document.getElementById("editor.game.name").value;
                _this.game.metadata.place = document.getElementById("editor.game.place").value;
                _this.game.metadata.change = document.getElementById("editor.game.change").value;
                _this.game.metadata.tags = document.getElementById("editor.game.tags").value;
                _this.game.level.reserialise();
            });
        dialog.show();
    }
    //
    //
    //
    EditorController.prototype.editgameplay = function () {
        var editor = localplay.game.storyeditor.createstoryeditor(this.game.level);
        var _this = this;
        var dialog = localplay.dialogbox.createfullscreendialogbox("Gameplay", [editor.container],
            [],
            [], function () {
                editor.save();
                _this.game.level.reserialise();
            });
        dialog.show();
    }
    //
    //
    //
    EditorController.prototype.editbackground = function () {
        var editor = localplay.game.backgroundeditor.createbackgroundeditor(this.game.level);
        var _this = this;
        var dialog = localplay.dialogbox.createfullscreendialogbox("Background", [editor.container],
            [],
            [], function () {
                _this.game.level.reserialise();
                _this.adjustscrollbar();
            });
        dialog.show();
        editor.initialise();
    }
    //
    //
    //
    EditorController.prototype.edititems = function () {
        //
        // TODO: this should allow drag and drop so slide away once user starts dragging
        //
        var editor = localplay.game.itemeditor.createitemeditor(this.game.level);
        var _this = this;
        var dialog = localplay.dialogbox.createfullscreendialogbox("Things", [editor.container],
            [],
            [], function () {
                editor.dialog = null;
                _this.game.level.reserialise();
                _this.showmenu();
            });
        dialog.dialog.style.margin = "0px";
        dialog.dialog.style.top = "0px";
        dialog.backdrop.style.top = "35%";
        dialog.show();
        editor.dialog = dialog;
        editor.initialise();
        this.showmenu(false);
    }
    //
    //
    //
    EditorController.prototype.editsound = function () {
        var editor = localplay.game.soundeditor.createlevelsoundeditor(this.game.level);
        var _this = this;
        var dialog = localplay.dialogbox.createfullscreendialogbox("Sound", [editor.container],
            [],
            [], function () {
                _this.game.level.reserialise();
            });
        dialog.show();
    }
    //
    //
    //
    EditorController.prototype.showmenu = function (show) {
        if (this.menu) {
            this.menu.style.visibility = show === undefined || show ? 'visible' : 'hidden';
        }
        if (this.menupopup) {
            this.menupopup.style.visibility = show === undefined || show ? 'visible' : 'hidden';
        }

    }
    //
    //
    //
    EditorController.prototype.showtip = function (tip) {
        if (tip && tip.length > 0) {
            this.tip.innerHTML = tip;
            this.tip.style.visibility = "visible";
        } else {
            this.tip.innerHTML = "";
            this.tip.style.visibility = "hidden";
        }
    }
    EditorController.prototype.showselectionui = function (show) {
        if (this.selectedsprite && show) {
            //
            // layout edit interface centered on sprite
            //
            var aabb = this.selectedsprite.getAABB();
            aabb.moveby(this.game.getviewportoffset());
            aabb.scale(this.game.getscale());
            aabb.moveby(this.canvasoffset);
            if (aabb.height < 64 || aabb.width < 64) { // grow to accomodate interface
                var growth = Math.max(64 - aabb.height, 64 - aabb.width) / 2;
                aabb.grow(growth, growth);
            }
            this.selection.style.top = aabb.y + "px";
            this.selection.style.left = aabb.x + "px";
            this.selection.style.width = aabb.width + "px";
            this.selection.style.height = aabb.height + "px";
            this.selection.style.visibility = "visible";
            this.rollover.style.visibility = "hidden";
            //
            // hide delete for avatar
            //
            var del = document.getElementById("editor.item.delete");
            if (del) {
                del.style.visibility = this.game.level.isAvatar(this.selectedsprite.body) ? "hidden" : "inherit";
            }
        } else {
            this.selection.style.visibility = "hidden";
        }
    }

    EditorController.prototype.selectsprite = function () {
        var sprite = this.rolloversprite;
        if (sprite) {
            //
            //
            //
            this.selectedsprite = sprite;
            this.rolloversprite = null;
            this.showselectionui(true);
            if (!this.game.level.isAvatar(this.selectedsprite.body)) {
                this.showtip("press alt when you click to duplicate");
            }
        } else {
            this.showselectionui(false);
            this.selectedsprite = null;
            this.showtip();
        }

    }
    EditorController.prototype.edititemproperties = function () {
        if (this.selectedsprite) {
            var _this = this;
            var item = this.selectedsprite.userdata;
            var preview = null;
            if (item) {
                var propertyeditor = item.geteditor();
                if (propertyeditor) {
                    var dialog = localplay.dialogbox.createfullscreendialogbox("Item properties", [propertyeditor],
                        [],
                        [], function () {
                            _this.game.level.reserialise();
                            _this.selectsprite();
                            if (preview) {
                                preview.destroy();
                                preview = null;
                            }
                        });
                    dialog.show();
                    //
                    // start behaviour preview
                    //
                    var previewcanvas = document.getElementById("item.property.previewcanvas");
                    if (previewcanvas) {
                        preview = localplay.game.item.creatbehaviourpreviewanimator(previewcanvas, item);
                        preview.start();
                    }
                    //
                    // TODO: this is a fudge to get around the fact that we can't hook DOM element events before they are rendered ( only for some elements though )
                    //
                    /*
                    var itemtype = document.getElementById("item.property.type");
                    if (itemtype) {
                        itemtype.onchange = function (e) {
                            var type = itemtype.value;
                            if (localplay.game.item.isitemtype(type)&&type!==item.type) {
                                //
                                // remove from gameplay 
                                //
                                _this.game.level.gameplay.removeSentencesWithItem(item);
                                //
                                // change type
                                //
                                _this.game.level.changeitemtype(item, type);
                            }
                        }
                    }
                    */
                }
            }
        }
    }
    EditorController.prototype.confirmdelete = function () {
        if (this.selectedsprite) {
            var item = this.selectedsprite.userdata;
            if (item) {
                if (this.game.level.gameplay.containsItem(item)) {
                    var _this = this;
                    localplay.dialogbox.confirm("Delete item", "This item is part of the gameplay.<br />Are you sure you want to delete it?",
                    function (confirm) {
                        if (confirm) {
                            _this.game.level.removeitem(item, true);
                            _this.selectsprite();
                            _this.game.level.reserialise();
                        }
                    });

                } else {
                    this.game.level.removeitem(item, true);
                    this.selectsprite();
                    this.game.level.reserialise();
                }
            }
        }
    }

    EditorController.prototype.addItem = function (url,position) {
        position.scale(this.game.getscale());
        position.x -= this.game.level.world.viewport.x;
        var _this = this;
        var dialog = new localplay.dialogbox.createdialogbox("Add object as?", [],
           ["Platform", "Obstacle", "Pickup", "Goal", "Prop", "Cancel"],
           [
               function () {
                   _this.game.level.newitem("platform", url, position);
                   dialog.close();
               },
            function () {
                _this.game.level.newitem("obstacle", url, position);
                dialog.close();
            },
            function () {
                _this.game.level.newitem("pickup", url, position);
                dialog.close();
            },
            function () {
                _this.game.level.newitem("goal", url, position);
                dialog.close();
                return false;
            },
            function () {
                _this.game.level.newitem("prop", url, position);
                dialog.close();
            },
           function () {
               dialog.close();
           }], 600);
        dialog.show();

    }

    EditorController.mousetrackingmode = {
        rotate : "rotate",
        scale: "scale",
        move: "move",
        background: "background",
        none: "none"
    }

    EditorController.prototype.starttrackingmouse = function (mode) {
        this.mousetrackingmode = mode;
        this.firstmousetrackingupdate = true;
        this.mousetrackingduplicate = null;
        this.showselectionui(false);
        if (this.selectedsprite) {
            if (this.keys[localplay.keycode.ALT] && !this.game.level.isAvatar(this.selectedsprite.body)) {
                //
                // duplicate
                //
                this.mousetrackingduplicate = this.selectedsprite.userdata.duplicate();
                this.game.level.additem(this.mousetrackingduplicate);
                this.selectedsprite = this.mousetrackingduplicate.sprite;
            }
            this.selectedsprite.beginedit();
        }
    }

    EditorController.prototype.endtrackingmouse = function () {
        this.mousetrackingmode = EditorController.mousetrackingmode.none;
        if (this.selectedsprite) {
            this.mousetrackingduplicate = null;
            this.selectedsprite.commitedit();
            this.selectedsprite = null;
            this.game.level.reserialise();
        }
        this.showtip();
    }
    EditorController.prototype.canceltrackingmouse = function () {
        this.mousetrackingmode = EditorController.mousetrackingmode.none;
        if (this.mousetrackingduplicate) {
            this.game.level.removeitem(this.mousetrackingduplicate, true);
            this.mousetrackingduplicate = null;
        } else if (this.selectedsprite) {
            this.selectedsprite.canceledit();
        }
        this.selectedsprite = null;
        this.showtip();
    }
    EditorController.prototype.updatemousetracking = function (x, y) {
        this.mousetrackingposition.set(x, y);
        var p0 = this.selectedsprite ? this.selectedsprite.editPosition.duplicate() : null;
        var p1 = this.mousetrackingposition;
        var offset = this.game.getviewportoffset();
        if (p0) p0.moveby(offset);

        if (this.mousetrackingmode === EditorController.mousetrackingmode.rotate) {
            /*
            var arcTan = Math.atan2(p1.x - p0.x, p1.y - p0.y);
            var rotation = -arcTan;// * -180 / Math.PI;
            */
            var rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);
            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = rotation;
                this.firstmousetrackingupdate = false;
            } else {
                //this.selectedsprite.setrotation(rotation - this.mousetrackingreference);
                this.selectedsprite.editRotation = rotation - this.mousetrackingreference;
            }
        } else if (this.mousetrackingmode === EditorController.mousetrackingmode.scale) {
            var d = p1.distance(p0);
            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = d;
                this.firstmousetrackingupdate = false;
            } else {
                var scale = Math.min(100.0, Math.max(0.1, d / this.mousetrackingreference));
                //this.selectedsprite.setscale(scale);
                this.selectedsprite.editScale = scale;
            }
        } else if (this.mousetrackingmode === EditorController.mousetrackingmode.move) {

            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = new Point(p0.x - p1.x, p0.y - p1.y);
                this.firstmousetrackingupdate = false;
            } else {
                /*
                var p = new Point(p1.x + this.mousetrackingreference.x, p1.y + this.mousetrackingreference.y);
                this.selectedsprite.moveto(p);
                */
                this.selectedsprite.editPosition.x = ( p1.x + this.mousetrackingreference.x ) - offset.x;
                this.selectedsprite.editPosition.y = ( p1.y + this.mousetrackingreference.y ) - offset.y;

            }
        } else if (this.mousetrackingmode === EditorController.mousetrackingmode.background) {
            if (this.firstmousetrackingupdate) {
                this.mousetrackingreference = new Point(p1.x, p1.y);
                this.firstmousetrackingupdate = false;
            } else {
               this.game.level.scrollviewportby(this.mousetrackingreference.x - p1.x);
                this.mousetrackingreference.x = p1.x;
                this.mousetrackingreference.y = p1.y;
                this.adjustscrollbar();
            }
        }

        //this.selectedsprite.update();
    }
    EditorController.prototype.istrackingmouse = function () {
        return this.mousetrackingmode != EditorController.mousetrackingmode.none;
    }
    //
    // 
    //
    EditorController.prototype.onclick = function (e) {
        localplay.domutils.fixEvent(e);
        var selector = e.target.id.split(".");
        if (selector.length >= 2) {
            localplay.log(selector[1]);
            switch (selector[1]) {
                case "game":
                    this.editgamemetadata();
                    break;
                case "gameplay":
                    this.editgameplay();
                    break;
                case "background":
                    this.editbackground();
                    break;
                case "items":
                    this.edititems();
                    break;
                case "sound":
                    this.editsound();
                    break;
                case "save":
                    this.game.savelevel();
                    break;
                case "rollover":
                    this.selectsprite();
                    break;
                case "selection":
                    break;
                case "overlay":
                    if (this.istrackingmouse()) {
                        this.endtrackingmouse();
                        
                    } else if( !this.selectedsprite ) {
                        
                        if (this.game.level.isscrollable()) {
                            //
                            // start scrolling
                            //
                            this.starttrackingmouse(EditorController.mousetrackingmode.background);
                            var p = new Point(e.offsetX, e.offsetY);
                            this.game.containertocanvascoord(p);
                            this.updatemousetracking(p.x, p.y);
                            this.showtip("move mouse to scroll, click to stop");

                        }
                    }
                    this.selectsprite();
                    break;
                case "item":
                    if (selector.length >= 3) {
                        var showtip = false;
                        switch (selector[2]) {
                            case "properties":
                                this.edititemproperties();
                                break;
                            case "delete":
                                this.confirmdelete();
                                break;
                            case "scale":
                                showtip = true;
                                this.starttrackingmouse(EditorController.mousetrackingmode.scale);
                                break;
                            case "rotate":
                                showtip = true;
                                this.starttrackingmouse(EditorController.mousetrackingmode.rotate);
                                break;
                            case "move":
                                showtip = true;
                                this.starttrackingmouse(EditorController.mousetrackingmode.move);
                                break;

                        }
                        var p = localplay.domutils.elementPosition(e.target);// new Point(e.offsetX, e.offsetY);
                        p.x += e.target.offsetWidth / 2;
                        p.y += e.target.offsetHeight / 2;
                        p.x -= this.editoverlay.offsetLeft;
                        p.y -= this.editoverlay.offsetTop;
                        this.game.containertocanvascoord(p);
                        this.updatemousetracking(p.x, p.y);
                        if (showtip) this.showtip("click to fix, esc to cancel");
                    }
                    break;
                default:
                    //
                    // TODO: temporary 
                    //
                    this.endtrackingmouse();
                    this.selectsprite();
                    break;
            }
            localplay.domutils.stopPropagation(e);
        }
        return false;
    }

    EditorController.prototype.onmousedown = function (e) {
        //this.game.level.onmousedown(e);
        return false;
    }

    EditorController.prototype.onmouseup = function (e) {
        //this.game.level.onmouseup(e);
        return false;
    }

    EditorController.prototype.onmousemove = function (e) {
        //
        // scale mouse position into canvas coordinates
        //
        localplay.domutils.fixEvent(e);
        //
        //
        //
        if (e.target.id === "editor.overlay") {
            if (this.istrackingmouse()) {
                var p = new Point(e.offsetX, e.offsetY);
                this.game.containertocanvascoord(p);
                this.updatemousetracking(p.x, p.y);
            } else {
                if (this.scrollbar) {
                    //
                    // TODO: this condition needs a method
                    //
                    var totalwidth = this.game.level.bounds.width;
                    var viewportwidth = this.game.level.world.viewport.width;
                    if (totalwidth > viewportwidth) {
                        if (e.offsetY > this.scrollbar.offsetTop) {
                            
                            this.scrollbar.style.visibility = "visible";
                        } else {
                            this.scrollbar.style.visibility = "hidden";
                        }
                    }
                }
                if (!this.selectedsprite) {
                    var p = new Point(e.offsetX - this.canvasoffset.x, e.offsetY - this.canvasoffset.y);
                    var sprite = this.game.spriteatpoint(p);
                    if (sprite) {
                        //
                        // show rollover
                        //
                        var aabb = sprite.getAABB();
                        aabb.moveby(this.game.getviewportoffset());
                        aabb.scale(this.game.getscale());
                        aabb.moveby(this.canvasoffset);
                        aabb.grow(4, 4);
              
                        this.rollover.style.top = aabb.y + "px";
                        this.rollover.style.left = aabb.x + "px";
                        this.rollover.style.width = aabb.width + "px";
                        this.rollover.style.height = aabb.height + "px";
                        this.rollover.style.visibility = "visible";
                        this.rolloversprite = sprite;
                    } else {
                        this.rollover.style.visibility = "hidden";
                        this.rolloversprite = null;
                    }
                }
            }

        }
        /*
        //
        //
        //
        var rolloversprite = this.game.spriteatpoint(e);
        if (rolloversprite !== this.rolloversprite) {
            this.rolloversprite = rolloversprite;

        }
        */
        return false;
    }
    EditorController.prototype.onkeydown = function (e) {
        this.keys[e.keyCode] = true;
        if (this.keys[localplay.keycode.ESC]) {
            if (this.istrackingmouse()) {
                this.canceltrackingmouse();
            }
        }
        return false;
    }

    EditorController.prototype.onkeyup = function (e) {
        this.keys[e.keyCode] = false;
        return false;
    }

    EditorController.prototype.onresize = function (e) {
        this.game.fittocontainer();
        this.canvasoffset = new Point(this.game.canvas.offsetLeft, this.game.canvas.offsetTop);
        this.canvasbounds =
            new Rectangle(this.game.canvas.offsetLeft, this.game.canvas.offsetTop,
            this.game.canvas.offsetWidth, this.game.canvas.offsetHeight);
        if (this.selection.style.visibility !== "hidden") {
            this.showselectionui(true);
        }
        this.adjustscrollbar();
        return false;
    }

    EditorController.prototype.ondragstart = function (e) {
        localplay.domutils.preventDefault(e);
        localplay.domutils.stopPropagation(e);
        return false;
    }

    EditorController.prototype.ondragenter = function (e) {
        localplay.domutils.fixEvent(e);
        if (this.canvasbounds.contains(new Point(e.offsetX, e.offsetY))) {
            this.game.canvas.classList.add('over');
        }
    }

    EditorController.prototype.ondragleave = function (e) {
        this.game.canvas.classList.remove('over');
    }

    EditorController.prototype.ondragover = function (e) {
        localplay.domutils.fixEvent(e);
        //
        // this is to fix IE ondrop coordinate problem
        //
        this.droppoint = new Point(e.offsetX, e.offsetY);
        //localplay.log("drag over dropx=" + this.droppoint.x + " dropy=" + this.droppoint.y);
        if (e.preventDefault) {
            e.preventDefault();
        }
        
        if (this.canvasbounds.contains(new Point(e.offsetX, e.offsetY))) {
            if (!this.game.canvas.classList.contains('over')) {
                this.game.canvas.classList.add('over');
            }
        } else {
            this.game.canvas.classList.remove('over');
        }
        e.dataTransfer.dropEffect = 'copy';
        return false;
    }
    EditorController.prototype.ondrop = function (e) {
        localplay.domutils.fixEvent(e);

        var x = e.offsetX - this.canvasoffset.x;
        var y = e.offsetY - this.canvasoffset.y;
        this.game.canvas.classList.remove('over');
        var url = e.dataTransfer.getData("Text");
        var position = new Point(Math.abs(this.game.level.world.viewport.x) + x, y);
        if (position.x <= this.game.level.world.viewport.x || position.x >= this.game.level.world.viewport.x + this.game.level.world.viewport.width) {
            position.x = this.game.level.world.viewport.x + (this.game.level.world.viewport.width / 2);
        }
        if (position.y <= this.game.level.world.viewport.y || position.y >= this.game.level.world.viewport.y + this.game.level.world.viewport.height) {
            position.y = this.game.level.world.viewport.y + (this.game.level.world.viewport.height / 2);
        }
        this.addItem(url, position);

        localplay.domutils.stopPropagation(e);
        if (e.preventDefault) {
            e.preventDefault();
        }
        return false;
    }

    editor.attachtogame = function (game) {
        //
        // 
        //
        return new EditorController(game);
    }

    return editor;
})();
