//
// Current game state
//
;
localplay.game.gamestate = (function () {
    if (localplay.game.gamestate) return localplay.game.gamestate;

    var gamestate = {};

    function Gamestate(gameplay) {
        this.gameplay = gameplay;
        //
        // interpret gameplay
        //
        this.interpretgameplay();
        //
        // initialise state
        //
        this.reset();
    }

    Gamestate.prototype.reset = function () {
        this.win = null;
        this.lose = null;
        this.collected = {};
        this.collided = {};
        this.currenttime = 0;

    }

    Gamestate.prototype.interpretgameplay = function () {
        //
        // interpret collectables
        //
        this.collectables = [];
        if (this.gameplay.sentences["collect"] !== undefined) {

            var collection = this.gameplay.sentences["collect"];
            for (var i = 0; i < collection.length; i++) {
                var collectable = {};
                collectable.collect = collection[i].findClauseWithPredicate("collect");
                if (collectable.collect && collectable.collect.subject) {
                    collectable.forevery = collection[i].findClauseWithPredicate("for every");
                    if (collectable.forevery) {
                        collectable.replace = collection[i].findClauseWithPredicate("replace");
                        if (collectable.replace) {
                            collectable.witha = collection[i].findClauseWithPredicate("with a");
                            if (collectable.witha) {
                                collectable.asa = collection[i].findClauseWithPredicate("as a");
                            }
                        }
                        collectable.remove = collection[i].findClauseWithPredicate("remove");
                    }
                    this.collectables.push(collectable);
                }
            }
        }
        //
        // interpret avoidables
        //
        this.avoidables = [];
        if (this.gameplay.sentences["avoid"] !== undefined) {

            var collection = this.gameplay.sentences["avoid"];
            for (var i = 0; i < collection.length; i++) {
                var avoidable = {};
                avoidable.avoid = collection[i].findClauseWithPredicate("avoid");
                if (avoidable.avoid && avoidable.avoid.subject) {
                    avoidable.forevery = collection[i].findClauseWithPredicate("for every");
                    if (avoidable.forevery) {
                        avoidable.drop = collection[i].findClauseWithPredicate("drop");
                        avoidable.loose = collection[i].findClauseWithPredicate("loose");
                    }
                    this.avoidables.push(avoidable);
                }
            }
        }
        //
        // interpret win states
        //
        this.winstates = [];
        if (this.gameplay.sentences["win"] !== undefined) {
            var collection = this.gameplay.sentences["win"];
            for (var i = 0; i < collection.length; i++) {
                var win = {};
                win.collecting = collection[i].findClauseWithPredicate("collecting");
                win.reaching = collection[i].findClauseWithPredicate("reaching");
                if ((win.collecting && win.collecting.subject) || (win.reaching && win.reaching.subject)) {
                    win.goto = collection[i].findClauseWithPredicate("go to");
                    this.winstates.push(win);
                }
            }
        }
        if (this.gameplay.sentences["newwin"] !== undefined) {
            var collection = this.gameplay.sentences["newwin"];
            for (var i = 0; i < collection.length; i++) {
                var win = {};
                win.collecting = collection[i].findClauseWithPredicate("collecting");
                if (win.collecting) {
                    win.count = collection[i].findClauseWithPredicate("count");

                }
                win.reaching = collection[i].findClauseWithPredicate("reaching");
                if ((win.collecting && win.collecting.subject) || (win.reaching && win.reaching.subject)) {
                    win.goto = collection[i].findClauseWithPredicate("go to");
                    this.winstates.push(win);
                    if (win.collecting) {
                        this.collectables.push({ collect: win.collecting }); // create fake collectable?
                    }
                }
            }
        }
        //
        // interpret loose states
        //
        this.losestates = [];
        if (this.gameplay.sentences["loose"] !== undefined) {
            var collection = this.gameplay.sentences["loose"];
            for (var i = 0; i < collection.length; i++) {
                var loose = {};
                loose.colliding = collection[i].findClauseWithPredicate("colliding");
                loose.longerthan = collection[i].findClauseWithPredicate("longer than");
                if ((loose.colliding && loose.colliding.subject) || (loose.longerthan && loose.longerthan.subject)) {
                    loose.goto = collection[i].findClauseWithPredicate("go to");
                    this.losestates.push(loose);
                }
            }
        }

        if (this.gameplay.sentences["newlose"] !== undefined) {
            var collection = this.gameplay.sentences["newlose"];
            for (var i = 0; i < collection.length; i++) {
                var lose = {};
                lose.colliding = collection[i].findClauseWithPredicate("colliding with");
                lose.longerthan = collection[i].findClauseWithPredicate("longer than");
                if ((lose.colliding && lose.colliding.subject) || (lose.longerthan && lose.longerthan.subject)) {
                    if (lose.colliding) {
                        var count = collection[i].findClauseWithPredicate("count");
                        if (count) {
                            lose.count = count.subject;
                        } else {
                            lose.count = 1;
                        }
                    }
                    lose.goto = collection[i].findClauseWithPredicate("go to");
                    this.losestates.push(lose);
                    if (lose.colliding) {
                        this.avoidables.push({ avoid: lose.colliding });
                    }
                }
            }
        }
        //
        // interpret story sentences
        //
        if (this.gameplay.sentences["story"] !== undefined) {
            var collection = this.gameplay.sentences["story"];
            for (var i = 0; i < collection.length; i++) {
                var story = {};
                story.type = collection[i].findClauseWithPredicate("type");
                story.number = collection[i].findClauseWithPredicate("number");
                if (story.type.subject === "pickup") {
                    story.collect = collection[i].findClauseWithPredicate("pickup");
                    if (story.collect) {
                        story.replace = collection[i].findClauseWithPredicate("replace");
                        if (story.replace) {
                            story.witha = collection[i].findClauseWithPredicate("with a");
                            story.asa = collection[i].findClauseWithPredicate("as a");
                            this.collectables.push(story);
                        } else {
                            story.remove = collection[i].findClauseWithPredicate("remove");
                            this.collectables.push(story);
                        }
                    }
                } else if (story.type.subject === "obstacle") {
                    story.avoid = collection[i].findClauseWithPredicate("obstacle");
                    if (story.avoid) {
                        story.drop = collection[i].findClauseWithPredicate("drop");
                        if (story.drop) {
                            this.avoidables.push(story);
                        }
                    }
                }
            }
        }
    }

    Gamestate.prototype.update = function (time) {
        //
        // update state
        //
        this.currenttime = time;
        for (var i = 0; i < this.losestates.length; i++) {
            if (this.losestates[i].longerthan && this.losestates[i].longerthan.subject * 1000 < time) {
                this.lose = this.losestates[i];
                break;
            }
        }
    }

    Gamestate.prototype.collide = function (level, item) {
        if (this.win || this.lose) return; // don't update state if we have already won or lost
        //
        //
        //
        var media = localplay.domutils.urlToRelativePath(item.sprite.imageUrl);
        //
        // process collision
        //

        if (this.isCollectable(media)) {
            //
            // pickup
            //
            if (this.collected[media] === undefined) {
                this.collected[media] = 0;
            }
            this.collected[media]++;
            level.pickup(item);
            //
            // process rules
            //
            var collectables = this.getCollectablesForMedia(media);
            for (var i = 0; i < collectables.length; i++) {
                var sentence = collectables[i];
                if (sentence.forevery) {
                    if (this.collected[sentence.collect.subject] % sentence.forevery.subject == 0) {
                        if (sentence.replace) {
                            level.replacenearestitem(sentence.replace.subject, "obstacle", sentence.witha.subject, (sentence.asa ? sentence.asa.subject : "prop"));
                        } else if (sentence.remove) {
                            level.removenearestitem(sentence.remove.subject, "obstacle");
                        }
                    }
                } else {
                    if (sentence.number) {
                        if (this.collected[sentence.collect.subject] % sentence.number.subject == 0) {
                            if (sentence.replace) {
                                level.replacenearestitem(sentence.replace.subject, "obstacle", sentence.witha.subject, (sentence.asa ? sentence.asa.subject : "prop"));
                            } else if (sentence.remove) {
                                level.removenearestitem(sentence.remove.subject, "obstacle");
                            }
                        }
                    }
                }
            }
        }
        if (this.isAvoidable(media)) {
            //
            //
            //
            if (this.collided[media] === undefined) {
                this.collided[media] = 0;
            }
            this.collided[media]++;
            //
            // process rules
            //
            var avoidables = this.getAvoidablesForMedia(media);
            for (var i = 0; i < avoidables.length; i++) {
                var sentence = avoidables[i];
                if (sentence.forevery) {
                    if (this.collided[sentence.avoid.subject] % sentence.forevery.subject == 0) {
                        if (sentence.drop) {
                            if (this.collected[sentence.drop.subject] !== undefined && this.collected[sentence.drop.subject] > 0) {
                                this.collected[sentence.drop.subject]--;
                                level.droppickup(sentence.drop.subject);
                            }
                        }
                    }
                    //} else if (sentence.count) {
                } else if (sentence.number) {
                    if (this.collided[sentence.avoid.subject] % sentence.number.subject == 0) {
                        if (sentence.drop) {
                            if (this.collected[sentence.drop.subject] !== undefined && this.collected[sentence.drop.subject] > 0) {
                                this.collected[sentence.drop.subject]--;
                                level.droppickup(sentence.drop.subject);
                            }
                        }
                    }
                }
            }
            //
            // update loose state
            //
            if (this.losestates.length > 0 && !this.lose) {
                //
                // total collisions
                //
                var total = 0;
                for (var subject in this.collided) {
                    total += this.collided[subject];
                }
                //localplay.log("total collisions : " + total);
                for (var i = 0; i < this.losestates.length; i++) {
                    if (this.losestates[i].colliding && this.losestates[i].count && this.losestates[i].colliding.subject) {
                        if (this.collided[this.losestates[i].colliding.subject] && this.losestates[i].count <= this.collided[this.losestates[i].colliding.subject]) {
                            this.lose = this.losestates[i];
                        }
                    } else if (this.losestates[i].colliding && this.losestates[i].colliding.subject <= total) {
                        this.lose = this.losestates[i];

                    }
                    if (this.lose) break;
                }
            }
        }

        var win = this.isGoal(media);
        if (win) {
            //
            // instant win
            //
            this.win = win;
            return;
        }
        //
        //
        //
        var totalPickups = 0;
        for (var collected in this.collected) {
            totalPickups += this.collected[collected];
        }
        //
        // update win state(s)
        //
        for (var i = 0; i < this.winstates.length; i++) {
            if (this.winstates[i].collecting) {
                if (this.winstates[i].count) {
                    if (this.collected[this.winstates[i].collecting.subject] &&
                        this.collected[this.winstates[i].collecting.subject] >= this.winstates[i].count.subject) {
                        this.win = this.winstates[i];
                        break;
                    }
                } else if (totalPickups >= this.winstates[i].collecting.subject) {
                    //
                    //
                    //
                    this.win = this.winstates[i];
                    break;
                }
            }
        }

    }

    Gamestate.prototype.isCollectable = function (media) {
        for (var i = 0; i < this.collectables.length; i++) {
            if (this.collectables[i].collect.subject === media) {
                return this.collectables[i];
            }
        }
        return null;
    }

    Gamestate.prototype.getCollectablesForMedia = function (media) {
        var collectables = [];
        for (var i = 0; i < this.collectables.length; i++) {
            if (this.collectables[i].collect.subject === media) {
                collectables.push(this.collectables[i]);
            }
        }
        return collectables;
    }

    Gamestate.prototype.isAvoidable = function (media) {
        for (var i = 0; i < this.avoidables.length; i++) {
            if (this.avoidables[i].avoid.subject === media) {
                return this.avoidables[i];
            }
        }
        return null;
    }

    Gamestate.prototype.getAvoidablesForMedia = function (media) {
        var avoidables = [];
        for (var i = 0; i < this.avoidables.length; i++) {
            if (this.avoidables[i].avoid.subject === media) {
                avoidables.push(this.avoidables[i]);
            }
        }
        return avoidables;

    }

    Gamestate.prototype.isGoal = function (media) {
        for (var i = 0; i < this.winstates.length; i++) {
            if (this.winstates[i].reaching && this.winstates[i].reaching.subject === media) {
                return this.winstates[i];
            }
        }
        return null;
    }


    Gamestate.prototype.isWon = function () {
        return this.win != null;
    }
    Gamestate.prototype.isLost = function () {
        return this.lose != null;
    }

    Gamestate.prototype.hasTimelimit = function () {
        for (var i = 0; i < this.losestates.length; i++) {
            if (this.losestates[i].longerthan) {
                return true;
            }
        }
        return false;
    }

    Gamestate.prototype.getTimelimit = function () {
        for (var i = 0; i < this.losestates.length; i++) {
            if (this.losestates[i].longerthan) {
                return this.losestates[i].longerthan.subject * 1000;
            }
        }
        return -1;
    }

    Gamestate.prototype.getDescription = function (level) {
        if (this.isWon()) {
            //
            // TODO: this should be templated
            //
            var score = "";
            var collected = "";
            for (key in this.collected) {
                if (collected.length > 0) collected += ' and ';
                collected += this.collected[key] + ' x <img style="height: 32px; width: auto; vertical-align: middle;" src="' + key + '" />';
            }
            if (collected.length > 0) {
                score = "You collected " + collected;
            }
            if (this.hasTimelimit()) {
                var timelimit = Math.round(this.getTimelimit() / 1000);
                var timetaken = Math.round(this.currenttime / 1000);

                if (score.length > 0) {
                    score += "<br />and you only took " + timetaken + " out of " + timelimit + " seconds";
                } else {
                    score += "You completed this level in " + timetaken + " out of " + timelimit + " seconds";
                }
            }
            return {
                outcome: "Well done!",
                score: score,
                message: level.winmessage
            };
        } else {
            var score = "";
            if (this.lose.longerthan) {
                score = "You ran out of time";
            }

            return {
                outcome: "Hard luck!",
                score: score,
                message: level.losemessage
            };
        }
    }

    Gamestate.prototype.getScore = function () {
        var score = 0;
        //
        // count collectables
        //
        var possiblecollections = 0;
        for (var i = 0; i < this.winstates.length; i++) {
            if (this.winstates[i].collecting) {
                possiblecollections += this.winstates[i].count;
            }
        }
        if (possiblecollections > 0) {
            //
            // count collected
            //
            var collected = 0;
            for (key in this.collected) {
                collected += this.collected[key];
            }
            score = collected / possiblecollections;
        }
        //
        // factor in timelimit
        //
        if (this.hasTimelimit()) {
            var timelimit = this.getTimelimit();
            var timetaken = this.currenttime;
            var factor = 1.0 - (Math.max(1, timetaken) / timelimit);
            if (possiblecollections > 0) {
                score *= factor
            } else {
                score = factor;
            }
        }

        return score;
    }

    gamestate.creategamestate = function (gameplay) {
        return new Gamestate(gameplay);
    }

    return gamestate;
})();

