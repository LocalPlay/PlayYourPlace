;
//
// editor module
//
localplay.game.controller = (function () {
    if (localplay.game.controller) return localplay.game.controller;

    var controllers = [];

    function findgame(game) {

        for (var i = 0; i < controllers.length; i++) {
            if (controllers[i].game === game) return i;
        }

        return -1;
    }

    function findcontroller(game) {

        for (var i = 0; i < controllers.length; i++) {
            if (controllers[i].game === game) return i;
        }

        return -1;
    }

    var controller = {};
    //
    // attach controller to game
    //
    controller.attachcontroller = function (g, c) {
        var i = findgame(g);
        if (i > -1) {
            this.detachcontroller(g);
        }
        controllers.push({ game: g, controller: c });
        g.controller = c;
    }
    //
    // detach controller from game
    //
    controller.detachcontroller = function (g) {
        var i = findgame(g);
        if (i > -1) {
            controllers[i].controller.detach();
            g.controller = null;
            controllers.splice(i, 1);
        }
    }
    //
    // common utility methods
    //
    controller.hookbuttons = function (container, selector, callback) {

        for (var i = 0; i < container.childNodes.length; i++) {
            if (container.childNodes[i].id && container.childNodes[i].id.indexOf(selector) === 0) {
                container.childNodes[i].addEventListener("click", callback);
            }
            if (container.childNodes[i].childNodes.length > 0) {
                this.hookbuttons(container.childNodes[i], selector, callback);
            }
        }

    }
    //
    //
    //
    controller.createlevel = function (game) {
        //
        // show create level dialog
        //
        var _this = this;

        var content = [];

        var left = document.createElement("div");
        left.style.display = "inline-block";
        left.style.verticalAlign = "top";
        left.style.minWidth = "256px";
        left.style.minHeight = "400px";
        left.style.padding = "8px";

        var nameWrapper = document.createElement("div");
        nameWrapper.innerHTML = "<h4>Name</h4>";
        var name = document.createElement("input");
        name.type = "text";
        nameWrapper.appendChild(name);
        left.appendChild(nameWrapper);

        var placeWrapper = document.createElement("div");
        placeWrapper.innerHTML = "<h4>Place</h4>";
        var place = document.createElement("textarea");
        placeWrapper.appendChild(place);
        left.appendChild(placeWrapper);

        var changeWrapper = document.createElement("div");
        changeWrapper.innerHTML = "<h4>The change we want to see</h4>";
        var change = document.createElement("textarea");
        changeWrapper.appendChild(change);
        left.appendChild(changeWrapper);

        content.push(left);

        var right = document.createElement("div");
        right.style.display = "inline-block";
        right.style.verticalAlign = "top";
        right.style.minWidth = "512px";
        right.style.minHeight = "400px";
        right.style.padding = "8px";

        var backgroundWrapper = document.createElement("div");
        backgroundWrapper.innerHTML = "<h4>Background</h4><p>( click image to change )</p>";
        var background = new Image();
        background.style.height = "auto";
        background.style.width = "512px";
        background.src = "images/background-placeholder.png";
        background.url = null;
        background.onclick = function (e) {
 
       localplay.listview.createlibrarydialog("Choose a background", "getmedia.php?type=background&listview=true",
                function (item) {
                    background.url = item.data.url;
                    background.src = item.data.url;
                },
                20,"",
                function (controller) {
                    var backgrounduploader = localplay.game.backgroundeditor.createbackgrounduploader();
                    backgrounduploader.dialog.addEventListener("close", function (e) {
                        controller.refresh();
                    });
                }, "Upload background drawings" );
          };
        backgroundWrapper.appendChild(background);
        right.appendChild(backgroundWrapper);
        content.push(right);

        var dialog = localplay.dialogbox.createfullscreendialogbox("New Level", content,
            ["Save"],
            [
                function (e) {
                    //
                    // validate form
                    //
                    if (name.value.length > 0 && place.value.length > 0 && change.value.length > 0 && background.url !== null) {
                        //
                        // create new level
                        //
                        var metadata = {
                            name: name.value,
                            place: place.value,
                            change: change.value
                        }
                        var json = '{"background" : { "images" : ["' + background.url + '"] } , "avatar" : { "image" : "images/drcrab.png", "position" : "115,89" } }';
                        game.newlevel(metadata, json);
                        dialog.close();
                        //
                        // go to edit
                        //
                        localplay.game.controller.editor.attachtogame(game);
                    } else {
                        localplay.dialogbox.alert("Error", "You must fill in all fields and select a background.");
                    }
                }], function () {
                    window.history.back(-1);
                });
        dialog.show();

        //
        // create level
        //
    }

    return controller;
})();
