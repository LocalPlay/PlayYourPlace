/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.js
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
localplay = window.localplay ? window.localplay : {};
//
// game module
//
localplay.game = (function () {
    if (localplay.game) return localplay.game;

    var game = {};
    //
    // constants
    //
    game.modes = {
        none: "none",
        edit: "edit",
        demo: "demo",
        play: "play"
    };
    //
    //
    //
    function Game(canvas) {
        //
        //
        //
        this.level = null;
        this.canvas = null;
        this.setcanvas(canvas);
        //
        // create empty level
        //
        this.levelid = -1;
        this.level = localplay.game.level.createlevel(this);
        this.metadata = {};
        //
        // create empty arcade
        //
        this.currentlevel = -1;
        this.arcade = [];
        //
        // initialise flags
        //
        this.fullscreen = false;
        this.paused = true;
        this.mode = game.modes.none;
        //
        // initialise controller
        //
        this.controller = null;
        //
        // setup animation callback
        //
        this.animationframe = -1;
        //
        // resize canvas to fit container
        //
        this.fittocontainer();
    }
    //
    //
    //
    Game.prototype.setcanvas = function (canvas) {
        //
        // setup canvas
        //
        this.canvas = canvas;
        //
        // prevent selection and dragging
        //
        this.canvas.addEventListener("selectstart", function (e) {
            localplay.domutils.preventDefault(e);
            localplay.domutils.stopPropagation(e);
            return false;
        });
        this.canvas.addEventListener("dragstart", function (e) {
            localplay.domutils.preventDefault(e);
            localplay.domutils.stopPropagation(e);
            return false;
        });
        if (this.level) {
            this.level.setcanvas(this.canvas);
        }
    }
    //
    //
    //
    Game.prototype.newlevel = function (metadata, json) {
        this.metadata = {};
        for (var key in metadata) {
            this.metadata[key] = metadata[key];
        }
        this.levelid = 0;
        this.level.setup(json);
        this.play();
    }
    //
    // load a level
    //
    Game.prototype.loadlevel = function (level) {
        //
        //
        //
        var _this = this;
        localplay.datasource.get("getlevel.php", { id: level },
            {
                datasourceonloadend: function (e) {
                    var datasource = e.target.datasource;
                    if (((datasource.status >= 200 && datasource.status < 300) || datasource.status == 304)) {
                        //try {
                            //
                            // parse response
                            //
                            var data = JSON.parse(datasource.response);
                            if (data instanceof Array && data.length > 0 && data[0].json !== undefined) {
                                //
                                // store the current level metadata at this level
                                //
                                _this.metadata = {
                                    name: data[0].name,
                                    place: data[0].place,
                                    change: data[0].change,
                                    published: data[0].published == "1",
                                    creatorid: data[0].creatorid,
                                    creator: data[0].creator,
                                    tags: data[0].tags,
                                    thumbnail: data[0].thumbnail,
                                    attribution: data[0].attribution
                                };
                                //
                                // initialise level
                                //
                                _this.levelid = level;
                                _this.level.setup(data[0].json);
                                //
                                //
                                //
                                _this.play();
                            } else {
                                if (data.status&&data.message) {
                                    localplay.dialogbox.alert("Playsouthend", data.message);
                                } else {
                                    throw "Invalid format";
                                }
                            }
                        //} catch (error) {
                        //    localplay.dialogbox.alert("Local Play", "Unable to process level, error : '" + error + "' !");
                        //}
                    } else {
                        localplay.dialogbox.alert("Playsouthend", "Unable to download level, error : '" + datasource.statustext + "' !");
                    }
                }
            });

    }
    //
    // save a level
    //
    Game.prototype.createthumbnail = function() {
        var thumbnail = document.createElement( 'canvas' );
        thumbnail.width = 240;
        thumbnail.height = 180;
        var scale = thumbnail.height / this.canvas.height;
        var thumbnailcontext = thumbnail.getContext('2d');
        thumbnailcontext.drawImage(this.canvas, 0, 0, Math.round( this.canvas.width * scale ), thumbnail.height);
        return thumbnail;
    }

    Game.prototype.savelevel = function (callback,copy) {
        
        //
        // create thumbnail
        //
        var _this = this;
        //localplay.imageprocessor.resizeCanvasToFit(this.canvas, 256, 256, false, function (thumbnail) {
            var thumbnail = this.createthumbnail();
            //
            // serialise game
            //
            _this.level.reserialise();
            var json = _this.level.json;
            //
            // upload
            //
            var param = {};
            param.id = copy ? 0 : _this.levelid;
            param.name = _this.metadata.name;
            param.published = _this.metadata.published ? 1 : 0;
            param.place = _this.metadata.place;
            param.change = _this.metadata.change;
            param.tags = _this.metadata.tags ? _this.metadata.tags : "";
            //param.thumbnail = thumbnail;
            var data = {
                data: json,
                thumbnail: thumbnail.toDataURL("image/png")
            };
            localplay.datasource.put('putlevel.php', data, param,
                localplay.datasource.createprogressdialog("Saving level...", function( e ) {
                    var xhr = e.target;
                    try {
                        var response = JSON.parse(xhr.datasource.response);
                        if (response.status === "OK") {
                            if (response.id !== undefined) {
                                _this.levelid = response.id;
                                _this.metadata.name = response.name;
                                _this.level.resetdirty();
                                history.replaceState( null, "Localplay : " + param.name, "playnew.html?id=" + response.id);
                            }
                        }
                        if ( callback ) callback(response.status === "OK");
                    } catch (error) {
                        if (callback) callback(false);
                    }
                    
                }));
        //});
    }
    //
    // set current arcade
    // arcade is an array of level ids
    //
    //
    Game.prototype.setarcade = function (arcade,initiallevel) {
        //
        // TODO: should test if we are playing and whether the current level ( if we have one ) is in this arcade
        //
        this.currentlevel = initiallevel || 0;
        this.arcade = arcade ? arcade : [];
        if (arcade.length > 0 && arcade[this.currentlevel].id != this.levelid) {
            this.loadlevel(arcade[this.currentlevel].id);
        }
    }
    //
    // arcade navigation
    //
    Game.prototype.nextlevel = function () {
        if (this.arcade.length === 0) return;
        if (this.currentlevel < this.arcade.length - 1) {
            this.currentlevel++;
        } else {
            this.currentlevel = 0;
        }
        this.loadlevel(this.arcade[this.currentlevel].id);
    }
    Game.prototype.previouslevel = function () {
        if (this.arcade.length === 0) return;
        if (this.currentlevel > 0) {
            this.currentlevel--;

        } else {
            this.currentlevel = this.arcade.length - 1;
        }
        this.loadlevel(this.arcade[this.currentlevel].id);
    }
    Game.prototype.hasnextlevel = function () {
        return this.arcade.length > 0;// && this.currentlevel < this.arcade.length - 1;
    }
    Game.prototype.haspreviouslevel = function () {
        return this.arcade.length > 0 && this.currentlevel > 0;
    }
    //
    //
    //
    Game.prototype.play = function () {
        this.paused = false;
        //
        // cancel any existing queued frame
        //
        if (this.animationframe > 0) {
            cancelAnimationFrame(this.animationframe);
            this.animationframe = -1;
        }
        //
        // update and enqueue the next
        //
        this.animate();
    }

    Game.prototype.pause = function () {
        this.paused = true;
        cancelAnimationFrame(this.animationframe);
        this.animationframe = -1;
    }
    //
    //
    //
    Game.prototype.animate = function () {
        //
        // do nothing if we are paused
        //
        if (this.paused) return;
        //
        // update
        //
        this.level.update();
        //
        // draw 
        //
        this.level.draw();
        //
        // draw controller ui
        //
        if (this.controller) {
            this.controller.draw();
        }
        //
        // queue up next frame
        //
        var _this = this;
        this.animationframe = requestAnimFrame(function () {
            _this.animate();
        });
    }

    Game.prototype.fittocontainer = function () {
        var containerheight = 0;
        var containerwidth = 0;
        if (this.canvas.offsetParent === document.body) {
            containerheight = window.innerHeight;
            containerwidth = window.innerWidth;
        } else {
            containerheight = this.canvas.offsetParent.offsetHeight;
            containerwidth = this.canvas.offsetParent.offsetWidth;
        }
        var height = this.canvas.height;
        var width = this.canvas.width;
        while (true) {
            var hscale = containerwidth / width;
            var vscale = containerheight / height;
            if (vscale < hscale) {
                height = height * vscale;
                width = width * vscale;
            } else {
                height = height * hscale;
                width = width * hscale;
            }
            if (height <= containerheight && width <= containerwidth) break;
        }
        this.canvas.style.height = (height - 8) + 'px';
        this.canvas.style.width = (width - 8) + 'px';
    }

    Game.prototype.getscale = function () {
        return this.canvas.offsetWidth / this.canvas.width;
    }

    Game.prototype.getinversescale = function () {
        return this.canvas.width / this.canvas.offsetWidth;
    }

    Game.prototype.gofullscreen = function () {
        localplay.gofullscreen(this.canvas.offsetParent);
    }

    Game.prototype.containertocanvascoord = function (p) {
        p.x -= this.canvas.offsetLeft;
        p.y -= this.canvas.offsetTop;
        p.scale(this.getinversescale());
    }
    Game.prototype.spriteatpoint = function (p) {
        p.scale(this.getinversescale());
        return this.level.world.spriteAtPoint(p);
 
    }

    Game.prototype.getviewportoffset = function () {
        //
        // TODO: add this to world
        //
        return new Point(-this.level.world.viewport.x, -this.level.world.viewport.y);
    }
    //
    // game factory
    //
    game.creategamewithlevel = function (canvas, level) {
        var newgame = new Game(canvas);
        newgame.loadlevel(level);
        var arcade = sessionStorage.getItem("localplay.arcade");
        if (arcade) {
            arcade = JSON.parse(arcade);
            if (arcade instanceof Array) {
                var currentlevel = -1;
                for (var i = 0; i < arcade.length; i++) {
                    if (arcade[i].id == level) {
                        currentlevel = i;
                        break;
                    }
                }
                if (currentlevel >= 0) {
                    newgame.setarcade(arcade, currentlevel);
                }
            }
        }
        return newgame;
    }
    game.creategamewitharcade = function (canvas, arcade) {
        var newgame = new Game(canvas);
        newgame.setarcade(arcade);
        newgame.currentlevel = 0;
        sessionStorage.setItem("localplay.arcade", JSON.stringify(arcade));
        sessionStorage.setItem("localplay.arcade.level", 0);
        return newgame;
    }
    game.creategame = function (canvas) {
        return new Game(canvas);
    }
    //
    //
    //
    return game;
})();