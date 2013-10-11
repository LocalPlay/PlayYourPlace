/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.ratingpanel.js
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
localplay.ratingpanel = (function () {
    if (localplay.ratingpanel) return localplay.ratingpanel;
    //
    //
    //
    var ratingpanel = {};

    function RatingPanel(container, tablename, targetidid, disabled) {
        this.container = container;
        this.tablename = tablename;
        this.targetid = targetidid;
        this.disabled = disabled ? disabled : false;
        if (this.container) {
            var _this = this;
            this.container.innerHTML = "";
            this.label = ["Change idea", "Local flavour", "Artistry", "Fun"];
            this.score = [0, 0, 0, 0];
            this.stars = [[], [], [], []];
            for (var i = 0; i < this.label.length; i++) {
                var category = document.createElement("div");

                var title = document.createElement("div");
                title.className = "ratingpaneltitle";
                title.innerHTML = this.label[i];
                category.appendChild(title);
                var stars = document.createElement("span");
                stars.className = "ratingpanelstars";
                for (var j = 0; j < 5; j++) {
                    var star = document.createElement("img");
                    star.className = "ratingpanelstar";
                    star.src = "images/icons/rate-01.png";
                    star.category = i;
                    star.score = j + 1;
                    if (this.disabled) {
                        star.classList.add("disabled");
                    } else {
                        star.onclick = function (e) {
                            _this.addScore(this.category, this.score);
                            _this.put(this.category);
                        }
                    }
                    this.stars[i].push(star);
                    stars.appendChild(star);
                }
                title.appendChild(stars);
                this.container.appendChild(category);
            }
            this.getall();
        }
    }

    RatingPanel.prototype.addScore = function (category, score) {
        if (category < 0 || category >= this.score.length) return;
        var current = this.score[category];
        current = score;
        /*
        if (current == 0) {
            current = score;
        } else {
            current = (current + score) / 2.0;
        }
        */
        current = Math.max(0, Math.min(5, current));
        if (current != this.score[category]) {
            this.score[category] = current;
            this.updateDisplay();
        }
    }

    RatingPanel.prototype.setScore = function (category, score) {
        if (category < 0 || category >= this.score.length) return;
        if (this.score[category] != score) {
            this.score[category] = score;
            this.updateDisplay();
        }
    }

    RatingPanel.prototype.updateDisplay = function () {
        for (var category = 0; category < this.stars.length; category++) {
            for (var i = 0; i < 5; i++) {
                if (i < Math.round(this.score[category])) {
                    this.stars[category][i].src = "images/icons/rate.png";
                } else {
                    this.stars[category][i].src = "images/icons/rate-01.png";
                }
            }
        }
    }

    RatingPanel.prototype.datasourceonloadend = function (e) {
        var xhr = e.target;
        if (xhr.status == 200) {
            var datasource = xhr.datasource;
            //
            // deserialise
            //
            var json = datasource.response;
            try {
                var response = JSON.parse(json, function (key, value) {
                    return value;
                });
                if (response.status === "OK") {
                    var category = this.label.indexOf(response.category);
                    this.setScore(category, response.score);
                }
            } catch (error) {
                //
                // TODO: error dialog or fail gracefully?
                //
            }
        }

    }
    RatingPanel.prototype.getall = function () {
        for (var category = 0; category < this.score.length; category++) {
            var param = {
                category: this.label[category],
                tablename: this.tablename,
                targetid: this.targetid
            };
            localplay.datasource.get("getrating.php", param, this);
        }
    }

    RatingPanel.prototype.put = function (category) {
        var data = {
            "category": this.label[category],
            "tablename": this.tablename,
            "targetid": this.targetid,
            "score": this.score[category]
        };
        localplay.datasource.put("putrating.php", data, {}, {

        });
    }

    /*
    ratingpanel.createratingdialog = function (container, tablename, targetidid, disabled) {
        var panel = new RatingPanel(tablename, targetid);
        localplay.dialogbox.alert(title, panel, callback);
    }
    */

    ratingpanel.createratingpanel = function (container, tablename, targetidid, disabled) {
        return new RatingPanel(container, tablename, targetidid, disabled);
    }

    return ratingpanel;
})();