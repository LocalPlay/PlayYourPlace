/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.admin.js
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
localplay.admin = (function () {
    if (localplay.admin) return localplay.admin;
    //
    // templates
    //
    var creatoritemtemplate =
    '{{#rows}} \
        <div id="{{tablename}}.{{id}}" class="listitem" style="height: 400px;"> \
            <div style="position: absolute; top: 8px; left: 8px; right: 8px;"> \
            <span class="listitemheader">{{name}}</span>\
            <br />joined&nbsp;{{created}} <span id="{{tablename}}.{{id}}.verified"></span> \
            </div> \
            <img id="{{tablename}}.{{id}}.image" class="listitemimage" style="top: 16px; bottom: 56px" src="{{thumbnail}}" /> \
            <div style="position: absolute; left: 8px; right: 8px; bottom: 4px;"> \
                <div  class="menubaritem disabled" style="margin-right: 0px;" > \
                    <b>Role</b>&nbsp;\
                    <input type="radio" id="{{tablename}}.{{id}}.maker" name="{{tablename}}.{{id}}.role" value="maker" /><label for="{{tablename}}.{{id}}.maker"></label>&nbsp;maker \
                    <input type="radio" id="{{tablename}}.{{id}}.moderator" name="{{tablename}}.{{id}}.role" value="moderator" /><label for="{{tablename}}.{{id}}.moderator"></label>&nbsp;moderator&nbsp; \
                    <input type="radio" id="{{tablename}}.{{id}}.administrator" name="{{tablename}}.{{id}}.role" value="administrator" /><label for="{{tablename}}.{{id}}.administrator"></label>&nbsp;admin&nbsp; \
                </div> \
                <div  class="menubaritem disabled" style="margin-right: 0px;" > \
                    <input type="checkbox" id="{{tablename}}.{{id}}.flagged" name="{{tablename}}.{{id}}.flagged" value="flagged"><label for="{{tablename}}.{{id}}.flagged"></label>&nbsp;flagged&nbsp; \
                </div>\
                <div id="{{tablename}}.{{id}}.comments" class="menubaritem" style="" > \
                    <img class="menubaritem" src="images/icons/add-01.png" /> \
                    &nbsp;view comments \
                </div><br/> \
                <div class="menubaritem disabled" style="margin-right: 0px;" > \
                    <input type="checkbox" id="{{tablename}}.{{id}}.blocked" name="{{tablename}}.{{id}}.blocked" value="blocked"><label for="{{tablename}}.{{id}}.blocked"></label>&nbsp;blocked&nbsp; \
                 </div> \
                <div id="{{tablename}}.{{id}}.email" class="menubaritem" style="" > \
                    <img class="menubaritem" src="images/icons/email-01.png" /> \
                    &nbsp;Email maker \
                </div> \
            </div> \
        </div> \
    {{/rows}} \
    {{^rows}} \
        <h1>No Entries</h1> \
    {{/rows}}';

    var mediaitemtemplate =
    '{{#rows}} \
        <div id="{{tablename}}.{{id}}" class="listitem" style="height: 400px;"> \
            <div style="position: absolute; top: 8px; left: 8px; right: 8px;"> \
            <span class="listitemheader">{{name}}</span>\
            <br />by&nbsp;{{creator}} \
            </div> \
            <img id="{{tablename}}.{{id}}.image" class="listitemimage" style="top: 16px; bottom: 56px" src="{{thumbnail}}" /> \
            <div style="position: absolute; left: 8px; right: 8px; bottom: 4px;"> \
                <div  class="menubaritem disabled" style="margin-right: 0px;" > \
                    <input type="checkbox" id="{{tablename}}.{{id}}.flagged" name="{{tablename}}.{{id}}.flagged" value="flagged"><label for="{{tablename}}.{{id}}.flagged"></label>&nbsp;flagged&nbsp; \
                </div>\
                <div id="{{tablename}}.{{id}}.comments" class="menubaritem" style="" > \
                    <img class="menubaritem" src="images/icons/add-01.png" /> \
                    &nbsp;view comments \
                </div><br/> \
                <div id="{{tablename}}.{{id}}.delete" class="menubaritem" style="margin-right: 0px;" > \
                    <img class="menubaritem" src="images/icons/delete-01.png" /> \
                    &nbsp;Delete \
                </div> \
                <div id="{{tablename}}.{{id}}.email" class="menubaritem" style="" > \
                    <img class="menubaritem" src="images/icons/email-01.png" /> \
                    &nbsp;Email maker \
                </div> \
            </div> \
        </div> \
    {{/rows}} \
    {{^rows}} \
        <h1>No Entries</h1> \
    {{/rows}}';

    var levelitemtemplate =
    '{{#rows}} \
        <div id="{{tablename}}.{{id}}" class="listitem" style="height: 400px;"> \
            <div style="position: absolute; top: 8px; left: 8px; right: 8px;"> \
            <span class="listitemheader">{{name}}</span>\
            <br />by&nbsp;{{creator}} <span id="{{tablename}}.{{id}}.published"></span>\
            </div> \
            <img id="{{tablename}}.{{id}}.image" class="listitemimage" style="top: 16px; bottom: 56px" src="{{thumbnail}}" /> \
            <div style="position: absolute; left: 8px; right: 8px; bottom: 4px;"> \
                <div  class="menubaritem disabled" style="margin-right: 0px;" > \
                    <input type="checkbox" id="{{tablename}}.{{id}}.toppick" name="{{tablename}}.{{id}}.toppick" value="flagged"><label for="{{tablename}}.{{id}}.toppick"></label>&nbsp;top pick&nbsp; \
                </div><br />\
                <div  class="menubaritem disabled" style="margin-right: 0px;" > \
                    <input type="checkbox" id="{{tablename}}.{{id}}.flagged" name="{{tablename}}.{{id}}.flagged" value="flagged"><label for="{{tablename}}.{{id}}.flagged"></label>&nbsp;flagged&nbsp; \
                </div>\
                <div id="{{tablename}}.{{id}}.comments" class="menubaritem" style="" > \
                    <img class="menubaritem" src="images/icons/add-01.png" /> \
                    &nbsp;view comments \
                </div><br/> \
                <div id="{{tablename}}.{{id}}.delete" class="menubaritem" style="margin-right: 0px;" > \
                    <img class="menubaritem" src="images/icons/delete-01.png" /> \
                    &nbsp;Delete \
                </div> \
                <div id="{{tablename}}.{{id}}.email" class="menubaritem" style="" > \
                    <img class="menubaritem" src="images/icons/email-01.png" /> \
                    &nbsp;Email maker \
                </div> \
            </div> \
        </div> \
    {{/rows}} \
    {{^rows}} \
        <h1>No Entries</h1> \
    {{/rows}}';

    var levellistcontrols = ' \
       <input type="checkbox" id="{{prefix}}.flagged" name="{{prefix}}.flagged" value="flagged"><label for="{{prefix}}.flagged"></label>&nbsp;flagged&nbsp; \
       <input type="checkbox" id="{{prefix}}.toppick" name="{{prefix}}.toppick" value="toppick"><label for="{{prefix}}.toppick"></label>&nbsp;top picks&nbsp; \
    ';

    var medialistcontrols = ' \
       <input type="checkbox" id="{{prefix}}.flagged" name="{{prefix}}.flagged" value="flagged"><label for="{{prefix}}.flagged"></label>&nbsp;flagged&nbsp; \
    ';

    var creatorlistcontrols = ' \
       <input type="checkbox" id="{{prefix}}.flagged" name="{{prefix}}.flagged" value="flagged"><label for="{{prefix}}.flagged"></label>&nbsp;flagged&nbsp; \
       <input type="checkbox" id="{{prefix}}.blocked" name="{{prefix}}.blocked" value="blocked"><label for="{{prefix}}.blocked"></label>&nbsp;blocked&nbsp; \
       <div id="{{prefix}}.stats" class="menubaritem"> \
            <img src="images/icons/add-01.png" class="menubaritem" />&nbsp;statistics \
       </div> \
    ';


    var levelpreview = '\
            <div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: white;"> \
                <canvas id="preview.canvas" class="slider" width="1024" height="723" ></canvas> \
            </div> \
            ';

    var emaildialog = '\
        <div style="width: 512px; padding: 8px;"> \
            <h3>Contact {{creator}}</h3><p>at {{creatoremail}} about &apos;{{name}}&apos;</p> \
            <textarea id="admin.email" style="width: 496px; height: 256px;" placeholder="Message" ></textarea>\
            <div style="height: 42px; width: 496px;">\
                <div id="button.cancelemail" class="menubaritem" style="float: left; margin-left: 0px;" > \
                    <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                    &nbsp;Cancel \
                </div> \
                <div id="button.sendemail" class="menubaritem" style="float: right; margin-right: 0px;" > \
                    <img class="menubaritem" src="images/icons/email-01.png" /> \
                    &nbsp;Send \
                </div> \
            </div> \
        </div> \
    ';
    var commentdialog = '\
        <div style="width: 256px; padding: 8px;"> \
            <h3>Comments for &apos;{{name}}&apos;</h3> \
            <div style="width: 240px; height: 240px; overflow-y: auto; background-color: white; color: black;"> \
            {{#comments}} \
            <div id="comment.{{id}}" style="margin: 8px; border-bottom: solid 1px black;"> \
                <div> \
                    {{comment}} \
                </div> \
                <div style="padding: 4px; font-size: smaller;">by {{creatorname}} {{creatoremail}}</div> \
            </div> \
            {{/comments}} \
            {{^comments}} \
                <h3>No Entries</h3> \
            {{/comments}} \
            </div> \
            <div id="button.cancelcomment" class="menubaritem" style="float: right; margin-right: 0px;" > \
                <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                &nbsp;Cancel \
            </div> \
        </div>';

    var statsdialog = '\
        <div style="height: 300px padding: 8px;">\
            <h3>User statistics</h3> \
            <p style="text-align: left;">\
                registered users:&nbsp;<b>{{creatorcount}}</b><br/>\
                active makers:&nbsp;<b>{{activemakers}}</b>&nbsp;( created one or more levels )<br/>\
                active players:&nbsp;<b>{{activeplayers}}</b>&nbsp;( played one or more levels )<br/>\
                total levels:&nbsp;<b>{{levelcount}}</b><br/>\
                played levels:&nbsp;<b>{{activelevels}}</b>&nbsp;( played at least once )\
            </p>\
            <div style="height: 42px; width: 284px">\
                <div id="button.stats.webstats" class="menubaritem" style="float: left; margin-left: 0px;" > \
                    <img class="menubaritem" src="images/icons/add-01.png" /> \
                    &nbsp;Webstats \
                </div> \
                <div id="button.stats.close" class="menubaritem" style="float: right; margin-right: 0px;" > \
                    <img class="menubaritem" src="images/icons/close-cancel-01.png" /> \
                    &nbsp;Close \
                </div> \
            </div> \
        </div>\
    ';
    var itemtemplates = {
        level: levelitemtemplate,
        media: mediaitemtemplate,
        creator: creatoritemtemplate
    };
    //
    //
    //
    function createList(container, tablename, title, parameter) {
        var containerdata = { prefix: container.id + "." + tablename, filter: "" };
        container.innerHTML = Mustache.render(localplay.listview.container, containerdata);
        container.controller = localplay.listview.createlistview(title, "gettableformoderation.php?tablename=" + tablename + (parameter ? "&" + parameter : ""), 12, "", itemtemplates[tablename], function (list) {
            var rows = list.source.getRows();
            for (var i = 0; i < rows.length; i++) {
                var data = rows[i];
                //
                // published
                //
                var published = document.getElementById(data.tablename + "." + data.id + ".published");
                if (published) {
                    published.innerHTML = data.published == 1 ? "( public )" : "( private )";
                }
                //
                // toppick
                //
                var toppick = document.getElementById(data.tablename + "." + data.id + ".toppick");
                if (toppick) {
                    toppick.data = data;
                    toppick.checked = data.toppick == "1";
                    toppick.onchange = function (e) {
                        toppickitem(container, e.currentTarget.data, e.currentTarget.checked);
                    }
                }
                //
                // flagging
                //
                var flagged = document.getElementById(data.tablename + "." + data.id + ".flagged");
                if (flagged) {
                    flagged.data = data;
                    flagged.checked = data.flagged == "1";
                    flagged.onchange = function (e) {
                        flagitem(container, e.currentTarget.data, e.currentTarget.checked);
                    }
                }
                //
                // comments
                //
                var comments = document.getElementById(data.tablename + "." + data.id + ".comments");
                if (comments) {
                    comments.data = data;
                    comments.onclick = function (e) {
                        getcomments(e.currentTarget.data);
                    }
                }

                //
                // deleting
                //
                var del = document.getElementById(data.tablename + "." + data.id + ".delete");
                if (del) {
                    del.data = data;
                    del.onclick = function (e) {
                        deleteitem(container, e.currentTarget.data);
                    }
                }
                //
                // emailing
                //
                var email = document.getElementById(data.tablename + "." + data.id + ".email");
                if (email) {
                    email.data = data;
                    email.onclick = function (e) {
                        contactcreator(e.currentTarget.data);
                    }
                }
                //
                //
                //
                var image = document.getElementById(data.tablename + "." + data.id + ".image");
                if (image) {
                    if (tablename === "level") {
                        image.data = data;
                        image.onclick = function (e) {
                            previewlevel(e.target.data.id);
                        }
                    }
                }

            }
        });
        //
        // add additional controls
        //
        var listheader = document.getElementById(containerdata.prefix + ".listview.header");
        if (listheader) {
            var listcontrols = document.createElement("div");
            listcontrols.classList.add("menubaritem");
            listcontrols.classList.add("disabled");
            listcontrols.float = "right";
            listcontrols.innerHTML = Mustache.render((tablename === "level") ? levellistcontrols : medialistcontrols, containerdata);
            listheader.appendChild(listcontrols);
            //
            //
            //
            var listtoppicks = document.getElementById(containerdata.prefix + ".toppick");
            var listflagged = document.getElementById(containerdata.prefix + ".flagged");
            var changefiltering = function (e) {
                var additionalparameters = [];
                if (parameter) {
                    additionalparameters.push(parameter);
                }
                if (listtoppicks && listtoppicks.checked) {
                    additionalparameters.push("toppicks=1");
                }
                if (listflagged && listflagged.checked) {
                    additionalparameters.push("flagged=1");
                }
                var source = "gettableformoderation.php?tablename=" + tablename;
                for (var i = 0; i < additionalparameters.length; i++) {
                    source += "&" + additionalparameters[i];
                }
                container.controller.setsource(source);
            }
            if (listtoppicks) {
                listtoppicks.onchange = changefiltering;
            }
            if (listflagged) {
                listflagged.onchange = changefiltering;
            }
        }
    }
    function createCreatorList(container) {
        var containerdata = { prefix: container.id, filter: "" };
        container.innerHTML = Mustache.render(localplay.listview.container, containerdata);
        container.controller = localplay.listview.createlistview("creators", "getcreatorsforadministration.php", 12, "", itemtemplates["creator"], function (list) {
            
            var rows = list.source.getRows();
            for (var i = 0; i < rows.length; i++) {
                var data = rows[i];
                //
                // role
                //
                var maker = document.getElementById(data.tablename + "." + data.id + ".maker");
                var moderator = document.getElementById(data.tablename + "." + data.id + ".moderator");
                var administrator = document.getElementById(data.tablename + "." + data.id + ".administrator");
                if (maker && moderator && administrator) {
                    maker.data = data;
                    moderator.data = data;
                    administrator.data = data;
                    maker.checked = data.role == 0;
                    moderator.checked = data.role == 1;
                    administrator.checked = data.role == 2;
                    var changerole = function (e) {
                        switch (e.target.value) {
                            case "maker":
                                setcreatorrole(container,e.target.data, 0);
                                break;
                            case "moderator":
                                setcreatorrole(container,e.target.data, 1);
                                break;
                            case "administrator":
                                setcreatorrole(container,e.target.data, 2);
                                break;
                        }
                    };
                    maker.onchange = changerole;
                    moderator.onchange = changerole;
                    administrator.onchange = changerole;
                }
                //
                // flagging
                //
                var flagged = document.getElementById(data.tablename + "." + data.id + ".flagged");
                if (flagged) {
                    flagged.data = data;
                    flagged.checked = data.flagged == "1";
                    flagged.onchange = function (e) {
                        flagitem(container, e.currentTarget.data, e.currentTarget.checked);
                    }
                }
                //
                // comments
                //
                var comments = document.getElementById(data.tablename + "." + data.id + ".comments");
                if (comments) {
                    comments.data = data;
                    comments.onclick = function (e) {
                        getcomments(e.currentTarget.data);
                    }
                }
                //
                // blocking
                //
                var blocked = document.getElementById(data.tablename + "." + data.id + ".blocked");
                if (blocked) {
                    blocked.data = data;
                    blocked.checked = data.blocked == "1";
                    blocked.onchange = function (e) {
                        blockcreator(container, e.currentTarget.data, e.currentTarget.checked);
                    }
                }
                //
                // emailing
                //
                var email = document.getElementById(data.tablename + "." + data.id + ".email");
                if (email) {
                    email.data = data;
                    email.onclick = function (e) {
                        var emaildata = {
                            name: "Your Playsouthend account",
                            creatorname: email.data.name,
                            creatoremail: email.data.email
                        };
                        contactcreator(emaildata);
                    }
                }
                //
                //
                //
                var image = document.getElementById(data.tablename + "." + data.id + ".image");
                if (image) {
                    image.data = data;
                    image.onclick = function (e) {
                        localplay.creator.createdialog(e.target.data.id);
                    }
                }

            }
            
        });
        //
        // add additional controls
        //
        var listheader = document.getElementById(containerdata.prefix + ".listview.header");
        if (listheader) {
            var listcontrols = document.createElement("div");
            listcontrols.classList.add("menubaritem");
            listcontrols.classList.add("disabled");
            listcontrols.float = "right";
            listcontrols.innerHTML = Mustache.render(creatorlistcontrols, containerdata);
            listheader.appendChild(listcontrols);
            //
            //
            //
            var listflagged = document.getElementById(containerdata.prefix + ".flagged");
            var listblocked = document.getElementById(containerdata.prefix + ".blocked");
            var changefiltering = function (e) {
                var additionalparameters = [];
                if (listflagged && listflagged.checked) {
                    additionalparameters.push("flagged=1");
                }
                if (listblocked && listblocked.checked) {
                    additionalparameters.push("blocked=1");
                }
                var source = "getcreatorsforadministration.php";
                for (var i = 0; i < additionalparameters.length; i++) {
                    source += ( i == 0 ? "?" : "&" ) + additionalparameters[i];
                }
                container.controller.setsource(source);
            }
            if (listflagged) {
                listflagged.onchange = changefiltering;
            }
            if (listblocked) {
                listblocked.onchange = changefiltering;
            }
            //
            //
            //
            var statsbutton = document.getElementById(containerdata.prefix + ".stats");
            if (statsbutton) {
                statsbutton.onclick = function (e) {
                    showstats(statsbutton);
                };
            }
        }
    }

    function deleteitem(list, data) {
        localplay.dialogbox.confirm("Delete", "Are you sure you want to delete '" + data.name + "'?",
            function (confirm) {
                if (confirm) {
                    var command = "delete" + data.tablename + ".php";
                    localplay.datasource.get(command, { id: data.id },
                    {
                        datasourceonloadend: function (e) {
                            var xhr = e.target;
                            try {
                                var response = JSON.parse(xhr.datasource.response);
                                localplay.dialogbox.alert("Delete", response.message);
                            } catch (error) {
                                localplay.dialogbox.alert("Delete", "Unknown error!");
                            }
                            list.controller.refresh();
                        }
                    });
                }
            });

    }

    function toppickitem(list, data, toppick) {
        var command = "puttoppick.php";
        var toppickdata = {
            levelid: data.id,
            toppick: toppick ? 1 : 0
        };
        localplay.datasource.put(command, toppickdata, {},
            {
                datasourceonloadend: function (e) {
                    var xhr = e.target;
                    try {
                        var response = JSON.parse(xhr.datasource.response);
                        if (response.status !== "OK") {
                            localplay.dialogbox.alert("Playsouthend", response.message);
                        }
                        list.controller.refresh();
                    } catch (error) {
                        localplay.dialogbox.alert("Playsouthend", "Unknown error!");
                    }
                }
            });

    }

    function flagitem(list, data, flag) {
        if (flag) {
            localplay.flagitem("Flag item", data.name, data.tablename, data.id, function () {
                list.controller.refresh();
            });
        } else {
            localplay.clearitemflag("Reset item flag", data.tablename, data.id, function () {
                list.controller.refresh();
            });
        }

    }

    function contactcreator(data) {
        localplay.dialogbox.dialogboxwithtemplate(emaildialog, data, function (e) {
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length == 2) {
                var command = selector[1];
                switch (command) {
                    case "sendemail":
                        {
                            var command = "sendemail.php";
                            var putdata = {
                                subject: data.name,
                                name: data.creatorname,
                                email: data.creatoremail,
                                message: document.getElementById("admin.email").value
                            };
                            localplay.datasource.put(command, putdata, {},
                                {
                                    datasourceonloadend: function (e) {
                                        var xhr = e.target;
                                        try {
                                            var response = JSON.parse(xhr.datasource.response);
                                            localplay.dialogbox.alert("Playsouthend", response.message);
                                        } catch (error) {
                                            localplay.dialogbox.alert("Playsouthend", "Unknown error!");
                                        }
                                    }
                                });

                        }
                        break;
                    default:
                        ;
                }
            }
            return true;
        });
    }

    function getcomments(data) {
        var command = "getcomments.php";
        var param = {
            targetid: data.id,
            tablename: data.tablename,
        };
        localplay.datasource.get(command, param,
            {
                datasourceonloadend: function (e) {
                    var xhr = e.target;
                    try {
                        var response = JSON.parse(xhr.datasource.response);
                        var content = {
                            name: data.name,
                            comments: response
                        };
                        localplay.dialogbox.dialogboxwithtemplate(commentdialog, content, function (e) {
                            return true;
                        });
                    } catch (error) {
                        localplay.dialogbox.alert("Playsouthend", "Unknown error!");
                    }
                }
            });
    }

    function setcreatorrole(list, data, role) {
        var command = "putrole.php";
        var roledata = {
            id: data.id,
            role: role
        };
        localplay.datasource.put(command, roledata, {},
            {
                datasourceonloadend: function (e) {
                    var xhr = e.target;
                    try {
                        var response = JSON.parse(xhr.datasource.response);
                        if (response.status !== "OK") {
                            localplay.dialogbox.alert("Playsouthend", response.message);
                        }
                        list.controller.refresh();
                    } catch (error) {
                        localplay.dialogbox.alert("Playsouthend", "Unknown error!");
                    }
                    list.controller.refresh();
                }
            });

    }
    function blockcreator(list, data, block) {
        var command = "putblocked.php";
        var blockdata = {
            id: data.id,
            block: block ? 1 : 0
        };
        localplay.datasource.put(command, blockdata, {},
            {
                datasourceonloadend: function (e) {
                    var xhr = e.target;
                    try {
                        var response = JSON.parse(xhr.datasource.response);
                        if (response.status !== "OK") {
                            localplay.dialogbox.alert("Playsouthend", response.message);
                        }
                        list.controller.refresh();
                    } catch (error) {
                        localplay.dialogbox.alert("Playsouthend", "Unknown error!");
                    }
                    list.controller.refresh();
                }
            });
    }

    function showstats(target) {
        var dialogposition = localplay.domutils.elementPosition(target);
        dialogposition.x += target.offsetWidth / 2;
        dialogposition.y += 42;
        var command = "getcreatorstats.php";
        localplay.datasource.get(command, {},
                   {
                       datasourceonloadend: function (e) {
                           var xhr = e.target;
                           try {
                               var response = JSON.parse(xhr.datasource.response);
                               if (response.status === "OK") {
                                   localplay.dialogbox.pinnedpopupatpoint(dialogposition, statsdialog, response, function (e) {
                                       var selector = localplay.domutils.getButtonSelector(e);
                                       if (selector.length >= 3) {
                                           var command = selector[2];
                                           switch (command) {
                                               case "webstats":
                                                   window.open("https://playsouthend.co.uk/plesk-stat/webstat", "_blank", "width=800, height=600, toolbar=no, menubar=no, scrollbars=no, location=no, directories=no, status=no");
                                                   break;
                                           }
                                       }
                                       return true;
                                   });
                               } else {
                                   localplay.dialogbox.alert("Playsouthend", response.message);
                               }
                           } catch (error) {
                               localplay.dialogbox.alert("Playsouthend", "Unknown error!");
                           }
                       }
                   }); 
    }
    var levelpreview = '\
            <div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: white;"> \
                <canvas id="admin.preview.canvas" class="slider" width="1024" height="723" ></canvas> \
            </div> \
    ';
    function previewlevel(id) {
        var previewgame = null;
        var previewcontroller = null;
        localplay.savetip();
        localplay.showtip();
        var dialog = localplay.dialogbox.createfullscreendialogboxwithtemplate("Preview", levelpreview, {}, function (d) {
            if (previewcontroller) {
                previewcontroller.detach();
            }
            previewgame.level.clear();
            delete previewgame;
            localplay.restoretip();
        });
        dialog.show();
        var previewcanvas = document.getElementById("admin.preview.canvas");
        if (previewcanvas) {
            previewgame = localplay.game.creategamewithlevel(previewcanvas,id);
            previewcontroller = localplay.game.controller.embedded.attachtogame(previewgame);
            previewgame.play();
            previewgame.level.play();
        }
    }
    //
    //
    //
    var admin = {};

    admin.init = function () {
        //
        //
        //
        this.tabgroup = localplay.tabgroup.createtabgroup("admingroup");
        //
        // level management
        //
        var levels = document.getElementById("levels");
        if (levels) {
            createList(levels, 'level', 'levels' );
        }
        var backgrounds = document.getElementById("backgrounds");
        if (backgrounds) {
            createList(backgrounds, 'media', 'backgrounds', 'type=background');
        }
        var things = document.getElementById("things");
        if (things) {
            createList(things, 'media', 'things', 'type=object');
        }
        var creators = document.getElementById("creators");
        if (creators) {
            createCreatorList(creators);
        }

    }

    return admin;

})();