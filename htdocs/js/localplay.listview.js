/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.listview.js
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
localplay.listview = (function () {
    if ( localplay.listview ) return localplay.listview;
    var listview = {};
    //
    // public templates
    //
    listview.editablecontainer = '\
        <div id="{{prefix}}.listview.header" class="listviewheader"> \
            <img id="{{prefix}}.prev.medialibrarypage" class="listviewpagination" src="images/icons/arrow-previous-02.png" /> \
            <div id="{{prefix}}.pagenumbers.medialibrary" class="listviewpagination"></div> \
            <img id="{{prefix}}.next.medialibrarypage" class="listviewpagination" src="images/icons/arrow-next-02.png" /> \
            <input type="search" class="listviewsearch" placeholder="creator, name or tags"/> \
            <div id="{{prefix}}.localplay.addlistitem" class="menubaritem" style="float: right;"> \
                <img class="menubaritem" id="localplay.addlistitem" src="images/icons/add-01.png" />\
                {{{addlabel}}} \
            </div> \
        </div> \
        <div class="listviewcontent"></div>\
    ';

    listview.container = '\
         <div id="{{prefix}}.listview.header" class="listviewheader"> \
            <img id="{{prefix}}.prev.medialibrarypage" class="listviewpagination" src="images/icons/arrow-previous-02.png" /> \
            <div id="{{prefix}}.pagenumbers.medialibrary" class="listviewpagination"></div> \
            <img id="{{prefix}}.next.medialibrarypage" class="listviewpagination" src="images/icons/arrow-next-02.png" /> \
            <input type="search" class="listviewsearch" placeholder="creator, name or tags" value="{{filter}}"/> \
        </div> \
        <div class="listviewcontent"></div>\
    ';

    listview.itemtemplate =
        '<div class="listitemheader">{{name}}</div> \
        <img class="listitemthumbnail" src="{{thumbnail}}" /> \
        <div class="listitemcreator">by <b>{{creator}}</b></div> \
        <div class="listitemtags">{{tags}}</div>';

    listview.contenttemplate =
        '{{#rows}} \
        <div id="item.{{id}}" class="listitem"> \
            <div class="listitemheader"> \
                <span class="listitemheader">{{name}}</span>\
                <br />by&nbsp;{{creator}} \
            </div> \
            <img id="item.image.{{id}}" class="listitemimage" src="{{thumbnail}}" /> \
            <div class="listitemfooter">{{tags}}</div> \
        </div> \
        {{/rows}} \
        {{^rows}} \
            <h1>No Entries</h1> \
        {{/rows}}';

    listview.creatorlisttemplate =
        '{{#rows}} \
        <div id="item.{{id}}" class="creatorlistitem"> \
            <div class="creatorpanel left"> \
                <img id="item.image.{{id}}" class="creatorlistitemimage" src="{{thumbnail}}" /> \
            </div> \
            <div class="creatorpanel right"> \
                     <h3>{{name}}</h3>\
                    joined&nbsp;{{created}}<p />\
                    <div id="item.rating.{{id}}" style="width: 240px;"> \
                    </div>\
                    <p> \
                    {{#playerranking}} \
                    PLAYER RANKING {{rank}}/{{total}} \
                    {{/playerranking}}\
                    {{#makerranking}} \
                    MAKER RANKING {{rank}}/{{total}} \
                    {{/makerranking}}\
                    </p> \
            </div> \
        </div> \
        {{/rows}} \
        {{^rows}} \
            <h1>No Entries</h1> \
        {{/rows}}';
    //
    // TODO: shift all rendering into templates
    //
    function ListView(name, source, limit, filter, template, postprocessor) {
        var _this = this;
        this.view = document.getElementById(name);
        this.content = null;
        this.searchfield = null;
        this.searchbutton = null;
        this.searchform = null;
        this.offset = 0;
        this.limit = limit ? limit : 0;
        this.next = null;
        this.prev = null;
        this.pagenumbers = null;
        this.filter = filter ? filter : "";
        this.template = template ? template : listview.contenttemplate;
        this.postprocessor = postprocessor;
        if (this.view) {
            //
            //
            //
            var content = this.view.getElementsByClassName("listviewcontent");
            if (content && content.length > 0) {
                this.content = content[0];
            }
            //
            // initialise pagination
            // TODO: replace this with document.getElementById( "listview.next" ) etc
            var pagination = this.view.getElementsByClassName("listviewpagination");
            if (pagination) {
                this.limit = limit === undefined ? 8 : limit; // TODO: need to make this configurable
                this.offset = 0;
                for (var i = 0; i < pagination.length; i++) {
                    if (pagination[i].id.indexOf("prev") >= 0) {
                        this.prev = pagination[i];
                        pagination[i].onclick = function (e) {
                            _this.offset = Math.max(0, _this.offset - _this.limit);
                            _this.refresh();
                            localplay.domutils.stopPropagation(e);
                            return false;
                        };
                    } else if (pagination[i].id.indexOf("next") >= 0) {
                        this.next = pagination[i];
                        pagination[i].onclick = function (e) {
                            _this.offset = Math.min((_this.source.numberOfPages() - 1) * _this.limit, _this.offset + _this.limit);
                            _this.refresh();
                            localplay.domutils.stopPropagation(e);
                            return false;
                        };
                    } else if (pagination[i].id.indexOf("pagenumbers") >= 0) {
                        this.pagenumbers = pagination[i];
                    }
                }
            }
            //
            // initialise search
            // TODO: replace this with document.getElementById( "listview.search" )
            var search = this.view.getElementsByClassName("listviewsearch");
            if (search) {
                for (var i = 0; i < search.length; i++) {
                    if (search[i].type) {
                        if (search[i].type == "submit") {
                            this.searchbutton = search[i];
                        } else if (search[i].type == "search" || search[i].type == "text" ) {
                            this.searchfield = search[i];
                        }
                    }
                }
            }
            if (this.searchfield) {
                this.searchfield.onkeyup = function (e) {
                    e.preventDefault();
                    if (e.keyCode == 13) {
                        _this.offset = 0;
                        _this.filter = _this.searchfield.value;
                        _this.refresh();
                    }
                    return false;
                }
            }
            //
            //
            //
            this.source = new ListViewDataSource(source, this);
            this.refresh();
        }
    }

    ListView.prototype.refresh = function () {
        this.source.update(this.filter, this.offset, this.limit);
    }

    ListView.prototype.update = function () {
        if (this.content) {
            //
            // update pagination ui
            //
            this.updatePagination();
            //
            // render list
            //
            var rows = this.source.getRows();
            this.content.innerHTML = Mustache.render(this.template, { rows: rows });
            //
            // process items
            //
            for (var i = 0; i < rows.length; i++) {
                var data = rows[i];
                var item = document.getElementById("item." + data.id);
                if (item) {
                    this.attachDataToItem(item, data);
                }
            }
            if (this.postprocessor) {
                this.postprocessor(this);
            }
        }
    }

    ListView.prototype.setsource = function (source) {
        this.source.source = source;
        this.offset = 0;
        if (this.searchfield) this.searchfield.value = "";
        this.filter = "";
        this.refresh();
    }

    ListView.prototype.onselect = function (item) {

    }

    ListView.prototype.ondelete = function (item) {
        var _this = this;
        var data = item.data;
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
                            _this.source.update();
                        }
                    });
                }
            });

    }

    ListView.prototype.onflag = function (item) {
        var _this = this;
        localplay.flagitem("Flag", item.data.name, item.data.tablename, item.data.id, function () {
            _this.source.update();
        });
        /*
        var _this = this;
        var data = item.data;
        //
        // TODO: flag comment dialog
        //
        var command = "putflag.php";
        localplay.datasource.put(command, { tablename: data.tablename, targetid: data.id }, {},
            {
                datasourceonloadend: function (e) {
                    var xhr = e.target;
                    try {
                        var response = JSON.parse(xhr.datasource.response);
                        localplay.dialogbox.alert("Flag", response.message);
                    } catch (error) {
                        localplay.dialogbox.alert("Flag", "Unknown error!");
                    }
                    _this.source.update();
                }
            });
            */
    }

    ListView.prototype.attachDataToItem = function (item, data) {
        var _this = this;
        //
        // attach data to item
        //
        item.data = data;
        //
        // setup delete / flag
        //
        var offset = 0;
        if (data.candelete) {
            var button = new Image();
            button.id = "item.delete." + data.id;
            button.className = "imagebutton";
            button.style.position = "absolute";
            button.style.top = "8px";
            button.style.right = "8px";
            button.src = "images/icons/delete-05.png";
            button.onclick = function (e) {
                _this.ondelete(item);
            }
            item.appendChild(button);
            offset = 8 + 22;
        }

        if (data.canflag) {
            var button = new Image();
            button.id = "item.flag." + data.id;
            button.className = "imagebutton";
            button.style.position = "absolute";
            button.style.top = "8px";
            button.style.right = ( offset + 8 ) + "px";
            button.src = "images/icons/flag-01.png";
            button.onclick = function (e) {
                _this.onflag(item);
            }
            item.appendChild(button);

        }
        //
        // setup drag and drop
        //
        var image = document.getElementById("item.image." + data.id);
        if (image) {
            image.onclick = function (e) {
                _this.onselect(item);
            }
            image.ondragstart = function (e) {
                e.dataTransfer.effectAllowed = 'copyLink';
                e.dataTransfer.setData('Text', data.url);
            }
        }


    }
    ListView.prototype.updatePagination = function () {
        if (this.limit) {
            var _this = this;
            var pagecount = this.source.numberOfPages();
            var pagenumber = this.source.pageNumber();
            if (pagecount <= 1) {
                if (this.next) {
                    //this.next.style.display = "none";
                    this.next.style.opacity = "0";
                }
                if (this.prev) {
                    //this.prev.style.display = "none";
                    this.prev.style.opacity = "0";
                }
            } else {
                if (this.next && pagenumber < pagecount - 1) {
                    this.next.style.display = "inline";
                    this.next.style.opacity = "1";
                } else {
                    //this.next.style.display = "none";
                    this.next.style.opacity = "0";
                }
                if (this.prev && pagenumber > 0) {
                    this.prev.style.display = "inline";
                    this.prev.style.opacity = "1";
                } else {
                    //this.prev.style.display = "none";
                    this.prev.style.opacity = "0";
                }
            }
            if (this.pagenumbers) {
                var lowerlimit = 16;
                var upperlimit = pagecount - 1;
                this.pagenumbers.innerHTML = "";
                if (pagecount > 1) {
                    for (var i = 0; i < pagecount; i++) {
                        if (i == pagenumber || i < lowerlimit || i >= upperlimit) {
                            var a = document.createElement("a");
                            a.className = "listviewpagination";
                            if (i == pagenumber) {
                                a.style.color = "white";
                                a.style.backgroundColor = "black";
                            } else {
                                a.pageno = i;
                                a.onclick = function (e) {
                                    _this.offset = e.target.pageno * _this.limit;
                                    _this.refresh();
                                    localplay.domutils.stopPropagation(e);
                                }
                            }
                            a.innerHTML = (i + 1);
                            this.pagenumbers.appendChild(a);
                        } else if (i < lowerlimit + 3) {
                            var a = document.createElement("a");
                            a.innerHTML = ".";
                            this.pagenumbers.appendChild(a);
                        }
                    }
                }
            }
        }
    }

    function ListViewItem(parent, data) {
        //
        // store data
        //
        var _this = this;
        this.parent = parent;
        this.data = data;
        //
        // create list item div
        //
        this.view = document.createElement("div");
        this.view.className = "listitem";
        //
        // title
        //
        var div = document.createElement("div");
        div.className = "listitemheader";
        div.innerHTML = data.name;
        this.view.appendChild(div);
        //
        // delete button
        //
        if (data.deletecommand !== undefined) {
            var image = new Image();
            image.src = "images/delete.png";
            image.className = "listitemdelete";
            image.deletecommand = data.deletecommand;
            image.source = this.parent.source;
            image.onclick = function (e) {
                DialogBox.confirm("Playsouthend", "Are you sure you want to delete '" + data.name + "' ?", function (confirm) {
                    if (confirm) {
                        localplay.datasource.get( e.target.deletecommand, {}, {}, {
                            datasourceonloadend : function(e) {
                                _this.parent.source.update();
                            }
                        });
                    }
                });
            };
            this.view.appendChild(image);
        }
        //
        // thumbnail
        //
        if (data.thumbnail !== undefined) {
            var image = new Image();
            image.src = data.thumbnail;
            image.className = "listitemthumbnail";
            image.showcommand = data.showcommand;
            image.style.visibility = "hidden";
            image.onclick = function (e) {
                if (_this.parent.onselect != undefined) {
                    _this.parent.onselect(_this);
                } else if (e.target.showcommand != undefined && e.target.showcommand.length > 0) {
                    document.location = e.target.showcommand;
                }
            };
            image.onload = function (e) {
                localplay.domutils.fitImage(e.target, 32.0, 8.0, 240.0, 200.0);
                e.target.style.visibility = _this.parent.content.style.visibility;
            };
            image.ondragstart = function (e) {
                e.dataTransfer.effectAllowed = 'copyLink';
                e.dataTransfer.setData('Text', _this.data.url !== undefined ? _this.data.url : _this.data.thumbnail);
                ListViewItem.dragStart.set(e.offsetX, e.offsetY);
                localplay.log("startx=" + ListViewItem.dragStart.x + " starty=" + ListViewItem.dragStart.y);
            };
            this.view.appendChild(image);
        } else if (data.url !== undefined) {
            var image = new Image();
            image.src = data.url;
            image.className = "listitemthumbnail";
            image.style.visibility = "hidden";
            image.onload = function (e) {
                localplay.domutils.fitImage(e.target, 32.0, 8.0, 240.0, 200.0);
                e.target.style.visibility = _this.parent.content.style.visibility;
            };
            image.showcommand = data.showcommand;
            image.onclick = function (e) {
                if (_this.parent.onselect != undefined) {
                    _this.parent.onselect(_this);
                } else if (e.target.showcommand != undefined && e.target.showcommand.length > 0) {

                    document.location = e.target.showcommand;
                }
            };
            image.ondragstart = function (e) {
                localplay.domutils.fixEvent(e);
                e.dataTransfer.effectAllowed = 'copyLink';
                e.dataTransfer.setData('Text', _this.data.url);
                ListViewItem.dragStart.set(e.offsetX, e.offsetY);
                localplay.log("startx=" + ListViewItem.dragStart.x + " starty=" + ListViewItem.dragStart.y);
            };
            this.view.appendChild(image);
        }
        //
        // creator
        //
        div = document.createElement("div");
        div.className = "listitemcreator";
        div.innerHTML = data.creator;
        this.view.appendChild(div);
        //
        // tags
        //
        div = document.createElement("div");
        div.className = "listitemtags";
        div.innerHTML = data.tags;
        this.view.appendChild(div);
        //
        // add to parent
        //
        this.parent.content.appendChild(this.view);
    }

    ListViewItem.dragStart = new Point();
    //
    // TODO: replace this with localplay.datasource
    //
    function ListViewDataSource(source, target) {
        this.source = source;
        this.target = target;
        this.data = null;
    }

    ListViewDataSource.prototype.update = function (filter, offset, limit) {
        //
        // check parameters
        //
        if (filter === undefined) {
            filter = '';
        }
        if (offset === undefined) {
            offset = 0;
        }
        if (limit === undefined) {
            limit = 0;
        }
        //
        // create request object
        //
        var xhr = new XMLHttpRequest();
        //
        // hook events
        //
        var _this = this;
        xhr.addEventListener('load', function (evt) {
            _this.onload(evt);
        }, false);
        xhr.addEventListener('loadstart', function (evt) {
            _this.onloadstart(evt);
        }, false);
        xhr.addEventListener('loadend', function (evt) {
            _this.onloadend(evt);
        }, false);
        xhr.addEventListener('progress', function (evt) {
            _this.onprogress(evt);
        }, false);
        xhr.addEventListener('abort', function (evt) {
            _this.onabort(evt);
        }, false);
        xhr.addEventListener('timeout', function (evt) {
            _this.ontimeout(evt);
        }, false);
        xhr.addEventListener('error', function (evt) {
            _this.onerror(evt);
        }, false);
        //
        // build request
        //
        var query = this.source + (this.source.indexOf("?") >= 0 ? "&" : "?") + "filter=" + filter + "&offset=" + offset + "&limit=" + limit;
        xhr.open('GET', query, true);
        xhr.send();
    }
    //
    // event handling
    //
    ListViewDataSource.prototype.onload = function (evt) {
        var xhr = evt.target;
        if (xhr.status == 200) {
            //
            // deserialise
            //
            var json = xhr.response === undefined ? xhr.responseText : xhr.response;
            while (json[0] != '[' && json[0] != '{') json = json.substr(1);
            var _this = this;
            try {
                var data = JSON.parse(json, function (key, value) {
                    return value;
                });
                //localplay.log(json);
                this.data = data;
            } catch (error) {
                localplay.dialogbox.alert("Localplay", (xhr.response === undefined ? xhr.responseText : xhr.response));
            }
        }
        //
        //
        //
        if (this.target) {
            this.target.update();
        }
    }

    ListViewDataSource.prototype.onloadstart = function (evt) {

    }

    ListViewDataSource.prototype.onloadend = function (evt) {

    }

    ListViewDataSource.prototype.onprogress = function (evt) {


    }

    ListViewDataSource.prototype.onabort = function (evt) {

    }

    ListViewDataSource.prototype.ontimeout = function (evt) {

    }

    ListViewDataSource.prototype.onerror = function (evt) {

    }
    //
    //
    //
    ListViewDataSource.prototype.numberOfPages = function () {
        return this.data.pagecount;
    }

    ListViewDataSource.prototype.pageNumber = function () {
        return this.data.pagenumber;
    }

    ListViewDataSource.prototype.numberOfRowsInPage = function () {
        return this.data.rows.length;
    }

    ListViewDataSource.prototype.dataForRow = function (row) {
        if (row >= 0 && row < this.data.rows.length) {
            return this.data.rows[row];
        }
        return null;
    }

    ListViewDataSource.prototype.getRows = function () {
        return this.data.rows;
    }
    //
    //
    //
    listview.createlistview = function (name, source, limit, filter, itemtemplate, postprocessor) {
        return new ListView(name, source, limit, filter, itemtemplate, postprocessor);
    }

    //
    // utility functions
    //
    listview.createlibrarydialog = function (title, contents, onselect, limit, filter, onadd, addlabel, itemtemplate, menu, postprocessor) {
        var container = document.createElement("div");
        var d = new Date();
        var prefix = "library" + d.getTime();
        container.id = prefix;
        container.className = "";
        container.style.top = "0px";
        //
        // 
        //
        container.innerHTML = Mustache.render(listview.container, { filter: filter, prefix: prefix });

        var dialog = localplay.dialogbox.createfullscreendialogbox(title, [container],
            [], [], function () { });
        dialog.show();
        //
        // attach menu
        //
        // format = {
        //          items : [
        //              { name : name, id : id },
        //              { name : name, id : id },
        //              { name : name, id : id },
        //              { name : name, id : id }
        //          ],
        //          callback : function( id ) {}
        //  }
        //
        if (menu) {
            container.breadcrumb = dialog.attachmenu(menu.items, menu.callback);
        }

        container.controller = new ListView(container.id, contents, limit, filter, itemtemplate, postprocessor);
        container.prefix = prefix;
        container.controller.onselect = function (item) {

            if (onselect !== undefined && onselect) {
                //
                // on select can override close by returning true
                //
                if (!onselect(item)) {
                    dialog.close();
                }
            } else {
                dialog.close();
            }

        }

        if (onadd) {
            var header = document.getElementById(prefix + ".listview.header");
            if (header) {
                var addcontainer = document.createElement("div");
                addcontainer.id = prefix + ".localplay.addlistitem";
                addcontainer.classList.add("menubaritem");
                addcontainer.classList.add("right");
                addcontainer.innerHTML = '<img class="menubaritem" src="images/icons/add-01.png" />&nbsp;' + addlabel;
                addcontainer.onclick = function () {
                    onadd(container.controller);
                };
                header.appendChild(addcontainer);
            }
        }
        
        return container;
    }

    return listview;
})();