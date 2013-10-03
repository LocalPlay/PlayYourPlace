;
//
// datasource module
// queries to server and eventually local storage
//
//
localplay.datasource = (function () {
    if (localplay.datasource) return localplay.datasource;
    //
    // private utility functions
    //
    function responsetojson(response) {
        //
        // trim json string to remove invalid characters
        //
        var json = response;
        while (json.length > 0 && json[0] != '{' && json[0] != '[') json = json.substr(1);
        return json;
    }
    
    function responsetostring(response) {
        var json = responsetojson(response);
        try {
            /*
            { "status" : "OK|FAILED", "message" : "message text" }
            */
            var string = "";
            var object = JSON.parse(json);
            if (object.status == "OK") { // TODO: review this functionality
                string += "<h3>Success</h3>";
            } else {
                string += "<h3>Failure</h3>";
            }
            if (object.message) {
                string += object.message;
            }
            return string;
        } catch (error) {
            return response;
        }
    }
    //
    // Datasource interface
    //
    var datasource = {};

    datasource.transactions = [];

    datasource.put = function (target, data, param, delegate) {
        //
        // create request object
        //
        var xhr = this.createrequest('POST', target, param, delegate);
        //
        //
        //
        if (data != null) {
            //
            // build request body
            //
            try {
                var message = new FormData();
                for (var key in data) {
                    message.append(key, data[key]); // TODO: add filenames
                }
                xhr.send(message);
            } catch (error) {
                //
                // no formdata support ( IE9 )
                //
                var message = "";
                for (var key in data) {
                    if (message.length > 0) message += "&";
                    message += key + "=" + data[key];
                }
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(message);
            }
        } else {
            xhr.send();
        }
    }
    //
    //
    //
    datasource.get = function (source, param, delegate) {
        //
        // create request object
        //
        var xhr = this.createrequest('GET', source, param, delegate);
        //
        // build request
        //
        xhr.send();
    }
    //
    //
    //
    datasource.createrequest = function (method, url, param, delegate) {
        var _this = this;
        //
        // create request object
        //
        var xhr = new XMLHttpRequest();
        this.transactions.push(xhr);
        //
        // add datasource specific data
        // 
        // TODO: perhaps protect this inside 'localplay' object
        //
        xhr.datasource = {
            delegate: (delegate != undefined) ? delegate : null,
            progress: 0,
            status: 0,
            statustext: ""
        };
        //
        // hook events
        //
        if (xhr.onloadend) {
            xhr.addEventListener('load', function (e) {
                _this.onload(e);
            }, false);
            xhr.addEventListener('loadend', function (e) {
                _this.onloadend(e);
            }, false);
        } else {
            xhr.addEventListener('load', function (e) {
                _this.onloadend(e);
            }, false);
        }

        xhr.addEventListener('loadstart', function (e) {
            _this.onloadstart(e);
        }, false);
        xhr.addEventListener('progress', function (e) {
            _this.onprogress(e);
        }, false);
        xhr.addEventListener('abort', function (e) {
            _this.onabort(e);
        }, false);
        xhr.addEventListener('timeout', function (e) {
            _this.ontimeout(e);
        }, false);
        xhr.addEventListener('error', function (e) {
            _this.onerror(e);
        }, false);
        //
        // build query string
        //
        var query = "";
        for (var key in param) {
            if (query.length == 0) {
                query += '?';
            } else {
                query += '&';
            }
            query += key + '=' + escape(param[key]);
        }
        //
        // open request
        //
        xhr.open(method, url + query, true);
        //
        //
        //
        return xhr;
    }
    //
    // 
    //
    datasource.stop = function (delegate) {
        if (delegate === undefined || delegate == null) {
            //
            // stop all downloads
            //
            var transactions = this.transactions;
            this.transactions = [];
            for (var i = 0; i < downloads.length; i++) {
                transactions[i].abort();
            }
        } else {
            //
            // stop downloads associated with delegate
            //
            for (var i = 0; i < this.downloads.length; i++) {
                if (this.downloads[i].datasource.delegate === delegate) {
                    this.downloads[i].abort();
                }
            }
        }
    }
    //
    //
    //
    datasource.remove = function (xhr) {
        var i = this.transactions.indexOf(xhr);
        if (i != -1) {
            this.transactions.splice(i, 1);
        }
    }
    //
    // event handling
    //
    datasource.onload = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonload != undefined) {
            delegate.datasourceonload(e);
        }
    }

    datasource.onloadstart = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonloadstart != undefined) {
            delegate.datasourceonloadstart(e);
        }
    }

    datasource.onloadend = function (e) {
        //
        // update status
        //
        var xhr = e.target;
        xhr.datasource.status = xhr.status;
        xhr.datasource.statustext = xhr.statusText;
        xhr.datasource.response = responsetojson( xhr.response === undefined ? xhr.responseText : xhr.response );
        //
        // inform delegate
        //
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonloadend != undefined) {
            delegate.datasourceonloadend(e);
        }
        this.remove(e.target);
    }

    datasource.onprogress = function (e) {
        //
        // update progress
        //
        e.target.datasource.progress = e.loaded / (e.total > 0 ? e.total : 1);
        //
        // inform delegate
        //
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonprogress != undefined) {
            delegate.datasourceonprogress(e);
        }

    }

    datasource.onabort = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonabort != undefined) {
            delegate.datasourceonabort(e.target.datasource);
        }
    }

    datasource.ontimeout = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.downlaoderontimeout != undefined) {
            delegate.downlaoderontimeout(e.target.datasource);
        }
    }

    datasource.onerror = function (e) {
        var delegate = e.target.datasource.delegate;
        if (delegate != undefined && delegate != null && delegate.datasourceonerror != undefined) {
            delegate.datasourceonerror(e.target.datasource);
        }
    }
    //
    //
    //
    datasource.responsetostring = function (response) {
        var json = localplay.domutils.responseToJSON(response); // TODO: this will change to localplay.utils
        try {

            //{ "status" : "OK|FAILED", "message" : "message text" }

            var string = "";
            var object = JSON.parse(json);
            if (object.status == "OK") {
                string += "<h3>Success</h3>";
            } else {
                string += "<h3>Failure</h3>";
            }
            if (object.message) {
                string += object.message;
            }
            return string;
        } catch (error) {
            return response;
        }
    }

    //
    //
    //
    function DatasourceProgressBarDelegate(parent) {
        this.parent = parent;

        this.progress = document.createElement('progress');
        this.progress.max = '100';

        this.panel = document.createElement('div');
        this.panel.className = 'progress';

        this.prompt = document.createElement('p');

        this.panel.appendChild(this.prompt);
        this.panel.appendChild(this.progress);
        this.parent.appendChild(this.panel);
    }

    DatasourceProgressBarDelegate.prototype.datasourceonload = function (datasource) {

        this.prompt.innerText = datasource.statustext;
        this.parent.removeChild(this.panel);
    }

    DatasourceProgressBarDelegate.prototype.datasourceonprogress = function (datasource) {
        this.progress.value = (datasource.progress * 100.0);
    }

    DatasourceProgressBarDelegate.prototype.datasourceonerror = function (datasource) {
        this.parent.removeChild(this.panel);
        var response = uploader.xhr.response === undefined ? uploader.xhr.responseText : uploader.xhr.response;
        localplay.log(response);
    }

    function DatasourceProgressPanel(parent) {
        this.parent = parent;
        this.panel = document.createElement('div');
        this.panel.className = 'popup';
    }

    DatasourceProgressPanel.prototype.show = function () {

    }

    DatasourceProgressPanel.prototype.hide = function () {

    }

    function DatasourceProgressDialog(prompt, callback) {

        this.callback = callback;

        var wrapper = document.createElement("div");
        wrapper.style.width = "100%";
        this.progress = document.createElement('progress');
        this.progress.max = '100';
        this.progress.style.margin = 'auto'; // TODO: move this etc into css
        wrapper.appendChild(this.progress);

        this.dialog = localplay.dialogbox.createdialogbox(prompt, [wrapper]);
        this.dialog.show(true);
    }

    DatasourceProgressDialog.prototype.datasourceonloadend = function (e) {
        var xhr = e.target;

        this.dialog.close();

        try {
            var response = JSON.parse(xhr.datasource.response);
            localplay.dialogbox.alert("Localplay", response.message);
        } catch (error) {
            localplay.dialogbox.alert("Localplay - server error", xhr.datasource.response);
        }
        if (this.callback) {
            this.callback(e);
        }
    }

    DatasourceProgressDialog.prototype.datasourceonprogress = function (e) {
        var xhr = e.target;
        this.progress.value = (xhr.datasource.progress * 100.0).toString();
    }

    DatasourceProgressDialog.prototype.onerror = function (e) {
        var xhr = e.target;

        this.dialog.close();
        var dialog = localplay.dialogbox.alert("Localplay", xhr.datasource.response);
        dialog.show();

        if (this.callback) {
            this.callback(e);
        }
    }
    //
    // progress dialog factory
    //
    datasource.createprogressdialog = function (prompt, callback) {
        return new DatasourceProgressDialog(prompt, callback);
    }
    //
    //
    //
    return datasource;
}());


