;
;
localplay = window.localplay ? window.localplay : {};
localplay.game = localplay.game ? localplay.game : {};
//
// arcade module
//
localplay.game.arcade = (function () {
    if (localplay.game.arcade) return localplay.game.arcade;

    var arcade = {};


    arcade.load = function (arcadename, callback) {
        localplay.datasource.get("getarcade.php", { name: arcadename },
            {
                datasourceonloadend: function (e) {
                    var datasource = e.target.datasource;
                    if (((datasource.status >= 200 && datasource.status < 300) || datasource.status == 304)) {
                        try {
                            //
                            // parse response
                            //
                            var data = JSON.parse(datasource.response);
                            if (callback) {
                                callback(data);
                            }
                        } catch (error) {

                        }
                    }
                },

                datasourceonerror: function (e) {

                }
            });
    }
    arcade.showarcadedialog = function () {
        var listcontainer = null;
        var arcademenu = {
            items: [
                { name: "Top picks", id: "arcade.toppicks" },
                { name: "Ideas for change", id: "arcade.change" },
                { name: "Local flavour", id: "arcade.local" },
                { name: "Artistry", id: "arcade.artistry" },
                { name: "Fun", id: "arcade.fun" },
                { name: "Latest", id: "arcade.latest" }
            ],
            callback: function (id) {
                var selector = id.split('.');
                if (selector.length < 3 || selector[0] === "menu") return;
                var command = selector[1] + "." + selector[2];
                //
                // get menuitem name
                //
                var name = null;
                for (var i = 0; i < arcademenu.items.length; i++) {
                    if (arcademenu.items[i].id == command) {
                        name = arcademenu.items[i].name;
                        break;
                    }
                }
                if (name) {
                    //
                    // set breadcrumb
                    //
                    listcontainer.breadcrumb.innerHTML = '<img class="menubaritem disabled" src="images/icons/breadcrumb.png">&nbsp;' + name;
                    //
                    // load arcade
                    //
                    var arcade = "getarcade.php?name=" + selector[2];
                    listcontainer.controller.setsource(arcade);
                } else {
                    listcontainer.breadcrumb.innerHTML = "";
                }
            }
        };

        listcontainer = localplay.listview.createlibrarydialog("Arcades", "getarcade.php?name=latest",
            function (item) {
                //
                // get level ids
                //
                var arcade = listcontainer.controller.source.getRows();
                var currentlevel = -1;
                for ( var i = 0; i < arcade.length; i++ ) {
                    if (arcade[i].id === item.data.id) {
                        currentlevel = i;
                        break;
                    }
                }
                //
                // TODO: set this to the arcade
                //
                if (arcade.length > 1 && currentlevel != -1) {
                    sessionStorage.setItem("localplay.arcade", JSON.stringify(arcade));
                    sessionStorage.setItem("localplay.arcade.level", currentlevel);
                } else {
                    sessionStorage.removeItem("localplay.arcade");
                    sessionStorage.removeItem("localplay.arcade.level");
                }
                window.location = "playnew.html?id=" + item.data.id;
            }, 12, "", null, "", null, arcademenu);
        listcontainer.breadcrumb.innerHTML = '<img class="menubaritem disabled" src="images/icons/breadcrumb.png">&nbsp;Latest';
    }

    return arcade;

})();