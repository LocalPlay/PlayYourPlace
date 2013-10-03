;
localplay.creator = (function () {
    if (localplay.creator) return localplay.creator;
    //
    //
    //
    var creatortemplate =
        '\
        <div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; overflow: auto;"> \
            <div style="position: absolute; top: 0px; left: 0px; bottom: 0px; width: 285px; background-color: rgb(102,102,102); border-top: 2px solid white;"> \
                <img id="creator.{{id}}.thumbnail" class="profileimage" src="{{thumbnail}}" /> \
                <div class="profiledetails"> \
                    <h3 id="creator.{{id}}.name">{{name}}</h3> \
                    joined&nbsp;<b>{{created}}</b>\
                </div> \
                <div id="creator.ratingpanel" class="profilerating" > \
                </div> \
            </div> \
            </div> \
            <div class="menubar" style="left: 285px; right: 300px; border-top: 2px solid white;" > \
                <div class="menubaritem disabled">{{name}}&#39;s Levels</div>\
            </div> \
            <div id="creator.{{id}}.arcades" style="position: absolute; top: 42px; bottom: 0px; left: 285px; right: 300px;"> \
            </div> \
            <div id="creator.{{id}}.levelpreview" style="position: absolute; top: 0px; bottom: 0px; right: 0px; width: 285px; overflow: auto; border-top: 2px solid white; padding: 16px 0px 0px 16px;"> \
            </div> \
        </div> \
        ';
    var myprofiletemplate =
        '\
        <div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; overflow: auto;"> \
            <div style="position: absolute; top: 0px; left: 0px; bottom: 0px; width: 285px; background-color: rgb(102,102,102); border-top: 2px solid white;"> \
                <img id="creator.button.thumbnail.{{id}}" class="profileimage imagebutton" src="{{thumbnail}}" /> \
                <div class="profiledetails"> \
                    <div id="creator.button.setthumbnail.{{id}}" class="menubaritem" style="margin-left: 0px;"> \
                        <img class="menubaritem" src="images/icons/edit-01.png" />&nbsp;Change picture \
                    </div> \
                    <p>name<br/><br/> \
                    <input id="creator.{{id}}.name" type="text" value="{{name}}" style="width: 240px;"/></p>\
                    <div id="creator.button.update.{{id}}" class="menubaritem" style="margin-left: 0px;"> \
                        <img class="menubaritem" src="images/icons/save-01.png" />&nbsp;Update profile \
                    </div> \
                    <div id="creator.button.changepassword.{{id}}" class="menubaritem" style="margin-left: 0px; margin-top: 32px;"> \
                        <img class="menubaritem" src="images/icons/edit-01.png" />&nbsp;Change password \
                    </div> \
                </div> \
            </div> \
            <div class="menubar" style="left: 285px; right: 300px; border-top: 2px solid white;" > \
                <div class="menubaritem  disabled">My Levels</div>\
            </div> \
            <div id="creator.{{id}}.arcades" style="position: absolute; top: 42px; bottom: 0px; left: 285px; right: 300px;"> \
            </div> \
            <div id="creator.{{id}}.levelpreview" style="position: absolute; top: 0px; bottom: 0px; right: 0px; width: 285px; overflow: auto; border-top: 2px solid white; padding: 16px 0px 0px 16px;"> \
            </div> \
        </div> \
        ';
    var previewtemplate = '\
                <div id="creator.level.{{id}}" class="playable" style="position: relative; text-align: center;"><img class="imagebutton" src="{{thumbnail}}" /></div><br />\
                <h3>{{name}}</h3> \
                {{#attribution}} \
                    <i><small>originally&nbsp;\
                    <span id="player.loadoriginal.{{originalid}}" class="spanbutton">{{originalname}}</span> \
                    &nbsp;by&nbsp; \
                    <span id="player.showcreator.{{originalcreatorid}}" class="spanbutton">{{originalcreator}}</span></small></i><p/> \
                {{/attribution}} \
                <small>Idea for change</small><br/>\
                <i>{{change}}</i><p/> \
                <small>Place for change</small><br/>\
                <i>{{place}}</i><p/> \
                </div>\
                <b>Rating</b> \
                <div id="creator.level.rating" style="margin-right: 8px;"></div>\
        ';
    var changepasswordtemplate = '\
         <form id="creator.{{id}}.changepasswordform" style="height: 400px padding: 8px;">\
           <h4>old password</h4>\
            <input id="creator.{{id}}.oldpassword" type="password" value="" placeholder="old password" style="width: 240px;" required/>\
            <h4>new password</h4> \
            <input id="creator.{{id}}.newpassword" type="password" value="" placeholder="new password" style="width: 240px;" required/>\
            <h4>confirm password</h4> \
            <input id="creator.{{id}}.confirmpassword" type="password" value="" placeholder="confirm new password" style="width: 240px;" required/><br/>\
           <div style="height: 42px; width: 285px">\
                <div id="button.creator.password.cancel" class="menubaritem" style="float: left;" > \
                    <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                    &nbsp;Cancel \
                </div> <p>\
                <div id="button.creator.password.save" class="menubaritem" style="float: right;" > \
                    <img class="menubaritem" src="images/icons/save-01.png" /> \
                    &nbsp;Save \
                </div> \
            </div> \
            <input type="submit" id="creator.{{id}}.changepasswordsubmit" name="Change Password" style="position:absolute; left:-400px; visibility:collapse;"/> \
        </form> \
   ';
    //
    //
    //
    var creator = {};
    //
    //
    //
    function changecreatorthumbnail(creatorid) {
        //
        // show media library
        //
        var image = document.getElementById("creator.button.thumbnail." + creatorid);
        var contents = "getmedia.php?type=object&listview=true";
        localplay.listview.createlibrarydialog("Choose your profile image", contents, function (item) {
            image.src = item.data.url;
        }, 24, "",
        function (controller) {
            var objecteditor = localplay.objecteditor.createobjecteditor("Add profile image", function () {
                controller.refresh();
            } );
        }, "Upload profile images");
    }
    
    function updatecreatorprofile(creatorid) {
        var name = null;
        var namefield = document.getElementById( "creator." + creatorid + ".name" );
        if (namefield) {
            name = namefield.value;
        }
        var thumbnail = null;
        var image = document.getElementById("creator.button.thumbnail." + creatorid);
        if (image) {
            thumbnail = image.src;
        }
        if (name && thumbnail) {
            var data = {
                name: name,
                thumbnail: thumbnail
            };
            var param = {
                creatorid: creatorid
            };
            localplay.datasource.put("updatecreatorprofile.php", data, param, localplay.datasource.createprogressdialog("Updating profil...", function (e) {
                var xhr = e.target;
                try {
                    var response = JSON.parse(xhr.datasource.response);
                    if (response.status === "OK") {
                    }
                 } catch (error) {
                }
            }));

        }
    }

    function changecreatorpassword(creatorid) {
        var target = document.getElementById("creator.button.changepassword." + creatorid);
        if (target) {
            var form = null;
            var submit = null;
            var pin = localplay.domutils.elementPosition(target);
            var dialog = localplay.dialogbox.pinnedpopupatpoint(pin, changepasswordtemplate, { id: creatorid }, function (e) {
                var selector = localplay.domutils.getButtonSelector(e);
                if (selector.length >= 4) {
                    var command = selector[3];
                    if (command === "save") {
                        submit.click();
                        return false;
                    }
                  
                }
                return true;
            });
            //
            // hook form and submit
            //
            form = document.getElementById("creator." + creatorid + ".changepasswordform");
            submit = document.getElementById("creator." + creatorid + ".changepasswordsubmit");
            var oldpassword = document.getElementById("creator." + creatorid + ".oldpassword"); 
            var newpassword = document.getElementById("creator." + creatorid + ".newpassword"); 
            var confirmpassword = document.getElementById("creator." + creatorid + ".confirmpassword"); 
            if (form && submit) {
                form.onsubmit = function (e) {
                    if (newpassword.value !== confirmpassword.value) {
                        localplay.dialogbox.alert("Localplay", "The passwords do not match!");
                    } else {
                        var param = {
                            creatorid: creatorid
                        };
                        var data = {
                            
                            oldpassword: MD5(oldpassword.value),
                            newpassword: MD5(newpassword.value)
                        };
                        localplay.datasource.put("updatecreatorpassword.php", data, param, {
                            datasourceonloadend: function (e) {
                                var datasource = e.target.datasource;
                                var response;
                                try {
                                    response = JSON.parse(datasource.response);
                                } catch (error) {
                                    response = {
                                        status: "FAILED",
                                        message: datasource.response
                                    };
                                }
                                var status = response.status;
                                var message = response.message;
                                if (status === "OK") {
                                    dialog.close();
                                    localplay.dialogbox.alert("Localplay", message);
                                } else {
                                    localplay.dialogbox.alert("Localplay", message);
                                }

                            },

                        });
                    }
                    return false;
                };

            }
        }
    }

    //
    //
    //
    creator.createdialog = function (creatorid,callback) {
        localplay.datasource.get("getcreator.php", { id: creatorid }, {
            datasourceonloadend: function (e) {
                var datasource = e.target.datasource;
                if (((datasource.status >= 200 && datasource.status < 300) || datasource.status == 304)) {
                    try {
                        //
                        // parse response
                        //
                        var data = JSON.parse(datasource.response);
                        //if (data.status && data.status === "OK") { // TODO: error handling
                        var currentcreator = localplay.authentication.getcreator();            
                        var template = (currentcreator && creatorid === currentcreator.creatorid) ? myprofiletemplate : creatortemplate;
                        var title = (currentcreator && creatorid === currentcreator.creatorid) ? "My Profile" : "Maker Profile";
                        var dialog = localplay.dialogbox.createfullscreendialogboxwithtemplate(title, template, data, function () {
                            if (callback) {
                                return callback();
                            }
                        });
                        dialog.show();
                        //
                        // hook dialog buttons
                        //
                        localplay.domutils.hookChildElementsWithPrefix(dialog.dialog, "creator.button", "click", function (e) {
                            var selector = localplay.domutils.getButtonSelector(e);
                            if (selector.length >= 3) {
                                var command = selector[2];
                                switch (command) {
                                    case "thumbnail":
                                    case "setthumbnail":
                                        changecreatorthumbnail(creatorid);
                                        break;
                                    case "update":
                                        updatecreatorprofile(creatorid);
                                        break;
                                    case "changepassword":
                                        changecreatorpassword(creatorid);
                                        break;
                                }
                            }
                        });
                        //
                        // create profile ardcade(s)
                        //
                        var arcadecontainer = document.getElementById("creator." + creatorid + ".arcades");
                        arcadecontainer.innerHTML = Mustache.render(localplay.listview.container, { filter: "" });
                        arcadecontainer.controller = localplay.listview.createlistview("creator." + creatorid + ".arcades", "getlevel.php?creator=" + creatorid + "&listview=true", 20);
                        arcadecontainer.controller.onselect = function (item) {
                            //
                            // show preview
                            //
                            var levelid = item.data.id;
                            var previewcontainer = document.getElementById("creator." + creatorid + ".levelpreview");
                            if (previewcontainer) {
                                previewcontainer.innerHTML = Mustache.render(previewtemplate, item.data);
                                var thumbnail = document.getElementById("creator.level." + levelid);
                                if (thumbnail) {
                                    thumbnail.onclick = function (e) {
                                        //
                                        // get level ids
                                        //
                                        var arcade = arcadecontainer.controller.source.getRows();
                                        var currentlevel = -1;
                                        for (var i = 0; i < arcade.length; i++) {
                                            if (arcade[i].id === item.data.id) {
                                                currentlevel = i;
                                                break;
                                            }
                                        }
                                        //
                                        // 
                                        //
                                        if (arcade.length > 1 && currentlevel != -1) {
                                            sessionStorage.setItem("localplay.arcade", JSON.stringify(arcade));
                                            sessionStorage.setItem("localplay.arcade.level", currentlevel);
                                        } else {
                                            sessionStorage.removeItem("localplay.arcade");
                                            sessionStorage.removeItem("localplay.arcade.level");
                                        }
                                        window.location = "playnew.html?id=" + item.data.id;
                                        //
                                        // TODO: build arcade from creators levels
                                        //
                                        window.location = "playnew.html?id=" + levelid;
                                    };
                                }
                            }
                            var ratingcontainer = document.getElementById("creator.level.rating");
                            if (ratingcontainer) {
                                //new RatingPanel(ratingcontainer, "level", levelid);
                                localplay.ratingpanel.createratingpanel(ratingcontainer, "level", levelid);
                            }

                        };
                        //
                        // populate rating panel
                        //
                        if (creatorid != localplay.authentication.getcreator()) {
                            var ratingcontainer = document.getElementById("creator.ratingpanel");
                            if (ratingcontainer) {
                                //new RatingPanel(ratingcontainer, "creator", creatorid, true);
                                localplay.ratingpanel.createratingpanel(ratingcontainer, "creator", creatorid, true);
                            }

                        }
                    } catch (error) {

                    }
                }
            },

            datasourceonerror: function (e) {

            }
        });
    }

    creator.showpeopledialog = function() {
        var listcontainer = null;
        var selection = "all";
        var peoplemenu = {
            items: [
                { name: "All", id: "people.all" },
                { name: "Top makers", id: "people.topmakers" },
                { name: "Top players", id: "people.topplayers" },
                { name: "Me", id: "people.me" }
            ],
            callback: function (id) {
                var selector = id.split('.');
                if (selector.length < 3 || selector[0] === "menu") return;
                var command = selector[1] + "." + selector[2];
                //
                // get menuitem name
                //
                var name = null;
                for (var i = 0; i < peoplemenu.items.length; i++) {
                    if (peoplemenu.items[i].id == command) {
                        name = peoplemenu.items[i].name;
                        break;
                    }
                }
                if (name) {
                    if (selector[2] === "me") {
                        //
                        // ensure authentication
                        //
                        creator.showmyprofile(function () {
                            listcontainer.controller.refresh();
                        });
                    } else {
                        //
                        // set breadcrumb
                        //
                        listcontainer.breadcrumb.innerHTML = '<img class="menubaritem disabled" src="images/icons/breadcrumb.png">&nbsp;' + name;
                        //
                        // load people
                        //
                        var source = "getcreator.php?listview=true";
                        selection = selector[2];
                        switch (selection) {
                            case "topmakers":
                                source += "&orderby=maker";
                                break;
                            case "topplayers":
                                source += "&orderby=player";
                                break;
                        }
                        listcontainer.controller.setsource(source);
                    }
                } else {
                    listcontainer.breadcrumb.innerHTML = "";
                }
            }
        };
        listcontainer = localplay.listview.createlibrarydialog("People", "getcreator.php?listview=true",
            function (item) {
                //
                // goto creator page
                //
                localplay.creator.createdialog(item.data.id);
                return true;
            }, 50, "", null, "", localplay.listview.creatorlisttemplate, peoplemenu, function (list) {
                localplay.domutils.forEachChildWithPrefix(list.content, "item.rating", function (ratingcontainer) {
                    var selector = ratingcontainer.id.split(".");
                    if (selector.length === 3) {
                        var creatorid = selector[2];
                        //new RatingPanel(ratingcontainer, "creator", creatorid, true);
                        localplay.ratingpanel.createratingpanel(ratingcontainer, "creator", creatorid, true);
                    }
                });                
            });
        listcontainer.breadcrumb.innerHTML = '<img class="menubaritem disabled" src="images/icons/breadcrumb.png">&nbsp;All';
    }

    creator.showmyprofile = function(callback) {
        var creator = localplay.authentication.getcreator();
        if (creator) {
            localplay.creator.createdialog(creator.creatorid, callback);
        } else {
            localplay.authentication.authenticate(function () {
                if (localplay.authentication.isauthenticated()) {
                    creator = localplay.authentication.getcreator();
                    localplay.creator.createdialog(creator.creatorid);
                } else {
                    localplay.dialogbox.alert("Localplay", "You must login to view your profile!");
                }
            });

        }
    }


    return creator;
})();