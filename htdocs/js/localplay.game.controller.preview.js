/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.controller.preview.js
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
localplay.game = localplay.game ? localplay.game : {};
localplay.game.controller = localplay.game.controller ? localplay.game.controller : {};
//
// preview module
//
localplay.game.controller.preview = (function () {
    if (localplay.game.controller.preview) return localplay.game.controller.preview;
    //
    // resources
    //

    //
    // templates
    //
    var loading     = 'Loading 0%';
    var mouseover = '\
                <div style="width: 100%; text-align: center;" > \
                    <h3>{{name}}</h3> \
                    <img id="preview.prev" title="previous level" class="imagebutton" style="position: absolute; top: 40%; left: 4px;" src="images/icons/arrow-previous-01.png" /> \
                    <img id="preview.play" title="play level" class="imagebutton" src="images/icons/play-game-01.png" /></p> \
                    <img id="preview.next" title="next level" class="imagebutton" style="position: absolute; top: 40%; right: 4px;" src="images/icons/arrow-next-01.png" /> \
                    by&nbsp;{{creator}} \
                </div> \
                ';
 
    //
    //
    //
    var preview = {};
    //
    // TODO: support for controlling preview
    //
    function PreviewController(game) {
        //
        //
        //
        localplay.game.controller.attachcontroller(game, this);
        //
        //
        //
        this.timer = localplay.timer.createtimer();
        this.game = game;
        //
        // hook events
        //
        // TODO: a more generic way of doing the binding way 
        //
        this.boundclick = this.onclick.bind(this);
        this.boundmouseover = this.onmouseover.bind(this);
        this.boundmouseleave = this.onmouseleave.bind(this);
        this.boundresize = this.onresize.bind(this);
        this.boundstatechange = this.onstatechange.bind(this);
        this.game.canvas.addEventListener("click", this.boundclick);
        this.game.canvas.addEventListener("mousemove", this.boundmouseover);
        this.game.canvas.addEventListener("mouseover", this.boundmouseover);
        this.game.canvas.addEventListener("mouseout", this.boundmouseleave);
        window.addEventListener("resize", this.boundresize);
        this.game.level.addEventListener("statechange", this.boundstatechange);
        //
        // create ui
        //
        this.banner = document.createElement("div");
        this.banner.id = "preview.banner";
        this.banner.classList.add("gamebanner");
        this.banner.style.visibility = "hidden";
        this.game.canvas.offsetParent.appendChild(this.banner);
        this.banner.addEventListener("mouseover", this.boundmouseover);
        this.onstatechange();
        //
        //
        //
        this.showcontrols = false;
    }
    //
    // required controller methods
    //

    PreviewController.prototype.draw = function () {
        switch (this.game.level.state) {
            case localplay.game.level.states.loading:
                //
                // draw progress
                //
                this.banner.innerHTML = "Loading " + this.game.level.loadingprogress + "%";
                break;
            case localplay.game.level.states.ready:
                this.game.level.updateitems(this.timer.elapsed());
                break;
                
        }
    }

    PreviewController.prototype.detach = function () {
        //
        // unhook events
        //
        this.game.canvas.removeEventListener("click", this.boundclick);
        this.game.canvas.removeEventListener("mouseover", this.boundmouseover);
        this.game.canvas.removeEventListener("mouseenter", this.boundmouseover);
        this.game.canvas.removeEventListener("mouseout", this.boundmouseleave);
        window.removeEventListener("resize", this.boundresize);
    }
    //
    //
    //
    PreviewController.prototype.showbanner = function (template, data) {
        if (!template || template.length === 0) {
            this.banner.style.visibility = "hidden";
        } else {
            var render = data ? Mustache.render(template, data) : template;
            this.banner.innerHTML = render;
            this.banner.style.visibility = "visible";
            //
            // hook all buttons
            //
            localplay.game.controller.hookbuttons(this.banner, "preview", this.boundclick);
        }
    }

    PreviewController.prototype.onstatechange = function (e) {
        switch (this.game.level.state) {
            case localplay.game.level.states.clear:
                if( !this.showcontrols ) this.showbanner();
                break;
            case localplay.game.level.states.loading:
                this.showbanner(loading);
                break;
            case localplay.game.level.states.ready:
                if (this.showcontrols) {
                    this.showbanner(mouseover, this.game.metadata);             
                } else {
                    this.showbanner();
                }
                this.timer.start();
                break;
         }

    }

    //
    // event handlers
    //
    PreviewController.prototype.onclick = function (e) {
        //
        // 
        //
        localplay.domutils.fixEvent(e);

        var selector = e.target.id.split(".");
        if (selector.length === 2) {
            switch (selector[1]) {
                case "play":
                    {
                        //
                        // play fullscreen
                        //
                        if (this.game.arcade && this.game.arcade.length > 0) {
                            sessionStorage.setItem("localplay.arcade", JSON.stringify(this.game.arcade));
                            sessionStorage.setItem("localplay.arcade.level", this.game.currentlevel);
                        } else {
                            sessionStorage.removeItem("localplay.arcade");
                            sessionStorage.removeItem("localplay.arcade.level");
                        }
                        //
                        // 
                        //
                        window.location = "playnew.html?id=" + this.game.levelid;
                        
                    }
                    break;
                case "prev":
                    this.showcontrols = false;
                    this.game.previouslevel();
                    break;
                case "next":
                    this.showcontrols = false;
                    this.game.nextlevel();
                    break;
            }
        }
        /*
        if (e.offsetX < prev.naturalWidth + 8) {
            this.game.previouslevel();
        } else if (e.offsetX > this.game.canvas.offsetWidth - (next.naturalWidth + 8)) {
            this.game.nextlevel();
        } else {
            //
            // play fullscreen
            //
            if (this.game.arcade && this.game.arcade.length > 0) {
                sessionStorage.setItem("localplay.arcade", JSON.stringify(this.game.arcade));
                sessionStorage.setItem("localplay.arcade.level", this.game.currentlevel);
            } else {
                sessionStorage.removeItem("localplay.arcade");
                sessionStorage.removeItem("localplay.arcade.level");
            }
            //
            // 
            //
            window.location = "playnew.html?id=" + this.game.levelid;
        }
        */
        return false;
    }

    PreviewController.prototype.onmouseover = function (e) {
        //
        // show navigation
        //
        if (!this.showcontrols) {
            this.showcontrols = true;
            this.showbanner(mouseover, this.game.metadata);
        }
        return false;
    }

    PreviewController.prototype.onmouseleave = function (e) {
        //
        // hide navigation
        //
        if (!(e.relatedTarget && e.relatedTarget.id.indexOf("preview") === 0)) {
            this.showcontrols = false;
            this.showbanner();
        }
        return false;
    }

    PreviewController.prototype.onresize = function (e) {
        this.game.fittocontainer();
    }

    preview.attachtogame = function (game) {
        //
        // TODO: detatch controller, probably need registry of who is attached to whom in localplay.gamecontroller
        //
        return new PreviewController(game);
    }
    return preview;
})();
