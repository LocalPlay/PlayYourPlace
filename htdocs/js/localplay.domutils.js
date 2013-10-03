//
// DOM utils
//
localplay.domutils = (function () {
    if (localplay.domutils) return localplay.domutils;
    //
    //
    //
    var domutils = {};
    //
    //
    //
    function Slider(container) {
        //
        // get target element
        //
        var _this = this;
        this.container = container;//document.getElementById(name);
        //
        // check if type = "range"  is supported
        //
        if (!this.container.type || this.container.type !== "range") {
            //
            //
            //
            this.min = this.container.min === undefined ? 0 : parseFloat(this.container.min);
            this.max = this.container.max === undefined ? 1.0 : this.container.max;
            this.value = this.container.value === undefined ? ((this.max + this.min) / 2.0) : this.container.value;
            //
            // build custom slider
            //
            this.slider = document.createElement("div");
            this.slider.style.display = this.container.style.display;
            this.slider.style.position = this.container.style.position;
            this.slider.style.left = this.container.style.left;
            this.slider.style.top = this.container.style.top;
            this.slider.style.width = this.container.style.width;
            this.slider.style.height = "32px";
            this.slider.style.backgroundImage = "url(images/slidertrack.png)";
            this.slider.style.backgroundRepeat = "repeat-x";
            this.slider.onmousedown = function (e) {
                localplay.domutils.fixEvent(e);
                if (e.target === _this.slider) _this.setThumbPosition(e.offsetX);
                _this.hookEvents();
                localplay.domutils.stopPropagation(e);
                return false;
            }

            this.thumb = document.createElement("div");
            this.thumb.style.position = "relative";
            this.thumb.style.left = "0px";
            this.thumb.style.top = "0px";
            this.thumb.style.width = "32px";
            this.thumb.style.height = "32px";
            this.thumb.style.backgroundImage = "url(images/sliderthumb.png)";

            this.slider.appendChild(this.thumb);

            this.container.parentNode.insertBefore(this.slider, this.container);

            this.container.style.display = "none";
            this.container.style.visibility = "hidden";

            this.setThumbValue(this.value);
        }

    }

    Slider.prototype.setThumbPosition = function (x) {
        var thumbwidth = Math.max(32, this.thumb.offsetWidth);
        var left = this.slider.offsetLeft;
        var width = this.slider.offsetWidth;
        var range = width - thumbwidth;
        var position = Math.max(0, Math.min((x - left) - (thumbwidth / 2), range));
        var factor = position / range;
        this.value = this.min + ((this.max - this.min) * factor);
        this.container.value = this.value;

        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        this.container.dispatchEvent(evt);

        this.thumb.style.left = position + "px";
    }

    Slider.prototype.setThumbValue = function (value) {
        var thumbwidth = Math.max(32, this.thumb.offsetWidth);
        var width = Math.max(this.slider.offsetWidth, 200);
        var range = width - thumbwidth;
        var factor = (value - this.min) / (this.max - this.min);
        var position = Math.min(range, Math.max(0, width * factor));
        this.slider.value = value;

        this.thumb.style.left = position + "px";
    }

    Slider.prototype.hookEvents = function () {
        document.addEventListener("mouseup", this, true);
        document.addEventListener("mousemove", this, true);
    }

    Slider.prototype.unhookEvents = function () {
        document.removeEventListener("mouseup", this, true);
        document.removeEventListener("mousemove", this, true);
    }

    Slider.prototype.handleEvent = function (e) {
        switch (e.type) {
            case 'mouseup':
                this.unhookEvents();
                break;
            case 'mousemove':
                localplay.domutils.fixEvent(e);
                var offset = -1;
                var x = e.offsetX;
                if (e.target === this.slider) {
                    offset = 0;
                } else if (e.target === this.thumb) {
                    offset = this.thumb.offsetLeft;
                }
                if (offset >= 0) {
                    x += offset;
                    this.setThumbPosition(x);
                }
                break;
        }
        localplay.domutils.stopPropagation(e);
        return false;
    }
    //
    //
    //
    domutils.getParameter = function (key) {
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query = window.location.search.substring(1);

        while (match = search.exec(query)) {
            if (decode(match[1]) === key) return decode(match[2]);
        }

        return undefined;
    }

    domutils.isEventSupported = function (element, eventname) {
        var e = 'on' + eventname;
        var isSupported = (e in element);
        if (!isSupported) {
            element.setAttribute(e, 'return;');
            isSupported = typeof element[e] == 'function';
        }
        return isSupported;
    }

    domutils.createCustomEvent = function (name, detail) {
        var event;
        try {
            event = new CustomEvent(name, detail);
        } catch (error) {
            event = document.createEvent("CustomEvent");
            event.initCustomEvent(name, true, true, detail === undefined ? null : detail);
        }
        return event;
    }

    domutils.extendAsEventDispatcher = function (target) {
        if (target._listeners == null) {
            target._listeners = [];
        }
        target.isEventDispatcher = true;
        if (typeof (target.dispatchEvent) == "undefined") {
            target.dispatchEvent = function (eventObject) {
                for (var i = 0; i < target._listeners.length; i++) {
                    var test = target._listeners[i];
                    if (test.type === eventObject.type) {
                        test.callback(eventObject);
                    }
                }
            };
        }
        if (typeof (target.addEventListener) == "undefined") {
            target.addEventListener = function (type, callback, capture) {
                // no dupes
                var declared = false;
                for (var i = 0; i < target._listeners.length; i++) {
                    var test = target._listeners[i];
                    if (test.type === type && test.callback === callback) {
                        declared = true;
                        break;
                    }
                }
                if (!declared) {
                    target._listeners.push({ 'type': type, 'callback': callback, 'capture': capture });
                }
            };
        }
        if (typeof (target.removeEventListener) == "undefined") {
            target.removeEventListener = function (type, callback, capture) {
                for (var i = 0; i < target._listeners.length; i++) {
                    var test = target._listeners[i];
                    if (test.type === type && test.callback === callback) {
                        target._listeners.splice(i, 1);
                        break;
                    }
                }
            };
        }
    }

    domutils.hookChildElementsWithPrefix = function (parent, prefix, event, callback) {
        for (var i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i].id && parent.childNodes[i].id.indexOf(prefix) === 0) {
                parent.childNodes[i].addEventListener(event, callback);
            }
            if (parent.childNodes[i].childNodes && parent.childNodes[i].childNodes.length > 0) {
                this.hookChildElementsWithPrefix(parent.childNodes[i], prefix, event, callback);
            }
        }
    }

    domutils.forEachChildWithPrefix = function (parent, prefix, callback) {
        for (var i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i].id && parent.childNodes[i].id.indexOf(prefix) === 0) {
                callback(parent.childNodes[i]);
            }
            if (parent.childNodes[i].childNodes && parent.childNodes[i].childNodes.length > 0) {
                this.forEachChildWithPrefix(parent.childNodes[i], prefix, callback);
            }
        }

    }

    domutils.valueOfRadioGroup = function (name) {
        var buttons = document.getElementsByName(name);
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].checked == true) {
                return buttons[i].value;
            }
        }
        return null;
    }

    domutils.urlToRelativePath = function (url) {
        var basedirectory = location.href;
        basedirectory = basedirectory.substr(0, basedirectory.lastIndexOf('/') + 1);
        if (url.indexOf(basedirectory) == 0) {
            return url.substr(basedirectory.length);
        }
        return url;
    }

    domutils.fitImage = function (image, top, left, width, height) {
        var imagewidth = parseFloat(image.naturalWidth);
        var imageheight = parseFloat(image.naturalHeight);

        var scale = 1.0;
        if (imagewidth > width) {
            scale = width / imagewidth;
            imagewidth *= scale;
            imageheight *= scale;
        }

        if (imageheight > height) {
            scale = height / imageheight;
            imagewidth *= scale;
            imageheight *= scale;
        }

        var offsetX = Math.round(left + ((width - imagewidth) / 2.0));
        var offsetY = Math.round(top + ((height - imageheight) / 2.0));

        image.width = Math.floor(imagewidth).toString();
        image.height = Math.floor(imageheight).toString();
        image.style.top = offsetY + "px";
        image.style.left = offsetX + "px";
    }

    domutils.purgeDOMElement = function (d) {
        var a = d.attributes, i, l, n;
        if (a) {
            for (i = a.length - 1; i >= 0; i -= 1) {
                n = a[i].name;
                if (typeof d[n] === 'function') {
                    d[n] = null;
                }
            }
        }
        a = d.childNodes;
        if (a) {
            l = a.length;
            for (i = 0; i < l; i += 1) {
                this.purgeDOMElement(d.childNodes[i]);
            }
        }
    }

    domutils.fixEvent = function (e) {
        if (!e.hasOwnProperty('offsetX')) {
            //
            // add offset position to firefox events
            //
            var curleft = curtop = 0;
            if (e.offsetParent) {
                var obj = e;

                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
            }
            e.offsetX = e.layerX - curleft;
            e.offsetY = e.layerY - curtop;
        }
    }

    domutils.preventDefault = function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
    }

    domutils.stopPropagation = function (e) {
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    }
    domutils.responseToJSON = function (response) {
        var json = response;
        while (json.length > 0 && json[0] != '{' && json[0] != '[') json = json.substr(1);
        return json;
    }

    domutils.elementPosition = function (element) {
        var p = new Point();
        do {
            p.x += element.offsetLeft;
            p.y += element.offsetTop;
            element = element.offsetParent;
        } while (element);
        return p;
    }

    domutils.isChild = function (parent, element) {
        if (parent === element) return true;
        for (var i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i] === element) {
                return true;
            } else if (this.isChild(parent.childNodes[i], element)) {
                return true;
            }
        }
        return false;
    }
    domutils.getExtensionForAudio = function () {
        return this.getTypeForAudio();
    }

    domutils.getTypeForAudio = function () {
        var audio = new Audio();

        if (audio.canPlayType("audio/mpeg")) {
            return "mp3";
        } else if (audio.canPlayType("audio/ogg")) {
            return "ogg";
        }

        return "";
    }
    //
    //
    //
    domutils.bindSlider = function (name, source, min, max) {
        var container = document.createElement("div");
        container.innerHTML = name + "<br />";
        var slider = document.createElement("input");
        slider.type = "range";
        slider.style.width = "200px";
        slider.style.height = "30px";
        slider.min = min;
        slider.max = max;
        slider.value = source[name];
        localplay.log("min: " + slider.min + " max: " + slider.max + " value:" + slider.value + " source: " + name + " value: " + source[name]);
        slider.onchange = function (e) {
            var value = e.target.value;
            source[name] = value;
        };
        container.appendChild(slider);
        if (slider.type == "text") {
            new Slider(slider);
        }
        container.slider = slider;
        return container;
    }
    domutils.createSlider = function (container) {
        return new Slider(container);
    }
    domutils.getButtonSelector = function (e) {
        var selector = e.target.id.split(".");
        if (selector.length <= 1) {
            selector = e.target.parentNode.id.split(".");
        }
        return selector;
    }
    return domutils;
}());
