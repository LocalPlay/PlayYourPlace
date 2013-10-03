;
//
// embedded module
//
localplay.game.controller.embedded = (function () {
    if (localplay.game.controller.embedded) return localplay.game.controller.embedded;
    //
    // resources
    //
    /*
    var pause = new Image();
    pause.src = "images/pause.png";
    var play = new Image();
    play.src = "images/run.png";
    */
    //
    // TODO: export these to templates
    //
    var loading = 'Loading 0%';
    var intro = '<p><h2>{{name}}</h2></p> \
                <div style="font-size: 24px;"> \
                by&nbsp;{{creator}}<p/> \
                <small>Idea for change</small><br/>\
                <i>{{change}}</i><p/> \
                <small>Place for change</small><br/>\
                <i>{{place}}</i><p/> \
                <small>Your mission</small><br/>\
                {{instructions}}\
                </div>';
    /*
    var outro = '<h3>{{outcome}}</h3> \
                {{{score}}}<p/> \
                <img id="embedded.new" title="create new level" class="imagebutton" style="margin: 4px;" src="images/new.png" /> \
                <img id="embedded.edit" title="edit" class="imagebutton" style="margin: 4px;" src="images/edit.png" /> \
                <img id="embedded.replay" title="play again" class="imagebutton" style="margin: 4px;" src="images/rerun.png" /> \
                <img id="embedded.next" title="next level" class="imagebutton" style="margin: 4px;" src="images/run.png" />';
    */
    var outro = '<h3>{{outcome}}</h3> \
                {{{score}}}<p/> \
                {{message}}\
                ';

    var pause = '<h2>{{name}}</h2> \
                by&nbsp;{{creator}}<p/><h3>paused</h3> \
                ';

    var info = '<p><h2>{{name}}</h2></p> \
                <div style="font-size: 24px;"> \
                by&nbsp;{{creator}}<p/> \
                <small>Idea for change</small><br/>\
                <i>{{change}}</i><p/> \
                <small>Place for change</small><br/>\
                <i>{{place}}</i><p/> \
                <small>Your mission</small><br/>\
                {{instructions}}\
                </div>';

    var playbar = '\
        <div class="playbargroup">\
            <img id="embedded.pause" class="imagebutton playbaritem" src="images/icons/pause-game-01.png" /><br />\
            <img id="embedded.play" class="imagebutton playbaritem" src="images/icons/play-01.png" /><br />\
            <img id="embedded.replay" class="imagebutton playbaritem" src="images/icons/reload-game-01.png" />\
        </div>\
    ';

    //
    // TODO: reinstate creator link
    // <p>by&nbsp;<a href="creatorpage.php?id={{creatorid}}">{{creator}}</a><p/><h3>paused</h3>
    //
    //
    //
    //
    var embedded = {};
    //
    //
    //
    function EmbeddedController(game) {
        //
        //
        //
        localplay.game.controller.attachcontroller(game, this);
        //
        //
        //
        this.game = game;
        this.timelimit = -1;
        this.paused = false;
        this.loadingprogress = 0;
        //
        // hook events
        //
        // TODO: support for game events ( load, start, stop ) also fin a more generic way of doing the binding way 
        //
        this.boundclick = this.onclick.bind(this);
        this.boundmousemove = this.onmousemove.bind(this);
        this.boundkeydown = this.onkeydown.bind(this);
        this.boundkeyup = this.onkeyup.bind(this);
        this.boundresize = this.onresize.bind(this);
        this.boundstatechange = this.onstatechange.bind(this);
        this.game.canvas.addEventListener("mousemove", this.boundmousemove);
        window.addEventListener("keydown", this.boundkeydown);
        window.addEventListener("keyup", this.boundkeyup);
        window.addEventListener("resize", this.boundresize);
        this.game.level.addEventListener("statechange", this.boundstatechange);
        //
        // create ui
        //
        this.banner = document.createElement("div");
        this.banner.classList.add("gamebanner");
        this.banner.style.visibility = "hidden";
        this.game.canvas.offsetParent.appendChild(this.banner);
        this.banner.addEventListener("mousemove", this.boundmousemove);

        this.playbar = document.createElement("div");
        this.playbar.className = "playbar";
        this.playbar.innerHTML = playbar;
        this.game.canvas.offsetParent.appendChild(this.playbar);
        localplay.game.controller.hookbuttons(this.playbar, "embedded", this.boundclick);
        //
        // 
        //
        //
        this.game.level.reset();
        this.onstatechange();
    }
    //
    // generic authentication pattern
    //
    EmbeddedController.prototype.authenticate = function (failprompt, succeedaction) {
        var _this = this;
        localplay.authentication.authenticate(function () {
            if (localplay.authentication.isauthenticated()) {
                succeedaction();
            } else {
                localplay.dialogbox.alert("Localplay", failprompt, function () {
                    _this.resumegame();
                });
            }
        });

    }

    //
    // required controller methods
    //

    EmbeddedController.prototype.draw = function () {
        //
        //
        //
        var context = this.game.canvas.getContext("2d");
        switch (this.game.level.state) {
            case localplay.game.level.states.clear:
                break;
            case localplay.game.level.states.loading:
                //
                // draw progress
                //
                if (this.loadingprogress != this.game.level.loadingprogress) {
                    this.banner.innerHTML = "Loading " + this.game.level.loadingprogress + "%";
                    this.loadingprogress = this.game.level.loadingprogress;
                }
                break;
            case localplay.game.level.states.ready:

                break;
            case localplay.game.level.states.playing:
                //
                // draw game state
                //
                context.save();
                //
                // pickups
                //
                context.shadowColor = 'rgba(0,0,0,0.25)';
                context.shadowOffsetX = 5;
                context.shadowOffsetY = 5;
                context.shadowBlur = 4;
                var x = 8;
                if (this.game.level.avatar) {
                    var pickups = this.game.level.avatar.pickups;
                    for (var i = 0; i < pickups.length; i++) {
                        if (pickups[i].sprite) {
                            var image = pickups[i].sprite.image;
                            if (image && image.complete && image.naturalHeight > 0) {
                                var height = 32;
                                var width = image.naturalWidth * (height / image.naturalHeight);
                                context.drawImage(image, x, 8, width, height);
                                x += width + 4;
                            }
                        }
                    }
                }
                //
                // time
                //
                if (this.timelimit > 0) {
                    var time = "TIME:" + this.game.level.timer.formattime(this.timelimit - this.game.level.timer.elapsed());//this.game.level.timer.elapsedstring();
                    context.font = '24px CabinSketch';
                    context.fillStyle = 'rgba( 0, 0, 0, 1.0 )';
                    context.fillText(time, 8, 64);
                }
                context.restore();

                break;
            case localplay.game.level.states.done:
                break;
        }

    }

    EmbeddedController.prototype.detach = function () {
        //
        //
        //
        this.game.canvas.offsetParent.removeChild(this.banner);
        this.game.canvas.offsetParent.removeChild(this.playbar);
        //
        // unhook events
        //
        this.game.canvas.offsetParent.removeEventListener("mousemove", this.boundmousemove);
        window.removeEventListener("keydown", this.boundkeydown);
        window.removeEventListener("keyup", this.boundkeyupup);
        window.removeEventListener("resize", this.boundresize);
        this.game.level.removeEventListener("statechange", this.boundstatechange);
    }

    EmbeddedController.prototype.resumegame = function () {
        if (this.game.level.state === localplay.game.level.states.playing) {
            this.game.level.pause(false);
            //
            //
            //
            this.showbanner();
        }
    }

    EmbeddedController.prototype.pausegame = function () {
        if (this.game.level.state === localplay.game.level.states.playing) {
            this.game.level.pause(true);
            //
            //
            //
            this.showbanner(pause, this.game.metadata);
        }

    }

    EmbeddedController.prototype.showbanner = function (template, data) {
        if (!template || template.length === 0) {
            this.banner.style.visibility = "hidden";
        } else {
            var render = data ? Mustache.render(template, data) : template;
            this.banner.innerHTML = render;
            this.banner.style.left = (this.playbar.offsetLeft + this.playbar.offsetWidth) + "px";
            this.banner.style.visibility = "visible";
            //
            // hook all buttons
            //
            localplay.game.controller.hookbuttons(this.banner, "player", this.boundclick);
        }
    }

    EmbeddedController.prototype.showinfo = function () {
        var data = {
            name: this.game.metadata.name,
            creator: this.game.metadata.creator,
            place: this.game.metadata.place,
            change: this.game.metadata.change,
            instructions: this.game.level.instructions
        };
        this.pausegame();
        this.showbanner(info, data);
    }

    EmbeddedController.prototype.onstatechange = function (e) {
        switch (this.game.level.state) {
            case localplay.game.level.states.clear:
                this.showbanner();
                this.loadingprogress = 0;
                break;
            case localplay.game.level.states.loading:
                this.showbanner(loading);
                break;
            case localplay.game.level.states.ready:
                //this.showbanner(intro, this.game.metadata);
                this.timelimit = this.game.level.gamestate.getTimelimit();
                this.showbanner();
                this.game.level.play();
                break;
            case localplay.game.level.states.playing:
                this.showbanner();
                break;
            case localplay.game.level.states.done:
                this.showbanner(outro, this.game.level.gamestate.getDescription(this.game.level));
                break;
        }

    }
    EmbeddedController.prototype.showplaybar = function (show) {
        if (show) {
            this.banner.style.left = "42px";
            this.playbar.style.left = "0px";
        } else {
            this.banner.style.left = "0px";
            this.playbar.style.left = "-42px";
        }
    }

    EmbeddedController.prototype.onclick = function (e) {
        var _this = this;
        var selector = localplay.domutils.getButtonSelector(e);
        if (selector.length === 2) {
            switch (selector[1]) {
                case "home":
                    history.back(-1);
                    break;
                case "replay":
                    this.game.level.reset();
                    this.game.level.play();
                    this.showplaybar(false);
                    break;
                case "play":
                    if (_this.game.level.state === localplay.game.level.states.playing) {
                        _this.resumegame();
                    } else {
                        _this.game.level.play();
                    }
                    this.showplaybar(false);
                    break;
                case "pause":
                    this.pausegame();
                    break;
                case "prev":
                    this.game.previouslevel();
                    break;
                case "next":
                    var nextlevel = this.game.level.getnextlevel();
                    if (nextlevel.length >= 3) {
                        this.game.loadlevel(nextlevel[0]);
                    } else {
                        this.game.nextlevel();
                    }
                    break;
                case "info":
                    this.showinfo();
                    break;
                case "list":
                    //
                    // show arcade
                    //
                    this.showarcade();
                    break;
             }
        }
        return false;
    }

    EmbeddedController.prototype.onmousedown = function (e) {
        return false;
    }

    EmbeddedController.prototype.onmouseup = function (e) {
        return false;
    }


    EmbeddedController.prototype.onmousemove = function (e) {
        localplay.domutils.fixEvent(e);
        if (e.offsetX < 42) {// === this.game.canvas.offsetParent || e.target === this.playbar || localplay.domutils.isChild(this.playbar, e.target)) && e.offsetX < 42) {
            this.showplaybar(true);
        } else {
            this.showplaybar(false);
        }

        return false;
    }

    EmbeddedController.prototype.onkeydown = function (e) {
        if (e.keyCode === localplay.keycode.ESC) {
            this.pausegame();
        }
        this.game.level.onkeydown(e);
        return false;
    }

    EmbeddedController.prototype.onkeyup = function (e) {
        this.game.level.onkeyup(e);
        return false;
    }

    EmbeddedController.prototype.onresize = function (e) {
        this.game.fittocontainer();
        return false;
    }

    embedded.attachtogame = function (game) {
        //
        // 
        //
        return new EmbeddedController(game);
    }

    return embedded;
})();
