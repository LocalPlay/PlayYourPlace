/*
    Gameplay definition and current gameplay state
*/
;
localplay.game.gameplay = (function () {
    if (localplay.game.gameplay) return localplay.game.gameplay;

    var gameplay = {};

    function Gameplay() {
        this.sentences = {};
    }

    Gameplay.prototype.clear = function () {
        this.sentences = {};
    }

    Gameplay.prototype.countSentences = function () {
        var count = 0;
        for (var verb in this.sentences) {
            count += this.sentences[verb].length;
        }
        return count;
    }
    Gameplay.prototype.addSentence = function (verb) {
        if (this.sentences[verb] === undefined) {
            this.sentences[verb] = [];
        }
        var sentence = new GameplaySentence(verb);
        this.sentences[verb].push(sentence);
        return sentence;
    }

    Gameplay.prototype.removeSentence = function (sentence) {
        var collection = this.sentences[sentence.verb];
        if (collection !== undefined) {
            var index = collection.indexOf(sentence);
            if (index >= 0) {
                collection.splice(index, 1);
            }
        }
    }

    Gameplay.prototype.removeSentencesWithItem = function (item) {
        //
        // get item media
        //
        var media = localplay.domutils.urlToRelativePath(item.image);
        //
        // search
        //
        for (var verb in this.sentences) {
            var collection = this.sentences[verb];
            for (var i = 0; i < collection.length;) {
                if (collection[i].hasClauseWithSubject(media)) {
                    collection.splice(i, 1);
                } else {
                    i++;
                }
            }
        }
    }

    Gameplay.prototype.containsItem = function (item) {
        //
        // get item media
        //
        var media = localplay.domutils.urlToRelativePath(item.image);
        //
        // search
        //
        for (var verb in this.sentences) {
            var collection = this.sentences[verb];
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].hasClauseWithSubject(media)) return true;
            }
        }
        return false;
    }

    Gameplay.prototype.replaceSubject = function (original, replacement) {
        //
        // 
        //
        for (var verb in this.sentences) {
            var collection = this.sentences[verb];
            for (var i = 0; i < collection.length; i++) {
                collection[i].replaceSubject(original, replacement);
            }
        }

    }
    /*
        Gameplay sentence
    */
    function GameplaySentence(verb) {
        this.verb = verb;
        this.clauses = [];
    }

    GameplaySentence.prototype.toJSON = function () {
        var json = {
            verb: this.verb,
            clauses: this.clauses
        };
        return json;
        /*
        var json = "{";
        json += "'verb' : '" + this.verb + "',";
        json += "'clauses' : " + JSON.stringify(this.clauses);
        json += "}";
        return json;
        */
    }

    GameplaySentence.prototype.addClause = function (predicate, subject) {
        var clause = new GameplayClause(predicate, subject);
        this.clauses.push(clause);
        return clause;
    }
    GameplaySentence.prototype.removeClause = function (clause) {
        var index = this.clauses.indexOf(clause);
        if (index >= 0) {
            this.clauses.splice(index, 1);
        }
    }
    GameplaySentence.prototype.findClauseWithPredicate = function (predicate) {
        for (var i = 0; i < this.clauses.length; i++) {
            if (this.clauses[i].predicate === predicate) return this.clauses[i];
        }
        return null;
    }
    GameplaySentence.prototype.findClauseWithSubject = function (subject) {
        for (var i = 0; i < this.clauses.length; i++) {
            if (this.clauses[i].subject === subject) return this.clauses[i];
        }
        return null;
    }
    GameplaySentence.prototype.hasClauseWithSubject = function (subject) {
        return this.findClauseWithSubject(subject) != null;
    }

    GameplaySentence.prototype.replaceSubject = function (original, replacement) {
        for (var i = 0; i < this.clauses.length; i++) {
            if (this.clauses[i].subject === original) this.clauses[i].subject = replacement;
        }
    }
    /*
        Gameplay clause
    */
    function GameplayClause(predicate, subject) {
        this.predicate = predicate;
        this.subject = subject;
    }
    GameplayClause.prototype.toJSON = function () {
        var json = {
            predicate: this.predicate,
            subject: this.subject
        };
        return json;
    }
    //
    //
    //
    gameplay.creategameplay = function () {
        return new Gameplay();
    }
    //
    //
    //
    return gameplay;
})();


