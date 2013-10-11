/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/brightnesscontrastworker.js
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

//
// web worker interface
//
addEventListener('message', function (e) {
    var command = e.data.command;
    var brightness = e.data.brightness;
    var contrast = e.data.contrast;
    var imageData = e.data.imagedata;
    var data = imageData.data;
    var width   = e.data.width;
    var height = e.data.height;
    //
    //
    //
    var cfactor = Math.abs(contrast);
    var bfactor = Math.abs(brightness);
    for (var y = 0, i = 0; y < height; y++) {
        for (var x = 0; x < width; x++, i += 4) {
            var b = (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]);
            if (brightness > 0) {
                b += (255.0 - b) * bfactor;
            } else if (brightness < 0) {
                b *= 1.0 - bfactor;
            }
            for (var j = 0; j < 3; j++) {
                var value = data[i + j];
                if (brightness > 0) {
                    value += (255.0 - value) * bfactor;
                } else if (brightness < 0) {
                    value *= 1.0 - bfactor;
                }
                if (contrast > 0) {
                    if (b < 128) {
                        value -= value * cfactor;
                    } else {
                        value += (255.0 - value) * cfactor;
                    }
                } else if (contrast < 0) {
                    value = Math.round(value + (128.0 - value) * cfactor);
                }
                data[i + j] = value;
            }        
        }
    }
    postMessage(e.data);
});
