/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.menu.js
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
localplay.menu = (function () {
    if (localplay.menu) return localplay.menu;
    //
    //
    //
    var menu = {};
    //
    //
    //
    var items = [
            {
                name: "item-name",
                icon: "image",
                action: "id",
                items: {
                }
            }
    ];
    /*
    var template =
        '{{#items}} \
            <div class="menuitem" id="menuitem.{{id}}"><img class="menuitem" src="{{icon}}" />{{name}}</div> \
        {{/items}}';
        */
    var template =
        '{{#items}} \
            <div class="menuitem" id="menuitem.{{id}}">{{name}}</div> \
        {{/items}}';
    //
    //
    //
    menu.attachmenu = function (button,items,callback,appendlogin,sticky) {
        var menu = document.createElement( "div" );
        menu.classList.add("menucontainer");
        menu.style.position = "absolute";
        var p = localplay.domutils.elementPosition(button);
        menu.style.top = (p.y + button.offsetHeight + 8) + "px";
        menu.style.left = p.x + "px";
        menu.style.visibility = sticky ? "visible" : "hidden";
        menu.innerHTML = Mustache.render(template, { items: items });
        document.body.appendChild(menu);
        //
        // hook events
        //
        for (var i = 0; i < menu.childNodes.length; i++) {
            menu.childNodes[ i ].onclick = function (e) {
                callback(this.id);
                if ( !sticky ) menu.style.visibility = "hidden";
            }
        }
        //
        // append universal login/out
        //
        if (appendlogin) {
            var login = document.createElement("div");
            login.id = "button.login";
            login.classList.add("menuitem");
            //login.innerHTML = '<img class="menuitem" src="images/blank.png" />' + (localplay.authentication.isauthenticated() ? "LOGOUT" : "LOGIN");
            login.innerHTML = (localplay.authentication.isauthenticated() ? "LOGOUT" : "LOGIN");
            login.onclick = function (e) {
                if (localplay.authentication.isauthenticated()) {
                    localplay.authentication.logout();
                    login.innerHTML = 'LOGIN';
                } else {
                    localplay.authentication.login(function () {
                        login.innerHTML = (localplay.authentication.isauthenticated() ? "LOGOUT" : "LOGIN");
                    });
                }
                if (!sticky) menu.style.visibility = "hidden";
            };
            menu.appendChild(login);
            //
            //
            //
            var admin = document.createElement("div");
            admin.id = "button.admin";
            admin.classList.add("menuitem");
            //admin.style.visibitity = "hidden";
            admin.style.display = "none";
            admin.innerHTML = "ADMIN";
            admin.onclick = function (e) {
                window.location = "admin.php";
            };
            menu.appendChild(admin);
        }
        //
        //
        //
        var thecloser = function (e) {
            if (e.target != button && !localplay.domutils.isChild(menu, e.target)) {
                if (menu.style.visibility == "visible") {
                    menu.style.visibility = "hidden";
                    callback("menu.close");
                }
            }
            window.removeEventListener("mousedown", thecloser, true);
        }
        //
        //
        //
        button.onclick = function(e) {
            if (menu.style.visibility == "visible") {
                menu.style.visibility = "hidden";
                callback("menu.close");
            } else {
                var p = localplay.domutils.elementPosition(button);
                menu.style.top = (p.y + button.offsetHeight + 8) + "px";
                menu.style.left = p.x + "px";
                menu.style.visibility = "visible";
                callback("menu.open");
                window.addEventListener("mousedown", thecloser, true);
            }
        }
        return menu;
    }

    menu.dettachmenu = function (target) {
        if (target.menupopup) {
            document.body.removeChild(target.menupopup);
            target.menupopup = null;
        }
    }

    return menu;

})();