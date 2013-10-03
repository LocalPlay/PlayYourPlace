;
localplay.log = (function () {
    if (localplay.log) return localplay.log;
    //
    //
    //
    var log = function (string) {
        if (window.console && window.localplay.log) {
            console.log(string);
        }
    }

    return log;
})();