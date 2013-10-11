/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.controller.player.js
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
//
// player module
//
localplay.game.controller.player = (function () {
    if (localplay.game.controller.player) return localplay.game.controller.player;
    //
    // resources
    // TODO: preload icons? perhaps
    var logo = new Image();
    logo.src = "images/ingamelogo.png";
    //
    // TODO: export these to templates
    //
    var loading = 'Loading 0%';
    var intro = '<p><h2>{{name}}</h2></p> \
                <div style="font-size: 24px;"> \
                by&nbsp;{{creator}}<p/> \
                {{#attribution}} \
                    <small>originally</small><br/>\
                    {{originalname}}&nbsp;<small>by</small>&nbsp;{{originalcreator}}<p/> \
                {{/attribution}} \
                <p><span id="player.showcredits" class="spanbutton">full credits</span></p>\
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
                <img id="player.new" title="create new level" class="imagebutton" style="margin: 4px;" src="images/new.png" /> \
                <img id="player.edit" title="edit" class="imagebutton" style="margin: 4px;" src="images/edit.png" /> \
                <img id="player.replay" title="play again" class="imagebutton" style="margin: 4px;" src="images/rerun.png" /> \
                <img id="player.next" title="next level" class="imagebutton" style="margin: 4px;" src="images/run.png" />';
    */
    var nextleveltemplate = '\
        <div style="position: absolute; top: 0px; right: 0px; bottom: 0px; width: 64px;"> \
            <img id="player.nextlevel" src="images/icons/arrow-next-01.png" class="imagebutton" style="position: absolute; top: 40%; left: 16px;" title="Play next level" /> \
        </div> \
    ';
    var prevleveltemplate = '\
        <div style="position: absolute; top: 0px; left: 0px; bottom: 0px; width: 64px;"> \
            <img id="player.previouslevel" src="images/icons/arrow-previous-01.png" class="imagebutton" style="position: absolute; top: 40%; right: 16px;" title="Play previous level" /> \
        </div> \
    ';

    var outro = '<div style="margin-left: 64px; margin-right: 64px;"> \
                    <h2>{{name}}</h2> \
                    by&nbsp;<span id="player.showcreator.{{creatorid}}" class="spanbutton">{{creator}}</span><p/> \
                </div> \
                <div style="margin-left: 64px; margin-right: 64px;"> \
                    <h3>{{outcome}}</h3> \
                    {{{score}}}<p/> \
                    {{message}}\
                    <p><span id="player.showcredits" class="spanbutton">full credits</span></p>\
                 </div> \
                <div style="margin-left: 64px; margin-right: 64px;"> \
                    <div style="display: inline-block; width: 240px; margin-right: 16px; vertical-align: top;"> \
                        <h3>Rate this level</h3>\
                        <div id="player.rating"></div> \
                    </div> \
                    <div style="display: inline-block; margin-left: 16px; vertical-align: top;"> \
                        <h3>Share this level</h3>\
                        <img id="player.twitter" src="images/twitter.png" class="imagebutton" title="Share on Twitter" /> \
                        <img id="player.facebook" src="images/facebook.png" class="imagebutton" title="Share on Facebook" /> \
                        <img id="player.googleplus" src="images/googleplus.png" class="imagebutton" title="Share via Google +" /> \
                        <img id="player.sharethis" src="images/sharethis.png" class="imagebutton" title="Share via Sharethis" /> \
                        <img id="player.email" src="images/email.png" class="imagebutton" title="Share by Email" /> \
                    </div> \
                </div> \
                ';

    var credits = '\
               <div style="width: 608px; height: 342px;"> \
                    <div class="menubar"> \
                        <div class="menubaritem disabled" style="float: left;" > \
                            Credits \
                        </div> \
                        <div id="button.levelcredits.close" class="menubaritem" style="float: right;" > \
                            <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                            &nbsp;Close \
                        </div> \
                    </div> \
                    <div style="position: absolute; top: 64px; left: 8px; bottom: 8px; right: 8px;  padding: 8px; text-align: center; overflow-y: auto; background-color: rgb(200,200,200);"> \
                        <h2>{{name}}</h2> \
                        by&nbsp;<span id="button.showcreator.lvl.{{creatorid}}" class="spanbutton">{{creator}}</span><p/> \
                        {{#attribution}} \
                            <small>originally</small><br/>\
                            {{originalname}}&nbsp;<small>by</small>&nbsp;<span id="button.showcreator.orig.{{originalcreatorid}}" class="spanbutton">{{originalcreator}}</span><p/> \
                        {{/attribution}} \
                        <h4>Avatar</h4> \
                        {{#avatar}} \
                            {{name}}<br /> \
                            <img src="{{image}}" class="credits" /><br /> \
                            by&nbsp;<span id="button.showcreator.avat{{id}}.{{creatorid}}" class="spanbutton">{{creator}}</span> \
                        <p /> \
                        {{/avatar}} \
                        <h4>Backgrounds</h4> \
                        {{#backgrounds}} \
                            {{#background}} \
                                {{name}}<br /> \
                                <img src="{{image}}" class="credits" /><br /> \
                                by&nbsp;<span id="button.showcreator.bkgnd{{id}}.{{creatorid}}" class="spanbutton">{{creator}}</span> \
                                <p /> \
                            {{/background}} <p /> \
                        {{/backgrounds}} \
                        {{#platforms}} \
                            <h4>Platforms</h4> \
                            {{#platform}} \
                                {{name}}<br /> \
                                <img src="{{image}}" class="credits" /><br /> \
                                by&nbsp;<span id="button.showcreator.pltf{{id}}.{{creatorid}}" class="spanbutton">{{creator}}</span> \
                                <p /> \
                            {{/platform}} <p /> \
                        {{/platforms}} \
                        {{#pickups}} \
                            <h4>Pickups</h4> \
                            {{#pickup}} \
                                {{name}}<br /> \
                                <img src="{{image}}" class="credits" /><br /> \
                                by&nbsp;<span id="button.showcreator.pick{{id}}.{{creatorid}}" class="spanbutton">{{creator}}</span> \
                                <p /> \
                            {{/pickup}} <p /> \
                        {{/pickups}} \
                        {{#goals}} \
                            <h4>Goals</h4> \
                            {{#goal}} \
                                {{name}}<br /> \
                                <img src="{{image}}" class="credits" /><br /> \
                                by&nbsp;<span id="button.showcreator.goal{{id}}.{{creatorid}}" class="spanbutton">{{creator}}</span> \
                                <p /> \
                            {{/goal}} <p /> \
                        {{/goals}} \
                        {{#obstacles}} \
                            <h4>Obstacles</h4> \
                            {{#obstacle}} \
                                {{name}}<br /> \
                                <img src="{{image}}" class="credits" /><br /> \
                                by&nbsp;<span id="button.showcreator.obst{{id}}.{{creatorid}}" class="spanbutton">{{creator}}</span> \
                                <p /> \
                            {{/obstacle}} <p /> \
                        {{/obstacles}} \
                        {{#props}} \
                            <h4>Props</h4> \
                            {{#prop}} \
                                {{name}}<br /> \
                                <img src="{{image}}" class="credits" /><br /> \
                                by&nbsp;<span id="button.showcreator.prop{{id}}.{{creatorid}}" class="spanbutton">{{creator}}</span> \
                                <p /> \
                            {{/prop}} <p /> \
                        {{/props}} \
                    </div> \
                </div> \
            ';
        var pause = '<div style="margin: 0px 64px 0px 64px;"> \
                    <h2>{{name}}</h2> \
                    by&nbsp;<span id="player.showcreator.{{creatorid}}" class="spanbutton">{{creator}}</span><p/><h3>paused</h3> \
                    <p><small><span id="player.showcredits" class="spanbutton">full credits</span></small></p>\
                    </div>';

        var info = '<div style="margin: 0px 64px 0px 64px;"> \
                    <p><h2>{{name}}</h2></p> \
                    <div style="font-size: 24px;"> \
                        by&nbsp;<span id="player.showcreator.{{creatorid}}" class="spanbutton">{{creator}}</span><p/> \
                        {{#attribution}} \
                            <i><small>originally&nbsp;\
                            <span id="player.loadoriginal.{{originalid}}" class="spanbutton">{{originalname}}</span> \
                            &nbsp;by&nbsp; \
                            <span id="player.showcreator.{{originalcreatorid}}" class="spanbutton">{{originalcreator}}</span></small></i><p/> \
                        {{/attribution}} \
                        <p><small><span id="player.showcredits" class="spanbutton">full credits</span></small></p>\
                        <small>Idea for change</small><br/>\
                        <i>{{change}}</i><p/> \
                        <small>Place for change</small><br/>\
                        <i>{{place}}</i><p/> \
                        <small>Your mission</small><br/>\
                    {{instructions}}\
                    </div> \
               </div>';

        var playbar = '\
        <div class="playbargroup" style="margin-top: 0px;">\
            <div class="playbaritem" data-tip="Home" > \
                <img id="player.home" class="imagebutton playbaritem" src="images/icons/home.png" /><br />\
            </div> \
            <div class="playbaritem" data-tip="Me" > \
                <img id="player.me" class="imagebutton playbaritem" src="images/icons/me-01.png" data-tip="Me" /><br />\
            </div>\
            <div class="playbaritem" data-tip="People" > \
                <img id="player.people" class="imagebutton playbaritem" src="images/icons/people-01.png" data-tip="People"  /><br />\
            </div> \
            <div class="playbaritem" data-tip="Arcades" > \
                <img id="player.arcade" class="imagebutton playbaritem" src="images/icons/arcade.png"  data-tip="Arcades" /><br />\
            </div>\
        </div>\
        <div class="playbargroup">\
            <div class="playbaritem" data-tip="About this level" > \
                <img id="player.info" class="playbaritem" src="images/icons/info.png" /><br />\
            </div> \
            <div class="playbaritem" data-tip="Flag this level" > \
                <img id="player.flag" class="playbaritem" src="images/icons/flag-02.png" data-tip="Flag level" /><br />\
            </div> \
            <div class="playbaritem" data-tip="Rate this level" > \
                <img id="player.rate" class="playbaritem" src="images/icons/rate.png" data-tip="Rate level" ><br />\
            </div> \
            <div class="playbaritem" data-tip="Edit this level" > \
                <img id="player.edit" class="playbaritem" src="images/icons/edit-01.png" data-tip="Edit level" />\
            </div> \
        </div>\
        <div class="playbargroup">\
            <div class="playbaritem" data-tip="Pause" > \
                <img id="player.pause" class="imagebutton playbaritem" src="images/icons/pause-game-01.png" /><br />\
            </div>\
            <div class="playbaritem" data-tip="Play" > \
                <img id="player.play" class="imagebutton playbaritem" src="images/icons/play-01.png" /><br />\
            </div> \
            <div class="playbaritem" data-tip="Replay" > \
                <img id="player.replay" class="imagebutton playbaritem" src="images/icons/reload-game-01.png" />\
            </div>\
        </div>\
        <div class="playbargroup">\
            <div class="playbaritem" data-tip="Make new level" > \
                <img id="player.new" class="imagebutton playbaritem" src="images/icons/make-new-level-01.png" /><br />\
            </div> \
        </div>\
    ';

        var ratedialog = '\
        <div style="width: 256px; height: 256px;"> \
            <div class="menubar"> \
                 <div id="button.ratelevel.cancel" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                    &nbsp;Close \
                </div> \
           </div> \
            <div style="position: absolute; top: 42px; left: 16px; right: 16px;"> \
                <h3>Rate this level</h3> \
                <div id="player.ratelevel.ratingpanel" style="width: 240px;" > \
                </div> \
            </div> \
        </div> \
    ';
        //
        //
        //
        var controltip = '\
        controls<p />\
        <img src="images/icons/arrow-hint-left-01.png" style="vertical-align: middle; margin-right: 16px;"/>&nbsp;move left<p />\
        <img src="images/icons/arrow-hint-right-01.png" style="vertical-align: middle; margin-right: 16px;"/>&nbsp;move right<p />\
        <img src="images/icons/arrow-hint-space-01.png" style="vertical-align: middle; margin-right: 16px;"/>&nbsp;jump<p />\
        <img src="images/icons/arrow-hint-esc-01.png" style="vertical-align: middle; margin-right: 16px;"/>&nbsp;pause\
    ';
        //
        // TODO: reinstate creator link
        // <p>by&nbsp;<a href="creatorpage.php?id={{creatorid}}">{{creator}}</a><p/><h3>paused</h3>
        //
        //
        //
        //
        var player = {};
        //
        //
        //
        function PlayerController(game) {
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
            this.game.canvas.offsetParent.addEventListener("mousemove", this.boundmousemove);
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
            this.banner.style.paddingLeft = "32px";
            this.game.canvas.offsetParent.appendChild(this.banner);
            this.onstatechange();
            this.banner.addEventListener("mousemove", this.boundmousemove);

            this.playbar = document.createElement("div");
            this.playbar.className = "playbar";
            this.playbar.innerHTML = playbar;
            this.game.canvas.offsetParent.appendChild(this.playbar);
            localplay.game.controller.hookbuttons(this.playbar, "player", this.boundclick);
            //
            // 
            //
            //
            this.game.level.reset();
        }
        //
        // generic authentication pattern
        //
        PlayerController.prototype.authenticate = function (failprompt, succeedaction) {
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

        PlayerController.prototype.draw = function () {
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
                    var limit = this.game.canvas.width * 0.75;
                    var x = 8;
                    var y = 8;
                    var pickups = this.game.level.avatar.pickups;
                    for (var i = 0; i < pickups.length; i++) {
                        if (pickups[i].sprite) {
                            var image = pickups[i].sprite.image;
                            if (image && image.complete && image.naturalHeight > 0) {
                                var height = 32;
                                var width = image.naturalWidth * (height / image.naturalHeight);
                                if (x + width > limit) {
                                    y += height + 8;
                                }
                                context.drawImage(image, x, y, width, height);
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
            if (logo.complete) {
                context.drawImage(logo, this.game.canvas.width - ( logo.naturalWidth + 8 ), 8);
            }
        }

        PlayerController.prototype.detach = function () {
            //
            //
            //
            this.game.canvas.offsetParent.removeChild(this.banner);
            this.game.canvas.offsetParent.removeChild(this.playbar);
            //
            // unhook events
            //
            this.game.canvas.removeEventListener("mousemove", this.boundmousemove);
            this.game.canvas.offsetParent.removeEventListener("mousemove", this.boundmousemove);
            window.removeEventListener("keydown", this.boundkeydown);
            window.removeEventListener("keyup", this.boundkeyupup);
            window.removeEventListener("resize", this.boundresize);
            this.game.level.removeEventListener("statechange", this.boundstatechange);
        }

        PlayerController.prototype.resumegame = function () {
            if (this.game.level.state === localplay.game.level.states.playing) {
                this.game.level.pause(false);
                //
                //
                //
                this.showbanner();
            }
        }

        PlayerController.prototype.pausegame = function () {
            if (this.game.level.state === localplay.game.level.states.playing) {
                this.game.level.pause(true);
                //
                //
                //
                this.game.metadata.instructions = this.game.level.instructions;
                var composite = pause + (this.game.hasnextlevel() ? nextleveltemplate + prevleveltemplate : "");
                this.showbanner(composite, this.game.metadata);
            }

        }

        PlayerController.prototype.showbanner = function (template, data) {
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

        PlayerController.prototype.showinfo = function () {
            var data = {
                name: this.game.metadata.name,
                creator: this.game.metadata.creator,
                creatorid: this.game.metadata.creatorid,
                place: this.game.metadata.place,
                change: this.game.metadata.change,
                attribution: ( this.game.metadata.attribution ? this.game.metadata.attribution : false ),
                instructions: this.game.level.instructions
            };
            this.pausegame();
            var composite = info + (this.game.hasnextlevel() ? nextleveltemplate + prevleveltemplate : "");
            this.showbanner(composite, data);
        }

        PlayerController.prototype.flaglevel = function () {
            this.pausegame();
            var _this = this;
            localplay.flagitem("Flag Level", this.game.metadata.name, "level", this.game.levelid);
        }

        PlayerController.prototype.ratelevel = function () {
            this.pausegame();
            localplay.dialogbox.dialogboxwithtemplate(ratedialog, null, function (e) {
                var selector = localplay.domutils.getButtonSelector(e);
                if (selector.length == 3) {
                    var command = selector[2];
                    switch (command) {
                    }
                }
                return true;
            });
            //
            //
            //
            var ratingcontainer = document.getElementById("player.ratelevel.ratingpanel");
            if (ratingcontainer) {
                //new RatingPanel(ratingcontainer, "level", this.game.levelid);
                localplay.ratingpanel.createratingpanel(ratingcontainer, "level", this.game.levelid);
            }
        }

        PlayerController.prototype.sharelevel = function (url, param, windowspec) {
            var query = "";
            for (key in param) {
                if (query.length == 0) {
                    query += '?';
                } else {
                    query += '&';
                }
                query += key + '=' + encodeURIComponent(param[key]);
            }
            window.open(url + query, '_blank', windowspec ? windowspec : 'toolbar=0,location=0,menubar=0');
        }

        PlayerController.prototype.showlevelcredits = function () {
            var command = "getlevelcredits.php";
            var param = { id : this.game.levelid };
            localplay.datasource.get( command, param, {
                datasourceonloadend: function (e) {
                    var datasource = e.target.datasource;
                    var response = JSON.parse(datasource.response);                    
                    if (response.status && response.status === "FAILED") {
                        var message = response.message;
                        localplay.dialogbox.alert("Playsouthend", message);
                    } else {
                        localplay.dialogbox.dialogboxwithtemplate(credits, response, function (e) {
                            var selector = localplay.domutils.getButtonSelector(e);
                            if (selector.length == 4) {
                                var command = selector[1];
                                switch (command) {
                                    case "showcreator":
                                        var creatorid = selector[3];
                                        localplay.creator.createdialog(creatorid);
                                        return false;
                                        break;
                                }
                            }
                            return true;
                        });
                    }
                },
                datasourceonerror: function (e) {

                }
            });
        }
     
        PlayerController.prototype.onstatechange = function (e) {
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
                    this.game.metadata.instructions = this.game.level.instructions;
                    this.showinfo();
                    //this.showbanner(info,this.game.metadata);
                    //this.game.level.play();
                    break;
                case localplay.game.level.states.playing:
                    this.showbanner();
                    break;
                case localplay.game.level.states.done:
                    var composite = outro + (this.game.hasnextlevel() ? nextleveltemplate + prevleveltemplate : "");
                    var data = this.game.level.gamestate.getDescription(this.game.level);
                    data.protocol = window.location.protocol;
                    data.baseurl = window.location.host;
                    data.href = window.location.href;
                    data.id = this.game.levelid;
                    data.name = this.game.metadata.name;
                    data.creator = this.game.metadata.creator;
                    data.creatorid = this.game.metadata.creatorid;

                    this.showbanner(composite, data);
                    this.showplaybar(true);
                    //
                    // update player score
                    //
                    var score = this.game.level.gamestate.getScore();
                    if (score > 0 && this.game.level.gamestate.isWon()) {
                        var param = {
                            levelid: this.game.levelid,
                            score: Math.round( score * 1000 )
                        };
                        localplay.datasource.put("putscore.php", null, param);
                    }
                    //
                    // populate banner
                    //
                    //new RatingPanel(document.getElementById("player.rating"), "level", this.game.levelid);
                    localplay.ratingpanel.createratingpanel(document.getElementById("player.rating"), "level", this.game.levelid);
                    stWidget.addEntry({
                        "service": "sharethis",
                        "element": document.getElementById('player.sharethis'),
                        "url": window.location.href,
                        "title": this.game.metadata.name + 'by' + this.game.metadata.creator,
                        "type": "large",
                        "text": 'Check out ' + this.game.metadata.name + 'by' + this.game.metadata.creator + ' at ',
                        "summary": 'Play Southend' + this.game.metadata.name + 'by' + this.game.metadata.creator,
                        "onhover" : false
                    });
                    stWidget.addEntry({
                        "service": "email",
                        "element": document.getElementById('player.email'),
                        "url": window.location.href,
                        "title": this.game.metadata.name + 'by' + this.game.metadata.creator,
                        "type": "large",
                        "text": 'Check out ' + this.game.metadata.name + 'by' + this.game.metadata.creator + ' at ',
                        "summary": 'Play Southend' + this.game.metadata.name + 'by' + this.game.metadata.creator,
                        "onhover" : false
                    });

                    break;
            }

        }
        PlayerController.prototype.showplaybar = function (show) {
            if (show) {
                this.banner.style.left = "42px";
                this.playbar.style.left = "0px";
            } else {
                this.banner.style.left = "0px";
                this.playbar.style.left = "-42px";
            }
        }

        PlayerController.prototype.onclick = function (e) {
            var _this = this;
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length >= 2) {
                switch (selector[1]) {
                    case "home":
                        window.location = "index.html";
                        break;
                    case "me":
                        localplay.creator.showmyprofile();
                        break;
                    case "people":
                        localplay.creator.showpeopledialog();
                        break;
                    case "arcade":
                        localplay.game.arcade.showarcadedialog();
                        break;
                    case "replay":
                        this.game.level.reset();
                        this.game.level.play();
                        localplay.showtip(controltip, this.game.canvas);
                        this.showplaybar(false);
                        break;
                    case "play":
                        if (this.game.level.state === localplay.game.level.states.playing) {
                            this.resumegame();
                        } else {
                            this.game.level.play();
                        }
                        localplay.showtip(controltip, this.game.canvas);
                        this.showplaybar(false);
                        break;
                    case "pause":
                        this.pausegame();
                        break;
                    case "previouslevel":
                        this.game.previouslevel();
                        break;
                    case "nextlevel":
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
                    case "flag":
                        //
                        // show flag dialog
                        //
                        this.authenticate("You must login to flag this level!", function () {
                            _this.flaglevel();
                        });
                        break;
                    case "rate":
                        this.authenticate("You must login to rate this level!", function () {
                            _this.ratelevel();
                        });
                        break;
                    case "list":
                        //
                        // show arcade
                        //
                        this.showarcade();
                        break;
                    case "edit":
                        //
                        // attach edit controller
                        //
                        this.authenticate("You must login to edit this level!", function () {
                            localplay.game.controller.detachcontroller(_this.game);
                            localplay.game.leveleditor.editlevel(_this.game);
                                
                        });
                        break;
                    case "new":
                        //
                        // show level creator
                        //
                        this.authenticate("You must login to create a new level!", function () {
                            localplay.game.controller.detachcontroller(_this.game);
                            localplay.game.leveleditor.createlevel(_this.game);
                                
                        });

                        break;
                    case "twitter":
                        {
                            var url = 'https://twitter.com/intent/tweet';
                            //var param = 'text=Check out ' + this.game.metadata.name + ' by ' + this.game.metadata.creator + ' at ' + window.location.href;
                            var param = {
                                url:  window.location.href,
                                text: 'Check out ' + this.game.metadata.name + ' by ' + this.game.metadata.creator + ' at ' + window.location.href
                            }
                            var windowspec = 'toolbar=0,location=0,menubar=0,width=550,height=420';
                            this.sharelevel(url, param, windowspec);
                        }
                        break;
                    case "facebook":
                        {
                            var url = 'http://www.facebook.com/sharer/sharer.php';
                            var param = {
                                u: window.location.href
                            }
                            var windowspec = 'toolbar=0,location=0,menubar=0,width=626,height=436';
                            this.sharelevel(url, param, windowspec);
                        }
                        break;
                    case "googleplus":
                        {
                            var url = 'https://plus.google.com/share';
                            var param = {
                                url: window.location.href
                            }
                            var windowspec = 'toolbar=0,location=0,menubar=0,height=600,width=600';
                            this.sharelevel(url, param, windowspec);
                        }
                        break;
                    case "sharethis":
                        {

                        }
                        break;
                    case "email":
                        {

                        }
                        break;
                    case "showcreator":
                        {
                            var creatorid = selector[2];
                            localplay.creator.createdialog(creatorid);
                        }
                        break;
                    case "loadoriginal":
                        {
                            window.location.href = "playnew.html?id=" + _this.game.metadata.attribution.originalid;
                        }
                        break;
                    case "showcredits":
                        {
                           this.showlevelcredits();
                        }
                        break;
                }
            }
            return false;
        }

        PlayerController.prototype.onmousedown = function (e) {
            return false;
        }

        PlayerController.prototype.onmouseup = function (e) {
            return false;
        }


        PlayerController.prototype.onmousemove = function (e) {
            localplay.domutils.fixEvent(e);
            if (this.game.level.state != localplay.game.level.states.playing ||
                ( e.offsetX < 42 || ( e.target == this.game.canvas.offsetParent && e.offsetX < this.game.canvas.offsetLeft ) ) ) {// === this.game.canvas.offsetParent || e.target === this.playbar || localplay.domutils.isChild(this.playbar, e.target)) && e.offsetX < 42) {
                this.showplaybar(true);
            } else {
                this.showplaybar(false);
            }

            return false;
        }

        PlayerController.prototype.onkeydown = function (e) {
            if (e.keyCode === localplay.keycode.ESC) {
                this.pausegame();
            }
            if (this.game.level.state == localplay.game.level.states.playing) {
                if (localplay.hastip()) {
                    localplay.showtip();
                }
            }
            this.game.level.onkeydown(e);
            return false;
        }

        PlayerController.prototype.onkeyup = function (e) {
            this.game.level.onkeyup(e);
            return false;
        }

        PlayerController.prototype.onresize = function (e) {
            this.game.fittocontainer();
            return false;
        }

        player.attachtogame = function (game) {
            //
            // 
            //
            return new PlayerController(game);
        }

        return player;
    })();
