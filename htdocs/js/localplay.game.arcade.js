/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.game.arcade.js
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