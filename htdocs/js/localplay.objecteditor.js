/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.objecteditor.js
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
//
// TODO: encapsulate this in utils
//
var filecallback = function (data) {

};

var Flash = {
    getFileData: function (base64) {
        filecallback(base64);
    }
};

localplay.objecteditor = (function () {
    var objecteditor = {};
    //
    // 
    //
    //
    //
    //
    var uploadertemplate = '\
            <div class="menubar">\
                <div class="menubaritem disabled" > \
                   <img class="menubaritem" src="images/icons/breadcrumb.png" />&nbsp;<span id="objecteditor.title">Add Thing</span>\
                </div> \
                <div id="objecteditor.button.close" class="menubaritem" style="float: right;"> \
                   <img class="menubaritem" src="images/icons/close-cancel-01.png" />&nbsp;Close\
                </div> \
                <div id="objecteditor.button.file" class="menubaritem" style="float: right;"> \
                   <img class="menubaritem" src="images/icons/load.png" />&nbsp;Choose Image\
                </div> \
                <div id="objecteditor.button.cancel" class="menubaritem" style="float: right; display: none;"> \
                   <img class="menubaritem" src="images/icons/close-cancel-01.png" />&nbsp;Cancel\
                </div> \
                <div id="objecteditor.button.save" class="menubaritem" style="float: right; display: none;"> \
                   <img class="menubaritem" src="images/icons/save.png" />&nbsp;Save\
                </div> \
            </div> \
            <div id="objecteditor.container" style="position: absolute; top: 42px; left: 0px; bottom: 0px; right: 0px;"> \
                <!-- image canvas --> \
                <div id="objecteditor.scrollpane" style="position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; overflow: auto; background-color: darkgray;"> \
                    <canvas id="objecteditor.canvas" class="backgrounduploader" style="cursor: url( ../images/icons/brush-01.png ); width: auto; height: auto;" width="1023" height="723">Your browser doesn&apos;t support HTML5 canvas</canvas> \
                </div> \
                <div id="objecteditor.savepanel" class="objecteditorsavepanel"> \
                    <!-- toolbar --> \
                    <div id="objecteditor.toolbar" class="objecteditortoolbar"> \
                        <h3>name</h3>\
                        <input id="objecteditor.name" type="text" style="width: 256px;" placeholder="name" /> \
                        <h3>tags</h3>\
                        <input id="objecteditor.tags" type="text" style="width: 256px;" placeholder="tags" /> \
                        <h3>brightness</h3>\
                        <input id="objecteditor.slider.brightness" type="range" min="-255" max="255" value="0" style="width: 256px;"/> \
                        <h3>contrast</h3>\
                        <input id="objecteditor.slider.contrast" type="range" min="-255" max="255" value="0" style="width: 256px;"/> \
                        <!-- \
                        <h3>brushes</h3> \
                        <div style="width: 256px; height: 42px"> \
                            <img id="objecteditor.button.brush.1" src="images/icons/brush-01.png" style="margin: 4px;"/> \
                            <img id="objecteditor.button.brush.2" src="images/icons/brush-02.png" style="margin: 4px;"/> \
                            <img id="objecteditor.button.brush.3" src="images/icons/brush-03.png" style="margin: 4px;"/> \
                            <img id="objecteditor.button.brush.4" src="images/icons/brush-04.png" style="margin: 4px;"/> \
                            <img id="objecteditor.button.brush.5" src="images/icons/brush-05.png" style="margin: 4px;"/> \
                            <img id="objecteditor.button.brush.6" src="images/icons/brush-06.png" style="margin: 4px;"/> \
                            <img id="objecteditor.button.brush.7" src="images/icons/brush-07.png" style="margin: 4px;"/> \
                            <img id="objecteditor.button.brush.8" src="images/icons/brush-08.png" style="margin: 4px;"/> \
                        </div> \
                    --> \
                    </div> \
                    <!-- selected thing --> \
                    <div class="backgroundgrid" style="position: absolute; top: 0px; left: 300px; bottom: 0px; right: 0px; overflow: auto; background-color: darkgray; "> \
                        <canvas id="objecteditor.cropcanvas" class="backgrounduploader" width="1023" height="723">Your browser doesn&apos;t support HTML5 canvas</canvas> \
                    </div> \
                </div> \
            </div> \
            <input id="objecteditor.file" type="file" style="position: absolute; left: -400px; visibility: collapse;" /> \
    ';

    function ObjectEditor(title,callback) {
        //
        // create container
        //
        var container = document.createElement("div");
        container.className = "fullscreen";
        container.innerHTML = uploadertemplate;
        document.body.appendChild(container);
        //
        //
        //
        this.title = document.getElementById("objecteditor.title");
        if (title) {
            this.title.innerHTML = title;
        }
        //
        // initialise canvas and tools
        //
        this.scroll = document.getElementById("objecteditor.scrollpane");
        this.canvas = document.getElementById("objecteditor.canvas");
        this.cropcanvas = document.getElementById("objecteditor.cropcanvas");
        this.savepanel = document.getElementById("objecteditor.savepanel");
        //
        //
        //
        this.name = document.getElementById("objecteditor.name");
        this.tags = document.getElementById("objecteditor.tags");
        //
        // initialise file selector
        // TODO: IE9 support
        //
        var _this = this;
        var file = document.getElementById("objecteditor.file");
        if (file) {
            file.addEventListener("change", function (e) {
                _this.handleFileSelect(e);
            });
        }
        //
        // hook sliders
        //
        this.brightnessslider = document.getElementById("objecteditor.slider.brightness");
        if (this.brightnessslider) {
            this.brightnessslider.onchange = function (e) {
                _this.adjustImage();
            }
            if (this.brightnessslider.type == "text") {
                localplay.domutils.createSlider(this.brightnessslider);
            }
        }
        this.contrastslider = document.getElementById("objecteditor.slider.contrast");
        if (this.contrastslider) {
            this.contrastslider.onchange = function (e) {
                _this.adjustImage();
            }
            if (this.contrastslider.type == "text") {
                localplay.domutils.createSlider(this.contrastslider);
            }
        }
        //
        // hook ui buttons
        //
        this.update = false;
        this.savebutton = document.getElementById("objecteditor.button.save");
        this.cancelbutton = document.getElementById("objecteditor.button.cancel");
        this.filebutton = document.getElementById("objecteditor.button.file");
        localplay.domutils.hookChildElementsWithPrefix(container, "objecteditor.button", "click", function (e) {
            var selector = localplay.domutils.getButtonSelector(e);
            if (selector.length >= 3) {
                var command = selector[2];
                switch (command) {
                    case "close":
                        localplay.showtip();
                        localplay.domutils.purgeDOMElement(container);
                        document.body.removeChild(container);
                        if (callback) callback(this.update);
                        break;
                    case "file":
                        file.click();
                        break;
                    case "save":
                        localplay.showtip();
                        _this.saveSelection();
                        this.update = true;
                        break;
                    case "cancel":
                        _this.showSavePanel(false);
                        break;
                }
            }
        });
        //
        //
        //
        this.objectid = 0;
        this.objectname = "";
        this.objecttags = "";
        //
        // initialise event handling
        //
        this.canvas.objecteditor = this;
        this.canvas.addEventListener("mousedown", this.onmousedown, true);
        this.canvas.addEventListener("mouseup", this.onmouseup, true);
        this.canvas.addEventListener("mousemove", this.onmousemove, true);
        //
        // add editing to canvas
        //
        this.cropcanvas.addEventListener("mousedown", function (e) {
            localplay.domutils.fixEvent(e);
            _this.cropcanvas.drawing = true;
            var context = _this.cropcanvas.getContext("2d");
            context.clearRect(e.offsetX - 2, e.offsetY - 2, 4, 4);
        });
        this.cropcanvas.addEventListener("mouseup", function (e) {
            _this.cropcanvas.drawing = false;
        });
        this.cropcanvas.addEventListener("mousemove", function (e) {
            if (_this.cropcanvas.drawing) {
                localplay.domutils.fixEvent(e);
                var context = _this.cropcanvas.getContext("2d");
                context.clearRect(e.offsetX - 2, e.offsetY - 2, 4, 4);
            }
        });
        this.cropcanvas.addEventListener("mouseleave", function (e) {
            _this.cropcanvas.drawing = false;
        });
        //
        //
        //
        this.trackingMouse = false;
        this.dragStart = new Point();
        this.dragCurrent = new Point();
        //
        //
        //
        //this.imageprocessor = new ImageProcessor();
        this.showSavePanel(false);
        //
        //
        //
        localplay.showtip("Choose an image", _this.scroll);
    }

    ObjectEditor.prototype.showSavePanel = function(show) {
        if (show) {
            this.savebutton.style.display = "block";
            this.cancelbutton.style.display = "block";
            this.filebutton.style.display = "none";
            this.savepanel.style.right = "0px";
            this.savepanel.style.left = "0px";
            localplay.showtip("Give your thing a name<br />Adjust its contrast and brightness<br />Save or Cancel to finish or select again", document.getElementById("objecteditor.container"));
         } else {
            localplay.showtip("Click and drag to select an object", this.canvas);
            this.savebutton.style.display = "none";
            this.cancelbutton.style.display = "none";
            this.filebutton.style.display = "block";
            this.savepanel.style.right = "100%";
            this.savepanel.style.left = "-100%";
            this.name.value = "";
            this.tags.value = "";
            this.brightnessslider.value = 0;
            this.contrastslider.value = 0;
        }
    }

    ObjectEditor.prototype.handleFileSelect = function (e) {
        var _this = this;
        var files = e.target.files;
        var f = files[0];
        if (f) {
            localplay.imageprocessor.loadlocalimage(f, function (filename, e1) {
                var image = new Image();
                image.src = e1.target.result;
                image.onload = function (e2) {
                    _this.setImage(e2.target);
                    //
                    //
                    //
                    localplay.showtip("Click and drag to select an object", _this.canvas);
                }
            });

        }
    }

    ObjectEditor.prototype.adjustImage = function () {
        var _this = this;
        var brightness = this.brightnessslider.value;
        var contrast = this.contrastslider.value;
        localplay.imageprocessor.adjustBrightnessAndContrast(this.originalcropcanvas, this.cropcanvas, brightness, contrast);
        localplay.imageprocessor.processCanvas(this.cropcanvas, this.cropcanvas, function (data) { _this.createMask(data); });
    }

    ObjectEditor.prototype.setImage = function (image) {
        this.image = image;
        //
        //
        //
        if (this.canvas == null) {
            this.canvas = document.createElement("canvas");
            this.canvas.style.position = "relative";
            this.scroll.appendChild(this.canvas);
        }
        //
        // get image size and calculate scale to fix standard height
        //
        var imagewidth = image.naturalWidth;
        var imageheight = image.naturalHeight;
        var scale = 723.0 / imageheight;
        if (scale < 1.0) {
            imagewidth *= scale;
            imageheight *= scale;
        }
        //
        // resize canvas to fit
        //
        
        this.canvas.width = Math.round(imagewidth);
        this.canvas.height = Math.round(imageheight);
        this.canvas.style.width = this.canvas.width + "px";
        this.canvas.style.height = this.canvas.height + "px";
        //
        //
        //
        this.trackingMouse = false;
        this.dragStart = new Point();
        this.dragCurrent = new Point();
        //
        //
        //

        //
        // draw image
        //
        this.draw();
    }
    //
    //
    //
    ObjectEditor.prototype.draw = function () {
        if (this.canvas === null) return;
        var context = this.canvas.getContext("2d");
        //
        // draw image
        //
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.image) {
            context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            //
            //
            //
            if (this.trackingMouse) {
                var p0 = new Point();
                var p1 = new Point();
                if (this.dragCurrent.x > this.dragStart.x) {
                    p0.x = this.dragStart.x;
                    p1.x = this.dragCurrent.x;
                } else {
                    p1.x = this.dragStart.x;
                    p0.x = this.dragCurrent.x;
                }
                if (this.dragCurrent.y > this.dragStart.y) {
                    p0.y = this.dragStart.y;
                    p1.y = this.dragCurrent.y;
                } else {
                    p1.y = this.dragStart.y;
                    p0.y = this.dragCurrent.y;
                }
                if (context.setLineDash) {
                    context.setLineDash([5, 2]);
                }
                context.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
            }
        }
    }
    //
    //
    //
    ObjectEditor.prototype.onmousedown = function (e) {
        var objecteditor = this.objecteditor;
        localplay.showtip();
        localplay.domutils.fixEvent(e);
        if (e.target === objecteditor.canvas) {
            objecteditor.trackingMouse = true;
            objecteditor.dragStart.set(e.offsetX, e.offsetY);
            objecteditor.dragCurrent.set(e.offsetX, e.offsetY);
         } else {
            if (e.offsetX > e.target.clientWidth || e.offsetY > e.target.clientHeight) return;
            objecteditor.trackingMouse = true;
            var x = Math.max(0, Math.min(objecteditor.canvas.width, e.offsetX - objecteditor.canvas.offsetLeft));
            var y = Math.max(0, Math.min(objecteditor.canvas.height, e.offsetY - objecteditor.canvas.offsetTop));
            objecteditor.dragStart.set(x, y);
            objecteditor.dragCurrent.set(x, y);
        }
        objecteditor.draw();
        localplay.domutils.stopPropagation(e);
    }

    ObjectEditor.prototype.onmouseup = function (e) {
        var objecteditor = this.objecteditor;
        if (!objecteditor.trackingMouse) return;

        localplay.domutils.fixEvent(e);
        objecteditor.trackingMouse = false;
        objecteditor.draw();
        objecteditor.showSelection();
        localplay.domutils.stopPropagation(e);
    }

    ObjectEditor.prototype.onmousemove = function (e) {
        var objecteditor = this.objecteditor;
        if (!objecteditor.trackingMouse) {
            return;
        }

        localplay.domutils.fixEvent(e);

        if (e.target === objecteditor.canvas) {
            objecteditor.dragCurrent.set(e.offsetX, e.offsetY);
        } else {
            var x = Math.max(0, Math.min(objecteditor.canvas.width, e.offsetX - objecteditor.canvas.offsetLeft));
            var y = Math.max(0, Math.min(objecteditor.canvas.height, e.offsetY - objecteditor.canvas.offsetTop));
            
            objecteditor.dragCurrent.set(x, y);
        }

        objecteditor.draw();

        localplay.domutils.stopPropagation(e);
    }

    ObjectEditor.prototype.showSelection = function () {
        var _this = this;
        //
        // crop image
        //
        var p0 = new Point();
        var p1 = new Point();
        if (this.dragCurrent.x > this.dragStart.x) {
            p0.x = this.dragStart.x;
            p1.x = this.dragCurrent.x;
        } else {
            p1.x = this.dragStart.x;
            p0.x = this.dragCurrent.x;
        }
        if (this.dragCurrent.y > this.dragStart.y) {
            p0.y = this.dragStart.y;
            p1.y = this.dragCurrent.y;
        } else {
            p1.y = this.dragStart.y;
            p0.y = this.dragCurrent.y;
        }
        if (p1.x - p0.x < 8 || p1.y - p0.y < 8) {
            if (this.canvas.width < 400 && this.canvas.height < 400) {
                p0.x = p0.y = 0;
                p1.x = this.canvas.width;
                p1.y = this.canvas.height;
            } else {
                return;
            }
        }
        var scale = 1.0;
        this.cropcanvas.width = Math.round(p1.x - p0.x);
        this.cropcanvas.height = Math.round(p1.y - p0.y);
        this.cropcanvas.style.width = this.cropcanvas.width + "px";
        this.cropcanvas.style.height = this.cropcanvas.height + "px";
        this.cropcanvas.style.position = "relative";
        this.cropcanvas.style.margin = "8px";
        this.cropcanvas.drawing = false;
        var context = this.cropcanvas.getContext("2d");
        context.clearRect(0, 0, this.cropcanvas.width, this.cropcanvas.height);
        context.drawImage(this.image, -p0.x, -p0.y, this.canvas.width, this.canvas.height);
        this.originalcropcanvas = document.createElement("canvas");
        this.originalcropcanvas.width = this.cropcanvas.width;
        this.originalcropcanvas.height = this.cropcanvas.height;
        context = this.originalcropcanvas.getContext("2d");
        context.clearRect(0, 0, this.cropcanvas.width, this.cropcanvas.height);
        context.drawImage(this.image, -p0.x, -p0.y, this.canvas.width, this.canvas.height);
        //
        // create processed version
        //
        localplay.imageprocessor.processCanvas(this.cropcanvas, this.cropcanvas, function (data) { _this.createMask(data); });

        this.showSavePanel(true);
    }


    ObjectEditor.prototype.saveSelection = function () {
        //
        // convert canvas to image for upload
        //
        var data = {};
        data.data = this.cropcanvas.toDataURL("image/png");
        //
        // upload
        //
        var param = {
            type: 'object'
        };
        if (this.objectid > 0) param.id = this.objectid;
        param.name = this.name.value;
        param.tags = this.tags.value;
        if (param.name.length > 0) {
            param.filename = param.name + ".png";
        } else {
            //
            // TODO: unsafe move to server
            //
            param.filename = "object" + (new Date()).getTime() + ".png";
        }
        //
        // 
        //
        var _this = this;
        localplay.datasource.put('upload.php', data, param, localplay.datasource.createprogressdialog(param.name.length > 0 ? "Saving '" + param.name + "'..." : "Saving object...", function () {
            _this.showSavePanel(false);
        }));
    }

    var patternoffsets = [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: +1 },
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: +1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: +1 }
    ];

    function neighbourscan(p, x, y, width, height, bpp, rowbytes) {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        var threshold = 200;
        var index = (y * rowbytes) + (x * bpp);
        var done = false;
        if (p[index + 3] !== 0) { // not already touched
            if (p[index] > threshold && p[index + 1] > threshold && p[index + 2] > threshold) {
                p[index + 3] = 0;
                patternoffsets.forEach(function (o) {
                    neighbourscan(p, x + o.x, y + o.y, width, height, bpp, rowbytes);
                });
            }
        }
    }
    ObjectEditor.prototype.createMask = function (data) {
        //
        //
        //
        var threshold = 200;
        var bpp = 4;
        var rowbytes = bpp * data.width;
        var pixels = data.data;
        //
        //
        //
        var test = function (x, y) {
            var index = (y * rowbytes) + (x * bpp);
            return (pixels[index+3] !=0 && pixels[index] > threshold && pixels[index + 1] > threshold && pixels[index + 2] > threshold);
        }
        var fill = function (x, y) {
            var stack = [];
            stack.push({ x: x, y: y });
            while (stack.length > 0) {
                var p = stack.pop();
                if (!(p.x < 0 || p.x >= data.width || p.y < 0 || p.y >= data.height)) {
                    if (test(p.x, p.y)) {
                        var index = (p.y * rowbytes) + (p.x * bpp);
                        pixels[index + 3] = 0;
                        stack.push({ x: p.x - 1, y: p.y });
                        stack.push({ x: p.x + 1, y: p.y });
                        stack.push({ x: p.x, y: p.y - 1 });
                        stack.push({ x: p.x, y: p.y + 1 });
                    }
                }
            }
        };
        //
        // scan edges for background colour
        //
        var x = 0;
        var y = 0;
        //
        // top
        //
        for (x = 0; x < data.width - 1; x++) {
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // right
        //
        x = data.width - 1;
        for (y = 0; y < data.height - 1; y++) {
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // bottom
        //
        y = data.height - 1;
        for (x = 1; x < data.width; x++) {
            if (test(x, y)) {
                fill(x, y);
            }
        }
        //
        // left
        //
        x = 0;
        for (y = 1; y < data.height; y++) {
            if (test(x, y)) {
                fill(x, y);
            }
        }

    }

    ObjectEditor.prototype.onprocessed = function (image) {
        var context = this.cropcanvas.getContext("2d");
        context.clearRect(0, 0, this.cropcanvas.width, this.cropcanvas.height);
        context.drawImage(image, 0, 0);
    }
    //
    //
    //
    objecteditor.createobjecteditor = function (title, callback) {
        return new ObjectEditor(title,callback);
    }
    //
    //
    //
    return objecteditor;
})();