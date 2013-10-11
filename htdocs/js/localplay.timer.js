/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/localplay.timer.js
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
localplay.timer = (function () {
    if (localplay.timer) return localplay.timer;
    //
    //
    //
    var timer = {};
    //
    //
    //
    function Timer() {
        this.startTime = 0;
        this.pauseStartTime = 0;
        this.paused = false;
    }

    Timer.prototype.start = function () {
        this.startTime = new Date().getTime();
        this.paused = false;
        this.pauseStartTime = 0;
    }

    Timer.prototype.stop = function () {

    }

    Timer.prototype.elapsed = function () {
        if (this.paused) {
            return this.pauseStartTime - this.startTime;
        }
        return new Date().getTime() - this.startTime;
    }

    Timer.prototype.elapsedstring = function () {
        var elapsed = this.elapsed();
        /*
        var hr = Math.floor(elapsed / (1000 * 60 *60)); 
        elapsed -= hr * 1000 * 60 *60;
        */
        return this.formattime(elapsed);
    }

    Timer.prototype.paddedstring = function (n) {
        return n < 10 ? '0' + n.toString(10) : n.toString(10);
    }

    Timer.prototype.formattime = function (time) {
        var min = Math.floor(time / (1000 * 60));
        time -= min * (1000 * 60);
        var sec = Math.round(time / 1000);

        return this.paddedstring(min) + ':' + this.paddedstring(sec);
    }
    Timer.prototype.pause = function (pause) {
        if (pause != this.paused) {
            this.paused = pause;
            if (pause) {
                this.pauseStartTime = new Date().getTime();
            } else {
                this.startTime += new Date().getTime() - this.pauseStartTime;
            }
        }
    }
    //
    //
    //
    timer.createtimer = function () {
        return new Timer();
    }
    //
    //
    //
    return timer;
})();