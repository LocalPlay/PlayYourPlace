function NewBackgroundEditor() {
    var _this = this;
    this.hit = null;
    //
    //
    //
    this.backgroundview = document.createElement("div");
    this.backgroundview.id = "backgroundview";
    this.backgroundview.className = "backgroundview";
    //
    // hook drag events
    //
    this.backgroundview.ondragenter = function (e) {
        // this / e.target is the current hover target.
        _this.backgroundview.classList.add('over');

    }
    this.backgroundview.ondragleave = function (e) {
        _this.backgroundview.classList.remove('over');  // this / e.target is previous target element.
    }
    this.backgroundview.ondragover = function (e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        e.dataTransfer.effectAllowed = 'copyLink';  // See the section on the DataTransfer object.
        e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
        return false;
    }
    this.backgroundview.ondrop = function (e) {
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        _this.backgroundview.classList.remove('over');  // this / e.target is previous target element.
        var url = e.dataTransfer.getData("Text");
        _this.addImage(url);
        return false;
    }
    //
    //
    //
    this.medialibrary = document.createElement("div");
    this.medialibrary.id = "medialibrary";
    this.medialibrary.className = "listview";
    this.medialibrary.style.top = "256px";
    this.medialibrary.innerHTML =
        '<div style="background: white; width: 100%; height:56px;"> \
        <h3 style="display: inline-block; margin: 8px;">Background Images</h3>&nbsp;<form class="listviewsearch" > \
        <input type="search" class="listviewsearch" placeholder="name or tags"/> \
        <input type="submit" class="listviewsearch" value="Search" /></form> \
        <img id="prevthis.medialibrarypage" class="listviewpagination" src="images/prev.png" /> \
        <div id="pagenumbersthis.medialibrary" class="listviewpagination"></div> \
        <img id="nextthis.medialibrarypage" class="listviewpagination" src="images/next.png" /> \
        </div> \
        <div class="listviewcontent"></div>';
    //
    // add views to document
    //
    var gamecontainer = document.getElementById("gamecontainer");
    if (gamecontainer) {
        gamecontainer.appendChild(this.backgroundview);
        gamecontainer.appendChild(this.medialibrary);
    } else {
        document.body.appendChild(this.backgroundview);
        document.body.appendChild(this.medialibrary);
    }
    //
    // populate views
    //
    this.refresh();
    this.medialibrary.controller = new ListView("medialibrary", "getmedia.php?type=background&listview=true");
    this.medialibrary.controller.onselect = function (item) {
        //image.src = item.data.url;
        //game.level.properties.background.addimage(item.image.src);
        //game.level.reserialise();
        _this.addImage(item.data.url);
    };
}

NewBackgroundEditor.prototype.close = function () {
    if (this.backgroundview) {
        soda.utils.purgeDOMElement(this.backgroundview);
        this.backgroundview.parentElement.removeChild(this.backgroundview);
    }
    if (this.medialibrary) {
        soda.utils.purgeDOMElement(this.medialibrary);
        this.medialibrary.parentElement.removeChild(this.medialibrary);
    }
}

NewBackgroundEditor.prototype.refresh = function () {
    if (this.backgroundview && game) {
        this.backgroundview.innerHTML = "";
         var background = game.level.properties.background;
        var _this = this;
        if ( background ) {
            for ( var i = 0; i < background.images.length; i++ ) {
                var image = new Image();
                image.className = "backgroundview";
                image.src = background.images[i].src;
                image.background = i;
                image.onclick = function (e) {
                    _this.removeImage(e.target.background);
                };
                image.ondragenter = function (e) {
                    // this / e.target is the current hover target.
                    //e.target.classList.add('over');

                };
                image.ondragleave = function (e) {
                    e.target.classList.remove('overleft');  // this / e.target is previous target element.
                    e.target.classList.remove('overright');  // this / e.target is previous target element.
                };
                image.ondragover = function (e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }
                    var cx = e.target.offsetWidth / 2.0;
                    if (e.offsetX > cx) {
                        e.target.classList.remove('overleft');
                        e.target.classList.add('overright');
                    } else {
                        e.target.classList.remove('overright');
                        e.target.classList.add('overleft');
                    }
                    e.dataTransfer.effectAllowed = 'copyLink';  // See the section on the DataTransfer object.
                    e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
                    return false;
                };
                image.ondrop = function (e) {
                    if (e.stopPropagation) {
                        e.stopPropagation(); // stops the browser from redirecting.
                    }
                    e.target.classList.remove('overleft');  // this / e.target is previous target element.
                    e.target.classList.remove('overright');  // this / e.target is previous target element.
                    var i = e.target.background;
                    var cx = e.target.offsetWidth / 2.0;
                    if (e.offsetX > cx) {
                        i++;
                    }
                    var url = e.dataTransfer.getData("Text");
                    _this.insertImage(i, url);
                    
                    return false;
                };
                this.backgroundview.appendChild(image);
            }
        }
    }
}

NewBackgroundEditor.prototype.addImage = function (url) {
    //
    // add image to background
    //
    if (game) {
        game.level.properties.background.addimage(url);
        game.level.reserialise();
    }
    //
    // refresh
    //
    this.refresh();
}

NewBackgroundEditor.prototype.insertImage = function (i,url) {
    //
    // add image to background
    //
    if (game) {
        game.level.properties.background.insertimage(i, url);
        game.level.reserialise();
    }
    //
    // refresh
    //
    this.refresh();
}

NewBackgroundEditor.prototype.removeImage = function (i) {
    //
    // remove image from background
    //
    if (game) {
        game.level.properties.background.removeimage(i);
        game.level.reserialise();
    }
    //
    // refresh
    //
    this.refresh();
}
