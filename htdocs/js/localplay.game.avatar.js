//
// Avatar
//
;
localplay.game.avatar = (function () {
    if (localplay.game.avatar) return localplay.game.avatar;

    var avatar = {};

    function Avatar(level, properties) {
        this.level = level;
        this.homeposition = properties.position;
        this.image = properties.image;
        this.scale = properties.scale ? parseFloat(properties.scale) : 1.0;
        this.rotation = properties.rotation ? parseFloat(properties.rotation) : 0.0;
        this.gravityscale = properties.gravityscale && !isNaN(properties.gravityscale) ? parseFloat(properties.gravityscale) : 1.0;

        this.canjump = properties.canjump ? parseInt(properties.canjump) : 1;
        this.maximpulse = new this.level.world.b2Vec2(20, 30);
        this.movementscaler = 1.0;
        //
        //
        //
        this.aabb = new Rectangle();
        this.sprite = null;
        this.creatsprite();
        //
        //
        //
        this.impulse = new this.level.world.b2Vec2(0, 0);
        this.correctionalforce = new this.level.world.b2Vec2(0, 0);
        this.offscreen = false;
        this.onplatform = 0;
        this.hitgoal = false;
        this.hitobstacle = false;
        this.pickups = [];
        this.score = 0; // TODO: move scoring to gamestate
        this.currentcollisions = [];
        this.currentcollisionscount = [];
    }
    Avatar.prototype.creatsprite = function () {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
        this.sprite = localplay.sprite.createsprite(this.level.world, this.homeposition, this.image, 'dynamic', true, true, this.rotation, this.scale);
        this.sprite.setgravityscale(this.gravityscale);
        this.sprite.zindex = 10000;
        this.sprite.userdata = this;
    }

    Avatar.prototype.isloaded = function () {
        return (this.sprite && this.sprite.isloaded());
    }
    Avatar.prototype.sethometocurrentposition = function () {
        this.homeposition = new Point(this.sprite.position.x, this.sprite.position.y);
    }

    Avatar.prototype.toJSON = function () {
        return this.tostring();
    }

    Avatar.prototype.tostring = function () {
        return '"avatar" : { "image" : "' + this.image + '", "position" : "' + this.homeposition.tostring() + '", "scale" : "' + this.scale + '", "rotation" : "' + this.rotation + '", "gravityscale" : "' + this.gravityscale + '", "canjump" : "' + this.canjump + '" }';
    }

    Avatar.prototype.beginCollision = function (other) {
        var index = this.currentcollisions.indexOf(other);
        if (index >= 0) {
            this.currentcollisionscount[index]++;
        } else {
            this.currentcollisions.push(other);
            this.currentcollisionscount.push(1);
        }
    }

    Avatar.prototype.endCollision = function (other) {
        var index = this.currentcollisions.indexOf(other);
        if (index >= 0) {
            if (--this.currentcollisionscount[index] <= 0) {
                this.currentcollisions.splice(index, 1);
                this.currentcollisionscount.splice(index, 1);
            }
        }
    }

    Avatar.prototype.isCollidingWith = function (other) {
        return this.currentcollisions.indexOf(other) >= 0;
    }

    Avatar.prototype.isOnPlatform = function () {
        var on = false;
        for (var i = 0; i < this.currentcollisions.length; i++) {
            if (this.level.isPlatform(this.currentcollisions[i]) || this.level.isWorldGround(this.currentcollisions[i])) {
                on = true;
                break;
            }
        }
        if (on) {
            var scale = Math.min(1.0, this.sprite.world.fps / this.sprite.world.targetfps);
            this.onplatform = Math.round(10 * scale); // allow 10 frames TODO: this should be time rather than count based
        }
        return on || this.onplatform > 0;
    }

    Avatar.prototype.applyimpulse = function (p) {
        var scale = 1.0;
        if (this.sprite) {
            scale = Math.min(1.0, this.sprite.world.fps / this.sprite.world.targetfps);
        }
        if (p.x < 0 || p.x > 0) {
            this.impulse.x = (p.x * this.maximpulse.x * this.movementscaler) * scale;
        } else {
            this.impulse.x = 0;
        }
        if ((p.y < 0 || p.y > 0) && this.canjump && this.isOnPlatform()) {
            this.impulse.y = (p.y * this.maximpulse.y * this.movementscaler) * scale;
        } else {
            this.impulse.y = 0;
        }
    }

    Avatar.prototype.update = function (time) {
        //
        // update animation and state
        //
        if (this.sprite) {
            var velocity = this.sprite.getlinearvelocity();
            if (this.sprite.isloaded()) {
                if (!this.sprite.body.IsBullet()) {
                    this.sprite.body.SetBullet(true);
                }
                if (!this.isOnPlatform()) {
                    //
                    // in the air
                    //
                    this.sprite.setfriction(0);
                    //
                    //
                    //
                    if (velocity.y > 0.0) {
                    }
                } else {
                    //
                    // grounded stick to platform when not being pushed
                    //
                    if (this.impulse.Length() > 0) {
                        this.sprite.setfriction(0.2);
                    } else {
                        this.sprite.setfriction(1000);
                    }
                }
            }

            if (this.impulse.Length() > 0.0) {
                this.sprite.applycentralimpulse(this.impulse);
                //
                // cap velocity
                //
                if (velocity.x > 8.0) {
                    velocity.x = 8.0;
                } else if (velocity.x < -8.0) {
                    velocity.x = -8.0;
                }

                if (velocity.y < -16.0) {
                    velocity.y = -16.0;
                }
                this.sprite.setlinearvelocity(velocity);
            }
            var rotation = this.sprite.getrotation();
            if (rotation > 0.5 || rotation < -0.5) {
                //localplay.log('rotation:' + rotation);
                //rotation *= 0.99;
                //this.sprite.setrotation(rotation);
                //this.sprite.applytorque(rotation < 0.0 ? 20.0 : -20.0);
            }
            //
            // update bounds
            //
            var aabb = this.sprite.getAABB();
            this.aabb.x = aabb.x;
            this.aabb.y = aabb.y;
            this.aabb.width = aabb.width;
            this.aabb.height = aabb.height;
            var actual = this.aabb.getcenter();
            //
            // apply correctional force to keep sprite onscreen
            // TODO: Look into sensors for this
            //
            var margin = 10.0;
            var force = 60.0;
            var worldbounds = this.level.background.getbounds();
            this.correctionalforce.SetZero();
            this.offscreen = false;
            if (this.aabb.x < worldbounds.x - margin) {
                this.aabb.x += worldbounds.x - this.aabb.x;
                this.offscreen = true;
            } else if ((this.aabb.x + this.aabb.width) > worldbounds.x + worldbounds.width + margin) {
                this.aabb.x -= (this.aabb.x + this.aabb.width) - worldbounds.x + worldbounds.width;
                this.offscreen = true;
            }
            if (this.aabb.y < worldbounds.y - margin) {
                this.aabb.y += worldbounds.y - this.aabb.y;
                this.offscreen = true;
            } else if ((this.aabb.y + this.aabb.height) > worldbounds.y + worldbounds.height + margin) {
                this.aabb.y -= (this.aabb.y + this.aabb.height) - worldbounds.y + worldbounds.height;
                this.offscreen = true;
            }
            if (this.offscreen) {
                var desired = this.aabb.getcenter();
                var d = desired.subtract(actual);
                force = (d.length() * 0.01) * this.sprite.world.scale;
                d.normalise();
                this.correctionalforce.x = d.x * force;
                this.correctionalforce.y = d.y * force;
                this.correctionalforce
                this.sprite.applyforce(this.correctionalforce);
            }
        }
        this.onplatform--;
    }

    Avatar.prototype.draw = function () {
    }

    Avatar.prototype.shadowcolour = function () {
        return 'rgba(0, 0, 0, 0.25)';
    }

    Avatar.prototype.addpickup = function (pickup) {
        if (this.pickups.indexOf(pickup) < 0) {
            this.score += 10; // default score for now
            this.pickups.push(pickup);
        }
    }

    Avatar.prototype.droppickup = function (media) {
        for (var i = 0; i < this.pickups.length; i++) {
            if (this.pickups[i].image === media) {
                var pickup = this.pickups[i];
                this.pickups.splice(i, 1);
                return pickup;
            }
        }
        return null;
    }
    //
    // event handling
    //
    Avatar.prototype.onmousedown = function (e) {

    }

    Avatar.prototype.onmouseup = function (e) {

    }

    Avatar.prototype.onmousemove = function (e) {

    }

    Avatar.prototype.onkeydown = function (e) {
        switch (e.keyCode) {
            case 37:
                // left
                this.impulse.x = -20.0;
                break;
            case 39:
                // right
                this.impulse.x = 20.0;
                break;
            case 32:
                // space
                if (this.onplatform > 0) this.impulse.y = -50.0;
                break;
        }
    }

    Avatar.prototype.onkeyup = function (e) {

    }

    Avatar.prototype.geteditor = function () {
        var _this = this;
        var container = document.createElement("div");
        container.style.padding = "32px";
        //
        //
        //
        var image = new Image();
        image.id = "item.property.image";
        image.classList.add("imagebutton");
        image.classList.add("backgroundgrid");
        image.style.maxWidth = "200px";
        image.style.height = "auto";
        image.style.padding = "4px";
        image.style.margin = "16px";
        //image.style.backgroundImage = "url( ../images/icons/transparency.png )";
        image.onload = function (e) {
            _this.replacesprite(e.target.src);
            _this.level.reserialise();
        }
        var change = function (e) {
            //
            // show media library
            //
            var contents = "getmedia.php?type=object&listview=true";
            localplay.listview.createlibrarydialog("Choose your Avatar", contents, function (item) {
                image.src = item.data.url;
            }, 20, "",
            function (controller) {
                var objecteditor = localplay.objecteditor.createobjecteditor("Add Avatar", function () {
                    controller.refresh();
                });
            }, "Upload drawings of avatars");
        }
        image.src = this.image;
        image.onclick = change;
        container.appendChild(image);
        container.appendChild(document.createElement('br'));
        var prompt = document.createElement("div");
        prompt.className = "menubaritem";
        prompt.innerHTML = '\
                <img class="menubaritem" src="images/icons/edit-01.png" />&nbsp;Change image \
            ';
        prompt.onclick = change;
        container.appendChild(prompt);
        //
        //
        //
        var gravity = document.createElement("div");
        gravity.innerHTML = "<h3>Weight</h3>";
        var slider = document.createElement("input");
        slider.type = "range";
        slider.style.width = "200px";
        slider.style.height = "30px";
        slider.min = -25;
        slider.max = 200;
        slider.value = Math.round(this.gravityscale * 100);
        slider.onchange = function (e) {
            var value = e.target.value;
            _this.gravityscale = value / 100.0;
            if (_this.sprite) {
                _this.sprite.setgravityscale(_this.gravityscale);
            }
        };
        gravity.appendChild(slider);
        container.appendChild(gravity);
        if (slider.type == "text") {
           localplay.domutils.createSlider(slider);
        }
        var reset = document.createElement("div");
        reset.className = "menubaritem";
        reset.innerHTML = '\
                <img class="menubaritem" src="images/icons/add-01.png" />&nbsp;Reset weight \
            ';
        reset.onclick = function (e) {
            _this.gravityscale = 1.0;
            slider.value = 100;
        };
        container.appendChild(reset);

        return container;
    }

    Avatar.prototype.initialiseeditor = function () {
    }
    Avatar.prototype.closeeditor = function () {
    }

    Avatar.prototype.replacesprite = function (src) {
        var media = localplay.domutils.urlToRelativePath(src);
        if (media !== this.image) {
            this.image = media;
            this.creatsprite();
            this.level.reserialise();
        }
    }

    avatar.createavatar = function (level, properties) {
        return new Avatar( level, properties );
    }

    return avatar;
})();