/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.imageprocessor.js
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
localplay.imageprocessor = (function () {
    if (localplay.imageprocessor) return localplay.imageprocessor;
    //
    //
    //
    var imageprocessor = {};
    //
    //
    //
    function tograyscale(data) {
        for (var i = 0; i < data.data.length; i += 4) {
            var r = data.data[i];
            var g = data.data[i + 1];
            var b = data.data[i + 2];
            var y = Math.min(255, Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b));
            data.data[i] = data.data[i + 1] = data.data[i + 2] = y;
        }
    }
    //
    //
    //

    imageprocessor.getImageData = function (image) {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height);
    }

    imageprocessor.loadlocalimage = function (f, callback) {
        if (f.type.match('image.*')) {
            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (f) {
                var filename = f.name;
                return function (evt) {
                    callback(filename, evt);
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
            return true;
        }
    }

    imageprocessor.processCanvas = function (source, target, process) {
        //
        // get pixel data
        //
        var context = source.getContext('2d');
        var data = context.getImageData(0, 0, source.width, source.height);
        //
        // forward to processor
        //
        if (process) {
            process(data);
        }
        //
        // copy to target
        //
        context = target.getContext('2d');
        context.putImageData(data, 0, 0);
    }

    imageprocessor.processImage = function (image, process, callback) {
        //
        // get image data
        //
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        var data = context.getImageData(0, 0, canvas.width, canvas.height);
        //
        // pass canvas on for processing
        //
        if (process) {
            process(data);
            context.putImageData(data, 0, 0);
        }
        //
        //
        //
        var processedimage = new Image();
        processedimage.src = canvas.toDataURL("image/png");
        processedimage.onload = function (evt) {
            callback(processedimage);
        }
    }

    imageprocessor.processLocalImage = function (f, process, callback) {
        //
        // load image
        //
        this.loadlocalimage(f, function (filename, e) {
            var image = new Image();
            image.src = e.target.result;
            image.onload = function (e) {
                //
                // get image
                //
                var image = e.target;
                this.processImage(image, process, callback);
            }
            image.onerror = function (e) {
                if (callback) callback(null);
            }
        });
    }

    imageprocessor.findContours = function (image) {
        //
        // 
        //
        /*
        var spacing = 16;
        var nDivisions = image.width / spacing;
        */
        var triangles = [];
        var bounds = this.findBoundingBox(image);

        if (bounds.width < 16 || bounds.height < 16) {
            bounds.moveby(new Point(-image.naturalWidth / 2.0, -image.naturalHeight / 2.0));
            triangles.push(new Triangle(new Point(bounds.x + bounds.width, bounds.y), new Point(bounds.x, bounds.y + bounds.height), new Point(bounds.x, bounds.y)));
            triangles.push(new Triangle(new Point(bounds.x + bounds.width, bounds.y + bounds.height), new Point(bounds.x, bounds.y + bounds.height), new Point(bounds.x + bounds.width, bounds.y)));
        } else {
            var imageData = this.getImageData(image);
            var p = imageData.data;
            var bpp = 4;
            var rowbytes = bpp * imageData.width;
            var istransparent = function(x,y) {
                var index = (y * rowbytes) + (x * bpp);
                 return p[ index + 3 ] == 0;
            }

            var cp = bounds.getcenter();
            var length = Math.max(bounds.width / 2, bounds.height / 2);
            bounds.width -= 1;
            bounds.height -= 1;

            var points = [];
            var sp = new Point();
            //
            // sweep
            //
            var xoffset = image.naturalWidth / 2.0;
            var yoffset = image.naturalHeight / 2.0;
            for (var i = 0; i < 360; i += 10) {
                var r = length;
                var a = i * Math.PI / 180;
                sp.x = cp.x + ( r * Math.cos( a ) );
                sp.y = cp.y + (r * Math.sin(a));
                var dp = sp.subtract(cp);
                dp.normalise();
                while (( !bounds.contains(sp) || istransparent(Math.round(sp.x), Math.round(sp.y)) ) && r > 16) {
                    r--;
                    sp.set(cp.x + ( dp.x * r), cp.y + ( dp.y * r ));
                }
                if (r > 16) {
                    points.push(new Point(sp.x-xoffset, sp.y-yoffset));
                }
            }
            //
            // cull points which are too close or inline ( TODO )
            //
            var done = false;
            while (!done) {
                done = true;
                for (var i = 1; i < points.length; i++) {
                    var d = points[i - 1].distance(points[i]);
                    if (d < 16) {
                        done = false;
                        var newp = new Point(
                            points[i - 1].x + ((points[i].x - points[i - 1].x) / 2),
                            points[i - 1].y + ((points[i].y - points[i - 1].y) / 2));
                        points.splice(i - 1, 2, newp);
                        //console.log("cull: " + i + " d:" + d + " points: " + points.length);
                    } else {
                        //console.log("not culled d:" + d);
                    }
                }
            }
            //
            // triangulate
            //
            cp.x -= xoffset;
            cp.y -= yoffset;
            for ( var i = 0; i < points.length; i++ ) {
                if ( i ===  points.length - 1 ) {
                    triangles.push(new Triangle(points[0], cp, points[i]));
                } else {
                    triangles.push(new Triangle(points[i+1], cp, points[i]));
                }   
            }
            //
            // cull zero area
            //           
            for (var i = 0; i < triangles.length;) {
                if (triangles[i].a.distance(triangles[i].b) <= 1 ||
                    triangles[i].b.distance(triangles[i].c) <= 1 ||
                    triangles[i].c.distance(triangles[i].a) <= 1) {
                    triangles.splice(i, 1);
                } else {
                    i++;
                }
            }
            
            /*
            bounds.grow(-4, -4);
            //
            // get image data
            //
            var imageData = this.getImageData(image);
            var nDivisions = 32;
            var spacing = Math.round(bounds.width / nDivisions);
            while (spacing < 16) {
                nDivisions /= 2;
                spacing = Math.round(bounds.width / nDivisions);
            }
            var points = [];
            var p = imageData.data;
            var bpp = 4;
            var rowbytes = bpp * imageData.width;
            for (var i = 0; i <= nDivisions; i++) {
                var x = bounds.x + (spacing * i);
                var yMin = -1;
                var yMax = -1;
                for (var y = 0; y < bounds.height; y++) {
                    var index;
                    if (yMin == -1) {
                        index = Math.ceil((((y + bounds.y) * image.naturalWidth) + x) * bpp);
                        if (p[index + 3] != 0) {
                            yMin = y + bounds.y;
                        } else {
                            //localplay.log("top index : " + index);
                        }
                    }
                    if (yMax == -1) {
                        index = Math.floor(((((bounds.y + bounds.height) - (y + 1)) * image.naturalWidth) + x) * bpp);
                        if (p[index + 3] != 0) {
                            yMax = (bounds.y + bounds.height) - (y + 1);
                        } else {
                            //localplay.log("bottom index : " + index);
                        }
                    }
                    if (yMin != -1 && yMax != -1) break;
                }
                if (yMin != -1 && yMax != -1 && yMax >= yMin) {
                    points.push(new Point(x - (image.naturalWidth / 2), yMin - (image.naturalHeight / 2)));
                    points.push(new Point(x - (image.naturalWidth / 2), yMax - (image.naturalHeight / 2)));
                }
            }
            if (points.length < nDivisions * 2) {
                bounds.moveby(new Point(-image.naturalWidth / 2.0, -image.naturalHeight / 2.0));
                triangles.push(new Triangle(new Point(bounds.x + bounds.width, bounds.y), new Point(bounds.x, bounds.y + bounds.height), new Point(bounds.x, bounds.y)));
                triangles.push(new Triangle(new Point(bounds.x + bounds.width, bounds.y + bounds.height), new Point(bounds.x, bounds.y + bounds.height), new Point(bounds.x + bounds.width, bounds.y)));
            } else {
                //
                // TODO: smooth points before triangulation
                //
                triangles = this.triangulate(points);
                //
                // cull zero area
                // TODO: perhaps we should do this in triangulate
                //
                for (var i = 0; i < triangles.length; ) {
                    if (triangles[i].a.distance(triangles[i].b) <= 1 ||
                        triangles[i].b.distance(triangles[i].c) <= 1 ||
                        triangles[i].c.distance(triangles[i].a) <= 1) {
                        triangles.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }
            */

        }
        return triangles;
    }

    imageprocessor.findBoundingBox = function (image) {
        var pmin = new Point(image.naturalWidth, image.naturalHeight);
        var pmax = new Point();

        //
        // get image data
        //
        var data = this.getImageData(image);
        //
        // 
        //
        var bpp = 4;
        var rowbytes = bpp * data.width;
        //
        // horizontal scan
        //
        var threshold = 200;
        var p = data.data;
        for (var y = 0; y < data.height; y++) {
            var pleft = (y * rowbytes);
            var pright = pleft + ((data.width - 1) * bpp);
            var scanleft = true;
            var scanright = true;
            for (x = 0; pleft < pright && (scanleft || scanright) ; x++) {
                if (scanleft) {
                    if (p[pleft + 3] === 0) {
                        pleft += bpp;
                    } else if (scanleft) {
                        if (x < pmin.x) pmin.x = x;
                        scanleft = false;
                    }
                }
                if (scanright) {
                    if (p[pright + 3] === 0) {
                        pright -= bpp;
                    } else if (scanright) {
                        if (data.width - x > pmax.x) pmax.x = data.width - x;
                        scanright = false;
                    }
                }


            }
        }
        if (pmin.x == pmax.x) {
            pmin.x--;
            pmax.x++;
        }
        //
        // vertical scan
        //
        for (var x = 0; x < data.width; x++) {
            var ptop = x * bpp;
            var pbottom = ptop + (rowbytes * (data.height - 1));
            var scantop = true;
            var scanbottom = true;
            for (y = 0; ptop < pbottom && (scantop || scanbottom) ; y++) {
                if (scantop) {
                    if (p[ptop + 3] === 0) {
                        ptop += rowbytes;
                    } else {
                        if (y < pmin.y) pmin.y = y;
                        scantop = false;
                    }
                }
                if (scanbottom) {
                    if (p[pbottom + 3] === 0) {
                        pbottom -= rowbytes;
                    } else {
                        if (data.height - y > pmax.y) pmax.y = data.height - y;
                        scanbottom = false;
                    }
                }
            }
        }
        if (pmin.y == pmax.y) {
            pmin.y--;
            pmax.y++;
        }
        //
        //
        //
        /*
        pmin.x -= image.naturalWidth / 2.0;
        pmax.x -= image.naturalWidth / 2.0;
        pmin.y -= image.naturalHeight / 2.0;
        pmax.y -= image.naturalHeight / 2.0;
        */
        return new Rectangle(pmin.x, pmin.y, pmax.x - pmin.x, pmax.y - pmin.y);
        /*
        var triangles = [];
        triangles.push(new Triangle(new Point(pmax.x, pmin.y), new Point(pmin.x, pmax.y), new Point(pmin.x, pmin.y)));
        triangles.push(new Triangle(new Point(pmax.x, pmax.y), new Point(pmin.x, pmax.y), new Point(pmax.x, pmin.y)));
        return triangles;
        //return new Rectangle(pmin.x, pmin.y, pmax.x - pmin.x, pmax.y - pmin.y);
        */
    }

    imageprocessor.resizeImage = function (image, scale, callback) {
        var canvas = document.createElement("canvas");
        canvas.width = Math.floor(image.naturalWidth * scale);
        canvas.height = Math.floor(image.naturalHeight * scale);
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        var processedimage = new Image();
        processedimage.onload = function (evt) {
            callback(processedimage);
        }
        processedimage.src = canvas.toDataURL("image/png");

    }

    imageprocessor.resizeImageToFit = function (image, width, height, scaleup, callback) {
        var imagewidth = image.naturalWidth;
        var imageheight = image.naturalHeight;
        var scale = 1.0;

        if (imagewidth > width || imageheight > height) {
            //
            // scale down
            //
            /*
            if (imagewidth > width) {
                scale = width / imagewidth;
                imagewidth *= scale;
                imageheight *= scale;
                scaled = true;
            }

            if (imageheight > height) {
                scale = height / imageheight;
                imagewidth *= scale;
                imageheight *= scale;
                scaled = true;
            }
            */
            scale = Math.min(imagewidth / width, imageheight / height);
        } else if (scaleup) {
            scale = Math.min(imagewidth / width, imageheight / height);
            imagewidth *= scale;
            imageheight *= scale;
        }
        this.resizeImage(image, scale, callback);
    }
    imageprocessor.resizeCanvasToFit = function (canvas, width, height, scaleup, callback) {
        var imagewidth = canvas.width;
        var imageheight = canvas.height;
        var scale = 1.0;

        if (imagewidth > width || imageheight > height) {
            //
            // scale down
            //
            if (imagewidth > width) {
                scale = width / imagewidth;
                imagewidth *= scale;
                imageheight *= scale;
                scaled = true;
            }

            if (imageheight > height) {
                scale = height / imageheight;
                imagewidth *= scale;
                imageheight *= scale;
                scaled = true;
            }

        } else if (scaleup) {
            scale = Math.min(imagewidth / width, imageheight / height);
            imagewidth *= scale;
            imageheight *= scale;
        }
        //
        //
        //
        var image = new Image();
        image.onload = function (e) {
            //
            //
            //
            var processed = document.createElement("canvas");
            processed.width = Math.floor(imagewidth);
            processed.height = Math.floor(imageheight);
            var context = processed.getContext("2d");
            context.drawImage(image, 0, 0, processed.width, processed.height);

            callback(processed);

        }
        image.src = canvas.toDataURL("image/png");
    }

    imageprocessor.adjustBrightnessAndContrast = function (source, target, brightness, contrast) {
        var working = document.createElement("canvas");
        working.width = source.width;
        working.height = source.height;
        //
        //
        //
        this.adjustBrightness(source, working, brightness);
        this.adjustContrast(working, target, contrast);
    }

    imageprocessor.adjustBrightness = function (source, target, brightness) { // brightness -255 => 255
        this.processCanvas(source, target, function (data) {
            //
            // adjust contrast
            //
            //var factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast))
            var factor = Math.abs(brightness / 255.0);
            for (var i = 0; i < data.data.length; i += 4) {
                for (var j = 0; j < 3; j++) {
                    //data.data[i + j] = Math.floor(factor * (data.data[i + j] - 128.0) + 128.0);
                    var value = data.data[i + j];
                    if (brightness > 0) {
                        value += (255.0 - value) * factor;
                    } else {
                        value = Math.round(value * (1.0 - factor));
                    }
                    data.data[i + j] = value;
                }
            }
        });
    }

    imageprocessor.adjustContrast = function (source, target, contrast) { // contrast -255 => 255
        this.processCanvas(source, target, function (data) {
            //
            // adjust contrast
            //
            //var factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast))
            var factor = Math.abs(contrast / 255.0);
            for (var i = 0; i < data.data.length; i += 4) {
                for (var j = 0; j < 3; j++) {
                    //data.data[i + j] = Math.floor(factor * (data.data[i + j] - 128.0) + 128.0);
                    var value = data.data[i + j];
                    if (contrast > 0) {
                        if (value < 128) {
                            value -= value * factor;
                        } else {
                            value += (255.0 - value) * factor;
                        }
                    } else {
                        value = Math.round(value + (128.0 - value) * factor);
                    }
                    data.data[i + j] = value;
                }
            }
        });
    }

    imageprocessor.triangulate = function (points) {

        var triangles = [];
        for (var i = 0; i < points.length - 2; i += 2) {
            triangles.push(new Triangle(points[i + 2], points[i + 1], points[i]));
            if (i < points.length - 3) { // check we are not the last one
                triangles.push(new Triangle(points[i + 3], points[i + 1], points[i + 2]));
            }
        }
        return triangles;
    }

    imageprocessor.canvastograyscale = function (source, target) {
        this.processCanvas(source, target, tograyscale);
    }

    imageprocessor.copycanvas = function (source, target) {
        //
        // get source image data
        //
        var context = source.getContext('2d');
        var data = context.getImageData(0, 0, source.width, source.height);
        //
        // copy to target
        //
        context = target.getContext('2d');
        context.putImageData(data, 0, 0);
    }

    return imageprocessor;

})();