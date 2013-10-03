;
//
// storyeditor module
//
localplay.game.storyeditor = (function () {
    var storyeditor = {};
    //
    //
    //
    function StoryEditor(level) {
        var _this = this;
        this.level = level;
        //
        // container
        //
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.top = "0px";
        this.container.style.left = "8px";
        this.container.style.bottom = "0px";
        this.container.style.right = "8px";
        if (this.level.getUniqueMediaForObjectOfType("pickup").length === 0 &&
            this.level.getUniqueMediaForObjectOfType("obstacle").length === 0 &&
            this.level.getUniqueMediaForObjectOfType("goal").length === 0) {
            this.container.style.background = "lightgray";
            this.container.innerHTML = '<div style="position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px; margin: auto;"><h2>Before your create your game story you need to add obstacles, pickups and/or goals to your Game Level</h2></div>';
            return;
        }
        this.container.style.background = "white";
        //
        // header 
        //
        this.addbutton = document.createElement("div");
        this.addbutton.classList.add("darkgrey");
        this.addbutton.classList.add("addbutton");
        this.addbutton.classList.add("bottom");
        this.addbutton.classList.add("left");
        this.addbutton.onclick = function (e) {
            _this.addSentence();
        }
        this.container.appendChild(this.addbutton);
        //
        // create scroll pane
        //
        this.scrollpane = document.createElement("div");
        this.scrollpane.classList.add("scrollpane");
        this.scrollpane.classList.add("footer");
        //
        // process gameplay
        //
        if (level.gameplay !== undefined) {
            this.gameplay = level.gameplay;
        } else {
            level.gameplay = this.gameplay = localplay.game.gameplay.creategameplay();
        }
        if (level.autogenerate || level.gameplay.countSentences() == 0) {
            level.buildGameplayFromLevel();
        }
        this.jsonin = JSON.stringify(this.gameplay);
        this.buildStoryFromGameplay();
        //
        //
        //
        this.container.appendChild(this.scrollpane);
    }
    //
    // required editor methods
    //
    StoryEditor.prototype.initialise = function () {
    }

    StoryEditor.prototype.dealloc = function () {
        if (this.container) {
            localplay.domutils.purgeDOMElement(this.container);
        }
    }

    StoryEditor.prototype.serialise = function () {
        /*
        var json = JSON.stringify(this.gameplay);
        localplay.log(json);
        */
    }

    StoryEditor.prototype.addSentence = function () {
        //
        // display sentence selection menu
        //
        //
        // TODO: turn this into a context menu class
        //
        var _this = this;
        var pickups = this.level.getUniqueMediaForObjectOfType("pickup");
        var obstacles = this.level.getUniqueMediaForObjectOfType("obstacle");
        var goals = this.level.getUniqueMediaForObjectOfType("goal");
        var menu = document.createElement("div");
        menu.classList.add("contextmenu");
        menu.style.bottom = (this.container.offsetHeight - (this.addbutton.offsetTop + this.addbutton.offsetHeight)) + "px";
        menu.style.left = (this.addbutton.offsetLeft + 4) + "px";


        var menuitems = [];
        if (obstacles.length > 0 && pickups.length > 0) {
            menuitems.push(
                {
                    title: "Game Level Story ...",
                    action: function (e) {
                        _this.addStory();
                    }
                });
        }
        if (pickups.length > 0 || goals.length > 0) {
            menuitems.push(
            {
                title: "Win Game Level by ...",
                action: function (e) {
                    _this.addNewWin();
                }
            });
        }
        menuitems.push(
        {
            title: "Lose Game Level by ...",
            action: function (e) {
                _this.addNewLose();
            }
        });
        var close = function (e) {
            window.removeEventListener("click", close, true);
            _this.container.removeChild(menu);
        };
        for (var i = 0; i < menuitems.length; i++) {
            var item = document.createElement("div");
            item.classList.add("contextmenuitem");
            item.innerHTML = menuitems[i].title;
            item.addEventListener("click", menuitems[i].action);
            //item.addEventListener("click", close);
            menu.appendChild(item);
        }
        window.addEventListener("click", close, true);

        this.container.appendChild(menu);
    }
    //
    //
    //
    StoryEditor.prototype.addCollect = function (sentence) {
        var _this = this;
        var container = document.createElement("div");
        container.classList.add("story");
        //
        //
        //
        var rebuild = sentence !== undefined;
        container.sentence = rebuild ? sentence : this.gameplay.addSentence("collect");
        //
        //
        //
        container.appendChild(StoryEditor.createDeleteButton(this, container));
        //
        // get all pickups from the game
        //
        var pickups = this.level.getUniqueMediaForObjectOfType("pickup");
        var obstacles = this.level.getUniqueMediaForObjectOfType("obstacle");
        container.appendChild(StoryEditor.createTextSpan("collect&nbsp;"));
        var clause = rebuild ? sentence.findClauseWithPredicate("collect") : null;
        var index = clause ? pickups.indexOf(clause.subject) : 0;
        var pickup = StoryEditor.createVariableImage(index, pickups);
        pickup.clause = clause ? clause : container.sentence.addClause("collect", pickups[index]);
        pickup.addEventListener("change", function (e) {
            pickup.clause.subject = this.options[this.value];
        });
        container.appendChild(pickup);
        //
        //
        //
        var concequence = null;
        var choice = null;
        var action = null;
        if (obstacles.length > 0) {
            var choice = [
                {
                    title: "for every",
                    action: function (e) {
                        //
                        // remove all children after this one
                        //
                        StoryEditor.trimStoryFrom(this.parentElement);
                        //
                        //
                        //
                        clause = rebuild ? sentence.findClauseWithPredicate("for every") : null;
                        choice.clause = clause ? clause : container.sentence.addClause("for every", 1);
                        //
                        //
                        //
                        var mediaUrl = pickups[pickup.value];
                        var count = _this.level.countInstancesOfMediaForObjectOfType("pickup", mediaUrl);
                        var options = [];
                        var value = 0;
                        var j = 0;
                        for (var i = 1; i <= count; i++) {
                            if (count % i == 0) {
                                options.push(i);
                                if (i == choice.clause.subject) {
                                    value = j;
                                }
                                j++;
                            }
                        }
                        if (options.length > 1) {
                            var forevery = StoryEditor.createVariableSpan(value, options);
                            forevery.addEventListener("change", function (e) {
                                choice.clause.subject = this.options[this.value];
                            });
                            container.appendChild(forevery);
                            container.appendChild(StoryEditor.createTextSpan("&nbsp;objects collected&nbsp;"));
                        } else {
                            container.appendChild(StoryEditor.createTextSpan("&nbsp;object collected&nbsp;"));
                        }
                        //
                        //
                        //
                        concequence = StoryEditor.createChoice(
                            [
                                {
                                    title: "replace",
                                    action: function (e) {
                                        StoryEditor.trimStoryFrom(this.parentElement);
                                        if (!rebuild) {
                                            concequence.clause.predicate = "replace";
                                            concequence.clause.subject = obstacles[0];
                                        }
                                        container.appendChild(StoryEditor.createTextSpan("&nbsp;a&nbsp;"));
                                        var target = StoryEditor.createVariableImage(obstacles.indexOf(concequence.clause.subject), obstacles);
                                        target.addEventListener("change", function (e) {
                                            concequence.clause.subject = this.options[this.value];
                                        });
                                        container.appendChild(target);
                                        container.appendChild(StoryEditor.createTextSpan("&nbsp;with a&nbsp;"));
                                        clause = rebuild ? sentence.findClauseWithPredicate("with a") : null;
                                        var substitute = StoryEditor.createVariableImage(clause ? pickups.indexOf(clause.subject) : 0, pickups);
                                        substitute.addEventListener("change", function (e) {
                                            substitute.clause.subject = this.options[this.value];
                                            });
                                        substitute.clause = clause ? clause : container.sentence.addClause("with a", pickups[0]);
                                        container.appendChild(substitute);
                                        container.appendChild(StoryEditor.createTextSpan("&nbsp;.&nbsp;"));
                                    }
                                },
                                {
                                    title: "remove",
                                    action: function (e) {
                                        StoryEditor.trimStoryFrom(this.parentElement);
                                        if (!rebuild) {
                                            concequence.clause.predicate = "remove";
                                            concequence.clause.subject = obstacles[0];
                                        }
                                        container.appendChild(StoryEditor.createTextSpan("&nbsp;a&nbsp;"));
                                        var target = StoryEditor.createVariableImage(obstacles.indexOf(concequence.clause.subject), obstacles);
                                        target.addEventListener("change", function (e) {
                                            concequence.clause.subject = this.options[this.value];
                                        });
                                        container.appendChild(target);
                                        container.appendChild(StoryEditor.createTextSpan("&nbsp;.&nbsp;"));
                                    }
                                }
                            ]);
                        if (rebuild) {
                            clause = sentence.findClauseWithPredicate("replace");
                            if (!clause) {
                                clause = sentence.findClauseWithPredicate("remove");
                            }
                        }
                        concequence.clause = clause ? clause : container.sentence.addClause("", "");
                        container.appendChild(concequence);
                        //
                        //
                        //
                    }
                },
                {
                    title: "end",
                    action: function (e) {
                        //
                        // remove all children after this one
                        //
                        StoryEditor.trimStoryFrom(this.parentElement);
                    }
                }
            ];
            action = StoryEditor.createChoice(choice);
            container.appendChild(action);
        } else {
            container.appendChild(StoryEditor.createChoice([
                {
                    title: "end",
                    action: function (e) {
                        //
                        // remove all children after this one
                        //
                        StoryEditor.trimStoryFrom(this.parentElement);
                    }
                }]));
        }
        //
        //
        //
        this.scrollpane.appendChild(container);
        this.scrollpane.scrollTop = this.scrollpane.scrollHeight;
        //
        //
        //
        if (rebuild) {
            if (action) {
                if (sentence.findClauseWithPredicate("for every")) {
                    action.childNodes[0].click();
                } else { // assume end
                    action.childNodes[1].click();
                }
            }
            if (concequence) {
                if (sentence.findClauseWithPredicate("replace")) {
                    concequence.childNodes[0].click();
                } else if (sentence.findClauseWithPredicate("remove")) {
                    concequence.childNodes[1].click();
                }
            }
            rebuild = false;
        }
        //
        //
        //
        this.serialise();
        return container;
    }

    StoryEditor.prototype.addStory = function (sentence) {
        var _this = this;
        var container = document.createElement("div");
        container.classList.add("story");
        //
        //
        //
        var rebuild = sentence !== undefined;
        container.sentence = rebuild ? sentence : this.gameplay.addSentence("story");
        //
        //
        //
        container.appendChild(StoryEditor.createDeleteButton(this, container));
        //
        // get all pickups and obstacles from the game
        //
        var pickups = this.level.getUniqueMediaForObjectOfType("pickup");
        var obstacles = this.level.getUniqueMediaForObjectOfType("obstacle");
        //
        // create number clause
        //
        container.appendChild(StoryEditor.createTextSpan("for every&nbsp;"));
        var clause = rebuild ? sentence.findClauseWithPredicate("number") : container.sentence.addClause("number", 1);
        var index = clause.subject;
        var number = StoryEditor.createVariableSpan(0, [1]); // need type and media clauses to find number so do this later
        number.clause = clause;
        number.addEventListener("change", function (e) {
            number.clause.subject = this.options[this.value];
        });
        container.appendChild(number);
        //
        // add type choice
        //
        var concequence = null;
        var choice = null;
        var action = null;
        var clause = rebuild ? sentence.findClauseWithPredicate("type") : container.sentence.addClause("type", 0);
        var type = StoryEditor.createChoice([
            {
                title: "pickup",
                action: function (e) {
                    //
                    // remove previous
                    //
                    _this.dirty = (!rebuild);
                    if (this.parentElement) {
                        StoryEditor.trimStoryFrom(this.parentElement);
                    }
                    //
                    //
                    //
                    type.clause.subject = "pickup";
                    //
                    // create / rebuild target pickup
                    //
                    clause = rebuild ? sentence.findClauseWithPredicate("pickup") : null;
                    var index = clause ? pickups.indexOf(clause.subject) : 0;
                    var count = 0;
                    var pickup = StoryEditor.createVariableImage(index, pickups);
                    pickup.clause = clause ? clause : container.sentence.addClause("pickup", pickups[index]);
                    pickup.addEventListener("change", function (e) {
                        //
                        // update target pickup
                        //
                        pickup.clause.subject = this.options[this.value];
                        //
                        // update number options
                        //
                        number.options = [];
                        count = _this.level.countInstancesOfMediaForObjectOfType("pickup", pickup.clause.subject);
                        for (var i = 1; i <= count; i++) {
                            number.options.push(i);
                        }
                        number.setVariableValue(0);
                    });
                    container.appendChild(pickup);
                    //
                    // update number options
                    //
                    //clause = rebuild ? sentence.findClauseWithPredicate("number") : null;
                    count = _this.level.countInstancesOfMediaForObjectOfType("pickup", pickups[index]);
                    var value = 0;
                    number.options = [];
                    for (var i = 1; i <= count; i++) {
                        number.options.push(i);
                        if (number.clause.subject == i) value = i - 1;
                    }
                    number.setVariableValue(value);
                    //
                    //
                    //
                    container.appendChild(StoryEditor.createTextSpan("&nbsp;collected&nbsp;"));
                    //
                    //
                    //
                    concequence = StoryEditor.createChoice(
                        [
                            {
                                title: "replace",
                                action: function (e) {
                                    StoryEditor.trimStoryFrom(this.parentElement);
                                    if (!rebuild) {
                                        concequence.clause.predicate = "replace";
                                        concequence.clause.subject = obstacles[0];
                                    }
                                    container.appendChild(StoryEditor.createTextSpan("&nbsp;a&nbsp;"));
                                    var target = StoryEditor.createVariableImage(obstacles.indexOf(concequence.clause.subject), obstacles);
                                    target.addEventListener("change", function (e) {
                                        concequence.clause.subject = this.options[this.value];
                                    });
                                    container.appendChild(target);
                                    container.appendChild(StoryEditor.createTextSpan("&nbsp;with a&nbsp;"));
                                    clause = rebuild ? sentence.findClauseWithPredicate("with a") : container.sentence.addClause("with a", "");
                                    var substitute = StoryEditor.createLibrarySelector("getmedia.php?type=object&listview=true", "Choose Replacement", clause, null, null);
                                    substitute.clause = clause;
                                    container.appendChild(substitute);
                                    //
                                    //
                                    //
                                    substitute.callback = function (selected) {
                                        //
                                        // remove story so far
                                        //
                                        StoryEditor.trimStoryFrom(substitute);
                                        //
                                        // check if subject appears in game
                                        //
                                        var asaclause = rebuild ? sentence.findClauseWithPredicate("as a") : container.sentence.addClause("as a", "");
                                        var asa;
                                        var mediatype = selected.length > 0 ? _this.level.getTypeOfMedia(selected) : null;
                                        if ( mediatype ) {
                                            asa = StoryEditor.createTextSpan("&nbsp;as a&nbsp;"+mediatype);
                                        } else {
                                            //
                                            // TODO: add 'as' clause
                                            //
                                            var asachoice = [
                                                    {
                                                        title: "prop",
                                                        action: function (e) {
                                                            asa.clause.subject = "prop";
                                                        }
                                                    },
                                                    {
                                                        title: "platform",
                                                        action: function (e) {
                                                            asa.clause.subject = "platform";
                                                        }
                                                    },
                                                    {
                                                        title: "pickup",
                                                        action: function (e) {
                                                            asa.clause.subject = "pickup";
                                                        }
                                                    },
                                                    {
                                                        title: "obstacle",
                                                        action: function (e) {
                                                            asa.clause.subject = "obstacle";
                                                        }
                                                    },
                                                    {
                                                        title: "goal",
                                                        action: function (e) {
                                                            asa.clause.subject = "goal";
                                                        }
                                                    }
                                            ];
                                            var asavalue = -1;
                                            if (rebuild && asaclause.subject) {
                                                for (var i = 0; i < asachoice.length; i++) {
                                                    if (asaclause.subject === asachoice[i].title) {
                                                        asavalue = i;
                                                        break;
                                                    }
                                                }
                                            }
                                            var asa = StoryEditor.createChoice(asachoice, asavalue);
                                            container.appendChild(StoryEditor.createTextSpan("&nbsp;as a&nbsp;"));
                                        }
                                        asa.clause = asaclause;
                                        container.appendChild(asa);
                                    }
                                    if(substitute.clause.subject !== "" ) substitute.callback(substitute.clause);
                                }
                            },
                            {
                                title: "remove",
                                action: function (e) {
                                    StoryEditor.trimStoryFrom(this.parentElement);
                                    if (!rebuild) {
                                        concequence.clause.predicate = "remove";
                                        concequence.clause.subject = obstacles[0];
                                    }
                                    container.appendChild(StoryEditor.createTextSpan("&nbsp;a&nbsp;"));
                                    var target = StoryEditor.createVariableImage(obstacles.indexOf(concequence.clause.subject), obstacles);
                                    target.addEventListener("change", function (e) {
                                        concequence.clause.subject = this.options[this.value];
                                    });
                                    container.appendChild(target);
                                    container.appendChild(StoryEditor.createTextSpan("&nbsp;.&nbsp;"));
                                }
                            }
                        ]);
                    if (rebuild) {
                        clause = sentence.findClauseWithPredicate("replace");
                        if (!clause) {
                            clause = sentence.findClauseWithPredicate("remove");
                        }
                    }
                    concequence.clause = clause ? clause : container.sentence.addClause("", "");
                    container.appendChild(concequence);
                }
            },
            {
                title: "obstacle",
                action: function (e) {
                    //
                    // remove previous
                    //
                    _this.dirty = (!rebuild);
                    if (this.parentElement) {
                        StoryEditor.trimStoryFrom(this.parentElement);
                    }
                    //
                    //
                    //
                    type.clause.subject = "obstacle";
                    //
                    // create / rebuild target pickup
                    //
                    clause = rebuild ? sentence.findClauseWithPredicate("obstacle") : null;
                    var index = clause ? obstacles.indexOf(clause.subject) : 0;
                    var count = 0;
                    var obstacle = StoryEditor.createVariableImage(index, obstacles);
                    obstacle.clause = clause ? clause : container.sentence.addClause("obstacle", obstacles[index]);
                    obstacle.addEventListener("change", function (e) {
                        //
                        // update target pickup
                        //
                        obstacle.clause.subject = this.options[this.value];
                        //
                        // update number options
                        //
                        number.options = [];
                        count = _this.level.countInstancesOfMediaForObjectOfType("obstacle", obstacle.clause.subject);
                        for (var i = 1; i <= count; i++) {
                            number.options.push(i);
                        }
                        number.setVariableValue(0);
                    });
                    container.appendChild(obstacle);
                    //
                    // update number options
                    //
                    count = _this.level.countInstancesOfMediaForObjectOfType("obstacle", obstacles[index]);
                    var value = 0;
                    number.options = [];
                    for (var i = 1; i <= count; i++) {
                        number.options.push(i);
                        if (number.clause.subject == i) value = i - 1;
                    }
                    number.setVariableValue(value);
                    //
                    //
                    //
                    container.appendChild(StoryEditor.createTextSpan("&nbsp;you hit, you will lose a&nbsp;"));
                    //
                    //
                    //
                    clause = rebuild ? sentence.findClauseWithPredicate("drop") : null;
                    var drop = StoryEditor.createVariableImage(clause ? pickups.indexOf(clause.subject) : 0, pickups);
                    drop.clause = clause ? clause : container.sentence.addClause("drop", pickups[0]);
                    drop.addEventListener("change", function (e) {
                        drop.clause.subject = this.options[this.value];
                    });
                    container.appendChild(drop);
                }
            }
        ]);
        type.clause = clause;
        container.appendChild(type);
        //
        //
        //
        this.scrollpane.appendChild(container);
        this.scrollpane.scrollTop = this.scrollpane.scrollHeight;
        //
        //
        //
        if (rebuild) {
            if (type) {
                if (type.clause.subject === "pickup") {
                    type.childNodes[0].click();
                } else if (type.clause.subject === "obstacle") {
                    type.childNodes[1].click();
                }
            }
            if (concequence) {
                if (sentence.findClauseWithPredicate("replace")) {
                    concequence.childNodes[0].click();
                } else if (sentence.findClauseWithPredicate("remove")) {
                    concequence.childNodes[1].click();
                }
            }

            rebuild = false;
        }
        //
        //
        //
        this.serialise();
        return container;
    }

    StoryEditor.prototype.addAvoid = function (sentence) {
        var _this = this;
        var container = document.createElement("div");
        container.classList.add("story");
        //
        //
        //
        var rebuild = sentence !== undefined;
        container.sentence = rebuild ? sentence : this.gameplay.addSentence("avoid");
        //
        //
        //
        container.appendChild(StoryEditor.createDeleteButton(this, container));
        //
        // get all pickups and obstacles from the game
        //
        var pickups = this.level.getUniqueMediaForObjectOfType("pickup");
        var obstacles = this.level.getUniqueMediaForObjectOfType("obstacle");
        container.appendChild(StoryEditor.createTextSpan("avoid&nbsp;"));
        var clause = rebuild ? sentence.findClauseWithPredicate("avoid") : null;
        var index = clause ? obstacles.indexOf(clause.subject) : 0;
        var obstacle = StoryEditor.createVariableImage(index, obstacles);
        obstacle.clause = clause ? clause : container.sentence.addClause("avoid", obstacles[0]);
        obstacle.addEventListener("change", function (e) {
            obstacle.clause.subject = this.options[this.value];
        });
        container.appendChild(obstacle);
        //
        //
        //
        var action = null;
        if (pickups && pickups.length > 0) {
            var choice = [
                {
                    title: "for every",
                    action: function (e) {
                        //
                        // remove all children after this one
                        //
                        StoryEditor.trimStoryFrom(this.parentElement);
                        //
                        //
                        //
                        clause = rebuild ? sentence.findClauseWithPredicate("for every") : null;
                        //
                        //
                        //
                        var mediaUrl = obstacles[obstacle.value];
                        var count = _this.level.countInstancesOfMediaForObjectOfType("obstacle", mediaUrl);
                        var options = [];
                        var value = 0;
                        var j = 0;
                        for (var i = 1; i <= count; i++) {
                            if (count % i == 0) {
                                options.push(i);
                                if (clause && i == clause.subject) {
                                    value = j;
                                }
                                j++;
                            }
                        }
                        if (options.length > 1) {
                            var forevery = StoryEditor.createVariableSpan(value, options);
                            forevery.clause = clause ? clause : container.sentence.addClause("for every", options[value]);
                            forevery.addEventListener("change", function (e) {
                                forevery.clause.subject = this.options[this.value];
                                _this.dirty = (!rebuild);
                            });
                            container.appendChild(forevery);
                            container.appendChild(StoryEditor.createTextSpan("&nbsp;objects you hit, you will lose a&nbsp;"));
                        } else {
                            var forevery = StoryEditor.createTextSpan("&nbsp;object you hit, you will lose a&nbsp;");
                            forevery.clause = clause ? clause : container.sentence.addClause("for every", 1);
                            container.appendChild(forevery);
                        }
                        clause = rebuild ? sentence.findClauseWithPredicate("drop") : null;
                        var drop = StoryEditor.createVariableImage(clause ? pickups.indexOf(clause.subject) : 0, pickups);
                        drop.clause = clause ? clause : container.sentence.addClause("drop", pickups[0]);
                        drop.addEventListener("change", function (e) {
                            drop.clause.subject = this.options[this.value];
                        });
                        container.appendChild(drop);
                    }
                },
                {
                    title: "end",
                    action: function (e) {
                        //
                        // remove all children after this one
                        //
                        _this.dirty = (!rebuild);
                        StoryEditor.trimStoryFrom(this.parentElement);
                    }
                }
            ];
            action = StoryEditor.createChoice(choice);
            container.appendChild(action);
        } else {
            action = StoryEditor.createChoice([
                            {
                                title: "end",
                                action: function (e) {
                                    //
                                    // remove all children after this one
                                    //
                                    StoryEditor.trimStoryFrom(this.parentElement);
                                }
                            }
            ]);
            container.appendChild(action);
        }
        //
        //
        //
        this.scrollpane.appendChild(container);
        this.scrollpane.scrollTop = this.scrollpane.scrollHeight;
        //
        //
        //
        if (rebuild) {
            if (action) {
                if (sentence.findClauseWithPredicate("for every")) {
                    action.childNodes[0].click();
                } else { // assume end
                    action.childNodes[action.childNodes.length - 1].click();
                }
            }
            rebuild = false;
        }
        //
        //
        //
        this.serialise();
    }
    StoryEditor.prototype.addDrop = function (sentence) {
        var _this = this;
        var container = document.createElement("div");
        container.classList.add("story");
        //
        //
        //
        container.sentence = this.gameplay.addSentence("drop");
        //
        //
        //
        container.appendChild(StoryEditor.createDeleteButton(this, container));
        //
        // get all pickups from the game
        //
        var pickups = this.level.getUniqueMediaForObjectOfType("pickup");
        var obstacles = this.level.getUniqueMediaForObjectOfType("obstacle");
        container.appendChild(StoryEditor.createTextSpan("drop&nbsp;"));
        var pickup = StoryEditor.createVariableImage(0, pickups);
        container.appendChild(pickup);
        container.appendChild(StoryEditor.createTextSpan("&nbsp;on&nbsp;"));
        container.appendChild(StoryEditor.createVariableImage(0,
            [
                "images/pickup1.png",
                "images/pickup2.png",
                "images/pickup3.png",
                "images/pickup4.png"
            ]));
        //
        //
        //
        var choice = [
            {
                title: "for every",
                action: function (e) {
                    //
                    //
                    //
                    var mediaUrl = pickups[pickup.value];
                    var count = _this.level.countInstancesOfMediaForObjectOfType("pickup", mediaUrl);
                    var options = [];
                    for (var i = 1; i <= count; i++) {
                        if (count % i == 0) {
                            options.push(i);
                        }
                    }
                    if (options.length > 1) {
                        container.appendChild(StoryEditor.createVariableSpan(0, options));
                        container.appendChild(StoryEditor.createTextSpan("&nbsp;objects dropped a&nbsp;"));
                    } else {
                        container.appendChild(StoryEditor.createTextSpan("&nbsp;object dropped a&nbsp;"));
                    }
                    //
                    //
                    //
                    container.appendChild(StoryEditor.createVariableImage(0, obstacles));
                    container.appendChild(StoryEditor.createTextSpan("&nbsp;will be&nbsp;"));
                    //
                    //
                    //
                    container.appendChild(StoryEditor.createChoice(
                        [
                            {
                                title: "replaced by a",
                                action: function (e) {
                                    container.appendChild(StoryEditor.createVariableImage(0, pickups));
                                }
                            },
                            {
                                title: "removed",
                                action: function (e) {
                                    StoryEditor.trimStoryFrom(this.parentElement);
                                }
                            }
                        ]));
                }
            },
            {
                title: "end",
                action: function (e) {
                    //
                    // remove all children after this one
                    //
                    StoryEditor.trimStoryFrom(this.parentElement);
                }
            }
        ];
        container.appendChild(StoryEditor.createChoice(choice));
        //
        //
        //
        this.scrollpane.appendChild(container);
        this.scrollpane.scrollTop = this.scrollpane.scrollHeight;
        //
        //
        //
        this.serialise();
    }
    StoryEditor.prototype.addWin = function (sentence) {
        var _this = this;
        var container = document.createElement("div");
        container.classList.add("story");
        //
        //
        //
        var rebuild = sentence !== undefined;
        container.sentence = rebuild ? sentence : this.gameplay.addSentence("win");
        //
        //
        //
        container.appendChild(StoryEditor.createDeleteButton(this, container));
        //
        //
        //
        container.appendChild(StoryEditor.createTextSpan("win by&nbsp;"));
        //
        // get all pickups from the game
        //
        var pickups = this.level.getUniqueMediaForObjectOfType("pickup");
        var goals = this.level.getUniqueMediaForObjectOfType("goal");
        var action = null;
        var clause = null;
        if (goals.length > 0) {
            //
            //
            //
            var choice = [
                {
                    title: "collecting",
                    action: function (e) {
                        //
                        // remove previous
                        //
                        _this.dirty = (!rebuild);
                        StoryEditor.trimStoryFrom(this.parentElement);
                        //
                        // append new
                        //
                        clause = rebuild ? sentence.findClauseWithPredicate("collecting") : null;
                        var count = 0;
                        for (var i = 0; i < pickups.length; i++) {
                            var mediaUrl = pickups[i];
                            count += _this.level.countInstancesOfMediaForObjectOfType("pickup", mediaUrl);
                        }
                        var value = 0;
                        var options = [];
                        for (var i = 1; i <= count; i++) {
                            options.push(i);
                            if (clause && clause.subject == i) value = i - 1;
                        }
                        var collecting = StoryEditor.createVariableSpan(value, options);
                        collecting.clause = clause ? clause : container.sentence.addClause("collecting", options[0]);
                        collecting.addEventListener("change", function (e) {
                            collecting.clause.subject = this.options[this.value];
                        });
                        container.appendChild(collecting);
                        container.appendChild(StoryEditor.createTextSpan("&nbsp;objects"));
                        //
                        // add destinations level
                        //
                        clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
                        if (!clause) clause = container.sentence.addClause("go to", "");
                        var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
                        container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
                        container.appendChild(level);
                    }
                },
                /*
                {
                    title: "dropping",
                    action: function (e) {
                        //
                        // remove previous
                        //
                        StoryEditor.trimStoryFrom(this.parentElement);
                        //
                        // append new
                        //
                        var count = 0;
                        for (var i = 0; i < pickups.length; i++) {
                            var mediaUrl = pickups[i];
                            count += game.countInstancesOfMediaForObjectOfType("pickup", mediaUrl);
                        }
                        var options = [];
                        for (var i = 1; i <= count; i++) {
                            options.push(i);
                        }
                        container.appendChild(StoryEditor.createVariableSpan(0, options));
                        container.appendChild(StoryEditor.createTextSpan("&nbsp;objects"));
                    }
                },
                */
                {
                    title: "reaching",
                    action: function (e) {
                        //
                        // remove previous
                        //
                        StoryEditor.trimStoryFrom(this.parentElement);
                        //
                        // add new
                        //
                        clause = rebuild ? sentence.findClauseWithPredicate("reaching") : null;
                        container.appendChild(StoryEditor.createTextSpan("&nbsp;a&nbsp;"));
                        var reaching = StoryEditor.createVariableImage(clause ? goals.indexOf(clause.subject) : 0, goals);
                        reaching.clause = clause ? clause : container.sentence.addClause("reaching", goals[0]);
                        reaching.addEventListener("change", function (e) {
                            reaching.clause.subject = this.options[this.value];
                        });
                        container.appendChild(reaching);
                        //
                        // add destinations level
                        //
                        clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
                        if (!clause) clause = container.sentence.addClause("go to", "");
                        var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
                        container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
                        container.appendChild(level);
                    }
                }
            ];
            action = StoryEditor.createChoice(choice);
            container.appendChild(action);

        } else {
            container.appendChild(StoryEditor.createTextSpan("collecting&nbsp;"));
            clause = rebuild ? sentence.findClauseWithPredicate("collecting") : null;
            var count = 0;
            for (var i = 0; i < pickups.length; i++) {
                var mediaUrl = pickups[i];
                count += _this.level.countInstancesOfMediaForObjectOfType("pickup", mediaUrl);
            }
            var value = 0;
            var options = [];
            for (var i = 1; i <= count; i++) {
                options.push(i);
                if (clause && clause.subject == i) value = i - 1;
            }
            var collecting = StoryEditor.createVariableSpan(value, options);
            collecting.clause = clause ? clause : container.sentence.addClause("collecting", options[0]);
            collecting.addEventListener("change", function (e) {
                collecting.clause.subject = this.options[this.value];
            });
            container.appendChild(collecting);
            container.appendChild(StoryEditor.createTextSpan("&nbsp;objects"));
            //
            // add destinations level
            //
            clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
            if (!clause) clause = container.sentence.addClause("go to", "");
            var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
            container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
            container.appendChild(level);
        }
        //
        //
        //
        this.scrollpane.appendChild(container);
        this.scrollpane.scrollTop = this.scrollpane.scrollHeight;
        //
        //
        //
        if (rebuild) {
            if (action) {
                if (sentence.findClauseWithPredicate("collecting")) {
                    action.childNodes[0].click();
                } else if (sentence.findClauseWithPredicate("reaching")) {
                    action.childNodes[1].click();
                }
            }
            rebuild = false;
        }
        //
        //
        //
        this.serialise();
    }

    StoryEditor.prototype.addNewWin = function (sentence) {
        var _this = this;
        var container = document.createElement("div");
        container.classList.add("story");
        //
        //
        //
        var rebuild = sentence !== undefined;
        container.sentence = rebuild ? sentence : this.gameplay.addSentence("newwin");
        //
        //
        //
        container.appendChild(StoryEditor.createDeleteButton(this, container));
        //
        // get all pickups and goals from the game
        //
        var pickups = this.level.getUniqueMediaForObjectOfType("pickup");
        var goals = this.level.getUniqueMediaForObjectOfType("goal");
        var action = null;
        var clause = null;
        //
        // create functions
        //
        function collecting(e) {
            //
            // remove previous
            //
            _this.dirty = (!rebuild);
            if (this.parentElement) {
                StoryEditor.trimStoryFrom(this.parentElement);
            }
            //
            // create / rebuild target pickup
            //
            clause = rebuild ? sentence.findClauseWithPredicate("collecting") : null;
            var index = clause ? pickups.indexOf(clause.subject) : 0;
            var number = null;
            var count = 0;
            var pickup = StoryEditor.createVariableImage(index, pickups);
            pickup.clause = clause ? clause : container.sentence.addClause("collecting", pickups[index]);
            pickup.addEventListener("change", function (e) {
                //
                // update target pickup
                //
                pickup.clause.subject = this.options[this.value];
                //
                // update number options
                //
                number.options = [];
                count = _this.level.countInstancesOfMediaForObjectOfType("pickup", pickup.clause.subject);
                for (var i = 1; i <= count; i++) {
                    number.options.push(i);
                }
                number.setVariableValue(0);
            });
            //
            // create / rebuild count
            //
            clause = rebuild ? sentence.findClauseWithPredicate("count") : null;
            count = _this.level.countInstancesOfMediaForObjectOfType("pickup", pickups[ index ]);
            var value = 0;
            var options = [];
            for (var i = 1; i <= count; i++) {
                options.push(i);
                if (clause && clause.subject == i) value = i - 1;
            }
            var number = StoryEditor.createVariableSpan(value, options);
            number.clause = clause ? clause : container.sentence.addClause("count", options[0]);
            number.addEventListener("change", function (e) {
                number.clause.subject = this.options[this.value];
            });
            container.appendChild(number);
            container.appendChild(pickup);
            //
            // add destinations level
            //
            clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
            if (!clause) clause = container.sentence.addClause("go to", "");
            var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
            container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
            container.appendChild(level);
        }

        function reaching(e) {
            //
            // remove previous
            //
            _this.dirty = (!rebuild);
            if (this.parentElement) {
                StoryEditor.trimStoryFrom(this.parentElement);
            }
            //
            // add new
            //
            clause = rebuild ? sentence.findClauseWithPredicate("reaching") : null;
            //container.appendChild(StoryEditor.createTextSpan(( this.parentElement ? "&nbsp;a&nbsp;" : "&nbsp;reaching a&nbsp;")));
            var reaching = StoryEditor.createVariableImage(clause ? goals.indexOf(clause.subject) : 0, goals);
            reaching.clause = clause ? clause : container.sentence.addClause("reaching", goals[0]);
            reaching.addEventListener("change", function (e) {
                reaching.clause.subject = this.options[this.value];
            });
            container.appendChild(reaching);
            //
            // add destinations level
            //
            clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
            if (!clause) clause = container.sentence.addClause("go to", "");
            var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
            container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
            container.appendChild(level);
        }

        if (goals.length > 0 && pickups.length > 0) {
            //
            //
            //
            var choice = [{ title: "collecting", action: collecting }, { title: "reaching", action: reaching }];
            action = StoryEditor.createChoice(choice);
            //
            //
            //
            container.appendChild(StoryEditor.createTextSpan("win by&nbsp;"));
            container.appendChild(action);

        } else if (goals.length > 0) {
            container.appendChild(StoryEditor.createTextSpan("win by reaching&nbsp;"));
            reaching();
        } else if (pickups.length > 0) {
            container.appendChild(StoryEditor.createTextSpan("win by collecting&nbsp;"));
            collecting();
        }
        //
        //
        //
        this.scrollpane.appendChild(container);
        this.scrollpane.scrollTop = this.scrollpane.scrollHeight;
        //
        //
        //
        if (rebuild) {
            if (action) {
                if (sentence.findClauseWithPredicate("collecting")) {
                    action.childNodes[0].click();
                } else if (sentence.findClauseWithPredicate("reaching")) {
                    action.childNodes[1].click();
                }
            }
            rebuild = false;
        }
        //
        //
        //
        this.serialise();
    }

    StoryEditor.prototype.addLose = function (sentence) {
        var _this = this;
        var container = document.createElement("div");
        container.classList.add("story");
        //
        //
        //
        var rebuild = sentence !== undefined;
        container.sentence = rebuild ? sentence : this.gameplay.addSentence("lose");
        //
        //
        //
        container.appendChild(StoryEditor.createDeleteButton(this, container));
        //
        //
        //
        container.appendChild(StoryEditor.createTextSpan("lose by&nbsp;"));
        //
        // get all pickups from the game
        //
        var obstacles = this.level.getUniqueMediaForObjectOfType("obstacle");
        var action = null;
        var clause = null;
        var choice = [
            {
                title: "colliding with",
                action: function (e) {
                    //
                    // remove previous
                    //
                    StoryEditor.trimStoryFrom(this.parentElement);
                    //
                    // append new
                    //
                    clause = rebuild ? sentence.findClauseWithPredicate("colliding") : null;
                    var count = 0;
                    for (var i = 0; i < obstacles.length; i++) {
                        var mediaUrl = obstacles[i];
                        count += _this.level.countInstancesOfMediaForObjectOfType("obstacle", mediaUrl);
                    }
                    var value = 0;
                    var options = [];
                    for (var i = 1; i <= count; i++) {
                        options.push(i);
                        if (clause && clause.subject == i) value = i - 1;
                    }
                    var collecting = StoryEditor.createVariableSpan(value, options);
                    collecting.clause = clause ? clause : container.sentence.addClause("colliding", options[0]);
                    collecting.addEventListener("change", function (e) {
                        collecting.clause.subject = this.options[this.value];
                    });
                    container.appendChild(collecting);
                    container.appendChild(StoryEditor.createTextSpan("&nbsp;obstacles"));
                    //
                    // add destinations level
                    //
                    clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
                    if (!clause) clause = container.sentence.addClause("go to", "");
                    var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
                    container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
                    container.appendChild(level);
                }
            },
            {
                title: "taking longer than",
                action: function (e) {
                    //
                    // remove previous
                    //
                    StoryEditor.trimStoryFrom(this.parentElement);
                    //
                    // add new
                    //
                    clause = rebuild ? sentence.findClauseWithPredicate("longer than") : null;
                    container.appendChild(StoryEditor.createTextSpan("&nbsp;a&nbsp;"));
                    var times = [];
                    var time = 20.0;
                    for (var i = 0; i < 10; i++) {
                        times.push(time);
                        time += 20;
                    }
                    var longerthan = StoryEditor.createVariableSpan(clause ? times.indexOf(clause.subject) : times.length - 1, times);
                    longerthan.clause = clause ? clause : container.sentence.addClause("longer than", times[times.length - 1]);
                    longerthan.addEventListener("change", function (e) {
                        longerthan.clause.subject = this.options[this.value];
                    });
                    container.appendChild(longerthan);
                    container.appendChild(StoryEditor.createTextSpan("&nbsp;seconds&nbsp;"));
                    //
                    // add destinations level
                    //
                    clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
                    if (!clause) clause = container.sentence.addClause("go to", "");
                    var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
                    container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
                    container.appendChild(level);
                }
            }
        ];
        action = StoryEditor.createChoice(choice);
        container.appendChild(action);

        //
        //
        //
        this.scrollpane.appendChild(container);
        this.scrollpane.scrollTop = this.scrollpane.scrollHeight;
        //
        //
        //
        if (rebuild) {
            if (action) {
                if (sentence.findClauseWithPredicate("colliding")) {
                    action.childNodes[0].click();
                } else if (sentence.findClauseWithPredicate("longer than")) {
                    action.childNodes[1].click();
                }
            }
            rebuild = false;
        }
        //
        //
        //
        this.serialise();
    }

    StoryEditor.prototype.addNewLose = function (sentence) {
        var _this = this;
        var container = document.createElement("div");
        container.classList.add("story");
        //
        //
        //
        var rebuild = sentence !== undefined;
        container.sentence = rebuild ? sentence : this.gameplay.addSentence("newlose");
        //
        //
        //
        container.appendChild(StoryEditor.createDeleteButton(this, container));
        //
        //
        //
        container.appendChild(StoryEditor.createTextSpan("lose by&nbsp;"));
        //
        // get all pickups from the game
        //
        var obstacles = this.level.getUniqueMediaForObjectOfType("obstacle");
        var action = null;
        var clause = null;
        //
        //
        //
        function collidingwith(e) {
            //
            // remove previous
            //
            _this.dirty = (!rebuild);
            if (this.parentElement) {
                StoryEditor.trimStoryFrom(this.parentElement);
            }
            //
            // create / rebuild target pickup
            //
            clause = rebuild ? sentence.findClauseWithPredicate("colliding with") : null;
            var index = clause ? obstacles.indexOf(clause.subject) : 0;
            var number = null;
            var count = 0;
            var obstacle = StoryEditor.createVariableImage(index, obstacles);
            obstacle.clause = clause ? clause : container.sentence.addClause("colliding with", obstacles[index]);
            obstacle.addEventListener("change", function (e) {
                //
                // update target pickup
                //
                obstacle.clause.subject = this.options[this.value];
                //
                // update number options
                //
                number.options = [];
                count = _this.level.countInstancesOfMediaForObjectOfType("obstacle", obstacle.clause.subject);
                for (var i = 1; i <= count; i++) {
                    number.options.push(i);
                }
                number.setVariableValue(0);
            });
            //
            // create / rebuild count
            //
            clause = rebuild ? sentence.findClauseWithPredicate("count") : null;
            count = _this.level.countInstancesOfMediaForObjectOfType("obstacle", obstacles[index]);
            var value = 0;
            var options = [];
            for (var i = 1; i <= count; i++) {
                options.push(i);
                if (clause && clause.subject == i) value = i - 1;
            }
            var number = StoryEditor.createVariableSpan(value, options);
            number.clause = clause ? clause : container.sentence.addClause("count", options[0]);
            number.addEventListener("change", function (e) {
                number.clause.subject = this.options[this.value];
            });
            container.appendChild(number);
            container.appendChild(obstacle);
            //
            // add destinations level
            //
            clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
            if (!clause) clause = container.sentence.addClause("go to", "");
            var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
            container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
            container.appendChild(level);
        }
        function takinglongerthan(e) {
            //
            // remove previous
            //
            if ( this.parentElement ) StoryEditor.trimStoryFrom(this.parentElement);
            //
            // add new
            //
            clause = rebuild ? sentence.findClauseWithPredicate("longer than") : null;
            container.appendChild(StoryEditor.createTextSpan("&nbsp;taking longer than&nbsp;"));
            var times = [];
            var time = 20.0;
            for (var i = 0; i < 10; i++) {
                times.push(time);
                time += 20;
            }
            var longerthan = StoryEditor.createVariableSpan(clause ? times.indexOf(clause.subject) : times.length - 1, times);
            longerthan.clause = clause ? clause : container.sentence.addClause("longer than", times[times.length - 1]);
            longerthan.addEventListener("change", function (e) {
                longerthan.clause.subject = this.options[this.value];
            });
            container.appendChild(longerthan);
            container.appendChild(StoryEditor.createTextSpan("&nbsp;seconds&nbsp;"));
            //
            // add destinations level
            //
            clause = rebuild ? sentence.findClauseWithPredicate("go to") : null;
            if (!clause) clause = container.sentence.addClause("go to", "");
            var level = StoryEditor.createLibrarySelector("getlevel.php?listview=true", "Choose Level", clause);
            container.appendChild(StoryEditor.createTextSpan(", then go to level&nbsp;"));
            container.appendChild(level);
        }
        //
        //
        //
        if (obstacles.length > 0) {
            var choice = [
                {
                    title: "colliding with",
                    action: collidingwith
                },
                {
                    title: "taking longer than",
                    action: takinglongerthan

                }
            ];
            action = StoryEditor.createChoice(choice);
            container.appendChild(action);
        } else {
            takinglongerthan();
        }
        //
        //
        //
        this.scrollpane.appendChild(container);
        this.scrollpane.scrollTop = this.scrollpane.scrollHeight;
        //
        //
        //
        if (rebuild) {
            if (action) {
                if (sentence.findClauseWithPredicate("colliding with")) {
                    action.childNodes[0].click();
                } else if (sentence.findClauseWithPredicate("longer than")) {
                    action.childNodes[1].click();
                }
            }
            rebuild = false;
        }
        //
        //
        //
        this.serialise();
    }

    //
    //
    //
    StoryEditor.createDeleteButton = function (editor, container) {
        var button = document.createElement("div");
        button.classList.add("deletebutton");
        button.classList.add("white");
        button.classList.add("top");
        button.classList.add("right");
        //
        //
        //
        button.addEventListener("click", function (e) {
            if (container.sentence !== undefined) {
                editor.gameplay.removeSentence(container.sentence);
                //
                //
                //
                editor.serialise();
            }
            editor.scrollpane.removeChild(container);
        });
        return button;
    }

    StoryEditor.createTextSpan = function (content) {
        var span = document.createElement("span");
        span.type = "textspan";
        span.classList.add("story");
        span.innerHTML = content;
        return span;
    }
    StoryEditor.createVariableSpan = function (value, options) {
        //
        // build basic spin control - move this into function
        //
        var container = document.createElement("div");
        container.type = "variablespan";
        container.classList.add("spincontrol");
        container.options = options;
        container.value = value;
        var variable = document.createElement("span");
        variable.innerHTML = options[value];
        variable.classList.add("spincontrol");
        container.appendChild(variable);
        //
        //
        //
        var changeEvent = localplay.domutils.createCustomEvent("change");
        var up = null;
        var down = null;
        function updateState() {            
            if (container.value < container.options.length - 1) up.classList.remove("disabled");
            if (container.value >= container.options.length - 1) up.classList.add("disabled");
            if (container.value == 0) down.classList.add("disabled");
            if (container.value > 0) down.classList.remove("disabled");
        }

        container.setVariableValue = function (v) {
            if (v < 0) {
                v = 0;
            } else if (v >= container.options.length) {
                v = container.options.length - 1;
            }
            container.value = v;
            variable.innerHTML = container.options[v];
            updateState();
            container.dispatchEvent(changeEvent);
        }
        //
        //
        //
        up = document.createElement("div");
        up.classList.add("spincontrol");
        up.classList.add("button");
        up.classList.add("up");
        down = document.createElement("div");
        down.classList.add("spincontrol");
        down.classList.add("button");
        down.classList.add("down");
        //
        // set state
        //
        if (value == 0) {
            down.classList.add("disabled");
        }
        if (value == container.options.length - 1) {
            up.classList.add("disabled");
        }
        container.appendChild(up);
        container.appendChild(down);
        //
        //
        //
        down.addEventListener("click", function (e) {
            if (!this.classList.contains("disabled") && container.value > 0) {
                container.value--;
                variable.innerHTML = container.options[container.value];
                updateState();
                container.dispatchEvent(changeEvent);
            }
        });
        up.addEventListener("click", function (e) {
            if (!this.classList.contains("disabled") && container.value < container.options.length - 1) {
                container.value++;
                variable.innerHTML = container.options[container.value];
                updateState();
                container.dispatchEvent(changeEvent);
            }
        });
        return container;
    }
    StoryEditor.createVariableImage = function (value, options) {
        //
        // build basic spin control - move this into function
        //
        var container = document.createElement("div");
        container.type = "variableimage";
        container.classList.add("spincontrol");
        container.value = value;
        container.options = options;
        var variable = document.createElement("img");
        variable.src = options[value];
        variable.classList.add("spincontrol");
        container.appendChild(variable);
        //
        //
        //
        if (options.length > 1) {
            var changeEvent = localplay.domutils.createCustomEvent("change");
            var up = document.createElement("div");
            up.classList.add("spincontrol");
            up.classList.add("button");
            up.classList.add("up");
            if (value == 0) {
                up.classList.add("disabled");
            }
            var down = document.createElement("div");
            down.classList.add("spincontrol");
            down.classList.add("button");
            down.classList.add("down");
            if (value == options.length - 1) {
                down.classList.add("disabled");
            }
            container.appendChild(up);
            container.appendChild(down);
            //
            //
            //
            up.addEventListener("click", function (e) {
                if (!this.classList.contains("disabled") && container.value > 0) {
                    container.value--;
                    variable.src = options[container.value];
                    if (container.value == 0) this.classList.add("disabled");
                    if (container.value < options.length - 1) down.classList.remove("disabled");
                    container.dispatchEvent(changeEvent);
                }
            });
            down.addEventListener("click", function (e) {
                if (!this.classList.contains("disabled") && container.value < options.length - 1) {
                    container.value++;
                    variable.src = options[container.value];
                    if (container.value > 0) up.classList.remove("disabled");
                    if (container.value >= options.length - 1) down.classList.add("disabled");
                    container.dispatchEvent(changeEvent);
                }
            });
        }
        return container;
    }
    StoryEditor.createChoice = function (options, value) {
        //
        // build basic spin control - move this into function
        //
        var container = document.createElement("div");
        container.type = "choice";
        container.classList.add("choice");
        container.value = value !== undefined ? value : -1;
        for (var i = 0; i < options.length; i++) {
            var choice = document.createElement("div");
            choice.classList.add("choice");
            choice.classList.add("option");
            if (container.value >= 0 && i !== container.value) choice.classList.add("hidden");
            choice.innerHTML = options[i].title;
            choice.value = i;
            choice.action = options[i].action;
            choice.addEventListener("click", function (e) {
                if (this.value == container.value) {
                    //
                    // show other choices
                    //
                    container.value = -1;
                    for (var child = container.firstChild; child != null; child = child.nextSibling) {
                        child.classList.remove("hidden");
                    }
                } else {
                    //
                    // hide other choices
                    //
                    container.value = this.value;
                    for (var child = container.firstChild; child != null; child = child.nextSibling) {
                        if (child != this) {
                            child.classList.add("hidden");
                        }
                    }
                    if (this.action) {
                        this.action(e);
                    }
                }
            });
            container.appendChild(choice);
        }

        return container;
    }
    StoryEditor.createLibrarySelector = function (url, title, clause, editor, callback) {
        //
        // 
        //
        var container = document.createElement("div");
        container.classList.add("choice");
        container.style.padding = "8px";
        //
        //
        //
        container.clause = clause;
        container.callback = callback;
        function setContents(subject) {
            if (subject && subject.length > 0) {
                //
                // get name for subject
                //
                var components = clause.subject.split('|');
                if (components.length >= 3) {
                    container.innerHTML = '<h3>' + components[1] + '</h3>';
                    container.innerHTML += '<img  style="max-width: 256px; max-height: 256px" src="' + components[2] + '" />';
                } else {
                    container.innerHTML = '<img style="max-width: 256px; max-height: 256px" src="' + subject + '" />';
                }
            } else {
                container.innerHTML = "click to select";
            }
            if (container.callback) {
                container.callback(subject);
            }
        }
        setContents(clause.subject);
        //
        //
        //
        container.addEventListener("click", function (e) {
            localplay.listview.createlibrarydialog(title, url, function (item) {
                if (item.data.thumbnail !== item.data.url) {
                    //
                    // assume entry for level
                    //
                    container.clause.subject = item.data.id + "|" + item.data.name + "|" + item.data.thumbnail;
                } else {
                    //
                    // assume entry for media
                    //
                    container.clause.subject = item.data.url;
                }
                setContents(container.clause.subject);
            });
        });
        return container;
    }
    //
    //
    //
    StoryEditor.trimStoryFrom = function (element) {
        var parent = element.parentElement;

        var current = element.nextSibling;
        while (current) {
            var next = current.nextSibling;
            if (parent.sentence !== undefined && current.clause !== undefined) {
                parent.sentence.removeClause(current.clause);
            }
            parent.removeChild(current);
            current = next;
        }
    }
    //
    // utilities
    //
    StoryEditor.prototype.buildStoryFromGameplay = function () {
        for (var verb in this.gameplay.sentences) {
            var collection = this.gameplay.sentences[verb];
            for (var i = 0; i < collection.length; i++) {
                if (verb === "collect") {
                    this.addCollect(collection[i]);
                } else if (verb === "avoid") {
                    this.addAvoid(collection[i]);
                } else if (verb === "win") {
                    this.addWin(collection[i]);
                } else if (verb === "lose" || verb === "loose") { // legecy spelling error
                    this.addLose(collection[i]);
                } else if (verb === "story") {
                    this.addStory(collection[i]);
                } else if (verb === "newwin") {
                    this.addNewWin(collection[i]);
                } else if (verb === "newlose") {
                    this.addNewLose(collection[i]);
                }
            }
        }
    }
    //
    // generic asset bar functionality
    //
    StoryEditor.prototype.save = function () {
        if (this.container && this.jsonin) {
            //
            //
            //
            var jsonout = JSON.stringify(this.gameplay);
            if (jsonout.length != this.jsonin.length || jsonout !== this.jsonin) {
                this.level.autogenerate = false;
            }
            this.level.gamestate = localplay.game.gamestate.creategamestate(this.level.gameplay); // TODO: this should perhaps be in the level
            this.level.reserialise();
        }
    }
    //
    //
    //
    storyeditor.createstoryeditor = function (level) {
        return new StoryEditor(level);
    }
    //
    //
    //
    return storyeditor;
})();
