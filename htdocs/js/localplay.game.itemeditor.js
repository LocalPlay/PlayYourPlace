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