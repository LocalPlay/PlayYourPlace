/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.leveleditor.js
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

localplay.game.leveleditor = (function () {
    if (localplay.game.leveleditor) return localplay.game.leveleditor;
    var leveleditor = {};
    //
    // templates
    //
    var createlevelsplash0 = '\
        <div class="splashcontainer"> \
            <div class="splashtext" style="height: 400px;">Make the game of<br/>your future town for<br />the health and<br />prosperity of all…</div> \
            <img id="leveleditor.button.next" class="imagebutton" style="position: absolute; right: 16px; top: 50%;" src="images/icons/arrow-next-01.png" /> \
        </div> \
    ';

    var createlevelsplash1 = '\
        <div class="splashcontainer"> \
            <div class="splashtext" style="height: 100px;">… or for total disaster!</div> \
            <img id="leveleditor.button.prev" class="imagebutton" style="position: absolute; left: 16px; top: 50%;" src="images/icons/arrow-previous-01.png" /> \
            <img id="leveleditor.button.next" class="imagebutton" style="position: absolute; right: 16px; top: 50%;" src="images/icons/arrow-next-01.png" /> \
        </div> \
    ';

    var createlevel = '\
    <div id="leveleditor.createlevel" class="fullscreen">\
        <div id="leveleditor.createlevel.menubar" class="menubar"> \
           <div id="leveleditor.button.home" class="menubaritem"><img class="menubaritem" src="images/icons/home.png" /></div> \
           <div id="leveleditor.createlevel.mainmenu" class="menubaritem"><img class="menubaritem" src="images/icons/menu-01.png" />&nbsp;Make new game level</div> <div id="leveleditor.createlevel.breadcrumb" class="menubaritem disabled"></div> \
        </div> \
        <div class="createlevelcontainer"> \
            <div class="promptcontainer"> \
                <div  id="leveleditor.createlevel.prompt" class="prompttext"></div> \
                <img id="leveleditor.button.prev" class="imagebutton" style="position: absolute; left: 16px; top: 25%;" src="images/icons/arrow-previous-01.png" /> \
                <img id="leveleditor.button.next" class="imagebutton" style="position: absolute; right: 16px; top: 25%;" src="images/icons/arrow-next-01.png" /> \
            </div> \
            <div id="leveleditor.editormenu" class="editormenubar"> \
                <div id="leveleditor.button.cancel" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                    &nbsp;Close \
                </div> \
                <div id="leveleditor.button.save" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="images/icons/save.png" /> \
                    &nbsp;Save \
                </div> \
                <div id="leveleditor.button.preview" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="images/icons/add-01.png" /> \
                    &nbsp;Preview  \
                </div> \
            </div> \
            <div id="leveleditor.createlevel.editorcontainer" class="editorcontainer"> \
            </div> \
        </div> \
     </div> \
    ';

    var editlevel = '\
        <div class="fullscreen" style="background-color: white;" > \
            <div id="leveleditor.editormenu" style="top: 0px;" class="editormenubar"> \
               <div id="leveleditor.button.home" class="menubaritem"> \
                    <img class="menubaritem" src="images/icons/home.png" /> \
               </div> \
               <div id="leveleditor.createlevel.mainmenu" class="menubaritem"> \
                    <img class="menubaritem" src="images/icons/menu-01.png" />&nbsp;Edit game level\
               </div> <div id="leveleditor.createlevel.breadcrumb" class="menubaritem disabled"></div> \
                <div id="leveleditor.button.cancel" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                    &nbsp;Close \
                </div> \
                <div id="leveleditor.button.save" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="images/icons/save.png" /> \
                    &nbsp;Save  \
                </div> \
                <div id="leveleditor.button.preview" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="images/icons/add-01.png" /> \
                    &nbsp;Preview  \
                </div> \
            </div> \
            <div id="leveleditor.createlevel.editorcontainer" class="editorcontainer" style="top: 42px;"> \
            </div> \
        </div> \
    ';
    var savedialog = '\
        <div style="height: 400px padding: 8px;">\
            <p><input id="savelevel.name" class="required" style="width: 380px" type="text" placeholder="Name for level" value="{{name}}"/></p>\
            <p><input id="savelevel.place" class="required" style="width: 380px" type="text" placeholder="Place for level" value="{{place}}"/></p>\
            <p><input id="savelevel.change" class="required" style="width: 380px" type="text" placeholder="What is the change?" value="{{change}}"/></p>\
            <p><textarea id="savelevel.instructions" style="width: 380px; height: 80px;" class="required" placeholder="What is the mission?" >{{instructions}}</textarea></p>\
            <p><input id="savelevel.winmessage" style="width: 380px" type="text" placeholder="message for winner" value="{{winmessage}}"/></p>\
            <p><input id="savelevel.losemessage" style="width: 380px" type="text" placeholder="message for loser" value="{{losemessage}}"/></p>\
            <p style="text-align: left;">\
                Visibility&nbsp;\
                <input type="radio" id="savelevel.private" name="savelevel.visibility" value="private" /><label for="savelevel.private"></label>&nbsp;private \
                <input type="radio" id="savelevel.public" name="savelevel.visibility" value="public" /><label for="savelevel.public"></label>&nbsp;public<br/> \
            </p>\
            <p style="text-align: left;">\
                 <input type="checkbox" id="savelevel.savecopy" name="savelevel.savecopy" /><label for="savelevel.savecopy"></label>&nbsp;save a copy<br/> \
            </p> \
            <div style="height: 42px; width: 380px">\
                <div id="button.savelevel.cancel" class="menubaritem" style="float: left; margin-left: 0px;" > \
                    <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                    &nbsp;Cancel \
                </div> \
                <div id="button.savelevel.save" class="menubaritem" style="float: right; margin-right: 0px;" > \
                    <img class="menubaritem" src="images/icons/save-01.png" /> \
                    &nbsp;Save \
                </div> \
            </div> \
        </div>\
    ';
    var preview = '\
            <div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: white;"> \
                <canvas id="preview.canvas" class="slider" width="1024" height="723" ></canvas> \
            </div> \
    ';
    var list = '\
    <div id="leveleditor.list.header">\
        <div id="leveleditor.list.pagination">\
        </div> \
        <div id="leveleditor.list.search"> \
            <input id="leveleditor.list.searchfield" type="search" /> \
        </div> \
        <div id="leveleditor.list.add" ></div>\
    </div> \
    <div id="leveleditor.list.body"> \
        {{listcontent}} \
    </div> \
    ';
    //
    //
    //
    var backgroundeditor = {
        breadcrumb: "Add background",
        prompt: "MAKE A NEW GAME LEVEL - START BY CREATING YOUR PLACE IN YOUR TOWN",
        init: function () {
            var editor = localplay.game.backgroundeditor.createbackgroundeditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.backgroundeditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.backgroundeditor) {
                createleveleditorcontainer.localplay.backgroundeditor.dealloc();
                delete createleveleditorcontainer.localplay.backgroundeditor;
                createleveleditorcontainer.localplay.backgroundeditor = null;
            }
        },
        exitcondition: function() {
            if (level.background.countimages() == 0) {
                localplay.dialogbox.alert("Playsouthend", "Your level needs a place!<br />Please add at least one background image.");
                return false;
            }
            return true;
        }
    }

    var avatareditor = {
        breadcrumb: "Choose avatar",
        prompt: "CHOOSE YOUR AVATAR",
        init: function () {
            var editor = localplay.game.avatareditor.createavatareditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.avatareditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.avatareditor) {
                createleveleditorcontainer.localplay.avatareditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.avatareditor.container);
                delete createleveleditorcontainer.localplay.avatareditor;
                createleveleditorcontainer.localplay.avatareditor = null;
            }
        },
        exitcondition: function () {
            return true;
        }
    };

    var layouteditor = {
        breadcrumb: "Add things",
        prompt: "ADD THINGS TO YOUR GAME LEVEL",
        init: function () {
            var editor = localplay.game.layouteditor.createlayouteditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.layouteditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.layouteditor) {
                createleveleditorcontainer.localplay.layouteditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.layouteditor.container);
                delete createleveleditorcontainer.localplay.layouteditor;
                createleveleditorcontainer.localplay.layouteditor = null;
            }
        },
        exitcondition: function () {
            if (level.countitems() <= 0) {
                localplay.dialogbox.alert("Playsouthend", "Your level needs some things!<br />Please add some platforms, obstacles, pickups or goals.");
                return false;
            }
            return true;
        }
    };

    var thingeditor = {
        breadcrumb: "Edit thing properties",
        prompt: "MAKE THINGS DO STUFF - EDIT YOUR THINGS",
        init: function () {
            var editor = localplay.game.thingeditor.createnewthingeditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.thingeditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.thingeditor) {
                createleveleditorcontainer.localplay.thingeditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.thingeditor.container);
                delete createleveleditorcontainer.localplay.thingeditor;
                createleveleditorcontainer.localplay.thingeditor = null;
            }
        },
        exitcondition: function () {
            return true;
        }
    };

    var storyeditor = {
        breadcrumb: "Add gameplay rules",
        prompt: "MAKE THINGS DO STUFF - ADD GAMEPLAY RULES",
        init: function () {
            var editor = localplay.game.storyeditor.createstoryeditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.storyeditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.storyeditor) {
                createleveleditorcontainer.localplay.storyeditor.save();
                createleveleditorcontainer.localplay.storyeditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.storyeditor.container);
                delete createleveleditorcontainer.localplay.storyeditor;
                createleveleditorcontainer.localplay.storyeditor = null;
            }
        },
        exitcondition: function () {
            return true;
        }
    };

    var soundeditor = {
        breadcrumb: "Add level sounds",
        prompt: "MAKE THINGS DO STUFF - ADD LEVEL SOUNDS",
        init: function () {
            var editor = localplay.game.soundeditor.createlevelsoundeditor(level);
            createleveleditorcontainer.appendChild(editor.container);
            editor.initialise();
            createleveleditorcontainer.localplay.soundeditor = editor;
        },
        dealloc: function () {
            if (createleveleditorcontainer.localplay.soundeditor) {
                createleveleditorcontainer.localplay.soundeditor.dealloc();
                createleveleditorcontainer.removeChild(createleveleditorcontainer.localplay.soundeditor.container);
                delete createleveleditorcontainer.localplay.soundeditor;
                createleveleditorcontainer.localplay.soundeditor = null;
            }
        },
        exitcondition: function () {
            return true;
        }

    };
    //
    // utility functions
    //
    function renderfragment(fragment) {
        //
        // resolve all templated data
        //
        for (var key in fragment.data) {
            if (fragment.data[key].template && fragment.data[key].data) {
                fragment.data[key] = render(fragment.data[key]);
            }
        }
        //
        // process template
        //
        return Mustache.render(fragment.template, fragment.data);
    }

    function hookbuttons(container, selector, callback) {
        for (var i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].id && container.childNodes[i].id.indexOf(selector) === 0) {
                container.childNodes[i].onclick = callback;
            }
            if (container.childNodes[i].childNodes.length > 0) {
                hookbuttons(container.childNodes[i], selector, callback);
            }
        }
    }
    //
    //
    //
    var level = null;
    var canvas = null;
    var maintemplate = createlevel;
    //
    // create level sequence
    //
    var createlevelphase = 0;
    var createlevelsequence = [
        createlevelsplash0,
        createlevelsplash1,
        backgroundeditor,
        avatareditor,
        layouteditor,
        thingeditor,
        storyeditor,
        soundeditor
    ];
    var createlevelcontainer = null;
    var createleveleditorcontainer = null;
    var createlevelmainmenu = null;

    function initialisecreatelevel() {
        //
        // initialise navigation
        //
        createlevelphase = 0;
        createleveleditorcontainer = null;
        createlevelcontainer = document.createElement("div");
        createlevelcontainer.className = "fullscreen";
        document.body.appendChild(createlevelcontainer);
        //
        //
        //
    }
    function cleanup() {
        //
        // remove mainmenu
        //
        if (createlevelmainmenu) {
            localplay.menu.dettachmenu(createlevelmainmenu);
        }
        //
        //
        //
        localplay.domutils.purgeDOMElement(createlevelcontainer);
        document.body.removeChild(createlevelcontainer);
    }
    //
    //
    //
    function createlevelclick(e) {
        localplay.domutils.fixEvent(e);
        var selector = localplay.domutils.getButtonSelector(e);
        if (selector.length >= 3) {
            //
            // 
            //
            localplay.log(selector[2]);
            localplay.log("in phase: " + createlevelphase);
            switch (selector[2]) {
                case "next": 
                    gotocreatelevelphase(createlevelphase + 1);
                    break;
                case "prev":
                    gotocreatelevelphase(createlevelphase - 1);
                    break;
                case "save":
                    savelevel();
                    break;
                case "cancel":
                    closeeditor();
                    break;
                case "preview":
                    previewlevel();
                    break;
                case "home":
                    closeeditor(true);
                    break;
            }
        }
    }
    function gotocreatelevelphase(i) {
        if (createleveleditorcontainer&&createleveleditorcontainer.localplay.exitcondition && !createleveleditorcontainer.localplay.exitcondition()) return;
        if (i > createlevelsequence.length - 1) {
            createlevelphase = createlevelsequence.length - 1; 
        } else if (i < 0) {
            createlevelphase = 0;
        } else {
            createlevelphase = i;
        }
        rendercreatelevelphase();
        //
        // 
        //
    }

    function setbreadcrumb(text) {
        var breadcrumb = document.getElementById("leveleditor.createlevel.breadcrumb");
        if (breadcrumb) {
            breadcrumb.innerHTML = text ? '<img class="menubaritem" src="images/icons/breadcrumb.png" />&nbsp;' + text : "";
        }

    }
    function setprompt(text) {
        var prompt = document.getElementById("leveleditor.createlevel.prompt");
        if (prompt) {
            prompt.innerHTML = text;
        }
    }
    function rendercreatelevelphase() {
        var template = createlevelsequence[createlevelphase];
        if (createlevelphase <= 1) {
            //
            //
            //
            if (createleveleditorcontainer && createleveleditorcontainer.localplay.dealloc) {
                createleveleditorcontainer.localplay.dealloc();
            }
            //
            // splash screens, these are rendered into the toplevel container
            //
            createlevelcontainer.innerHTML = template;
            createleveleditorcontainer = null;
        } else {
            //
            // editors, these are rendered into the editor container
            //
            if (createleveleditorcontainer === null) {
                createlevelcontainer.innerHTML = maintemplate; //createlevel;
                createleveleditorcontainer = document.getElementById("leveleditor.createlevel.editorcontainer");
                createlevelmainmenu = document.getElementById("leveleditor.createlevel.mainmenu");
                if (createlevelmainmenu) {
                    mainmenu(createlevelmainmenu);
                }
                createleveleditorcontainer.localplay = {};
            } else if (createleveleditorcontainer.localplay.dealloc) {
                createleveleditorcontainer.localplay.dealloc();
            }
            //
            //
            //
            setbreadcrumb(template.breadcrumb);
            //
            //
            //
            if (template.prompt) {
                setprompt(template.prompt);
            } else {
                setprompt("");
            }
            //
            // render fragment
            //
            if (template.fragment) {
                createleveleditorcontainer.innerHTML = renderfragment(template.fragment);
            } else {
                createleveleditorcontainer.innerHTML = "";
            }
            //
            // initialise
            //
            if (template.init) {
                template.init();
            }
            //
            // store dealloc and exit condition
            //
            if (template.dealloc) {
                createleveleditorcontainer.localplay.dealloc = template.dealloc;
            } else {
                createleveleditorcontainer.localplay.dealloc = null;
            }
            if (template.exitcondition) {
                createleveleditorcontainer.localplay.exitcondition = template.exitcondition;
            } else {
                createleveleditorcontainer.localplay.exitcondition = null;
            }
        }
        hookbuttons(createlevelcontainer, "leveleditor.button", createlevelclick);
        //
        //
        //
        var nextbutton = document.getElementById("leveleditor.button.next");
        if (nextbutton) {
            nextbutton.style.visibility = (createlevelphase < createlevelsequence.length - 1) ? 'visible' : 'hidden';
        }
    }
    function mainmenu(target) {
        var items = [];
        
        for (var i = 2; i < createlevelsequence.length; i++) {
            items.push({
                name: createlevelsequence[i].breadcrumb,
                id: "phase." + i
            });
        }
        target.menupopup = localplay.menu.attachmenu(target, items, function (id) {
            var command = id.split(".");
            if (command.length >= 3) {
                var phase = parseInt(command[2]);
                gotocreatelevelphase(phase);
            }
        });
    }
    function savelevel() {
        localplay.showtip();
        //
        // force the story editor to save it's state
        // TODO: this should be automated
        //
        if (createleveleditorcontainer.localplay.storyeditor) {
            createleveleditorcontainer.localplay.storyeditor.save();
        }
        //
        // get dialog position
        //
        var savebutton = document.getElementById("leveleditor.button.save");
        if (savebutton) {
            var dialogposition = localplay.domutils.elementPosition(savebutton);
            dialogposition.x += savebutton.offsetWidth / 2;
            dialogposition.y += 42;//savebutton.offsetHeight;
            var metadata = {
                name: level.game.metadata.name,
                place: level.game.metadata.place,
                change: level.game.metadata.change,
                published: level.game.metadata.published,
                instructions: level.instructions,
                winmessage: level.winmessage,
                losemessage: level.losemessage,
                music: level.music[localplay.domutils.getTypeForAudio()],
                winsound: level.winsound[localplay.domutils.getTypeForAudio()],
                losesound: level.winsound[localplay.domutils.getTypeForAudio()]
            };
            //
            // show save dialog
            //
            localplay.dialogbox.pinnedpopupatpoint(dialogposition, savedialog, metadata, function (e) {
                localplay.domutils.fixEvent(e);
                var selector = localplay.domutils.getButtonSelector(e);
                var pin = localplay.domutils.elementPosition(e.target);
                if (selector.length >= 3) {
                    var command = selector[2];
                    switch (command) {
                        case "save":
                            {
                                //
                                // game metadata
                                //
                                var copy = document.getElementById("savelevel.savecopy").checked;
                                var name = document.getElementById("savelevel.name").value;
                                var place = document.getElementById("savelevel.place").value;
                                var published = localplay.domutils.valueOfRadioGroup("savelevel.visibility") === "public";
                                var change = document.getElementById("savelevel.change").value;
                                //
                                // level data
                                //
                                var instructions = document.getElementById("savelevel.instructions").value;
                                var winmessage = document.getElementById("savelevel.winmessage").value;
                                var losemessage = document.getElementById("savelevel.losemessage").value;
                                //
                                // update game metadata
                                //
                                level.game.metadata.name = name;
                                level.game.metadata.place = place;
                                level.game.metadata.published = published;
                                level.game.metadata.change = change;
                                //
                                // update level data
                                //
                                level.instructions = instructions;
                                level.winmessage = winmessage;
                                level.losemessage = losemessage;
                                level.reserialise();
                                level.reset();
                                /*
                                level.game.setcanvas(canvas);
                                level.draw();
                                */
                                //
                                // save
                                //
                                authenticate("You must login to save!", function () {
                                    level.game.savelevel(function (success) {
                                        if (success) {
                                            level.resetdirty();
                                        }
                                        rendercreatelevelphase();
                                    },copy)
                                });

                            }
                            break;
                    }
                }
                return true;
            });
            //
            // initialise publish radio group
            //
            var publishpublic = document.getElementById("savelevel.public");
            var publishprivate = document.getElementById("savelevel.private");
            if (publishpublic) publishpublic.checked = metadata.published;
            if (publishprivate) publishprivate.checked = !metadata.published;

        }
    }

    function closeeditor(gohome) {
        var cancel = function () {
            //
            // TODO: where do we go from here? should go back but where is that
            //
            if (gohome) {
                location.href = "index.html"
            } else {
                if (location.search.indexOf("id=-1") > 0) {
                    history.back();
                } else {
                    location.reload();
                }
            }
        }
        //
        // confirm cancel
        //
        if (level.isdirty()) {
            localplay.dialogbox.confirm("Playsouthend", "Do you really want to close without saving?", function (confirm) {
                if (confirm) {
                    cancel();
                }
            });
        } else {
            cancel();
        }
    }

    function previewlevel() {
        //
        // force the story editor to save it's state
        // TODO: this should be automated
        //
        if (createleveleditorcontainer.localplay.storyeditor) {
            createleveleditorcontainer.localplay.storyeditor.save();
        }
        //
        //
        //
        var json = new String( level.json );
        var previewgame = null;
        var previewcontroller = null;
        //createfullscreendialogboxwithtemplate = function (prompt, template, data, closebuttonaction)
        localplay.savetip();
        localplay.showtip();
        var dialog = localplay.dialogbox.createfullscreendialogboxwithtemplate( "Preview", preview, {}, function (d) {
            if (previewcontroller) {
                previewcontroller.detach();
            }
            previewgame.level.clear();
            delete previewgame;
            localplay.restoretip();
        });
        dialog.show();
        var previewcanvas = document.getElementById("preview.canvas");
        if (previewcanvas) {
            previewgame = localplay.game.creategame(previewcanvas);
            previewgame.level.setup(json);
            previewcontroller = localplay.game.controller.embedded.attachtogame(previewgame);
            previewgame.play();
            previewgame.level.play();
        }
    }

    function authenticate(failprompt, succeedaction) {
        var _this = this;
        localplay.authentication.authenticate(function () {
            if (localplay.authentication.isauthenticated()) {
                succeedaction();
            } else {
                localplay.dialogbox.alert("Localplay", failprompt, function () {
                    //
                    // restore current phase
                    //
                    rendercreatelevelphase();
                });
            }
        });
    }

    //
    //
    //
    leveleditor.createlevel = function (game) {
        //
        // create new level
        //
        var metadata = {
            name: "",
            place: "",
            change: "",
            tags: "",
            published: 0
        }
        //
        // TODO: sensible default
        //
        var json = '{"background" : { "images" : [] } , "avatar" : { "image" : "images/drcrab.png", "position" : "150,650" } }';
        game.newlevel(metadata, json);
        level = game.level;
        canvas = game.canvas;
        //canvas.style.visibility = "hidden";
        //
        //
        //
        level.reset();
        level.trackavatar = false;
        //
        //
        //
        maintemplate = createlevel;
        initialisecreatelevel();
        gotocreatelevelphase(0);
    }

    leveleditor.editlevel = function (game) {
        //
        //
        //
        level = game.level;
        canvas = game.canvas;
        //canvas.style.visibility = "hidden";
        //
        //
        //
        level.reset();
        level.trackavatar = false;
        //
        //
        //
        maintemplate = editlevel;
        initialisecreatelevel();
        gotocreatelevelphase(5);
    }

    return leveleditor;
})();