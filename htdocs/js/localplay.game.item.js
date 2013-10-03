;
localplay.game.item = (function () {
    if (localplay.game.item) return localplay.game.item;
    var item = {};
    //
    //
    //
    item.types = {
        platform: "platform",
        obstacle: "obstacle",
        pickup: "pickup",
        goal: "goal",
        prop: "prop"
    };
    //
    //
    //
    var editortemplate =
        '<div id="itemeditor.container"> \
            <div> \
                \
            </div> \
            <div> \
                \
            </div>  \
        </div>';


    //
    // TODO: scale and rotation must be synched between sprite and item at the moment it is assumed not to be animated by the game physics
    //
    function GameItem(level, type, properties, deferspritecreation) {
        var _this = this;
        this.level = level;
        this.type = type;
        this.homeposition = properties.position;
        this.currentposition = new Point(this.homeposition.x,this.homeposition.y);
        this.image = properties.image;
        this.scale = properties.scale ? parseFloat(properties.scale) : 1.0;
        this.rotation = properties.rotation ? parseFloat(properties.rotation) : 0.0;
        this.zindex = properties.zindex ? parseInt(properties.zindex) : 0;
        this.sprite = null;
        //
        // behavious
        //
        if (properties.behaviours) {
            this.behaviour = [];
            for (var i = 0; i < properties.behaviours.length; i++) {
                var behaviour = properties.behaviours[i].behaviour; // TODO: sort this out
                this.behaviour.push(localplay.game.behaviour.createbehaviour(parseInt(behaviour.starttime), parseInt(behaviour.duration), parseFloat(behaviour.extent), parseInt(behaviour.type),behaviour.onedirection ? behaviour.onedirection : false ));
            }
        } else {
            this.behaviour = [];
            this.behaviour.push(localplay.game.behaviour.createbehaviour(0, 0, 0.0, localplay.game.behaviour.types.leftright));
            this.behaviour.push(localplay.game.behaviour.createbehaviour(0, 0, 0.0, localplay.game.behaviour.types.updown));
        }
        //
        // audio
        //
        this.audioready = false;
        this.audio = null;
        this.audioplayer = null;
        if (!properties.audio) {
            //
            // default audio for pickup, obstacle and goal
            //
            if (this.type === "pickup" || this.type === "obstacle" || this.type === "goal") {
                properties.audio = { id: 0, name: this.type, type: "effect", mp3: "audio/" + this.type + ".mp3", ogg: "audio/" + this.type + ".ogg" };
            }
        }
        if (properties.audio) {
            this.audio = properties.audio;
            this.setupaudio();
        }
        if (deferspritecreation === undefined || !deferspritecreation) this.createsprite();
    }

    GameItem.prototype.setupaudio = function () {
        var _this = this;
        if (this.audio) {
            this.audioready = false;
            try {
                if (!this.audioplayer) {
                    this.audioplayer = new Audio();
                    this.audioplayer.addEventListener("canplaythrough", function () {
                        _this.audioready = true;
                    });
                    this.audioplayer.addEventListener("ended", function () {
                        _this.audioready = true;
                    });
                }
                this.audioplayer.src = this.audio[localplay.domutils.getTypeForAudio()];
                this.audioplayer.load();
            } catch (error) {
                this.audioplayer = null;
                localplay.log("GameItem : unable to load audio '" + this.audio + "'");
            }
        } else {
            if (this.audioplayer) {
                delete this.audioplayer;
                this.audioplayer = null;
            }
            this.audioready = false;
        }
    }
    GameItem.prototype.duplicate = function (position) {
        //
        // package behaviours
        //
        var _behaviours = [];
        for (var i = 0; i < this.behaviour.length; i++) {
            _behaviours.push({
                behaviour: {
                    starttime: this.behaviour[i].starttime,
                    duration: this.behaviour[i].duration,
                    extent: this.behaviour[i].extent,
                    type: this.behaviour[i].type
                }
            });
        }
        //
        // and properties
        //
        var properties = {
            image: this.image,
            position: this.homeposition.duplicate(),
            rotation: this.rotation,
            scale: this.scale,
            zindex: this.zindex,
            behaviours: _behaviours,
            audio: this.audio
        };
        return new GameItem(this.level, this.type, properties, false);
    }

    GameItem.prototype.isloaded = function () {
        return (this.sprite && this.sprite.isloaded());
    }

    GameItem.prototype.createsprite = function () {
        if (this.sprite) this.sprite.destroy();
        this.sprite = localplay.sprite.createsprite(this.level.world, this.homeposition, this.image, 'static', false, this.type !== 'prop', this.rotation, this.scale);
        this.sprite.userdata = this;
        if ( this.zindex <= 0 ) this.zindex = this.level.world.sprites.length + 1;
        this.sprite.zIndex = this.zindex;
     }

    GameItem.prototype.destroy = function () {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    GameItem.prototype.sethometocurrentposition = function () {
        this.homeposition = new Point(this.sprite.position.x, this.sprite.position.y);
    }

    GameItem.prototype.update = function (time) {
        //
        // update animation and state
        //
        var aabb = ( this.sprite ? this.sprite.getAABB() : new Rectangle(0,0,20,20) );
        this.currentposition.set( this.homeposition.x, this.homeposition.y );
        var worldwidth = this.level.background.width;
        var worldheight = this.level.background.height;
        for (var i = 0; i < this.behaviour.length; i++) {
            this.behaviour[i].update(time, this.currentposition, worldwidth, worldheight, aabb.width, aabb.height);
        }
        this.sprite.moveto(this.currentposition);
    }

    GameItem.prototype.playaudio = function () {
        if (this.audioplayer && this.audioready) {
            this.audioready = false;
            this.audioplayer.play();
        }
    }

    GameItem.prototype.toJSON = function () {
        return this.tostring();
    }

    GameItem.prototype.tostring = function () {
        var p = this.homeposition.duplicate();
        //
        // store behaviours as string. TODO: move this to behaviours
        //
        var behaviours = "";
        for (var i = 0; i < this.behaviour.length; i++) {
            behaviours += '{ ' + this.behaviour[i].tostring() + ' }';
            if (i < this.behaviour.length - 1) {
                behaviours += ','
            }
        }
        behaviours = '[' + behaviours + ']';
        //
        //
        //
        var audio = "";
        if (this.audio) {
            audio = JSON.stringify(this.audio);
            audio = ', "audio" : ' + audio;
        }
        return '{ "' + this.type + '" : { "image" : "' + this.image + '", "position" : "' + p.tostring() + '", "scale" : "' + this.scale + '", "rotation" : "' + this.rotation + '", "zindex" : "' + this.zindex + '", "behaviours" : ' + behaviours + audio + ' } }';
    }

    GameItem.prototype.shadowcolour = function () {
        switch (this.type) {
            case item.types.platform:
                return 'rgba( 247, 144, 41, 0.5)'
            case item.types.obstacle:
                return 'rgba( 247, 41, 41, 0.5)'
            case item.types.pickup:
                return 'rgba( 0, 144, 144, 0.5)'
            case item.types.goal:
                return 'rgba( 247, 247, 41, 0.5)'

        }
        return 'rgba(0, 0, 0, 0.25)';
    }

    GameItem.prototype.replacesprite = function (src) {
        var media = localplay.domutils.urlToRelativePath(src);
        if (media !== this.image) {
            if (!this.level.autogenerate && this.level.gameplay.containsItem(this) ) {
                if (this.level.countInstancesOfMediaForObjectOfType(this.type, this.image) <= 1) {
                    this.level.gameplay.replaceSubject(this.image, media);
                } else if (this.level.countInstancesOfMediaForObjectOfType(this.type, media) < 1) {
                    //
                    // TODO: generate default rule for type
                    //
                }
            }
            this.image = media;
            this.sprite.destroy();
            this.createsprite();
        }
    }

    var editortemplate = ' \
        <div id="itemeditor.left" style="display: inline-block; vertical-align: top; min-width: 256px; min-height: 400px; padding: 8px;"> \
            <h4>Type</h4> \
            <select id="item.property.type" style="width: 200px;"> \
            </select> \
            <p /> \
            <img  id="item.property.image" class"imagebutton backgroundgrid" style="height: auto; max-width: 200px; padding: 4px;" src="{{image}}" /> \
            <div id="item.property.changeimage" class="menubaritem" style="margin-left: 0px;"> \
                <img class="menubaritem" src="images/icons/edit-01.png" />&nbsp;Change image \
            </div> \
            <p /> \
            <audio id="item.property.audio" controls="true" style="width: 200px;" /><br /> \
            <div id="item.property.changeaudio" class="menubaritem" style="margin-left: 0px;"> \
                <img class="menubaritem" src="images/icons/edit-01.png" />&nbsp;Change collision sound \
            </div> \
        </div> \
        <div id="itemeditor.right" style="display: inline-block; vertical-align: top; min-width: 512px; min-height: 400px; padding: 8px; white-space: nowrap;"> \
            <div id="itemeditor.behaviours" style="display: inline-block; vertical-align: top;"> \
                <h4>Movement</h4> \
                <div id="id="item.property.behaviour.leftright"> \
                    <h4>Left / Right</h4> \
                    <div> \
                        <input id="item.property.behaviour.leftright.onedirection" type="checkbox" name="item.property.behaviour.leftright.onedirection"/> \
                        <label for="item.property.behaviour.leftright.onedirection"></label>&nbsp;one direction<p/> \
                    </div> \
                    <div>starttime<br />\
                        <input id="item.property.behaviour.leftright.starttime" type="range" style="width: 200px; height: 30px;"/><p /> \
                    </div> \
                    <div>duration<br />\
                        <input id="item.property.behaviour.leftright.duration" type="range"  style="width: 200px; height: 30px;"/><p /> \
                    </div> \
                    <div><span id="item.property.behaviour.leftright.extentlabel">extent</span><br />\
                        <input id="item.property.behaviour.leftright.extent" type="range"  style="width: 200px; height: 30px;"/><p /> \
                    </div> \
                </div> \
                <div id="item.property.behaviour.updown"> \
                    <h4>Up / Down</h4> \
                    <div> \
                        <input id="item.property.behaviour.updown.onedirection" type="checkbox" name="item.property.behaviour.updown.onedirection"/> \
                        <label for="item.property.behaviour.updown.onedirection"></label>&nbsp;one direction<p/> \
                    </div> \
                    <div>starttime<br />\
                        <input id="item.property.behaviour.updown.starttime" type="range"  style="width: 200px; height: 30px;"/><p /> \
                    </div> \
                    <div>duration<br />\
                        <input id="item.property.behaviour.updown.duration" type="range"  style="width: 200px; height: 30px;"/><p /> \
                    </div> \
                    <div><span id="item.property.behaviour.updown.extentlabel">extent</span><br />\
                        <input id="item.property.behaviour.updown.extent" type="range"  style="width: 200px; height: 30px;"/><p /> \
                    </div> \
                </div> \
            </div> \
            <div id="itemeditor.preview" style="display: inline-block; padding: 0px 0px 0px 16px; vertical-align: middle;"> \
                <h4>Preview</h4> \
                <canvas id = "item.property.previewcanvas" width="512" height="384" style="position: relative; margin: 0px;"> \
                    Your browser doesn&apos;t support canvas \
                </canvas> \
            </div> \
        </div> \
    ';

    GameItem.prototype.geteditor = function () {
        var container = document.createElement("div");
        container.style.overflow = "auto";
        container.style.padding = "32px";
        container.innerHTML = Mustache.render( editortemplate, this );
        return container;
    }

    GameItem.prototype.initialiseeditor = function () {
    var _this = this;
        //
        // setup item type
        //
        var itemtype = document.getElementById("item.property.type");
        if (itemtype) {
            var index = 0;
            var options = "";
            for (var key in item.types) {

                var option = document.createElement("option");
                option.text = item.types[key];
                if (item.types[key] === this.type) {
                    option.selected = "selected";
                } else {
                    index++;
                }
                itemtype.add(option);
            }

            itemtype.onchange = function (e) {
                var type = itemtype.value;
                var newtitle = type.substring(0, 1).toUpperCase() + type.substring(1);
                if (localplay.game.item.isitemtype(type) && type !== _this.type) {
                    var instances = _this.level.getInstancesOfMediaForObjectOfType(_this.type, _this.image);
                    localplay.dialogbox.confirm("Playsouthend", "This will change all things using this image to " + newtitle + "<br/>Are you sure you want to continue?",
                    function (confirm) {
                        if (confirm) {
                            //
                            // remove from gameplay 
                            // 
                            _this.level.gameplay.removeSentencesWithItem(_this);
                            //
                            // change all things using this media to new type
                            //

                            for (var i = 0; i < instances.length; i++) {
                                //
                                // change type
                                //
                                _this.level.changeitemtype(instances[i], type);
                            }
                            //
                            // TODO: add default rule for this type
                            //
                        } else {
                            //
                            // reset dropdown
                            //
                            for (var i = 0; i < itemtype.length; i++) {
                                if (itemtype.options[i].text === _this.type) {
                                    itemtype.options[i].selected = "selected";
                                } else {
                                    itemtype.options[i].selected = undefined;
                                }
                            }
                        }
                    }, instances.length <= 1);
                }
            };
        }
        //
        // setup image
        //
        var image = document.getElementById("item.property.image");
        if ( image ) {

            image.onload = function (e) {
                _this.replacesprite(e.target.src);
                _this.level.reserialise();
            }

            var changeimage = function (e) {
                //
                // show media library
                //
                var contents = "getmedia.php?type=object&listview=true";
                //title, contents, onselect, limit, filter, onadd, addlabel, itemtemplate
                localplay.listview.createlibrarydialog("Select " + _this.type, contents, function (item) {
                    //
                    // TODO: if there are no other instances of the item's original media then remove all rules associated with media, should be accompanied by confirmation dialog
                    //
                    image.src = item.data.url;

                }, 20, "",
                function (controller) {
                    var objecteditor = localplay.objecteditor.createobjecteditor("Add Thing", function () {
                        controller.refresh();
                    });
                }, "Upload images of " + _this.type + "s");
            }

            image.onclick = changeimage;

            var changeimagebutton = document.getElementById("item.property.changeimage");
            if (changeimagebutton) {
                changeimagebutton.onclick = changeimage;
            }
        }
        //
        // setup collision audio
        //
        var player = document.getElementById("item.property.audio");
        if (player) {
            if (this.audio) {
                player.style.visibility = "visible";
                player.src = _this.audio[localplay.domutils.getTypeForAudio()];
            }
            var changeaudio = document.getElementById('item.property.changeaudio');
            if (changeaudio) {
                changeaudio.onclick = function (e) {
                    var pin = localplay.domutils.elementPosition(e.target);
                    var dialog = localplay.game.soundeditor.createaudiodialog("Select collison sound", "effect", _this.audio, pin);
                    dialog.addEventListener("save", function () {
                        if (!_this.audio) _this.audio = {};
                        _this.audio.id = dialog.selection.id;
                        _this.audio.type = dialog.selection.type;
                        _this.audio.name = dialog.selection.name;
                        _this.audio.mp3 = dialog.selection.mp3;
                        _this.audio.ogg = dialog.selection.ogg;
                        player.src = _this.audio[localplay.domutils.getTypeForAudio()];
                        _this.setupaudio();
                    });
                    dialog.show();
                }
            }
        }
        //
        // setup behaviours
        //
        for (var i = 0; i < this.behaviour.length; i++) {
            var prefix = null;
            switch (i) {
                case 0:
                    prefix = "leftright";
                    break;
                case 1:
                    prefix = "updown";
                    break;
            }
            if (prefix) {

                var starttime = document.getElementById("item.property.behaviour." + prefix + ".starttime");
                var duration = document.getElementById("item.property.behaviour." + prefix + ".duration");
                var extent = document.getElementById("item.property.behaviour." + prefix + ".extent");
                var extentlabel = document.getElementById("item.property.behaviour." + prefix + ".extentlabel");
                var onedirection = document.getElementById("item.property.behaviour." + prefix + ".onedirection");
                onedirection.checked = this.behaviour[i].isonedirection();
                if ( this.behaviour[ i ].isonedirection() ) {
                    onedirection.checked = true;
                    extentlabel.innerHTML = "direction";
                } else {
                    onedirection.checked = false;
                    extentlabel.innerHTML = "extent";
                }
                onedirection.localplay = {
                    behaviour: this.behaviour[i],
                    slider: extent,
                    label: extentlabel
                };
                onedirection.onchange = function (e) {
                    e.target.localplay.behaviour.setonedirection(e.target.checked);
                    if (e.target.checked) {
                        var extent = Math.round(localplay.game.behaviour.ranges.extent.min + ((localplay.game.behaviour.ranges.extent.max - localplay.game.behaviour.ranges.extent.min) / 2.0));
                        e.target.localplay.behaviour.extent = extent;
                        e.target.localplay.slider.value = e.target.localplay.behaviour.extent;
                        e.target.localplay.label.innerHTML = "direction";
                    } else {
                        e.target.localplay.label.innerHTML = "extent";
                    }
                };
                //
                // bind to sliders
                //
                function bindslider(slider, source, name, min, max) {
                    slider.min = min;
                    slider.max = max;
                    slider.value = source[name];
                    localplay.log("min: " + slider.min + " max: " + slider.max + " value:" + slider.value + " source: " + name + " value: " + source[name]);
                    slider.onchange = function (e) {
                        var value = e.target.value;
                        source[name] = value;
                    };
                    if (slider.type == "text") {
                        localplay.domutils.createSlider(slider);
                    }
                }
                bindslider(starttime,this.behaviour[ i ], "starttime", localplay.game.behaviour.ranges.starttime.min, localplay.game.behaviour.ranges.starttime.max ); 
                bindslider(duration, this.behaviour[i], "duration", localplay.game.behaviour.ranges.duration.min, localplay.game.behaviour.ranges.duration.max);
                bindslider(extent, this.behaviour[i], "extent", localplay.game.behaviour.ranges.extent.min, localplay.game.behaviour.ranges.extent.max);
            }
        }
        //
        // start behaviour preview
        //
        var previewcanvas = document.getElementById("item.property.previewcanvas");
        if (previewcanvas) {
            preview = localplay.game.behaviour.creatbehaviourpreviewanimator(previewcanvas, this);
            preview.start();
            previewcanvas.localplay = {
                preview : preview
            };
        }

    }

    GameItem.prototype.closeeditor = function () {
        //
        // close preview
        //
        var previewcanvas = document.getElementById("item.property.previewcanvas");
        if (previewcanvas&&previewcanvas.localplay) {
            previewcanvas.localplay.preview.destroy();
        }
    }
    //
    //
    //
    item.isitemtype = function (type) {
        for (var key in this.types) {
            if (this.types[key] === type) return true;
        }
        return false;
    }

    item.createitem = function (level, type, properties, deferspritecreation) {
        return new GameItem(level, type, properties, deferspritecreation);
    }

    //
    //
    //
    return item;
})();