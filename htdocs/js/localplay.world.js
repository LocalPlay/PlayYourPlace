;
localplay.world = (function () {
    if (localplay.world) return localplay.world;
    //
    //
    //
    var world = {};

    function World(listener) {
        //
        // initialise common Box2D object shortcuts
        //
        this.b2Vec2 = Box2D.Common.Math.b2Vec2;
        this.b2BodyDef = Box2D.Dynamics.b2BodyDef;
        this.b2Body = Box2D.Dynamics.b2Body;
        this.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
        this.b2Fixture = Box2D.Dynamics.b2Fixture;
        this.b2World = Box2D.Dynamics.b2World;
        this.b2MassData = Box2D.Collision.Shapes.b2MassData;
        this.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
        this.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
        this.b2ChainShape = Box2D.Collision.Shapes.b2ChainShape;
        this.b2AABB = Box2D.Collision.b2AABB;
        this.b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
        this.b2ContactListener = Box2D.Dynamics.b2ContactListener;
        //
        //
        //
        this.world = null;
        this.ground = null;
        this.bounds = null;
        /*
        this.sprites = null;
        this.lastsprite = null;
        */
        this.operationqueue = [];
        this.sprites = [];
        this.basescale = 30.0;
        this.scale = 30.0;
        this.drawdebug = false;
        this.viewport = new Rectangle();
        this.fps = 60.0;
        this.targetfps = 60.0;
        this.lasttime = -1;
        this.dtaccumilator = 0;
        this.timestep = 1 / this.targetfps;
        this.maxsteps = 5;
        this.steps = 1;
        this.fixframerate = false;
        //
        //
        //
        this.setup(listener);
    }

    World.prototype.setcanvas = function (canvas) {
        //
        // store context
        //
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        //
        // initialise viewport
        //
        this.viewport.set(0, 0, this.canvas.width, this.canvas.height);
        //
        // set default scale
        //
        this.setscale(this.canvas.height / localplay.defaultsize.height);
        //
        // redirect dubug draw
        //
        var debugDraw = this.world.m_debugDraw;
        debugDraw.SetSprite(this.context);
        debugDraw.SetDrawScale(this.scale);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(this.b2DebugDraw.e_shapeBit | this.b2DebugDraw.e_jointBit | this.b2DebugDraw.e_centerOfMassBit);
    }

    World.prototype.reset = function () {
        this.fps = 60.0;
        this.lasttime = -1;
        this.dtaccumilator = 0;
        this.steps = 1;
        this.sprites = [];
        this.operationqueue = [];
        //this.world.GetBodyList();
    }

    World.prototype.setscale = function (scale) {
        this.scale = this.basescale * scale;
    }

    World.prototype.setup = function (listener) {
        //
        // create Box2D world
        //
        //this.world = new this.b2World(new this.b2Vec2(0, 10.0));
        this.world = new this.b2World(new this.b2Vec2(0, 20.0));
        //
        // initialise debug drawing
        //
        this.world.SetDebugDraw(new this.b2DebugDraw());
        //
        // initialise collision handling
        //
        if (listener != undefined) {
            var _listener = new this.b2ContactListener;
            _listener.BeginContact = function (contact) {
                listener.begincontact(contact);
            };
            _listener.EndContact = function (contact) {
                listener.endcontact(contact)
            };
            _listener.PreSolve = function (contact, oldManifold) {
                listener.presolve(contact, oldManifold);
            };
            _listener.PostSolve = function (contact, impulse) {
                listener.postsolve(contact, impulse);
            };
            this.world.SetContactListener(_listener);
        }
    }

    World.prototype.update = function () {
        var dt = 0;
        var thistime = new Date().getTime();
        if (this.lasttime < 0) {
            this.lasttime = thistime;
            this.fps = 60.0;
            return;
        } else {
            dt = (thistime - this.lasttime) / 1000.0;
            var fps = (1.0 / dt);
            this.fps = Math.max(15.0, Math.min((this.fps + fps) / 2.0, 60.0));
            this.lasttime = thistime;

        }

        if (this.world != null) {
            this.preupdateSprites();
            if (this.fixframerate) {
                this.dtaccumilator += 1.0 / this.fps;//dt;
                var steps = Math.floor(this.dtaccumilator / this.timestep);
                if (steps > 0) {
                    this.dtaccumilator -= steps * this.timestep;
                }
                steps = Math.max(1, Math.min(steps, this.maxsteps));
                for (var i = 0; i < steps; i++) {
                    // TODO: apply forces here
                    this.resetSpritesPreviousState();
                    this.world.Step(this.timestep,
                                        10, // velocity iterations
                                        10);// position iterations
                }
                var dtaccumilatorratio = this.dtaccumilator / this.timestep;
                this.updateSprites(dtaccumilatorratio);
                this.steps = steps;
            } else {
                this.world.Step(1.0 / this.fps, 10, 10);
                this.updateSprites();
            }
            this.world.ClearForces();
        }
    }


    World.prototype.draw = function () {
        if (this.world != null) {
            this.drawSprites();
            if (this.drawdebug) {
                this.context.save();
                this.context.translate(-this.viewport.x, -this.viewport.y);
                var scale = this.scale / this.basescale;
                this.context.scale(scale, scale);
                this.world.DrawDebugData();
                this.context.restore();
                var fps = "fps : " + Math.floor(this.fps) + " steps:" + this.steps;
                this.context.fillText(fps, 40, 40);
            }

        }
    }

    World.prototype.queueoperation = function (operation) {
        this.operationqueue.push(operation);
    }

    World.prototype.performqueuedoperations = function () {
        //
        //
        //
        while (this.operationqueue.length > 0) {
            var operation = this.operationqueue.pop();
            operation();
        }
    }

    World.prototype.toggledebugdraw = function () {
        this.drawdebug = !this.drawdebug;
    }
    //
    // sprite handling
    //
    World.prototype.addSprite = function (sprite) {
        //
        // queue sprite creation if world is locked
        //
        var _this = this;
        if (this.islocked()) {
            this.queueoperation(function () {
                _this.addSprite(sprite);
            });
        }
        //
        // create body 
        //
        var dim = this.screenToWorld(new this.b2Vec2(sprite.image.naturalWidth / 2.0, sprite.image.naturalHeight / 2.0));
        var bodyDef = new this.b2BodyDef();
        if (sprite.type === 'dynamic') {
            bodyDef.type = this.b2Body.b2_dynamicBody;
        } else if (sprite.type === 'kinematic') {
            bodyDef.type = this.b2Body.b2_kinematicBody;
        } else {
            bodyDef.type = this.b2Body.b2_staticBody;
        }
        bodyDef.position = this.screenToWorld(sprite.position);
        sprite.body = this.world.CreateBody(bodyDef);
        //
        // create fixture(s) from sprite image
        //
        if (false) { // TODO: implement box2d edge shape //sprite.edgeshape && sprite.points.length > 0) {

            var points = [];
            sprite.points.forEach(function (p) {
                points.push(_this.screenToWorld(new _this.b2Vec2(p.x, p.y)));
            });
            //var chain = this.chain.CreateChain(vs, 4); 
            var fixtureDef = new this.b2FixtureDef();
            fixtureDef.density = 1.0;
            fixtureDef.friction = 0.3;
            fixtureDef.restitution = 0.2;
            fixtureDef.shape = new this.b2PolygonShape;
            fixtureDef.shape.SetAsVector(points, 0);
            sprite.body.CreateFixture(fixtureDef);

        } else if (sprite.triangles.length > 0) {
            var c = new Point(0, 0);
            for (var i = 0; i < sprite.triangles.length; i++) {
                //
                // convert triangle into Box2D point array in world coordinates
                //
                var t = sprite.triangles[i];
                var points = [];
                points.push(this.screenToWorld(new this.b2Vec2(c.x + t.a.x, c.y + t.a.y)));
                points.push(this.screenToWorld(new this.b2Vec2(c.x + t.b.x, c.y + t.b.y)));
                points.push(this.screenToWorld(new this.b2Vec2(c.x + t.c.x, c.y + t.c.y)));
                //
                //
                //
                var fixtureDef = new this.b2FixtureDef();
                fixtureDef.density = 1.0 / sprite.triangles.length;
                fixtureDef.friction = 0.2;//0.3;
                fixtureDef.restitution = 0.2;
                fixtureDef.shape = new this.b2PolygonShape;
                //fixtureDef.shape.m_radius = 0.1;
                fixtureDef.shape.SetAsVector(points, 0);
                sprite.body.CreateFixture(fixtureDef);
            }
        } else {
            var fixtureDef = new this.b2FixtureDef();
            fixtureDef.density = 1.0;
            fixtureDef.friction = 0.3;
            fixtureDef.restitution = 0.2;
            fixtureDef.shape = new this.b2PolygonShape;
            fixtureDef.shape.SetAsBox(dim.x, dim.y);
            sprite.body.CreateFixture(fixtureDef);
        }
        //
        // add to sprite list
        //
        this.sprites.push(sprite);
        //
        // depth sort
        //
        this.sprites.sort(function (a, b) { return a.zindex - b.zindex; });
    }

    World.prototype.removeSprite = function (sprite) {
        //
        //
        //
        var index = this.sprites.indexOf(sprite);
        if (index > -1) {
            this.sprites.splice(index, 1);
        }
        //
        // remove from Box2D world ( if it is in there )
        //
        if (sprite.body) {
            this.world.DestroyBody(sprite.body);
        }
    }


    World.prototype.resetSpritesPreviousState = function () {
        var length = this.sprites.length;
        for (var i = 0; i < length; i++) {
            this.sprites[i].resetpreviousstate();
        }
    }

    World.prototype.preupdateSprites = function () {
        var length = this.sprites.length;
        for (var i = 0; i < length; i++) {
            this.sprites[i].preupdate();
        }
    }

    World.prototype.updateSprites = function (dtaccumilatorratio) {
        var length = this.sprites.length;
        for (var i = 0; i < length; i++) {
            this.sprites[i].update(dtaccumilatorratio);
        }
    }

    World.prototype.startDrawSprites = function () {
        //
        // initialise transformation
        //
        this.context.save();
        this.context.translate(-this.viewport.x, -this.viewport.y);
        var scale = this.scale / this.basescale;
        this.context.scale(scale, scale);
    }

    World.prototype.endDrawSprites = function () {
        this.context.restore();
    }

    World.prototype.drawSprites = function () {
        //
        // draw sprites
        //
        this.startDrawSprites();
        var scale = this.scale / this.basescale;
        var min = this.viewport.x / scale;
        var max = (this.viewport.x + this.viewport.width) / scale;
        var length = this.sprites.length;
        for (var i = 0; i < length; i++) {
            var aabb = this.sprites[i].getAABB();
            if (aabb.x + aabb.width > min && aabb.x < max) {
                this.sprites[i].draw();
            }
        }
        this.endDrawSprites();
    }
    //
    //
    //
    World.prototype.createGround = function (left, right) {
        if (this.ground) this.world.DestroyBody(this.ground);
        var bodyDef = new this.b2BodyDef();
        this.ground = this.world.CreateBody(bodyDef);
        var fixtureDef = new this.b2FixtureDef();
        fixtureDef.shape = new this.b2PolygonShape;
        var worldleft = this.screenToWorld(left);
        var worldright = this.screenToWorld(right);
        fixtureDef.shape.SetAsEdge(worldleft, worldright);
        this.ground.CreateFixture(fixtureDef);
    }

    World.prototype.createBounds = function (topLeft, bottomRight) {
        if (this.bounds) this.world.DestroyBody(this.bounds);
        //
        // create body
        //
        var bodyDef = new this.b2BodyDef();
        this.bounds = this.world.CreateBody(bodyDef);
        var fixtureDef = new this.b2FixtureDef();
        fixtureDef.shape = new this.b2PolygonShape;
        //
        // right wall
        //
        fixtureDef.shape.SetAsEdge(this.screenToWorld(new this.b2Vec2(bottomRight.x, topLeft.y)), this.screenToWorld(new this.b2Vec2(bottomRight.x, bottomRight.y)));
        this.bounds.CreateFixture(fixtureDef);
        //
        // left wall
        //
        fixtureDef.shape.SetAsEdge(this.screenToWorld(new this.b2Vec2(topLeft.x, topLeft.y)), this.screenToWorld(new this.b2Vec2(topLeft.x, bottomRight.y)));
        this.bounds.CreateFixture(fixtureDef);
        //
        // top wall
        //
        fixtureDef.shape.SetAsEdge(this.screenToWorld(new this.b2Vec2(topLeft.x, topLeft.y)), this.screenToWorld(new this.b2Vec2(bottomRight.x, topLeft.y)));
        this.bounds.CreateFixture(fixtureDef);
        //
        // ground
        //
        this.createGround(new this.b2Vec2(topLeft.x, bottomRight.y), new this.b2Vec2(bottomRight.x, bottomRight.y));
    }
    //
    // utilities
    //
    World.prototype.worldToScreen = function (w) {
        return new this.b2Vec2(w.x * this.scale, w.y * this.scale);
    }

    World.prototype.screenToWorld = function (s) {
        return new this.b2Vec2(s.x / this.scale, s.y / this.scale);
    }
    //
    //
    //
    World.prototype.islocked = function () {
        return this.world.IsLocked();
    }
    //
    // interaction
    //
    World.prototype.spriteAtPoint = function (p) {
        //
        // returns first sprite at point
        //
        p.x += this.viewport.x;
        for (var i = this.sprites.length - 1; i >= 0; i--) {
            if (this.sprites[i].isPointInAABB(p)) {
                return this.sprites[i];
            }
        }
        return null;
    }
    //
    //
    //
    world.createworld = function (listener) {
        return new World(listener);
    }
    //
    //
    //
    return world;
})();

