;
//
// TODO: templating
//
localplay.game.backgroundeditor = (function () {
    var backgroundeditor = {};
    //
    //
    //
    function BackgroundEditor(level) {
        this.level = level;
        //
        //
        //
        var _this = this;
        this.hit = null;
        this.movebackground = -1;
        //
        // create container
        //
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.top = "0px";
        this.container.style.left = "8px";
        this.container.style.bottom = "0px";
        this.container.style.right = "8px";
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
            if (!_this.isFull()) _this.backgroundview.classList.add('over');

        }
        this.backgroundview.ondragleave = function (e) {
            _this.backgroundview.classList.remove('over');  // this / e.target is previous target element.
        }
        this.backgroundview.ondragover = function (e) {
            if (_this.movebackground < 0 && _this.isFull()) {
                e.dataTransfer.dropEffect = 'none';
            } else {
                if (!_this.backgroundview.classList.contains('over')) {
                    _this.backgroundview.classList.add('over');
                }
                e.dataTransfer.dropEffect = 'copy';
            }
            localplay.domutils.preventDefault(e);
            return false;
        }
        this.backgroundview.ondrop = function (e) {
            localplay.domutils.stopPropagation(e);
            _this.backgroundview.classList.remove('over');
            var url = e.dataTransfer.getData("Text");
            if (_this.movebackground >= 0) {
                _this.removeImage(_this.movebackground);
                _this.movebackground = -1;
            }
            _this.addImage(url);
            localplay.domutils.preventDefault(e);
            return false;
        }
        //
        //
        //
        var d = new Date();
        this.prefix = "background.medialibrary." + d.getTime();
        this.medialibrary = document.createElement("div");
        this.medialibrary.id = this.prefix;
        this.medialibrary.className = "listview";
        this.medialibrary.style.top = "260px";
        this.medialibrary.innerHTML = Mustache.render( localplay.listview.editablecontainer, { prefix: this.prefix, addlabel: "Upload background drawings" });
        //
        //
        //
        this.container.appendChild(this.backgroundview);
        this.container.appendChild(this.medialibrary);
    }
    BackgroundEditor.prototype.save = function () {

    }

    BackgroundEditor.prototype.initialise = function () {
        var _this = this;
        this.medialibrary.controller = localplay.listview.createlistview(this.prefix, "getmedia.php?type=background&listview=true", 20);
        this.medialibrary.controller.onselect = function (item) {
            //image.src = item.data.url;
            //this.level.background.addimage(item.image.src);
            //this.level.reserialise();
            if (!_this.isFull()) {
                _this.addImage(item.data.url);
            } 
        };
        //
        // populate views
        //
        this.refresh();
        //
        //
        //
        var addobjectbutton = document.getElementById(this.prefix + ".localplay.addlistitem");
        if (addobjectbutton) {
            addobjectbutton.onclick = function (e) {
                var backgrounduploader = new BackgroundUploader(function (update) {
                    if (update) {
                        _this.medialibrary.controller.refresh();
                    }
                    if (_this.level.background.images.length > 1) {
                        localplay.showtip("Drag your backgrounds here<br />Drag to reorder your backgrounds", _this.backgroundview);
                    } else {
                        localplay.showtip("Drag your backgrounds here", _this.backgroundview);
                    }
                });

            }
        }
        if (this.level.background.images.length > 1) {
            localplay.showtip("Drag your backgrounds here<br />Drag to reorder your backgrounds", this.backgroundview);
        } else {
            localplay.showtip("Drag your backgrounds here", this.backgroundview);
        }
    }

    BackgroundEditor.prototype.dealloc = function () {
        localplay.showtip();
    }

    BackgroundEditor.prototype.isFull = function () {
        return this.level.background.images.length >= 7;
    }

    BackgroundEditor.prototype.isEmpty = function () {
        return this.level.background.images.length == 0;
    }

    BackgroundEditor.prototype.refresh = function () {
        if (this.backgroundview) {
            this.backgroundview.innerHTML = "";
            var background = this.level.background;
            var _this = this;
            if (background) {
                for (var i = 0; i < background.images.length; i++) {
                    var item = document.createElement("div");
                    item.className = "backgroundviewitem";
                    item.background = i;
                    item.onclick = function (e) {

                        localplay.domutils.fixEvent(e);
                        localplay.log(" e.offsetX=" + e.offsetX + " e.offsetY=" + e.offsetY);
                        if (e.offsetX < 26 /*&& e.offsetY > 18*/ && e.offsetY < 42) {
                            _this.removeImage(e.target.background);
                        }

                        /*
                        TODO: need to fix the firefox and opera 'after' offset problem 
                        */
                        //_this.removeImage(e.target.background);
                    }
                    var image = new Image();
                    image.className = "backgroundview";
                    image.src = background.images[i].src;
                    image.background = i;
                    image.ondragenter = function (e) {
                        //e.target.classList.add('over');

                    };
                    image.onmousemove = function (e) {
                        this.hoverx = e.offsetX;
                        this.hovery = e.offsetY;
                    };

                    image.ondragleave = function (e) {
                        e.target.classList.remove('overleft');
                        e.target.classList.remove('overright');
                    };
                    image.ondragover = function (e) {
                        if (e.preventDefault) {
                            e.preventDefault();
                        }
                        if (_this.movebackground < 0 && _this.isFull()) {
                            e.dataTransfer.dropEffect = 'none';
                        } else {
                            localplay.domutils.fixEvent(e);
                            //localplay.log("dragx=" + e.offsetX + " dragy=" + e.offsetY + " hoverx=" + this.hoverx + " hovery" + this.hovery );
                            var cx = e.target.offsetWidth / 2.0;
                            if (e.target.hoverx > cx) {
                                e.target.classList.remove('overleft');
                                e.target.classList.add('overright');
                            } else {
                                e.target.classList.remove('overright');
                                e.target.classList.add('overleft');
                            }
                            /*
                            if (e.dataTransfer.effectAllowed == 'copyLink') {
                                e.dataTransfer.dropEffect = 'copy';
                            } else if (e.dataTransfer.effectAllowed == 'linkMove') {
                                e.dataTransfer.dropEffect = 'move';
                            } else {
                                e.dataTransfer.dropEffect = 'none';
                            }
                            */
                            e.dataTransfer.dropEffect = 'copy';
                        }
                        return false;
                    };
                    image.ondrop = function (e) {
                        localplay.domutils.stopPropagation(e);
                        e.target.classList.remove('overleft');
                        e.target.classList.remove('overright');
                        _this.backgroundview.classList.remove('over');

                        var i = e.target.background;
                        var cx = e.target.offsetWidth / 2.0;
                        if (e.offsetX > cx) {
                            i++;
                        }
                        var url = e.dataTransfer.getData("Text");
                        var newimage = true;
                        if (_this.movebackground >= 0) {
                            _this.removeImage(_this.movebackground);
                            if (i > _this.movebackground) i--;
                            _this.movebackground = -1;
                            newimage = false;
                        }
                        _this.insertImage(i, url);
                        if (newimage&&_this.isFull()) {
                            localplay.showtip("You have reached the limit of 7 backgrounds<br />Drag to reorder your backgrounds<br />Delete backgrounds to add new ones", _this.backgroundview);
                        }
                        if (e.preventDefault) {
                            e.preventDefault(); // Necessary. Allows us to drop.
                        }
                        
                        return false;
                    }; 
                    image.ondragstart = function (e) {

                        if (e.shiftKey) { // duplicate
                            //e.dataTransfer.effectAllowed = 'copyLink';
                        } else { // move
                            //e.dataTransfer.effectAllowed = 'linkMove';
                            e.target.style.opacity = "0";
                            _this.movebackground = e.target.background;
                        }
                        e.dataTransfer.effectAllowed = 'copy';
                        e.dataTransfer.setData('Text', e.target.src);
                    };
                    item.appendChild(image);
                    this.backgroundview.appendChild(item);
                }
            }
        }
    }

    BackgroundEditor.prototype.addImage = function (url) {
        //
        // add image to background
        //
        if (this.level) {
            this.level.background.addimage(url);
            this.level.reserialise();
            if (this.isFull()) {
                localplay.showtip("You have reached the limit of 7 backgrounds<br />Drag to reorder your backgrounds<br />Delete backgrounds to add new ones", this.backgroundview);
            }
        }
        //
        // refresh
        //
        this.refresh();
    }

    BackgroundEditor.prototype.insertImage = function (i, url) {
        //
        // add image to background
        //
        if (this.level) {
            this.level.background.insertimage(i, url);
            this.level.reserialise();
        }
        //
        // refresh
        //
        this.refresh();
    }

    BackgroundEditor.prototype.removeImage = function (i) {
        //
        // remove image from background
        //
        if (this.level) {
            this.level.background.removeimage(i);
            this.level.reserialise();
            localplay.showtip();
        }
        //
        // refresh
        //
        this.refresh();
    }
    //
    //
    //
    var uploadertemplate = '\
            <div class="menubar">\
                <div class="menubaritem" > \
                   <img class="menubaritem" src="images/icons/add-01.png" />&nbsp;Add Background\
                </div> \
                <div id="backgrounduploader.button.close" class="menubaritem" style="float: right;"> \
                   <img class="menubaritem" src="images/icons/close-cancel-01.png" />&nbsp;Close\
                </div> \
                <div id="backgrounduploader.button.file" class="menubaritem" style="float: right;"> \
                   <img class="menubaritem" src="images/icons/load.png" />&nbsp;Choose Image\
                </div> \
                <div id="backgrounduploader.button.save" class="menubaritem" style="float: right; display: none;"> \
                   <img class="menubaritem" src="images/icons/save.png" />&nbsp;Save Background\
                </div> \
            </div> \
            <div style="position: absolute; top: 42px; left: 0px; bottom: 0px; right: 0px;"> \
                <!-- toolbar --> \
                <div id="backgrounduploader.toolbar" style="position: absolute; top: 0px; left: -272px; bottom: 0px; width: 272px; padding: 16px; background-color: lightgray; overflow-x: hidden; overflow-y: auto;"> \
                    <h3>name</h3>\
                    <input id="backgrounduploader.name" type="text" style="width: 256px;" placeholder="name" /> \
                    <h3>tags</h3>\
                    <input id="backgrounduploader.tags" type="text" style="width: 256px;" placeholder="tags" /> \
                    <h3>brightness</h3>\
                    <input id="backgrounduploader.slider.brightness" type="range" min="-255" max="255" value="0" style="width: 256px;"/> \
                    <h3>contrast</h3>\
                    <input id="backgrounduploader.slider.contrast" type="range" min="-255" max="255" value="0" style="width: 256px;"/> \
                    <!--\
                    <h3>brushes</h3> \
                    <div style="width: 256px; height: 42px"> \
                        <img src="images/icons/brush-01.png" style="margin: 4px;"/> \
                        <img src="images/icons/brush-02.png" style="margin: 4px;"/> \
                        <img src="images/icons/brush-03.png" style="margin: 4px;"/> \
                        <img src="images/icons/brush-04.png" style="margin: 4px;"/> \
                    </div> \
                    -->\
                </div> \
                <!-- image canvas --> \
                <div id="backgrounduploader.scrollpane" style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; overflow: auto; background-color: darkgray;"> \
                    <canvas id="backgrounduploader.canvas" class="backgrounduploader" width="1023" height="723">Your browser doesn&apos;t support HTML5 canvas</canvas> \
                </div> \
            </div> \
            <input id="backgrounduploader.file" type="file" style="position: absolute; left: -400px; visibility: collapse;" /> \
    ';
    function BackgroundUploader(callback) {
        //
        // create container
        //
        var container = document.createElement("div");
        container.className = "fullscreen";
        container.innerHTML = uploadertemplate;
        document.body.appendChild(container);
        //
        // initialise canvas and tools
        //
        this.scrollpane = document.getElementById("backgrounduploader.scrollpane");
        this.canvas = document.getElementById("backgrounduploader.canvas");
        this.toolbar = document.getElementById("backgrounduploader.toolbar");
        //
        //
        //
        this.name = document.getElementById("backgrounduploader.name");
        this.tags = document.getElementById("backgrounduploader.tags");
        //
        // initialise file selector
        // TODO: IE9 support
        //
        var _this = this;
        var file = document.getElementById("backgrounduploader.file");
        if (file) {
            file.addEventListener("change", function (e) {
                _this.handleFileSelect(e);
            });
        }
        //
        // hook ui buttons
        //
        this.update = false;
        this.savebutton = document.getElementById("backgrounduploader.button.save");
        localplay.domutils.hookChildElementsWithPrefix(container, "backgrounduploader.button", "click", function (e) {
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length >= 3) {
                var command = selector[2];
                switch (command) {
                    case "close":
                        localplay.domutils.purgeDOMElement(container);
                        document.body.removeChild(container);
                        if (callback) callback(_this.update);
                        break;
                    case "file":
                        file.click();
                        break;
                    case "save":
                        _this.save();
                        localplay.showtip("Choose another image", _this.scrollpane);
                        _this.update = true;
                        break;
                }
            }
        });
        //
        // hook sliders
        //
        this.brightnessslider = document.getElementById("backgrounduploader.slider.brightness");
        if ( this.brightnessslider ) {
            this.brightnessslider.onchange = function(e) {
                _this.adjustImage();
            }
            if (this.brightnessslider.type == "text") {
                localplay.domutils.createSlider(this.brightnessslider);
            }
        }
        this.contrastslider = document.getElementById("backgrounduploader.slider.contrast");
        if (this.contrastslider) {
            this.contrastslider.onchange = function (e) {
                _this.adjustImage();
            }
            if (this.contrastslider.type == "text") {
                localplay.domutils.createSlider(this.contrastslider);
            }
        }
        //
        //
        //
        this.enableEditControls(false);
        //
        //
        //
        localplay.showtip("Choose image", this.scrollpane);
    }
    //
    //
    //
    BackgroundUploader.prototype.save = function (e) {
        var _this = this;
        localplay.imageprocessor.resizeCanvasToFit(this.canvas, 256, 256, false,
            function (c) {
                var data = new Object();
                /*
                data.data = _this.canvas.toDataURL("image/png");
                data.thumbnail = c.toDataURL("image/png");
                */
                data.data = _this.canvas.toDataURL("image/jpg",0.5);
                data.thumbnail = c.toDataURL("image/jpg",0.5);
                if (data) {
                    //
                    // upload image and thumbnail
                    //
                    var param = {};
                    param.type = 'background';
                    param.filename = 'background.jpg';
                    param.name = _this.name.value;
                    param.tags = _this.tags.value;
                    localplay.datasource.put('upload.php', data, param, localplay.datasource.createprogressdialog("Saving Background...", 
                        function (e) {
                            var xhr = e.target;
                            try {
                                var response = JSON.parse(xhr.datasource.response);
                                if (response.status === "OK") {
                                    _this.canvas.getContext('2d').clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                                    _this.enableEditControls(false);
                                }
                            } catch (error) {

                            }

                        }));
                }
            });
    }


    //
    // image processing worker
    //
    BackgroundUploader.prototype.adjustImage = function () {
        this.spawnWorker();
        if (this.worker) {
            var c = this.contrastslider.value / 255.0;
            var b = this.brightnessslider.value / 255.0;
            var blockwidth = this.originalcanvas.width >> 2;
            var blockheight = this.originalcanvas.height >> 2;
            var data = {
                'command': 'block',
                'brightness': b,
                'contrast': c,
                'x': 0,
                'y': 0,
                'width': blockwidth > 0 ? blockwidth : this.originalcanvas.width,
                'height': blockheight > 0 ? blockheight : this.originalcanvas.height
            };
            this.sendBlock(data);
        }
    }
    BackgroundUploader.prototype.sendBlock = function (data) {
        var context = this.originalcanvas.getContext("2d");
        data.imagedata = context.getImageData(data.x, data.y, data.width, data.height);
        this.worker.postMessage(data);
    }
    BackgroundUploader.prototype.spawnWorker = function () {
        var _this = this;
        this.terminateWorker();
        this.worker = new Worker('js/brightnesscontrastworker.js');
        this.worker.addEventListener('message', function (e) {
            localplay.log("worker command: " + e.data.command);
            if (e.data.command == 'block') {
                //
                // display processed data
                //
                var context = _this.canvas.getContext('2d');
                context.putImageData(e.data.imagedata, e.data.x, e.data.y);
                //
                // send next block
                //
                e.data.x += e.data.width;
                if (e.data.x >= _this.originalcanvas.width) {
                    e.data.x = 0;
                    e.data.y += e.data.height;
                    if (e.data.y >= _this.originalcanvas.height) {
                        return;
                    }
                }
                _this.sendBlock(e.data);
            } else if (e.data.command == 'image') {
                var context = _this.canvas.getContext('2d');
                context.putImageData(e.data.imagedata, 0, 0);
            }
        });
        this.worker.addEventListener('error', function (e) {
            localplay.log("worker error line:" + e.lineno + " file:" + e.filename + " message:" + e.message);
        });

    }
    BackgroundUploader.prototype.terminateWorker = function () {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
    //
    //
    //
    BackgroundUploader.prototype.enableEditControls = function (enable) {
        if (window.Worker) {
            if (enable) {
                this.savebutton.style.display = "block";
                this.toolbar.style.left = "0px";
                this.scrollpane.style.left = "300px";
            } else {
                this.savebutton.style.display = "none";
                this.toolbar.style.left = "-272px";
                this.scrollpane.style.left = "0px";
                this.name.value = "";
                this.tags.value = "";
                this.brightnessslider.value = 0;
                this.contrastslider.value = 0;
            }
        }
    }

    BackgroundUploader.prototype.handleFileSelect = function (e) {
        var _this = this;
        var files = e.target.files;
        var f = files[0];
        if (f) {
            localplay.imageprocessor.loadlocalimage(f, function (filename, e1) {
                _this.setImage(e1.target.result);
                /*
                //localfilename = filename;
                var image = new Image();
                image.src = e1.target.result;
                image.onload = function (e2) {
                    _this.setImage(e2.target);
                }
                */
            });

        }
    }
    BackgroundUploader.prototype.setImage = function (data) {
        var _this = this;
        var image = new Image();
        image.src = data;
        image.onload = function (evt) {
            //
            // get image size and calculate scale to fix standard height
            //
            var imagewidth = image.naturalWidth;
            var imageheight = image.naturalHeight;
            var scale = _this.canvas.height / image.naturalHeight;
            imagewidth *= scale;
            imageheight = _this.canvas.height;
            //
            // resize this.canvas to fit
            //
            _this.canvas.width = Math.round(imagewidth);
            _this.originalcanvas = document.createElement("canvas");
            _this.originalcanvas.width = _this.canvas.width;
            _this.originalcanvas.height = _this.canvas.height;
            var context = _this.originalcanvas.getContext("2d");
            context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            context.drawImage(image, 0, 0, imagewidth, imageheight);
            //
            // convert to grayscale
            //
            localplay.imageprocessor.canvastograyscale(_this.originalcanvas, _this.originalcanvas);
            localplay.imageprocessor.copycanvas(_this.originalcanvas, _this.canvas);
            //
            //
            //
            _this.enableEditControls(true);
            //
            //
            //
            localplay.showtip("Give your background a name<br />Adjust the contrast and brightness<br />Save", _this.scrollpane);
        }

    }
    BackgroundUploader.prototype.cleanup = function () {
        this.terminateWorker();
    }
    //
    //
    //
    backgroundeditor.createbackgroundeditor = function (level) {
        return new BackgroundEditor(level);
    }
    backgroundeditor.createbackgrounduploader = function (level) {
        return new BackgroundUploader();
    }
    //
    //
    //
    return backgroundeditor;
})();