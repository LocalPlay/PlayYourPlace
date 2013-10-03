//
// game module
//
localplay.game.level = (function () {
    if (localplay.game.level) return localplay.game.level;

    var level = {};
    //
    //
    //
    level.states = {
        clear: "clear",
        loading: "loading",
        ready: "ready",
        playing: "playing",
        done: "done"
    };
    //
    //
    //
    function Level(game) {
        //
        //
        //
        localplay.domutils.extendAsEventDispatcher(this);
        //
        // store game
        //
        this.game = game;
        //
        // move world to world module
        //
        this.world = localplay.world.createworld(this);
        //
        //
        //
        this.musicplayer = null;
        this.music = null;
        this.winsoundplayer = null;
        this.winsound = null;
        this.loosesoundplayer = null;
        this.loosesound = null;
        this.instructions = "";
        this.winmessage = "";
        this.losemessage = "";
        //
        //
        //
        this.json = null;
        //
        //
        //
        this.state = level.states.clear;
        //
        //
        //
        this.keys = [];
        this.loaded = false;
        this.loadingprogress = 0;
        this.trackavatar = true;
        this.gamestarted = false;
        this.gameover = false;
        this.timer = localplay.timer.createtimer();
        this.bounds = new Rectangle();
        this.paused = false;
        this.removeonnextupdate = [];
        this.addonnextupdate = [];
        this.impulse = new Point();
        this.autogenerate = true;
        this.jsonin = "";
        //
        // 
        //
        this.setcanvas(game.canvas);
    }

    Level.prototype.setcanvas = function (canvas) {
        this.canvas = canvas;
        this.world.setcanvas(canvas);
        //
        //
        //
        var scale = this.canvas.height / localplay.defaultsize.height;
        if (this.background) {
            this.background.setscale(scale);
            this.adjustviewport();
        }
        
    }

    Level.prototype.setstate = function (state) {
        if (state != this.state) {
            this.state = state;
            this.dispatchEvent( localplay.domutils.createCustomEvent( "statechange" ) );
        }
    }

    Level.prototype.resetdirty = function () {
        this.jsonin = new String(this.json);
    }

    Level.prototype.isdirty = function () {
        var jsonin = this.jsonin.valueOf();
        return (jsonin.length != this.json.length || jsonin != this.json);
    }

    Level.prototype.setup = function (json) {
        if (this.isplaying()) {
            this.pause();
        }
        //
        // keep hold of default game state for reset
        //
        if (json !== undefined && json) {
            this.jsonin = new String(json);
            this.json = json;
        }
        //
        // and reset
        //
        this.reset();
    }

    Level.prototype.revert = function (json) {
        if (this.isdirty()) {
            this.json = new String(this.jsonin);
            this.reset();
        }
    }

    Level.prototype.clear = function () {
        this.loaded = false;
        this.setstate(level.states.clear);
        if (this.avatar) {
            ////localplay.log("destroying avatar");
            this.avatar.sprite.destroy();
            delete this.avatar;
        }
        if (this.platforms) {
            ////localplay.log("destroying " + this.platforms.length + " platforms");
            for (var i = 0; i < this.platforms.length; i++) {
                this.platforms[i].sprite.destroy();
                delete this.platforms[i];
            }
        }
        if (this.obstacles) {
            ////localplay.log("destroying " + this.obstacles.length + " obstacles");
            for (var i = 0; i < this.obstacles.length; i++) {
                this.obstacles[i].sprite.destroy();
                delete this.obstacles[i];
            }
        }
        if (this.pickups) {
            ////localplay.log("destroying " + this.pickups.length + " pickups");
            for (var i = 0; i < this.pickups.length; i++) {
                this.pickups[i].sprite.destroy();
                delete this.pickups[i];
            }
        }
        if (this.goals) {
            ////localplay.log("destroying " + this.goals.length + " goals");
            for (var i = 0; i < this.goals.length; i++) {
                this.goals[i].sprite.destroy();
                delete this.goals[i];
            }
        }
        if (this.props) {
            ////localplay.log("destroying " + this.props.length + " props");
            for (var i = 0; i < this.props.length; i++) {
                this.props[i].sprite.destroy();
                delete this.props[i];
            }
        }
        if (this.background) {
            delete this.background;
        }
        this.background = null;
        this.avatar = null;
        this.platforms = [];
        this.obstacles = [];
        this.pickups = [];
        this.goals = [];
        this.props = [];
        //
        //
        //
        this.gameplay = null;
        this.gamestate = null;
        this.removeonnextupdate = [];
        this.addonnextupdate = [];
        this.postupdateoperations = [];
        this.music = null;
        if (this.musicplayer) {
            this.musicplayer.pause();
            delete this.musicplayer;
            this.musicplayer = null;
        }
        this.winsound = null;
        if (this.winsoundplayer) {
            this.winsoundplayer.pause();
            delete this.winsoundplayer;
            this.winsoundplayer = null;
        }
        this.loosesound = null;
        if (this.loosesoundplayer) {
            this.loosesoundplayer.pause();
            delete this.loosesoundplayer;
            this.loosesoundplayer = null;
        }
        this.instructions = "";
        this.winmessage = "";
        this.losemessage = "";
        this.keys = [];
    }
    Level.prototype.reset = function () {
        //
        // remove existing properties
        //
        this.clear();
        //
        //
        //
        this.world.reset();
        //
        //
        //
        this.loadingprogress = 0;
        this.trackavatar = true;
        this.gamestarted = false;
        this.gameover = false;
        //
        // deserialise
        //
        this.setstate(level.states.loading);
        var _this = this;
        var currentSentence = null;
        var currentClause = null;
        JSON.parse(this.json, function (key, value) {
            if (key === 'background') {
                _this.background = localplay.game.background.createbackground(_this, value.images);
                _this.background.setscale(_this.canvas.height / localplay.defaultsize.height);
            } else if (key === 'avatar') {
                _this.avatar = localplay.game.avatar.createavatar(_this, value);
            } else if (localplay.game.item.isitemtype(key)) {
                var item = localplay.game.item.createitem(_this, key, value, false);
                var container = _this.containerfromitemtype(key);
                if (container) {
                    container.push(item);
                }
            } else if (key === 'position') {
                //
                //
                //
                var coord = value.split(',');
                if (coord && coord.length > 1) {
                    var position = new Point(parseFloat(coord[0]), parseFloat(coord[1]));// _this.world.b2Vec2(parseFloat(coord[0]), parseFloat(coord[1]));
                    return position;
                } else {
                    return new _this.world.b2Vec2(0, 0);
                }

            } else if (key === 'gameplay') {
                if (_this.gameplay == null) {
                    _this.gameplay = localplay.game.gameplay.creategameplay();
                }
            } else if (key === 'verb') {
                if (_this.gameplay == null) {
                    _this.gameplay = localplay.game.gameplay.creategameplay();
                }
                currentSentence = _this.gameplay.addSentence(value);
            } else if (key === 'predicate') {
                currentClause = currentSentence.addClause(value);
            } else if (key === 'subject') {
                currentClause.subject = value;
            } else if (key === 'music') {
                _this.music = value;
            } else if (key === 'loosesound') {
                _this.loosesound = value;
            } else if (key === 'winsound') {
                _this.winsound = value;
            } else if (key === 'instructions') {
                _this.instructions = value;
            } else if (key === 'winmessage') {
                _this.winmessage = value;
            } else if (key === 'losemessage') {
                _this.losemessage = value;
            }

            return value;
        });
        //
        // default gameplay
        //
        this.autogenerate = (this.gameplay == null);
        if (this.autogenerate) {
            this.gameplay = localplay.game.gameplay.creategameplay();
            this.buildGameplayFromLevel();
        }
        //
        // initialise gamestate from gameplay
        //
        this.gamestate = localplay.game.gamestate.creategamestate(this.gameplay);
        //
        // default audio
        //
        if (this.music == null) {
            this.music = { id: 0, type: "music", name: "music", mp3: "audio/music.mp3", ogg: "audio/music.ogg" };
        }
        try {
            this.musicplayer = new Audio();
            this.musicplayer.addEventListener("canplaythrough", function () {
                _this.musicready = true;
                _this.musicplayer.loop = true;
            });
            this.musicplayer.src = this.music[localplay.domutils.getTypeForAudio()];
            this.musicplayer.load();
        } catch (error) {
            this.musicplayer = null;
            //localplay.log("GameItem : unable to load audio '" + this.musicplayer.src + "'");
        }
        if (this.winsound == null) {
            this.winsound = { id: 0, type: "effect", name: "effect", mp3: "audio/cheer.mp3", ogg: "audio/cheer.ogg" };
        }
        try {
            this.winsoundplayer = new Audio();
            this.winsoundplayer.addEventListener("canplaythrough", function () {
                _this.winsoundready = true;
            });
            this.winsoundplayer.src = this.winsound[localplay.domutils.getTypeForAudio()];
            this.winsoundplayer.load();
        } catch (error) {
            this.winsoundplayer = null;
            //localplay.log("GameItem : unable to load audio '" + this.winsound[localplay.domutils.getTypeForAudio()] + "'");
        }
        if (this.loosesound == null) {
            this.loosesound = { id: 0, type: "effect", name: "effect", mp3: "audio/boo.mp3", ogg: "audio/boo.ogg" };
        }
        try {
            this.loosesoundplayer = new Audio();
            this.loosesoundplayer.addEventListener("canplaythrough", function () {
                _this.loosesoundready = true;
            });
            this.loosesoundplayer.src = this.loosesound[localplay.domutils.getTypeForAudio()];
            this.loosesoundplayer.load();
        } catch (error) {
            this.loosesoundplayer = null;
            //localplay.log("Level : unable to load audio '" + this.loosesound[localplay.domutils.getTypeForAudio()] + "'");
        }
        //
        // update loading progress
        //
        this.updateprogress();
    }

    Level.prototype.reserialise = function () {
        var json = '{';
        //
        // serialise background TODO: encapsulate this in background
        //
        json += '"background" : { "images" : [';
        for (var i = 0; i < this.background.images.length; i++) {
            json += '"' + this.background.images[i].src + '"';
            if (i < this.background.images.length - 1) {
                json += ',';
            }
        }
        json += '] } ,';
        //
        // serialise avatar
        //
        json += this.avatar.tostring() + ',';
        //
        // serialise platforms
        //
        json += '"platforms" : [';
        for (var i = 0; i < this.platforms.length; i++) {
            json += this.platforms[i].tostring();
            if (i < this.platforms.length - 1) {
                json += ',';
            }
        }
        json += '] ,';
        //
        // serialise props
        //
        json += '"props" : [';
        for (var i = 0; i < this.props.length; i++) {
            json += this.props[i].tostring();
            if (i < this.props.length - 1) {
                json += ',';
            }
        }
        json += '] ,';
        //
        // serialise obstacles
        //
        json += '"obstacles" : [';
        for (var i = 0; i < this.obstacles.length; i++) {
            json += this.obstacles[i].tostring();
            if (i < this.obstacles.length - 1) {
                json += ',';
            }
        }
        json += '] ,';
        //
        // serialise goals
        //
        json += '"goals" : [';
        for (var i = 0; i < this.goals.length; i++) {
            json += this.goals[i].tostring();
            if (i < this.goals.length - 1) {
                json += ',';
            }
        }
        json += '] ,';
        //
        // serialise pickups
        //
        json += '"pickups" : [';
        for (var i = 0; i < this.pickups.length; i++) {
            json += this.pickups[i].tostring();
            if (i < this.pickups.length - 1) {
                json += ',';
            }
        }
        json += ']';
        if (!this.autogenerate) {
            //
            // serialise gameplay
            //
            json += ', "gameplay" : ';
            json += JSON.stringify(this.gameplay);
        }
        json += ', "music" : ' + JSON.stringify(this.music);
        json += ', "winsound" : ' + JSON.stringify(this.winsound);
        json += ', "loosesound" : ' + JSON.stringify(this.loosesound);
        //
        //
        //
        json += ', "instructions" : "' + this.instructions + '"';
        json += ', "winmessage" : "' + this.winmessage + '"';
        json += ', "losemessage" : "' + this.losemessage + '"';
        //
        //
        //
        json += '}';
        //
        //
        //
        var basedirectory = location.href;
        basedirectory = basedirectory.substr(0, basedirectory.lastIndexOf('/') + 1);
        while (json.indexOf(basedirectory) > -1) json = json.replace(basedirectory, "");;
        this.json = json;
    }

    Level.prototype.setscale = function (scale) {
        this.background.setscale(scale);
        this.world.setscale(scale);
        this.adjustviewport();
    }

    Level.prototype.adjustviewport = function () {
        //localplay.log("adjusting viewport");
        //
        // reset world bounds
        //
        this.bounds = this.background.getbounds();
        this.world.createBounds(new this.world.b2Vec2(0, 0), new this.world.b2Vec2(this.bounds.width / this.background.scale, this.bounds.height / this.background.scale)); // use unscaled bounds because world already scales
        //
        // adjust viewport to fit and show level
        //
        this.world.viewport.width = this.world.canvas.width;
        if (this.world.viewport.width > this.bounds.width) {
            this.world.viewport.x = 0;
            this.world.viewport.width = this.bounds.width;
        } else if (this.world.viewport.x + this.world.viewport.width > this.bounds.width) {
            this.world.viewport.x = this.bounds.width - this.world.viewport.width;
        }

    }
    Level.prototype.onobjectloaded = function (object) {

        if (object == this.background) {
                var _this = this;
                this.world.queueoperation(function () {
                    //localplay.log("viewport adjustment");
                    _this.adjustviewport();
                });
        } else if (object == this.avatar) {
            ////localplay.log("avatar loaded");
        }

    }
    //
    // collision handling
    // TODO: move this to pre/post solve
    //
    Level.prototype.begincontact = function (contact) {
        var a = contact.GetFixtureA().GetBody();
        var b = contact.GetFixtureB().GetBody();
        var avatar = this.isAvatar(a) != null ? a : this.isAvatar(b) != null ? b : null;
        if (avatar != null) {
            var other = avatar === a ? b : a;
            if (other.GetUserData() && other.GetUserData().userdata) {
                if (this.gamestate !== undefined) {
                    if (!this.avatar.isCollidingWith(other) && this.isplaying() ) {
                        if (!this.isPlatform(other)) {
                            this.gamestate.collide(this, other.GetUserData().userdata);
                        }
                        other.GetUserData().userdata.playaudio();
                    }
                }
            }
            this.avatar.beginCollision(other);
        }
    }

    Level.prototype.endcontact = function (contact) {
        var a = contact.GetFixtureA().GetBody();
        var b = contact.GetFixtureB().GetBody();
        var avatar = this.isAvatar(a) != null ? a : this.isAvatar(b) != null ? b : null;
        if (avatar != null) {
            var other = avatar === a ? b : a;
            this.avatar.endCollision(other);
        }

    }

    Level.prototype.presolve = function (contact, oldManifold) {
        var a = contact.GetFixtureA().GetBody();
        var b = contact.GetFixtureB().GetBody();
        var avatar = this.isAvatar(a) != null ? a : this.isAvatar(b) != null ? b : null;
        if ((a == avatar && this.isPickup(b)) || (b == avatar && this.isPickup(a))) {
            //
            // cancel collision with pickups
            //
            contact.SetEnabled(false);
        } else if( this.avatar.offscreen ) {//if ((a == avatar && !this.isWorldGround(b)) || (b == avatar && !this.isWorldGround(a))) {
            //
            // avoid being pushed offscreen
            //
            contact.SetEnabled(false);
            /*
            var offscreen = (this.avatar.aabb.x + 20 < 0 || this.avatar.aabb.y + 5 < 0 || (this.avatar.aabb.x + this.avatar.aabb.width - 20 > this.background.width) || (this.avatar.aabb.y + this.avatar.aabb.height - 5 > this.background.height));
            
            contact.SetEnabled(!offscreen);
            if (!offscreen) {
                //var incollision = this.avatar.isCollidingWith(b) || this.avatar.isCollidingWith(a);
                //contact.SetEnabled(!incollision);
            }
            */
        }
    }

    Level.prototype.postsolve = function (contact, impulse) {

    }

    Level.prototype.isAvatar = function (body) {
        return this.avatar.sprite == body.GetUserData() ? this.avatar : null;
    }
    //
    //
    //
    Level.prototype.isWorldBounds = function (body) {
        return (body === this.world.bounds || body === this.world.ground);
    }
    Level.prototype.isWorldGround = function (body) {
        return (body === this.world.ground);
    }

    Level.prototype.isItemOfType = function (type, body) {
        var sprite = body.GetUserData();
        if (sprite && sprite.userdata && sprite.userdata.type === type) return sprite.userdata;
        return null;
    }

    Level.prototype.isPlatform = function (body) {
        //
        //
        //
        if (this.platforms) {
            return this.isItemOfType('platform', body);
        }
        return null;
    }

    Level.prototype.isGoal = function (body) {
        if (this.goals) {
            return this.isItemOfType('goal', body);
        }
        return null;
    }
    Level.prototype.isObstacle = function (body) {
        if (this.obstacles) {
            return this.isItemOfType('obstacle', body);
        }
        return null;
    }
    Level.prototype.isPickup = function (body) {
        if (this.pickups) {
            return this.isItemOfType('pickup', body);
        }
        return null;
    }
    //
    //
    //

    //
    //
    //
    Level.prototype.containerfromitemtype = function (type) {
        if (type !== undefined) {
            var key = type + "s";
            if (this[key] !== undefined) {
                return this[key];
            }
        }
        return null;
    }

    Level.prototype.removeitem = function (item,edit) {
        //
        // check if item is part of gameplay
        //
        if (edit) {
            if (this.gameplay.containsItem(item) && this.countInstancesOfMediaForObjectOfType(item.type, item.image) <= 1) {
                //
                // remove from gameplay
                //
                this.gameplay.removeSentencesWithItem(item);
            }
        }
        //
        // remove from level
        //
        var container = this.containerfromitemtype(item.type);
        if (container) {
            var index = container.indexOf(item);
            if (index >= 0) {
                item.destroy();
                container.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    Level.prototype.additem = function (item) {
        var container = this.containerfromitemtype(item.type);
        if (container&&container.indexOf(item)<0) {
            container.push(item);
            return true;
        } else {
            //localplay.log("unable to find container for type : '" + item.type + "'");
        }
        return false;
    }

    Level.prototype.changeitemtype = function (item, type) {
        if (item.type === type) return;
        //
        // remove from current container
        //
        var container = this.containerfromitemtype(item.type);
        if (container) {
            var index = container.indexOf(item);
            if (index >= 0) {
                container.splice(index, 1);
            }
        }
        //
        // add to new container and recreate sprite
        //
        var container = this.containerfromitemtype(type);
        if (container) {
            item.type = type;
            container.push(item);
            item.createsprite();
        }
    }

    //
    //
    //
    Level.prototype.updateprogress = function () {
        var total = 0;
        var loaded = 0;
        //
        //
        //
        if (this.avatar) {
            total++;
            if (this.avatar.isloaded()) loaded++;
        }
        //
        //
        //
        if (this.background) {
            if (this.background.images) {
                for (var i = 0; i < this.background.images.length; i++) {
                    total++;
                    if (this.background.images[i].complete) {
                        loaded++;
                    }
                }
            }
        }
        if (this.platforms) {
            for (var i = 0; i < this.platforms.length; i++) {
                total++;
                if (this.platforms[i].isloaded()) loaded++;
            }
        }
        if (this.obstacles) {
            for (var i = 0; i < this.obstacles.length; i++) {
                total++;
                if (this.obstacles[i].isloaded()) loaded++;
            }
        }
        if (this.pickups) {
            for (var i = 0; i < this.pickups.length; i++) {
                total++;
                if (this.pickups[i].isloaded()) loaded++;
            }
        }
        if (this.goals) {
            for (var i = 0; i < this.goals.length; i++) {
                total++;
                if (this.goals[i].isloaded()) loaded++;
            }
        }
        if (this.props) {
            for (var i = 0; i < this.props.length; i++) {
                total++;
                if (this.props[i].isloaded()) loaded++;
            }
        }
        if (total > 0) {
            this.loadingprogress = Math.round(100.0 * (loaded / total));
            this.loaded = loaded == total;
            if (this.loaded&&this.state!=level.states.playing) { // TODO: need a better way of stopping playing state from being reset on load
                this.setstate(level.states.ready);
            }
        }
    }

    Level.prototype.update = function () {
        //
        //
        //
        this.world.performqueuedoperations();
        //
        //
        //
        if (!this.loaded) {
            this.updateprogress();
            return;
        } else if (this.paused) {
            return;
        }
        //
        // update game state
        //
        var time = this.timer.elapsed();
        //
        //
        //
        if (this.gamestate && this.gamestate !== undefined) {
            if (this.gamestarted) {
                this.gamestate.update(time);
            }
            if (!this.gameover) {
                if (this.gamestate.isWon()) {
                    if (this.winsoundplayer) {
                        this.winsoundplayer.play();
                    }
                    this.gameover = true;
                } else if (this.gamestate.isLost()) {
                    if (this.loosesoundplayer) {
                        this.loosesoundplayer.play();
                    }
                    this.gameover = true;
                }
                //
                // TODO: move all gameover processing here
                //
                if (this.gameover) {
                    //
                    // stop music
                    //
                    if (this.musicplayer) {
                        this.musicplayer.pause();
                    }
                    //
                    // update score
                    //
                    // this.game.updatescore(this.avatar.score);
                    //
                    //
                    //
                    this.setstate(level.states.done);
                }
            }
        } else if (this.avatar) {
            //
            // TODO: remove this, all new games should have gameplay
            //
            this.gameover = this.avatar.hitgoal || this.avatar.hitobstacle;
        }
        //
        //
        //
        if (this.background) {
            this.background.update(time);
        }
        //
        //
        //
        if (this.avatar) {
            if (this.gamestarted) {
                this.impulse.set(0, 0);
                if (this.keys[37]) { // left
                    this.impulse.x = -1;
                }
                if (this.keys[39]) { // right
                    this.impulse.x = 1;
                }
                if (this.keys[32]) { // space
                    this.impulse.y = -1;
                }
                this.avatar.applyimpulse(this.impulse);
            }
            this.avatar.update(time);
       
            //
            // center world viewport on avatar
            //
            if (this.background.loaded && this.trackavatar) {
                var center = this.world.viewport.x + this.world.viewport.width / 2.0;
                var dx = ((this.avatar.sprite.position.x * (this.canvas.height / localplay.defaultsize.height)) - center) * 0.99;
                this.scrollviewportby(dx);
            }
            //
            // remove all pickedup pickups from the world
            //
            var pickedup = this.avatar.pickups;
            for (var i = 0; i < pickedup.length; i++) {
                this.removeitem(pickedup[i]);
            }
            //this.avatar.pickups = [];
        }
        if (this.gamestarted) {
            this.updateitems(time);
        }
        //
        // remove / replace items
        //
        while (this.removeonnextupdate.length > 0) {
            var item = this.removeonnextupdate.pop();
            this.removeitem(item);
        }
        while (this.addonnextupdate.length > 0) {
            var item = this.addonnextupdate.pop();
            if ( this.additem(item) ) item.createsprite();
        }
        //
        // update the world
        //
        if (this.gamestarted && this.world != null) this.world.update();
    }

    Level.prototype.updateitems = function (time) {
        //
        // update all other items
        //
        if (this.platforms) {
            for (var i = 0; i < this.platforms.length; i++) {
                this.platforms[i].update(time);
            }
        }
        if (this.obstacles) {
            for (var i = 0; i < this.obstacles.length; i++) {
                this.obstacles[i].update(time);
            }
        }
        if (this.goals) {
            for (var i = 0; i < this.goals.length; i++) {
                this.goals[i].update(time);
            }
        }
        if (this.pickups) {
            for (var i = 0; i < this.pickups.length; i++) {
                this.pickups[i].update(time);
            }
        }
        if (this.props) {
            for (var i = 0; i < this.props.length; i++) {
                this.props[i].update(time);
            }
        }
    }

    Level.prototype.draw = function () {
        //
        // draw background
        //
        if (this.background) {
            this.background.draw();
        }
        //
        // draw sprites
        //
        this.world.draw();
    }

    Level.prototype.isscrollable = function () {
        return this.background.loaded && this.bounds.width > this.world.viewport.width;
    }

    Level.prototype.scrollviewportby = function (dx) {
        if (this.background.loaded && (dx > 0.0 || dx < 0.0)) {
            var offset = Math.max(0, Math.min(this.bounds.width - this.world.viewport.width, this.world.viewport.x + dx));
            var dbounds = this.bounds.width - this.world.viewport.width;
            this.world.viewport.x = offset;
            ////localplay.log("viewport : " + this.world.viewport.tostring());
        }
    }
    Level.prototype.getnextlevel = function () {
        var nextlevel = [];

        if (this.gamestate.isWon() && this.gamestate.win.goto) {
            nextlevel = this.gamestate.win.goto.subject && this.gamestate.win.goto.subject != undefined ? this.gamestate.win.goto.subject.toString().split("|") : [];
        } else if (this.gamestate.isLost() && this.gamestate.lose.goto) {
            nextlevel = this.gamestate.lose.goto.subject && this.gamestate.lose.goto.subject != undefined ? this.gamestate.lose.goto.subject.toString().split("|") : [];
        }

        return nextlevel;
    }
    //
    // event handling
    //
    Level.prototype.onmousedown = function (e) {
        /*
        //
        // TODO: move this to the controllers
        //
        if (!this.loaded) return;
        if (!this.gamestarted || this.gameover) {
            if (this.gameover) {
                var goto = []
                if (this.gamestate.isWon() && this.gamestate.win.goto) {
                    goto = this.gamestate.win.goto.subject && this.gamestate.win.goto.subject != undefined ? this.gamestate.win.goto.subject.toString().split("|") : [];
                } else if (this.gamestate.isLost() && this.gamestate.loose.goto) {
                    goto = this.gamestate.loose.goto.subject && this.gamestate.loose.goto.subject != undefined ? this.gamestate.loose.goto.subject.toString().split("|") : [];
                }
                if (goto.length >= 3) {
                    this.game.loadlevel(goto[0]);
                    return;
                }
            }
            this.play();
        } else {
            if (this.avatar) this.avatar.onmousedown(e);
        }
        */
    }

    Level.prototype.onmouseup = function (e) {
        //if (this.loaded && this.avatar) this.avatar.onmouseup(e);
    }

    Level.prototype.onmousemove = function (e) {
        //if (this.loaded && this.avatar) this.avatar.onmousemove(e);
    }

    Level.prototype.onkeydown = function (e) {
        if (e.keyCode == 68 && e.shiftKey) this.world.toggledebugdraw();
         if (this.isplaying()) {
            this.keys[e.keyCode] = true;
        }
    }

    Level.prototype.onkeyup = function (e) {
        this.keys[e.keyCode] = false;
     }

    Level.prototype.ontouchstart = function (e) {
        e.preventDefault();
        if (this.gameover) {
            this.reset();
        } else if (!this.gamestarted) {
            this.gamestarted = true;
            this.timer.start();
        } else {
            this.keys[32] = true;
        }
    }

    Level.prototype.ontouchmove = function (e) {
        e.preventDefault();
    }

    Level.prototype.ontouchend = function (e) {
        e.preventDefault();
        this.keys[32] = false;
    }
    //
    // editing 
    // TODO: should perhaps move these to localplay.game.controller.editor
    //
    Level.prototype.replaceavatar = function (url) {
        var oldAvatar = this.avatar;
        oldAvatar.sprite.destroy();
        this.avatar = new Avatar(this.game.level, url, oldAvatar.homeposition);
        this.reserialise();
    }

    Level.prototype.removesprite = function (sprite) {
        if (this.isAvatar(sprite.body)) { // we can't remove the avatar ( so don't try )
            return false;
        }

        if (sprite.userdata !== undefined && sprite.userdata) {
            if (this.removeitem(sprite.userdata)) {
                this.reserialise();
                return true;
            }
        }
        return false;
    }


    Level.prototype.newitem = function (type, url, position) {
        this.additem(localplay.game.item.createitem(this, type,
            { image : url, position : position }));
    }
    //
    // gameplay support
    //
    Level.prototype.replaceobstacle = function (media, substitute) {
        for (var i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i].image === media) {
                //
                // TODO: when items are mutable just mutate
                //
                var position = new Point(this.obstacles[i].sprite.position.x, this.obstacles[i].sprite.position.y);
                var properties = {
                    image: substitute,
                    position: position
                };
                //localplay.log("replacing obstacle " + i + " at " + position.tostring());
                this.addonnextupdate.push(localplay.game.item.createitem(this, "prop", properties, true));
                this.removeonnextupdate.push(this.obstacles[i]);
                break;
            }
        }
    }

    Level.prototype.nearestitemtoavatar = function (media, type) {
        var collection = this.containerfromitemtype(type);
        var a = new Point(this.avatar.sprite.position.x, this.avatar.sprite.position.y);
        var b = new Point();
        var nearest = -1;
        var distance = 0.0;
        for (var i = 0; i < collection.length; i++) {
            if (collection[i].image === media) {
                b.set(collection[i].sprite.position.x, collection[i].sprite.position.y);
                var d = a.distance(b);
                if (nearest == -1 || d < distance) {
                    nearest = i;
                    distance = d;
                }
            }
        }
        if (nearest >= 0) {
           return(collection[nearest]);
        }
        return null;
    }

    Level.prototype.removenearestitem = function (media, type) {
        var item = this.nearestitemtoavatar(media, type);
        if (item) {
            this.removeonnextupdate.push(item);
        }
    }

    Level.prototype.replacenearestitem = function (media, type, withmedia, astype) {
        var item = this.nearestitemtoavatar(media, type);
        if (item) {
            //
            // 
            //
            var position = new Point(item.sprite.position.x, item.sprite.position.y);
            var properties = {
                image: withmedia,
                position: position,
                scale: item.scale,
                rotation: item.rotation
            };
            this.addonnextupdate.push(localplay.game.item.createitem(this, astype, properties, true));
            this.removeonnextupdate.push(item);
        }
    }


    Level.prototype.droppickup = function (media) {
        var item = this.avatar.droppickup(media);
        if (item) {
            this.addonnextupdate.push(item);
        }
    }
    Level.prototype.pickup = function (item) {
        this.avatar.hitpickup = true;
        this.avatar.addpickup(item);
    }

    //
    // gameplay utilities
    //
    Level.prototype.getTypeOfMedia = function (media) {
        var types = [ "platform", "pickup", "obstacle", "goal", "prop" ];
        for (var i = 0; i < types.length; i++) {
            if (this.countInstancesOfMediaForObjectOfType(types[i], media) > 0) return types[i];
        }
        return null;
    }

    Level.prototype.getUniqueMedia = function (type) {
        var types = ["platform", "pickup", "obstacle", "goal", "prop"];
        var media = {};
        for (var i = 0; i < types.length; i++) {
            var mediaoftype = this.getUniqueMediaForObjectOfType(type[ i ]);
            if ( mediaoftype.length > 0 ) {
                media[type[ i ]] = mediaoftype;
            }
        }
        return media;
    }

    Level.prototype.getUniqueMediaForObjectOfType = function (type) {
        var media = [];

        var source = this.containerfromitemtype(type);
        if (source) {
            for (var i = 0; i < source.length; i++) {
                var url = localplay.domutils.urlToRelativePath(source[i].image);
                if (url != null && media.indexOf(url) == -1) {
                    media.push(url);
                }

            }
        }
        return media;
    }

    Level.prototype.countInstancesOfMediaForObjectOfType = function (type, mediaUrl) {
        var count = 0;
        var source = this.containerfromitemtype(type);
        if (source) {
            for (var i = 0; i < source.length; i++) {
                var url = localplay.domutils.urlToRelativePath(source[i].image);
                if (url === mediaUrl) count++;
            }
        }
        return count;
    }

    Level.prototype.getInstancesOfMediaForObjectOfType = function (type, mediaUrl) {
        var instances = [];
        var source = this.containerfromitemtype(type);
        if (source) {
            for (var i = 0; i < source.length; i++) {
                var url = localplay.domutils.urlToRelativePath(source[i].image);
                if (url === mediaUrl) instances.push(source[i]);
            }
        }
        return instances;
    }

    Level.prototype.buildGameplayFromLevel = function () {
        this.gameplay.clear();
        //
        // 
        //
        var pickups = this.getUniqueMediaForObjectOfType("pickup");
        var obstacles = this.getUniqueMediaForObjectOfType("obstacle");
        var goals = this.getUniqueMediaForObjectOfType("goal");
        //
        // add win for all pickups
        //
        var sentence;
        if (pickups.length > 0) {
            for (var i = 0; i < pickups.length; i++) {
                sentence = this.gameplay.addSentence("newwin");
                sentence.addClause("collecting", pickups[i]);
                sentence.addClause("count", this.countInstancesOfMediaForObjectOfType("pickup", pickups[i]));
            }
        }
        //
        // add win by reaching
        //
        if (goals.length > 0) {
            for (var i = 0; i < goals.length; i++) {
                sentence = this.gameplay.addSentence("newwin");
                sentence.addClause("reaching", goals[i]);
            }
        }
        //
        // add lose for all obstacles
        //
        if (obstacles.length > 0) {
            for (var i = 0; i < obstacles.length; i++) {
                sentence = this.gameplay.addSentence("newlose");
                sentence.addClause("colliding with", obstacles[i]);
                sentence.addClause("count", 1);
            }
        } 
        //
        // add default timeout
        //
        sentence = this.gameplay.addSentence("newlose");
        sentence.addClause("longer than", 60.0);
        /*
        if (pickups.length > 0) {
            var count = 0;
            for (var i = 0; i < pickups.length; i++) {
                var sentence = this.gameplay.addSentence("collect");
                sentence.addClause("collect", pickups[i]);
                count += this.countInstancesOfMediaForObjectOfType("pickup", pickups[i]);
            }
            if (goals.length == 0) {
                var win = this.gameplay.addSentence("win");
                win.addClause("collecting", count);
            }
        }
        
        //
        // add avoids and loose by colliding for all unique obstacles
        //
        if (obstacles.length > 0) {
            var count = 0;
            for (var i = 0; i < obstacles.length; i++) {
                var sentence = this.gameplay.addSentence("avoid");
                sentence.addClause("avoid", obstacles[i]);
                count += this.countInstancesOfMediaForObjectOfType("obstacle", obstacles[i]);
            }
            var loose = this.gameplay.addSentence("loose");
            loose.addClause("colliding", 1);
        } else {
            //
            // add loose by timing out
            //
            var loose = this.gameplay.addSentence("loose");
            loose.addClause("longer than", 60.0);
        }
        //
        // add win by reaching
        //
        if (goals.length > 0) {
            for (var i = 0; i < goals.length; i++) {
                var sentence = this.gameplay.addSentence("win");
                sentence.addClause("reaching", goals[i]);
            }
        }
        */
    }
    //
    // external controller interface
    //
    Level.prototype.ongameover = function () {

    }
    Level.prototype.ongamestart = function () {

    }

    Level.prototype.play = function () {
        this.paused = false;
        this.trackavatar = true;
        if (this.gameover) {
            this.reset();
        }
        if (!this.gamestarted) {
            this.gamestarted = true;
            this.timer.start();
            this.ongamestart();
            if (this.musicplayer) {
                this.musicplayer.play();
            }
            this.setstate(level.states.playing);
        }

    }

    Level.prototype.pause = function (pause) {
        this.paused = pause === undefined | pause;
        this.timer.pause(this.paused);
        if (this.musicplayer) {
            if (this.paused) {
                this.musicplayer.pause();
            } else {
                this.musicplayer.play();
            }
        }

    }

    Level.prototype.togglepause = function () {
        this.pause(!this.paused);
    }
    Level.prototype.isplaying = function () {
        return !this.gameover && this.gamestarted;
    }

    Level.prototype.countitems = function () {
        var count = this.pickups.length + this.obstacles.length + this.goals.length + this.platforms.length;
        return count;
    }
    //
    //
    //
    level.createlevel = function (game) {
        return new Level(game);
    }

    return level;
})();
