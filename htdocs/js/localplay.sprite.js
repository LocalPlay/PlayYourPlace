;
localplay.sprite = (function () {
    if (localplay.sprite) return localplay.sprite;
    //
    //
    //
    var sprite = {};

    function Sprite(world, position, imageUrl, type, fixedrotation, active, rotation, scale, edgeshape) {
        this.world = world;
        this.image = null;
        this.body = null;
        this.next = null;
        this.prev = null;
        this.userdata = null;
        this.imageUrl = imageUrl;
        this.edgeshape = edgeshape;
        //
        // initialise transformation
        //
        this.position = new this.world.b2Vec2(position.x, position.y);
        this.previousposition = new this.world.b2Vec2(position.x, position.y);
        this.rotation = rotation ? rotation : 0.0;
        this.previousrotation = rotation ? rotation : 0.0;
        this.scale = scale ? scale : 1.0;
        this.zindex = 0;
        this.gravityscale = 1.0;
        //
        //
        //
        this.aabb = new Rectangle();
        this.triangles = [];
        this.points = [];
        //
        //
        //
        this.type = type;
        this.fixedrottation = (fixedrotation !== undefined) && fixedrotation;
        this.active = (active === undefined) || active;
        //
        //
        //
        this.shadowtransform = new Transform();
        this.shadowtransform.rotate(0.05);
        this.shadow = new Point(10, 10);
        //
        // create image and download
        //
        this.destroyed = false;
        this.loadimage();
        //
        // initialise editing 
        // TODO: this should probably be in a mutable version of sprite which handles the relationship between this and its item
        //
        this.editing = false;
        this.editRotation = 0;
        this.editScale = 1.0;
        this.editPosition = new Point();
        this.aabblisteners = [];
    }

    Sprite.prototype.loadimage = function () {
        //
        // create image and download
        //
        var _this = this;
        this.image = new Image();
        this.image.onload = function () {
            if (_this.destroyed) return;
            if (_this.scale > 1.0 || _this.scale < 1.0) {
                localplay.imageprocessor.resizeImage(_this.image, _this.scale, function (scaledimage) {
                    _this.image = scaledimage;
                    _this.setup();
                });
            } else {
                _this.setup();
            }
        };
        this.image.onerror = function () {
            //
            // TODO: need  coherent response to this. At the moment it just is not added to the world
            //
        };
        this.image.src = this.imageUrl;

    }

    Sprite.prototype.replaceimage = function (imageUrl) {
        this.imageUrl = imageUrl;
        this.loadimage();
    }

    Sprite.prototype.beginedit = function () {
        this.editing = true;
        this.editRotation = 0;
        this.editScale = 1.0;
        this.editPosition.x = this.position.x;
        this.editPosition.y = this.position.y;
    }

    Sprite.prototype.canceledit = function () {
        this.editing = false;
    }

    Sprite.prototype.commitedit = function () {
        var reloaded = false;
        this.editing = false;
        this.position.x = this.editPosition.x;
        this.position.y = this.editPosition.y;

        this.rotation += this.editRotation;
        if (this.editScale > 1.0 || this.editScale < 1.0) {
            this.scale *= this.editScale;
            this.loadimage();
            reloaded = true;
        }

        if (this.userdata) {
            this.userdata.rotation = this.rotation;
            this.userdata.scale = this.scale;
            this.userdata.sethometocurrentposition();
        }

        if (this.body && !reloaded) {
            this.body.SetPositionAndAngle(this.world.screenToWorld(this.position), this.rotation);
        }
        //
        //
        //
        this.getAABB(true);
    }

    Sprite.prototype.isloaded = function () {
        return (this.image && this.image.complete && this.body);
    }

    Sprite.prototype.setup = function () {
        if (this.body) {
            this.world.removeSprite(this);
        }
        //
        //
        //
        if (this.edgeshape) {
            this.points = localplay.imageprocessor.findContours(this.image, false);
        } else {
            this.triangles = localplay.imageprocessor.findContours(this.image, true);
        }
        //
        // create body
        //
        this.world.addSprite(this);
        if (this.body) {
            this.body.SetFixedRotation(this.fixedrottation);
            this.body.SetActive(this.active);
            this.body.SetUserData(this);
            this.body.SetAngle(this.rotation);
            this.getAABB(true);
        }
    }

    Sprite.prototype.destroy = function () {
        this.destroyed = true;
        this.world.removeSprite(this);
    }

    Sprite.prototype.resetpreviousstate = function () {
        var position = this.world.worldToScreen(this.body.GetPosition());
        this.position.x = this.previousposition.x = position.x;
        this.position.y = this.previousposition.y = position.y;
        //this.rotation = this.previousrotation = this.body.GetAngle();
    }

    Sprite.prototype.preupdate = function () {
        if (this.gravityscale > 1.0 || this.gravityscale < 1.0) {
            if (!this.gravitationalforce) {
                this.gravitationalforce = this.world.world.GetGravity().Copy();
                this.gravitationalforce.x *= this.gravityscale;
                this.gravitationalforce.y *= this.gravityscale;
            }
            this.applyforce(this.gravitationalforce);
        }
    }

    Sprite.prototype.update = function (dtAccumilatorRatio) {
        this.previousposition.x = this.position.x;
        this.previousposition.y = this.position.y;
        this.previousrotation = this.rotation;
        if (dtAccumilatorRatio) {
            //
            // TODO: interpolate from previous state
            //
            var oneMinusDtAccumilatorRatio = 1.0 - dtAccumilatorRatio;
            var position = this.world.worldToScreen(this.body.GetPosition());
            this.position.x = dtAccumilatorRatio * position.x + (oneMinusDtAccumilatorRatio * this.previousposition.x);
            this.position.y = dtAccumilatorRatio * position.y + (oneMinusDtAccumilatorRatio * this.previousposition.y);
            //this.rotation =  dtAccumilatorRatio * this.body.GetAngle() + (oneMinusDtAccumilatorRatio * this.previousrotation);
        } else {
            if (this.body) {
                this.position = this.world.worldToScreen(this.body.GetPosition());
                //this.rotation = this.body.GetAngle();
            }
            this.shadowtransform.transformPoint(this.shadow);

        }
        //
        // update AABB
        //
        this.getAABB(true);
    }

    Sprite.prototype.draw = function () {
        var context = this.world.context;
        var size = new this.world.b2Vec2(this.image.naturalWidth, this.image.naturalHeight);
        var rotation = this.rotation;
        var position = this.position;
        if (this.editing) {
            rotation += this.editRotation;
            size.x *= this.editScale;
            size.y *= this.editScale;
            position = this.editPosition;
        }

        context.save();
        context.translate(position.x, position.y);
        context.rotate(rotation);
        context.translate(-(size.x / 2), -(size.y / 2));
        //
        // TODO: this is a candidate for optimisation
        //
        if (this.userdata) {
            context.shadowColor = this.userdata.shadowcolour();
        } else {
            context.shadowColor = 'rgba(0,0,0,0.25)';
        }
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.shadowBlur = 4 + Math.abs(this.shadow.x);

        context.drawImage(this.image, 0, 0, size.x, size.y);
        context.restore();
    }

    //
    // transform
    //
    Sprite.prototype.getrotation = function () {
        /*
        if (this.body != null) {
            return this.body.GetAngle();
        }
        */
        return this.rotation;
    }

    Sprite.prototype.setrotation = function (rotation) {
        if (this.rotation !== rotation) {
            this.rotation = rotation;
            if (this.body != null) {
                this.body.SetAngle(this.rotation);
            }
        }
    }

    Sprite.prototype.getscale = function () {
        return scale;
    }

    Sprite.prototype.setscale = function (scale) {
        if (this.scale !== scale) {
            this.scale = scale;
            if (this.body) { // TODO: recreate the body

            }
        }
    }

    Sprite.prototype.moveto = function (p) {
        var tp = this.world.screenToWorld(p);
        if (this.body != null) {
            this.body.SetPosition(tp);
            this.update();
        }
    }

    Sprite.prototype.moveby = function (d) {
        var td = this.world.screenToWorld(d);
        if (this.body != null) {
            var p = this.body.GetPosition();
            p.x += td.x;
            p.y += td.y;
            this.body.SetPosition(p);
            this.update();
        }
    }
    //
    // forces
    //
    Sprite.prototype.getlinearvelocity = function () {
        if (this.body != null) {
            return this.body.GetLinearVelocity();
        }
        return new this.world.b2Vec2(0, 0);
    }

    Sprite.prototype.setlinearvelocity = function (velocity) {
        if (this.body != null) {
            return this.body.SetLinearVelocity(velocity);
        }
    }

    Sprite.prototype.applycentralimpulse = function (impulse) {
        if (this.body != null) {
            /*
            var i = this.world.screenToWorld(impulse);
            var c = this.world.screenToWorld(this.position);
            */
            var c = this.body.GetPosition();
            var i = impulse;
            var massData = new this.world.b2MassData();
            this.body.GetMassData(massData);
            c.x += massData.center.x;
            c.y += massData.center.y;
            this.body.ApplyImpulse(i, c);
        }
    }

    Sprite.prototype.applyforce = function (force) {
        var c = this.body.GetPosition();
        var massData = new this.world.b2MassData();
        this.body.GetMassData(massData);
        c.x += massData.center.x;
        c.y += massData.center.y;
        this.body.ApplyForce(force, c);
    }

    Sprite.prototype.applytorque = function (torque) {
        if (this.body != null) {
            this.body.ApplyTorque(torque);
        }
    }

    Sprite.prototype.setfixedrotation = function (fixed) {
        if (this.body != null) {
            this.body.SetFixedRotation(fixed);
        }
    }
    //
    //
    //
    Sprite.prototype.setfriction = function (friction) {
        if (this.body) {
            var fixture = this.body.m_fixtureList;
            while (fixture) {
                fixture.SetFriction(friction);
                fixture = fixture.m_next;
            }
        }
    }
    Sprite.prototype.setgravityscale = function (gravityscale) {
        this.gravityscale = gravityscale;
        if (this.gravitationalforce) {
            delete this.gravitationalforce;
            this.gravitationalforce = null;
        }
    }
    //
    //
    //
    Sprite.prototype.getAABB = function (update) {
        if (this.body != null && update) {
            if (!this.body.IsActive()) {
                var halfwidth = (this.image.naturalWidth / 2);
                var halfheight = (this.image.naturalHeight / 2);
                var corners = [];
                corners.push(new Point(-halfwidth, -halfheight)); // top left
                corners.push(new Point(halfwidth, -halfheight)); // top right
                corners.push(new Point(-halfwidth, halfheight)); // bottom left
                corners.push(new Point(halfwidth, halfheight)); // botton right
                var t = new Transform();
                t.rotate(this.rotation);
                var pmin = new Point(Number.MAX_VALUE.valueOf(), Number.MAX_VALUE.valueOf());
                var pmax = new Point(Number.MIN_VALUE.valueOf(), Number.MIN_VALUE.valueOf());
                for (var i = 0; i < 4; i++) {
                    t.transformPoint(corners[i]);
                    if (corners[i].x < pmin.x) pmin.x = corners[i].x;
                    if (corners[i].y < pmin.y) pmin.y = corners[i].y;
                    if (corners[i].x > pmax.x) pmax.x = corners[i].x;
                    if (corners[i].y > pmax.y) pmax.y = corners[i].y;
                }
                this.aabb.x = pmin.x + this.position.x;
                this.aabb.y = pmin.y + this.position.y;
                this.aabb.width = pmax.x - pmin.x;
                this.aabb.height = pmax.y - pmin.y;
            } else {
                var aabb = new this.world.b2AABB();
                aabb.lowerBound.Set(Number.MAX_VALUE, Number.MAX_VALUE);
                aabb.upperBound.Set(Number.MIN_VALUE, Number.MIN_VALUE);
                var fixture = this.body.GetFixtureList();
                while (fixture != null) {
                    aabb.Combine(aabb, fixture.GetAABB());
                    fixture = fixture.GetNext();
                }

                var topleft = this.world.worldToScreen(aabb.lowerBound);
                var bottomright = this.world.worldToScreen(aabb.upperBound);
                this.aabb.x = topleft.x;
                this.aabb.y = topleft.y;
                this.aabb.width = bottomright.x - topleft.x;
                this.aabb.height = bottomright.y - topleft.y;
            }
            this.informAABBListeners();
        }
        return this.aabb;
    }

    Sprite.prototype.isPointInAABB = function (p) {
        return this.getAABB().contains(p);
    }

    Sprite.prototype.addAABBListener = function (listener) {
        if (this.aabblisteners.indexOf(listener) === -1) {
            this.aabblisteners.push(listener);
        }
    }

    Sprite.prototype.removeAABBListener = function (listener) {
        var i = this.aabblisteners.indexOf(listener);
        if (i !== -1) {
            this.aabblisteners.splice(i, 1);
        }
    }

    Sprite.prototype.informAABBListeners = function () {
        for (var i = 0; i < this.aabblisteners.length; i++) {
            this.aabblisteners[i](this);
        }
    }
    //
    //
    //
    sprite.createsprite = function (world, position, imageUrl, type, fixedrotation, active, rotation, scale, edgeshape) {
        return new Sprite(world, position, imageUrl, type, fixedrotation, active, rotation, scale, edgeshape);
    }
    //
    //
    //
    return sprite;
})();


