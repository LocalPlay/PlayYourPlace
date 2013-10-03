localplay.game.avatareditor = (function () {
    var avatareditor = {};

    function AvatarEditor(level) {
        var _this = this;
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.top = "0px";
        this.container.style.left = "8px";
        this.container.style.bottom = "0px";
        this.container.style.right = "8px";
        //
        //
        //
        this.avatarview = document.createElement("div");
        this.avatarview.id = "avatarview";
        this.avatarview.className = "avatarview";
        //
        //
        //
        this.image = new Image();
        this.image.classList.add("avatarview");
        this.image.classList.add("backgroundgrid");
        this.image.onload = function (e) {
            level.avatar.replacesprite(e.target.src);
            //
            // shift avatar on screen
            //
            var dim = new Point(_this.image.naturalWidth / 2, _this.image.naturalHeight / 2);
            level.avatar.sprite.beginedit();
            if (level.avatar.sprite.editPosition.x - dim.x < 0) {
                level.avatar.sprite.editPosition.x += Math.abs(level.avatar.sprite.editPosition.x - dim.x) + 10;
            }
            if (level.avatar.sprite.editPosition.x + dim.x > localplay.defaultsize.width) {
                level.avatar.sprite.editPosition.x -= ((level.avatar.sprite.editPosition.x + dim.x) - localplay.defaultsize.width) + 10;
            }
            if (level.avatar.sprite.editPosition.y - dim.y < 0) {
                level.avatar.sprite.editPosition.y += Math.abs(level.avatar.sprite.editPosition.y - dim.y) + 10;
            }
            if (level.avatar.sprite.editPosition.y + dim.y > localplay.defaultsize.height) {
                level.avatar.sprite.editPosition.y -= ((level.avatar.sprite.editPosition.y + dim.y) - localplay.defaultsize.height) + 10;
            }
            level.avatar.sprite.commitedit();
            //
            // save changes
            //
            level.reserialise();
        }
        this.image.src = level.avatar.image;
        this.avatarview.appendChild(this.image);
        //
        // hook drag events
        //
        var _this = this;
        this.avatarview.ondragenter = function (e) {
            _this.avatarview.classList.add('over');

        }
        this.avatarview.ondragleave = function (e) {
            _this.avatarview.classList.remove('over');  
        }
        this.avatarview.ondragover = function (e) {
            localplay.domutils.preventDefault(e);
            if (!_this.avatarview.classList.contains('over')) {
                _this.avatarview.classList.add('over');
            }
            e.dataTransfer.dropEffect = 'copy';
            return false;
        }
        this.avatarview.ondrop = function (e) {
            localplay.domutils.stopPropagation(e);
            _this.avatarview.classList.remove('over');
            var url = e.dataTransfer.getData("Text");
            _this.image.src = url;
            localplay.domutils.preventDefault(e);
            return false;
        }
        //
        //
        //
        var d = new Date();
        this.prefix = "avatar.medialibrary." + d.getTime();
        this.medialibrary = document.createElement("div");
        this.medialibrary.id = this.prefix;
        this.medialibrary.className = "listview";
        this.medialibrary.style.top = "260px";
        this.medialibrary.innerHTML = Mustache.render(localplay.listview.editablecontainer, { prefix: this.prefix, addlabel: "Upload drawings of avatars" });
        //
        //
        //
        this.container.appendChild(this.avatarview);
        this.container.appendChild(this.medialibrary);
    }

    AvatarEditor.prototype.initialise = function () {
        var _this = this;
        this.medialibrary.controller = localplay.listview.createlistview(this.prefix, "getmedia.php?type=object&listview=true", 20);
        this.medialibrary.controller.onselect = function (item) {
            _this.image.src = item.data.url;
        };
        //
        //
        //
        var addobjectbutton = document.getElementById(this.prefix + ".localplay.addlistitem");
        if (addobjectbutton) {
            addobjectbutton.onclick = function (e) {
                var objecteditor = localplay.objecteditor.createobjecteditor("Add Avatar", function () {
                    _this.medialibrary.controller.refresh();
                    localplay.showtip("Drag things here to change you avatar", this.avatarview);
                });
            }
        }
        localplay.showtip("Drag things here to change you avatar", this.avatarview);

    }

    AvatarEditor.prototype.dealloc = function () {
        localplay.showtip();
    }

    avatareditor.createavatareditor = function (level) {
        return new AvatarEditor(level);
    }
    return avatareditor;

})();
