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

