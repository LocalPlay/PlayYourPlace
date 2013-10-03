
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
