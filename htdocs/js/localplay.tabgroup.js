/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.tabgroup.js
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
localplay.tabgroup = (function () {
    if (localplay.tabgroup) return localplay.tabgroup;
    //
    //
    //
    var tabgroup = {};
    //
    //
    //
    function TabGroup(name) {
        this.container = document.getElementById(name);

        this.buttons = [];
        this.tabs = [];
        var _this = this;
        var currentTab = -1;
        for (var i = 0; i < this.container.children.length; i++) {
            if (this.container.children[i].className === "tabgroupnavigation") {
                for (var j = 0; j < this.container.children[i].children.length; j++) {
                    if (this.container.children[i].children[j].className === "tabgroupbutton") {
                        this.buttons.push(this.container.children[i].children[j]);
                        var index = this.buttons.length - 1;
                        this.container.children[i].children[j].targetpane = this.buttons.length - 1;
                        this.container.children[i].children[j].onclick = function (e) {
                            _this.show(e.target.targetpane);
                        };

                    }
                }
            }
            if (this.container.children[i].className === "tabgroupcontent") {
                for (var j = 0; j < this.container.children[i].children.length; j++) {
                    if (this.container.children[i].children[j].className === "tabgrouppane") {
                        this.tabs.push(this.container.children[i].children[j]);
                    }
                }
            }
        }
        this.show(0);
    }

    TabGroup.prototype.show = function (tab) {
        if (tab >= 0 && tab < this.tabs.length) {
            for (var i = 0; i < this.tabs.length; i++) {
                this.buttons[i].style.background = i == tab ? 'rgb( 102, 102, 102 )' : 'lightgray';
                this.tabs[i].style.visibility = i == tab ? 'visible' : 'hidden';
                this.tabs[i].style.display = i == tab ? 'block' : 'none';
                if (i == tab && this.tabs[i].refresh) {
                    this.tabs[i].refresh();
                }
            }
        }
    }
    //
    //
    //
    tabgroup.createtabgroup = function (name) {
        return new TabGroup(name);
    }
    return tabgroup;
})();
