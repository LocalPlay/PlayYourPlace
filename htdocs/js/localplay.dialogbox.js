/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.dialogbox.js
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
localplay.dialogbox = (function () {
    var dialogbox = {};
    //
    // private utility functions
    //
    function toplevelparent() {
        var fullscreenenabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
        var parent = null;
        if (fullscreenenabled) {
            parent = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
        }
        return parent ? parent : document.body;
      }
    //
    //
    //
    function DialogBox(properties) {
        //
        //
        //
        var _this = this;
        localplay.domutils.extendAsEventDispatcher(this);
        //
        // create 
        //
        this.backdrop = document.createElement("div");
        this.backdrop.className = "backdrop";
        this.dialog = document.createElement("div");
        this.dialog.className = "dialog";
        if (properties.fullscreen) {
            this.dialog.style.position = "absolute";
            this.dialog.style.display = "inline";
            this.dialog.style.margin = "0px";
            this.dialog.style.top = "0px"
            this.dialog.style.left = "0px"
            this.dialog.style.bottom = "0px"
            this.dialog.style.right = "0px"
        } else {
            if (properties.width && properties.width > 0) {
                this.dialog.style.width = properties.width + "px";
            }
            if (properties.height && properties.height > 0) {
                this.dialog.style.height = properties.width + "px";
            }
        }
    
        this.content = [];
        this.toolbar = null;
        this.menubar = null;
        if (properties.prompt) { // generic prompt
            this.menubar = document.createElement("div");
            this.menubar.className = "menubar";
           
            this.prompt = document.createElement("div");
            this.prompt.classList.add("menubaritem");
            this.prompt.classList.add("disabled");
            //this.prompt.innerHTML = '<img class="menubaritem" src="images/icons/breadcrumb.png" />&nbsp;' + properties.prompt;
            this.prompt.innerHTML = properties.prompt;
            this.menubar.appendChild(this.prompt);

        }
        if (properties.closebuttonaction) {
            if (!this.menubar) {
                this.menubar = document.createElement("div");
                this.menubar.className = "menubar";
                
            }
            var closebuttonaction = properties.closebuttonaction;
            var close = document.createElement("div");
            close.classList.add("menubaritem");
            close.classList.add("right");
            close.innerHTML = '\
                <img class="menubaritem" src="images/icons/close-cancel-01.png" />&nbsp;Close \
            ';
            /*
            var close = new Image();
            close.classList.add("imagebutton");
            close.style.position = "absolute";
            close.style.top = "8px";
            close.style.right = "8px";
            close.style.width = "32px";
            close.style.height = "32px";
            close.src = "images/icons/close-cancel-01.png";
            */
            close.onclick = function (e) {
                closebuttonaction(_this);
                _this.close();
                return false;
            };
            this.menubar.appendChild(close);
        }
        if (this.menubar) {
            this.dialog.appendChild(this.menubar);
            var spacer = document.createElement("div");
            spacer.style.width = "100%";
            spacer.style.height = "42px";
            spacer.style.marginBottom = "16px";
            this.dialog.appendChild(spacer);
        }

        if (properties.content) { // other content
            this.content = properties.content;
            var container = this.dialog;
            if (properties.fullscreen) {
                container = document.createElement("div");
                container.style.position = "absolute";
                container.style.left = "0px";
                container.style.top = "42px";
                container.style.right = "0px";
                container.style.bottom = "0px";
                container.style.overflow = "auto";
            }
            for (var i = 0; i < this.content.length; i++) {

                if (typeof this.content[i] == "string") {
                    var wrapper = document.createElement("div");
                    wrapper.innerHTML = this.content[i];
                    container.appendChild(wrapper);
                } else {
                    container.appendChild(this.content[i]);
                }
            }
            if (container !== this.dialog) {
                this.dialog.appendChild(container);
            }
        }

        if (properties.buttons && properties.buttons.length > 0) { // buttons
            this.toolbar = document.createElement("div");
            this.toolbar.className = "toolbar";
            this.toolbar.style.height = "42px";
            this.toolbar.style.marginTop = "16px";
            for (var i = 0; i < properties.buttons.length; i++) {
                if (typeof properties.buttons[i].content == "string") {
                    var button = document.createElement("div");
                    button.className = "menubaritem";
                    //button.innerHTML = properties.buttons[i].content;
                    button.innerHTML = '\
                        <img class="menubaritem" src="images/icons/add-01.png" />&nbsp; \
                    ' + properties.buttons[i].content;
                    button.onclick = properties.buttons[i].action;
                    this.toolbar.appendChild(button);
                } else {
                    properties.buttons[i].content.onclick = properties.buttons[i].action;
                    this.toolbar.appendChild(properties.buttons[i].content);
                }
            }
            this.dialog.appendChild(this.toolbar);
        }
        //
        // attach dialog to backdrop
        //
        this.backdrop.appendChild(this.dialog);
     }

    DialogBox.prototype.show = function (show) {
        if (show === undefined || show) {
            toplevelparent().appendChild(this.backdrop);
        } else {
            this.backdrop.parentElement.removeChild(this.backdrop);
        }
    }

    DialogBox.prototype.close = function () {
        if (this.backdrop) {
            if (this.prompt&&this.prompt.menupopup) {
                localplay.menu.dettachmenu(this.prompt);
            }
            localplay.domutils.purgeDOMElement(this.backdrop);
            this.backdrop.parentElement.removeChild(this.backdrop);
            this.backdrop = null;
            var closeevent = localplay.domutils.createCustomEvent("close");
            this.dispatchEvent(closeevent);
        }
    }
    DialogBox.prototype.attachmenu = function (items,callback) {
        if (!this.prompt) return;
        this.prompt.classList.remove("disabled");
        if (this.prompt.firstChild.tagName === "IMG") {
            this.prompt.firstChild.src = "images/icons/menu-01.png";
        } else {
            var title = this.prompt.innerHTML;
            this.prompt.innerHTML = '<img class="menubaritem" src="images/icons/menu-01.png" />&nbsp;' + title;
        }
        //
        // create breadcrumb
        //
        var breadcrumb = document.createElement("div");
        breadcrumb.classList.add("menubaritem");
        breadcrumb.classList.add("disabled");
        if (this.prompt.insertAdjacentElement) {
            this.prompt.insertAdjacentElement("afterEnd", breadcrumb);
        } else {
            this.menubar.appendChild(breadcrumb);
        }
        //
        //
        //
        this.prompt.menupopup = localplay.menu.attachmenu(this.prompt, items, callback);
        return breadcrumb;
    }
    //
    //
    //
    dialogbox.createdialogbox = function (prompt, content, buttons, actions, width, height, closebuttonaction) {
        var properties = {
            prompt: prompt,
            content: content,
            buttons: [],
            width: width,
            height: height,
            fullscreen: false,
            closebuttonaction: (closebuttonaction || null)
        }
        if (buttons&&actions) {
            for (var i = 0; i < buttons.length; i++) {
                properties.buttons.push({
                    content: buttons[i],
                    action: actions[i]
                });
            }
        }
        return new DialogBox(properties);
    }
    dialogbox.createfullscreendialogbox = function (prompt, content, buttons, actions, closebuttonaction) {
        var properties = {
            prompt: prompt,
            content: content,
            buttons: [],
            fullscreen: true,
            closebuttonaction: (closebuttonaction || null)
        }
        if ( buttons && actions ) {
            for (var i = 0; i < buttons.length; i++) {
                properties.buttons.push({
                    content: buttons[i],
                    action: actions[i]
                });
            }
        }
        return new DialogBox(properties);
    }
    dialogbox.createfullscreendialogboxwithtemplate = function (prompt, template, data, closebuttonaction) {
        var properties = {
            prompt: prompt,
            content: [ Mustache.render( template, data ) ],
            fullscreen: true,
            closebuttonaction: (closebuttonaction || null)
        }
        return new DialogBox(properties);
    }

    dialogbox.alert = function (title, message, callback) {
        /*
        var dialog = this.createdialogbox(title, message ? [message] : [], ["Ok"],
            [function () {
                dialog.close();
                if (callback) {
                    callback();
                }
            }]);
            */
        var dialog = this.createdialogbox(title, message ? [message] : [], [], [], -1, -1, callback || function () { dialog.close(); });
        dialog.show();
    }
    //
    // TODO: build on this precondition met
    //
    dialogbox.confirm = function (title, message, callback, preconditionmet) {
        if (preconditionmet) {
            callback(true);
        } else {
            var dialog = null;
            var action = function (confirm) {
                if (callback !== undefined && callback) {
                    callback(confirm);
                }
                dialog.close();
            };
            dialog = this.createdialogbox(title, message ? [message] : [], ["Yes", "No"], [function () { action(true); }, function () { action(false) }]);
            dialog.show();
        }
    }
    dialogbox.pinnedpopupwithtargetelement = function (target, template, data, callback) {
        var p = localplay.domutils.elementPosition(target);
        this.pinnedpopupatpoint(p, template, data, callback);
    }
    dialogbox.pinnedpopupatpoint = function (p, template, data, callback) {
        //
        // 
        //
        var html = data ? Mustache.render(template, data) : template;
        var properties = {
            content: [html]
        }

        var dialog = new DialogBox(properties);
        dialog.dialog.style.visibility = "hidden";
        dialog.dialog.style.position = "absolute";
        dialog.dialog.style.margin = "0";
        dialog.dialog.style.padding = "8px";
        dialog.dialog.style.overflow = "visible";
        dialog.show();

        var width = dialog.dialog.offsetWidth;
        var height = dialog.dialog.offsetHeight;
        var align = new Point();
        if (p.x - width < 0) {
            dialog.dialog.style.left = Math.round(p.x - 15) + "px";
            align.x = 0;
        } else {
            dialog.dialog.style.right = Math.round((dialog.backdrop.offsetWidth - (p.x + 15))) + "px";
            align.x = 1;
        }
        
        if (p.y - height < 0) {
            dialog.dialog.style.top = Math.round(p.y + 15) + "px";
            align.y = 0;
        } else {
            dialog.dialog.style.bottom = Math.round(dialog.backdrop.offsetHeight - (p.y - 15)) + "px";
            align.y = 1;
        }
        //
        // position arrow
        //
        var arrow = document.createElement("div");
         if (align.y === 0) {
            arrow.className = "triangle-up";
            arrow.style.top = "-15px";
        } else {
            arrow.className = "triangle-down";
            arrow.style.bottom = "-15px";
        }
        if (align.x === 0) {
            arrow.classList.add("left");
        } else {
            arrow.classList.add("right");
        }
        //
        // append arrow
        //
        dialog.dialog.appendChild(arrow);
        //
        // show dialog
        //
        dialog.dialog.style.visibility = "visible";
        //
        //
        //
        var onclick = function (e) {
            if (callback(e)) {
                dialog.close();
            }
        }
        localplay.domutils.hookChildElementsWithPrefix(dialog.dialog, "button", "click", onclick);

        return dialog;
    }
    dialogbox.dialogboxwithtemplate = function (template, data, callback, fullscreen) {
        //
        // 
        //
        var html = data ? Mustache.render(template, data) : template;
        var properties = {
            content: [html],
            fullscreen: fullscreen
        }
        //
        //
        //
        var dialog = new DialogBox(properties);
        dialog.show();
        //
        //
        //
        var onclick = function (e) {
            if (callback(e)) {
                dialog.close();
            }
        }
        localplay.domutils.hookChildElementsWithPrefix(dialog.dialog, "button", "click", onclick);

        return dialog;
    }
    //
    //
    //
    return dialogbox;
})();