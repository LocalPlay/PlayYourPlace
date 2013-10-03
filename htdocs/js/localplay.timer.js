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