/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.itemeditor.js
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
localplay.game.itemeditor = (function () {
    var itemeditor = {};
    //
    //
    //
    function ItemEditor(level) {
        this.level = level;
        var _this = this;
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.top = "0px";
        this.container.style.left = "0px";
        this.container.style.bottom = "0px";
        this.container.style.right = "0px";
        //
        // TODO: templating
        //
        this.medialibrary = document.createElement("div");
        this.medialibrary.id = "medialibrary";
        this.medialibrary.className = "listview";
        this.medialibrary.style.top = "0px";
        this.medialibrary.innerHTML = Mustache.render(localplay.listview.editablecontainer, { addlabel: "Upload drawings of things" });
        //
        //
        //
        this.container.appendChild(this.medialibrary);
    }

    ItemEditor.prototype.save = function () {

    }

    ItemEditor.prototype.initialise = function () {
        //
        // populate views
        //
        var _this = this;
        this.medialibrary.controller = localplay.listview.createlistview("medialibrary", "getmedia.php?type=object&listview=true", 24);
        this.medialibrary.controller.onselect = function (item) {
            _this.addItem(item.data.url);
        };
        //
        //
        //
        var addobjectbutton = document.getElementById("localplay.addlistitem");
        if (addobjectbutton) {
            addobjectbutton.onclick = function (e) {
                var objecteditor = localplay.objecteditor.createobjecteditor("Add Thing", function () {
                    _this.medialibrary.controller.refresh();
                });
            }
        }
    }

    ItemEditor.prototype.close = function () {
        if (this.container) {
            localplay.domutils.purgeDOMElement(this.container);
            this.container.parentElement.removeChild(this.container);
        }
    }

    ItemEditor.prototype.addItem = function (url) {
        var position = new Point(this.level.game.canvas.width / 2, this.level.game.canvas.height / 2);
        position.scale(this.level.game.getscale());
        position.x += this.level.world.viewport.x;
        var _this = this;
        var dialog = new localplay.dialogbox.createdialogbox("Add object as?", [],
           ["Platform", "Obstacle", "Pickup", "Goal", "Prop", "Cancel"],
           [
               function () {
                   _this.level.newitem("platform", url, position);
                   dialog.close();
               },
            function () {
                _this.level.newitem("obstacle", url, position);
                dialog.close();
            },
            function () {
                _this.level.newitem("pickup", url, position);
                dialog.close();
            },
            function () {
                _this.level.newitem("goal", url, position);
                dialog.close();
                return false;
            },
            function () {
                _this.level.newitem("prop", url, position);
                dialog.close();
            },
           function () {
               dialog.close();
           }], 600);
        dialog.show();

    }
    //
    //
    //
    itemeditor.createitemeditor = function (level) {
        return new ItemEditor(level);
    }
    //
    //
    //
    return itemeditor;
})();