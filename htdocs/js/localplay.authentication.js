;
localplay = window.localplay ? window.localplay : {};
//
// authentication / registration module
//
localplay.authentication = (function () {
    if (localplay.authentication) return localplay.authentication;

    var authentication = {};
    //
    // form templates
    //
    // TODO: should be exported to fragments
    //
    authentication.logintemplate =
        'Email \
        <input id="login.email" type="email" name="email" placeholder="Email address" required/> \
            Password \
        <input id="login.password" type="password" name="password" placeholder="Password" required/> \
        <div id="login.error" style="padding: 16px; color: red"></div> \
        <input type="submit" id="login.submit" name="Login" style="position:absolute; left:-400px; visibility:collapse;"/>';

    authentication.jointemplate =
        'Display Name \
        <input id="join.creatorname" type="text" name="creatorname" placeholder="Name" required/> \
            Email \
        <input id="join.email" type="email" name="email" placeholder="Email address" required/> \
            Password \
        <input id="join.password" type="password" name="password" placeholder="Password" required/> \
        <div id="join.error" style="padding: 16px; color: red"></div> \
        <input type="submit" id="join.submit" name="Join" style="position:absolute; left:-400px; visibility:collapse;"/>';

    authentication.recoverpasswordtemplate =
        'Email \
        <input id="recover.email" type="email" name="email" placeholder="Email address" required/> \
        <div id="recover.error" style="padding: 16px; color: red"></div> \
        <input type="submit" id="recover.submit" name="Recover" style="position:absolute; left:-400px; visibility:collapse;"/>';
    //
    // private variables
    //
    var authenticated = sessionStorage.getItem("localplay.authenticated") || "false";
    var creatorid = -1;
    var creatorname = "";
    var creatorrole = 0;
    //
    //
    //
    function veil(v) {
        var e = "";
        for (var i = 0; i < v.length; i++) {
            if ( i > 0 ) e += '.';
            e += 0xFFFF - v.charCodeAt( i );
        }
        return e;
    }
    function unviel(e) {
        var v = "";
        var parts = e.split('.');
        for (var i = 0; i < parts.length; i++) {
            v += String.fromCharCode(0xFFFF-parseInt(parts[i]));
        }
        return v;
    }
    //
    // private functions
    //
    function adjustloginstatus(loggedin) {
        var loginbutton = document.getElementById("button.login");
        if (loginbutton) {
            if (loggedin) {
                loginbutton.onclick = function (e) { authentication.logout(); };
                loginbutton.innerHTML = "LOGOUT";
            } else {
                loginbutton.onclick = function (e) { authentication.login(); };
                loginbutton.innerHTML = "LOGIN";
            }
        }
        var adminbutton = document.getElementById("button.admin");
        if (adminbutton) {
            //adminbutton.style.visibility = loggedin && creatorrole > 0 ? "visible" : "hidden";
            adminbutton.style.display = loggedin && creatorrole > 0 ? "block" : "none";
        }

        authenticated = loggedin ? "true" : "false";
        sessionStorage.setItem("localplay.authenticated", authenticated);
    }

    function submitjoin(dialog, callback) {
        localplay.datasource.put("join.php",
                {
                    creatorname: document.getElementById("join.creatorname").value,
                    email: document.getElementById("join.email").value,
                    password: MD5(document.getElementById("join.password").value)
                },
                {},
                {
                    datasourceonloadend: function (e) {
                        var datasource = e.target.datasource;
                        var response = JSON.parse(datasource.response);
                        var status = response.status;
                        var message = response.message;
                        if (status === "OK") {
                            dialog.close();
                            if (callback) callback();
                            localplay.dialogbox.alert("Playsouthend - Join", message);
                        } else {
                            //
                            // display error
                            //
                            var joinerror = document.getElementById("join.error");
                            if (joinerror) {
                                joinerror.innerHTML = message;
                            }
                        }

                    },
                    datasourceonerror: function (e) {
                        
                    }
                });

    }

    function submitlogin(dialog, callback) {
        localplay.datasource.put("login.php",
            {
                email: document.getElementById("login.email").value,
                password: MD5(document.getElementById("login.password").value)
            },
            {},
            {
                datasourceonloadend: function (e) {
                    var datasource = e.target.datasource;
                    var response = JSON.parse(datasource.response);
                    var status = response.status;
                    var message = response.message;
                    creatorid = response.creatorid;
                    creatorname = response.creatorname;
                    creatorrole = response.creatorrole;
                    if (status === "OK") {
                        adjustloginstatus(true);
                        dialog.close();
                        if (callback) callback();
                    } else {
                        //
                        // display error
                        //
                        var loginerror = document.getElementById("login.error");
                        if (loginerror) {
                            loginerror.innerHTML = message;
                        }
                    }


                },
                datasourceonerror: function (e) {
                    //
                    // TODO: handle error
                    //
                    var loginerror = document.getElementById("login.error");
                    if (loginerror) {
                        loginerror.innerHTML = e.statusText;
                    }
                }
            });
    }

    function submitrecoverpassword(dialog, callback) {
        var email = document.getElementById("recover.email").value;
        localplay.datasource.put("recoverpassword.php",
                {
                    email: email
                },
                {},
                {
                    datasourceonloadend: function (e) {
                        var datasource = e.target.datasource;
                        var response = JSON.parse(datasource.response);
                        var status = response.status;
                        var message = response.message;
                        if (status === "OK") {
                            dialog.close();
                            localplay.dialogbox.alert("Password Recovery", message);
                            if (callback) callback();
                        } else {
                            //
                            // display error
                            //
                            var joinerror = document.getElementById("recover.error");
                            if (joinerror) {
                                joinerror.innerHTML = message;
                            }
                        }
                        if (callback) callback;
                    },
                    datasourceonerror: function (e) {
                        var joinerror = document.getElementById("recover.error");
                        if (joinerror) {
                            joinerror.innerHTML = e.statusText;
                        }
                    }
                });

    }
    //
    // public methods
    //
    authentication.join = function (callback) {
        var join = document.createElement("form");
        join.innerHTML = this.jointemplate;
        var dialog = localplay.dialogbox.createdialogbox("Join",
            [join],
            ["Join"],
            [
                function () {
                    document.getElementById("join.submit").click();
                }
            ], 0, 0, function () {
                if (callback) callback();
            });
        join.onsubmit = function (e) { submitjoin(dialog, callback); return false; };
        dialog.show();
    }

    authentication.login = function (callback) {
        var login = document.createElement("form");
        login.innerHTML = this.logintemplate;

        var dialog = localplay.dialogbox.createdialogbox("Login",
            [login],
            ["Forgotten Password", "Join", "Login"],
            [
                function () {
                    dialog.close();
                    authentication.recoverpassword();
                },
                function () {
                    dialog.close();
                    authentication.join();
                },
                function () {
                    document.getElementById("login.submit").click();
                }
            ], 0, 0, function () {
                if (callback) callback();
            });
        login.onsubmit = function (e) {
            localplay.domutils.preventDefault(e);
            submitlogin(dialog, callback);
            return false;
        };
        dialog.show();
    }

    authentication.recoverpassword = function (callback) {
        var recoverpassword = document.createElement("form");
        recoverpassword.innerHTML = this.recoverpasswordtemplate;

        var dialog = localplay.dialogbox.createdialogbox("Password Recovery",
            [recoverpassword],
            ["Recover"],
            [
                 function () {
                    document.getElementById("recover.submit").click();
                }
            ], 0, 0, function () {
                if (callback) callback();
            });
        recoverpassword.onsubmit = function (e) { submitrecoverpassword(dialog, callback); return false; };
        dialog.show();
    }

    authentication.logout = function () {
        localplay.datasource.put("logout.php");
        creatorid = -1;
        creatorname = "";
        creatorrole = 0;
        adjustloginstatus(false);
    }

    authentication.isauthenticated = function () {
        return authenticated === "true";
    }

    authentication.authenticate = function (callback) {
        if (!this.isauthenticated()) {
            this.login(callback);
        } else {
            callback();
        }
    }
    authentication.getcreator = function () {
        if (this.isauthenticated()) {
            return { creatorid: creatorid, creatorname: creatorname };
        }
        return null;
    }
    //
    // poll server to check for session timeout
    //
    authentication.poll = function (interval) {
        this.authenticationtimer = window.setTimeout(function () {
            localplay.datasource.get("sessiondata.php", {}, {
                datasourceonloadend: function (e) {
                    try {
                        var datasource = e.target.datasource;
                        var response = JSON.parse(datasource.response);
                        var status = response.status;
                        var message = response.message;
                        creatorid = response.creatorid;
                        creatorname = response.creatorname;
                        creatorrole = response.creatorrole;
                        adjustloginstatus(status === "OK");
                    } catch (error) {

                    }
                    //
                    // and again
                    //
                    authentication.poll(1000 * 60);
                }
            });
        }, interval);
    }

    //
    // start authentication poll
    //
    authentication.poll(1);
    //
    //
    //
    return authentication;
})();