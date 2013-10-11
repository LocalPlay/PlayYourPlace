/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/medialibrary.js
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

function MediaLibraryItem(library, source) {
    this.loaded = false;
    this.library = library;
    this.source = source;
    var _this = this;
    this.image = new Image();
    this.image.onload = function () {
        _this.setup();
    };
    this.image.onerror = function () {
        _this.library.remove(_this);
    };
    this.image.src = source;
}
MediaLibraryItem.prototype.setup = function () {
    this.loaded = true;
}

function MediaLibrary(source) {
    this.source = source;
    this.items = null;
    //
    // start downlaod
    //
    var downloader = new Downloader();
    downloader.download(source, this);
}

MediaLibrary.prototype.add = function (item) {
    this.items.push(item);
}

MediaLibrary.prototype.remove = function (item) {
    var i = this.items.indexOf(item);
    if (i != -1) {
        this.items.splice(i, 1);
    }
}
//
// downloader delegate
//
MediaLibrary.prototype.downloaderonload = function (evt) {
    var xhr = evt.target;
    if (xhr.status == 200) {
        //
        // deserialise
        //
        var json = xhr.response === undefined ? xhr.responseText : xhr.response;
        while (json[0] != '{' && json[0] != '[') json = json.substr(1);
        var _this = this;
        var items = JSON.parse(json, function (key, value) {
            
            var index = parseInt(key);
            if (!isNaN(index)) { // check for array index
                return new MediaLibraryItem(_this, value);
            }

            return value;
        });
        this.items = items;
    }
}

MediaLibrary.prototype.downloaderonloadstart = function (evt) {
}

MediaLibrary.prototype.downloaderonloadend = function (evt) {
}

MediaLibrary.prototype.downloaderonprogress = function (evt) {
}

MediaLibrary.prototype.downloaderonabort = function (evt) {
}

MediaLibrary.prototype.downloaderontimeout = function (evt) {
}

MediaLibrary.prototype.downloaderonerror = function (evt) {
}

