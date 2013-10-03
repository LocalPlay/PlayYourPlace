;
//
// arcadeplayer module
//
localplay.game.controller.arcade = (function () {
    if (localplay.game.controller.arcadeplayer) return localplay.game.controller.arcadeplayer;
    //
    // resources
    //
    var pause = new Image();
    pause.src = "images/pause.png";
    var play = new Image();
    play.src = "images/play.png";
    //
    // TODO: export these to templates
    //
    var loading = 'Loading 0%';
    var intro = '<h3>{{name}}</h3> \
                {{place}}<p/> \
                {{change}}<p/> \
                by&nbsp;<a href="creatorpage.php?id={{creatorid}}">{{creator}}</a><p/> \
                <img id="arcadeplayer.list" title="go to arcade" class="imagebutton" style="margin: 4px;" src="images/list.png" /> \
                <img id="arcadeplayer.new" title="create new level" class="imagebutton" style="margin: 4px;" src="images/new.png" /> \
                <img id="arcadeplayer.edit" title="edit" class="imagebutton" style="margin: 4px;" src="images/edit.png" /> \
                <img id="arcadeplayer.play" title="play" class="imagebutton" style="margin: 4px;" src="images/play.png" />';
    /*
    var outro = '<h3>{{outcome}}</h3> \
                {{{score}}}<p/> \
                <img id="arcadeplayer.new" title="create new level" class="imagebutton" style="margin: 4px;" src="images/new.png" /> \
                <img id="arcadeplayer.edit" title="edit" class="imagebutton" style="margin: 4px;" src="images/edit.png" /> \
                <img id="arcadeplayer.replay" title="play again" class="imagebutton" style="margin: 4px;" src="images/replay.png" /> \
                <img id="arcadeplayer.next" title="next level" class="imagebutton" style="margin: 4px;" src="images/play.png" />';
    */
    var outro = '<h3>{{outcome}}</h3> \
                {{{score}}}<p/> \
                <img id="arcadeplayer.replay" title="play again" class="imagebutton" style="margin: 4px;" src="images/replay.png" /> \
                <img id="arcadeplayer.next" title="next level" class="imagebutton" style="margin: 4px;" src="images/play.png" />';
    var info = '<h3>{{name}}</h3> \
                <img src="{{thumbnail}}" /><p/> \
                place - {{place}}<p/> \
                change - {{change}}<p/> \
                tags - {{tags}}<p/> \
                by - <a href="creatorpage.php?id={{creatorid}}">{{creator}}</a><p/>';
    //
    //
    //
    var arcadeplayer = {};
    //
    //
    //
    function ArcadeController(game) {
        //
        //
        //
        localplay.game.controller.attachcontroller(game, this);
        //
        //
        //
        this.game = game;
        this.timelimit = -1;
        this.loadingprogress = -1;
        //
        // hook events
        //
        //
        this.boundclick = this.onclick.bind(this);
        this.boundkeydown = this.onkeydown.bind(this);
        this.boundkeyup = this.onkeyup.bind(this);
        this.boundresize = this.onresize.bind(this);
        this.boundstatechange = this.onstatechange.bind(this);
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
        this.onstatechange();
        //
        // go fullscreen 
        // TODO: move this somewhere more suitable
        //
        this.game.level.reset();
    }


    //
    // required controller methods
    //

    ArcadeController.prototype.draw = function () {
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
                if (this.loadingprogress !== this.game.level.loadingprogress) {
                    this.banner.innerHTML = "Loading " + this.game.level.loadingprogress + "%";
                    this.loadingprogress = this.game.level.loadingprogress
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

    ArcadeController.prototype.detach = function () {
        //
        //
        //
        this.game.canvas.offsetParent.removeChild(this.banner);
        //
        // unhook events
        //
        window.removeEventListener("keydown", this.boundkeydown);
        window.removeEventListener("keyup", this.boundkeyupup);
        window.removeEventListener("resize", this.boundresize);
        this.game.level.removeEventListener("statechange", this.boundstatechange);
    }

    ArcadeController.prototype.resumegame = function () {
        if (this.game.level.state === localplay.game.level.states.playing) {
            this.game.level.pause(false);
        }
    }

    ArcadeController.prototype.showbanner = function (template, data) {
        if (!template || template.length === 0) {
            this.banner.style.visibility = "hidden";
        } else {
            var render = data ? Mustache.render(template, data) : template;
            this.banner.innerHTML = render;
            this.banner.style.visibility = "visible";
            //
            // hook all buttons
            //
            localplay.game.controller.hookbuttons(this.banner, "arcadeplayer", this.boundclick);
            //
            //
            //

        }
    }

    ArcadeController.prototype.onstatechange = function (e) {
        switch (this.game.level.state) {
            case localplay.game.level.states.clear:
                this.showbanner();
                break;
            case localplay.game.level.states.loading:
                this.showbanner(loading);
                break;
            case localplay.game.level.states.ready:
                this.timelimit = this.game.level.gamestate.getTimelimit();
                this.showbanner();
                this.game.level.play();
                break;
            case localplay.game.level.states.playing:
                this.showbanner();
                break;
            case localplay.game.level.states.done:
                this.showbanner(outro, this.game.level.gamestate.getDescription());
                break;
        }

    }

    ArcadeController.prototype.hookbuttons = function (container, callback) {

        for (var i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].id && container.childNodes[i].id.indexOf("arcadeplayer") === 0) {
                container.childNodes[i].addEventListener("click", callback);
            }
            if (container.childNodes[i].childNodes.length > 0) {
                this.hookbuttons(container.childNodes[i], callback);
            }
        }

    }

    ArcadeController.prototype.onclick = function (e) {
        var _this = this;

        var selector = e.target.id.split(".");
        if (selector.length === 2) {
            switch (selector[1]) {
                case "replay":
                    this.game.level.reset();
                    this.game.level.play();
                    break;
                case "play":
                    this.game.level.play();
                    break;
                case "next":
                    var nextlevel = this.game.level.getnextlevel();
                    if (nextlevel.length >= 3) {
                        this.game.loadlevel(nextlevel[0]);
                    } else {
                        this.game.nextlevel();
                    }
                    this.loadingprogress = -1;
                    break;
            }
        }

        return false;
    }

    ArcadeController.prototype.onkeydown = function (e) {
        if (this.game.level.state == localplay.game.level.states.done ) {
            switch (e.keyCode) {
                case 82: // R
                    this.game.level.reset();
                    this.game.level.play();
                    break;
                case 80: // P
                     this.game.previouslevel();
                    break;
                case 78: // N
                    this.game.nextlevel();
                    break;
                default:
                    this.game.level.onkeydown(e);
                    break;
            }
        } else {
            this.game.level.onkeydown(e);
        }
        return false;
    }

    ArcadeController.prototype.onkeyup = function (e) {
        this.game.level.onkeyup(e);
        return false;
    }

    ArcadeController.prototype.onresize = function (e) {
        this.game.fittocontainer();
        return false;
    }

    arcadeplayer.attachtogame = function (game) {
        //
        // TODO: detatch controller, probably need registry of who is attached to whom in localplay.gamecontroller
        //
        return new ArcadeController(game);
    }

    return arcadeplayer;
})();
