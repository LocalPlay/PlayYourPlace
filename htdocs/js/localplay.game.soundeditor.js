/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.soundeditor.js
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
localplay.game.soundeditor = (function () {
    var soundeditor = {};
    //
    //
    //
    function AudioDialog(prompt, type, selection, pin) {
        //
        //
        //
        localplay.domutils.extendAsEventDispatcher(this);
        //
        //
        //
        this.pin = pin;
        this.prompt = prompt;
        this.type = type;
        this.selection = selection;
        this.title = null;
        this.selecteditem = null;
        this.player = null;
        this.listing = [];
        this.scrollpane = null;
        this.dialog = null;
        this.datasource = new AudioListDataSource(type, this);
    }

    AudioDialog.prototype.show = function () {
        var _this = this;
        if (this.pin) {
            var template = '\
                <div> \
                    <div style="font-size: larger; font-weight: bold; padding: 8px;">{{prompt}}</div>\
                    <div style="padding: 8px">\
                    <div id="audiodialog.title"></div><br/>\
                    <audio id="audiodialog.player" controls></audio>\
                    </div>\
                    <div id="audiodialog.listing" class="audiolistingcontainer">\
                    </div>\
                    <div style="height: 42px; width: 100%;">\
                        <div id="button.audiodialog.cancel" class="menubaritem" style="float: left; margin-left: 0px;" > \
                            <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                            &nbsp;Cancel \
                        </div> \
                        <div id="button.audiodialog.save" class="menubaritem" style="float: right;" > \
                            <img class="menubaritem" src="images/icons/save-01.png" /> \
                            &nbsp;Save \
                        </div> \
                    </div> \
                </div>\
            ';
            var data = {
                prompt: this.prompt
            };
            localplay.dialogbox.pinnedpopupatpoint(this.pin, template, data, function (e) {
                var selector = e.target.id;
                if (selector == "") {
                    selector = e.target.parentNode.id;
                }
                var parts = selector.split(".");
                if (parts && parts.length >= 3) {
                    var command = parts[2];
                    switch (command) {
                        case "save":
                            _this.save();
                            break;
                    }
                }
                return true;
            });
            this.player = document.getElementById("audiodialog.player");
            if (this.selection) {
                this.player.src = this.selection[localplay.domutils.getTypeForAudio()]
            }
            this.scrollpane = document.getElementById("audiodialog.listing");
            this.title = document.getElementById("audiodialog.title");
        } else {
            var content = [];
            //
            //
            //
            this.title = document.createElement( "div" );
            content.push(this.title);
            this.player = new Audio();
            this.player.controls = true;
            var playercontainer = document.createElement("div");
            playercontainer.style.padding = "8px";
            playercontainer.style.marginTop = "4px";
            playercontainer.style.marginBottom = "4px";
            playercontainer.appendChild(this.player);
            content.push(playercontainer);
            //
            //
            //
            this.scrollpane = document.createElement("div");
            this.scrollpane.classList.add("audiolistingcontainer");
            content.push(this.scrollpane);
            //
            //
            //
            this.dialog = localplay.dialogbox.createdialogbox(this.prompt, content,
                [],
                [], 0, 0, function () {

                });
            this.dialog.show();
        }
        this.datasource.update();
    }

    AudioDialog.prototype.close = function () {
        if (this.dialog) {
            this.dialog.close();
            this.dialog = null;
            this.scrollpane = null;
            this.player = null;
        }
    }

    AudioDialog.prototype.save = function () {
        var saveevent = localplay.domutils.createCustomEvent("save");
        this.dispatchEvent(saveevent);
    }

    AudioDialog.prototype.select = function (audio) {
        this.selection = audio;
        this.title.innerHTML = audio.name;
        this.player.src = audio[localplay.domutils.getTypeForAudio()];
    }

    AudioDialog.prototype.update = function () {
        var _this = this;
        this.scrollpane.innerHTML = "";
        this.listing = [];
        for (var i = 0; i < this.datasource.data.length; i++) {
            var item = document.createElement("div");
            item.classList.add("audiolistingitem");
        
            item.innerHTML = this.datasource.data[i].name;
            item.audio = this.datasource.data[i];
            item.onclick = function (e) {
                if (_this.selecteditem) {
                    _this.selecteditem.classList.remove("selected");
                }
                this.classList.add("selected");
                _this.selecteditem = this;
                _this.select(e.target.audio);
            };
            this.listing.push(item);
            if (this.selection && this.selection.id == item.audio.id) {
                item.classList.add("selected");
                this.title.innerHTML = item.audio.name;
                this.selecteditem = item;
            }
            this.scrollpane.appendChild(item);
        }
    }

    function AudioListDataSource(type, target) {
        this.type = type;
        this.target = target;
        this.data = null;
    }

    AudioListDataSource.prototype.update = function () {
        //
        // create request object
        //
        var xhr = new XMLHttpRequest();
        //
        // hook events
        //
        var _this = this;
        xhr.addEventListener('load', function (evt) {
            _this.onload(evt);
        }, false);
        xhr.addEventListener('loadstart', function (evt) {
            _this.onloadstart(evt);
        }, false);
        xhr.addEventListener('loadend', function (evt) {
            _this.onloadend(evt);
        }, false);
        xhr.addEventListener('progress', function (evt) {
            _this.onprogress(evt);
        }, false);
        xhr.addEventListener('abort', function (evt) {
            _this.onabort(evt);
        }, false);
        xhr.addEventListener('timeout', function (evt) {
            _this.ontimeout(evt);
        }, false);
        xhr.addEventListener('error', function (evt) {
            _this.onerror(evt);
        }, false);
        //
        // build request
        //
        var query = "getaudio.php?type=" + this.type;
        xhr.open('GET', query, true);
        xhr.send();
    }
    //
    // event handling
    //
    AudioListDataSource.prototype.onload = function (evt) {
        var xhr = evt.target;
        if (xhr.status == 200) {
            //
            // deserialise
            //
            var json = xhr.response === undefined ? xhr.responseText : xhr.response;
            while (json[0] != '[' && json[0] != '{') json = json.substr(1);
            var _this = this;
            var data = JSON.parse(json, function (key, value) {
                return value;
            });
            //localplay.log(json);
            if (data.status === "OK") {
                this.data = data.message.data;
            } else {
                //
                // TODO: show error dialog here!
                //
                this.data = [];
            }
        } else {
            //
            // TODO: show error dialog here!
            //
            this.data = [];
        }
        //
        //
        //
        if (this.target) {
            this.target.update();
        }
    }

    AudioListDataSource.prototype.onloadstart = function (evt) {

    }

    AudioListDataSource.prototype.onloadend = function (evt) {

    }

    AudioListDataSource.prototype.onprogress = function (evt) {


    }

    AudioListDataSource.prototype.onabort = function (evt) {

    }

    AudioListDataSource.prototype.ontimeout = function (evt) {

    }

    AudioListDataSource.prototype.onerror = function (evt) {

    }
    var soundeditortemplate = '\
            <p><audio controls id="soundeditor.music.player" src="{{music}}"></audio> \
            <div id="button.soundeditor.music" class="menubaritem"> \
                <img id="" class="menubaritem" src="images/icons/add-01.png" />&nbsp;Background music \
            </div></p>\
            <p><audio controls id="soundeditor.winsound.player" src="{{winsound}}"></audio> \
            <div id="button.soundeditor.winsound" class="menubaritem"> \
                <img id="" class="menubaritem" src="images/icons/add-01.png" />&nbsp;Sound for winners \
            </div></p>\
            <p><audio controls id="soundeditor.losesound.player" src="{{loosesound}}"></audio> \
            <div id="button.soundeditor.losesound" class="menubaritem"> \
                <img id="" class="menubaritem" src="images/icons/add-01.png" />&nbsp;Sound for losers \
            </div></p>\
    ';
    //
    //
    //
    function LevelSoundEditor(level) {
        var _this = this;
        this.level = level;
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.top = "0px";
        this.container.style.left = "8px";
        this.container.style.bottom = "0px";
        this.container.style.right = "8px";
        this.container.style.padding = "16px";
        this.container.style.backgroundColor = "rgb(255,143,33)";
        var data = {
            music: level.music[localplay.domutils.getTypeForAudio()],
            winsound: level.winsound[localplay.domutils.getTypeForAudio()],
            loosesound: level.loosesound[localplay.domutils.getTypeForAudio()]
        };
        this.container.innerHTML = Mustache.render(soundeditortemplate, data);
     }
    //
    // required editor methods
    //
    LevelSoundEditor.prototype.initialise = function () {
        var _this = this;
        localplay.domutils.hookChildElementsWithPrefix(this.container, "button.soundeditor", "click", function (e) {
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length >= 3) {
                var command = selector[2];
                var title = "";
                var audio = null;
                var player = null;
                switch (command) {
                    case "music":
                        title = "Background Music";
                        audio = _this.level.music;
                        player = document.getElementById("soundeditor.music.player");
                        break;
                    case "winsound":
                        title = "Sound for Winners";
                        audio = _this.level.winsound;
                        player = document.getElementById("soundeditor.winsound.player");
                        break;
                    case "losesound":
                        title = "Sound for Losers";
                        audio = _this.level.loosesound;
                        player = document.getElementById("soundeditor.losesound.player");
                        break;
                }
                if (audio && player) {
                    var pin = localplay.domutils.elementPosition(player);
                    pin.x += player.offsetWidth;
                    pin.y += player.offsetHeight;
                    var dialog = new AudioDialog("Select " + title, audio.type, audio, pin);
                    dialog.addEventListener("save", function () {
                        audio.id = dialog.selection.id;
                        audio.type = dialog.selection.type;
                        audio.name = dialog.selection.name;
                        audio.mp3 = dialog.selection.mp3;
                        audio.ogg = dialog.selection.ogg;
                        player.src = audio[localplay.domutils.getTypeForAudio()];
                    });
                    dialog.show();
                }
            }
        });
    }

    LevelSoundEditor.prototype.dealloc = function () {
        if (this.container) {
            localplay.domutils.purgeDOMElement(this.container);
        }
    }

    LevelSoundEditor.createAudioElement = function (title, audio) {
        var container = document.createElement("div");
        container.style.padding = "8px";
        container.innerHTML = "<h4>" + title + "</h4>";
        var player = new Audio();
        player.controls = true;
        player.src = audio[localplay.domutils.getTypeForAudio()];
        var button = document.createElement("div");
        button.className = "toolbarbutton";
        button.innerHTML = "Change";
        button.audio = audio;
        button.onclick = function (e) {
            var pin = localplay.domutils.elementPosition(e.target);
            var dialog = soundeditor.createaudiodialog("Select " + title, button.audio.type, button.audio, pin);
            //var dialog = new AudioDialog("Select " + title, button.audio.type, button.audio);
            dialog.addEventListener("save", function () {
                audio.id = dialog.selection.id;
                audio.type = dialog.selection.type;
                audio.name = dialog.selection.name;
                audio.mp3 = dialog.selection.mp3;
                audio.ogg = dialog.selection.ogg;
                player.src = audio[localplay.domutils.getTypeForAudio()];
            });
            dialog.show();
        };
        //
        //
        //
        container.appendChild(player);
        container.appendChild(button);
        //
        //
        //
        return container;
    }
    //
    //
    //
    soundeditor.createlevelsoundeditor = function(level) {
        return new LevelSoundEditor(level);
    }
    soundeditor.createaudiodialog = function(prompt, type, selection,pin) {
        return new AudioDialog(prompt, type, selection,pin);
    }
    //
    //
    //
    return soundeditor;
})();