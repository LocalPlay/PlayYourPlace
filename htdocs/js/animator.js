/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/animator.js
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

function Animator() {
    this.animations = null;
    this.owner = null;
    this.locked = false;
    this.timer = null;
}

Animator.prototype.add = function (animation) {
    if (!this.lock(this)) return false;
    this.animations.prev = animation;
    this.animations         = animation;
    this.unlock(this);
}

Animator.prototype.remove = function (animation) {
    if (!this.lock(this)) return false;
    var current = this.animations;
    while (current != null) {
        if (current == animation) {
            if (current == this.animations) {
                this.animations = current.next;
            } else {
                current.prev.next = this.next;
            }
            current.next.prev = current.prev;
            break;
        }
        current = current.next;
    }
    this.unlock(this);
    return true;
}

Animator.prototype.lock = function (owner) {
    if (this.owner && this.locked) return false;
    this.owner = owner;
    this.locked = true;
    return true;
}

Animator.prototype.unlock = function (owner) {
    if (this.owner != owner || !this.locked) return false;
    this.owner = null;
    this.locked = false;
    return true;
    return true;
}

Animator.prototype.start = function () {
    var _this = this;
    this.timer = setInterval(function () { _this.update(); }, 1000 / 30);
}

Animator.prototype.stop = function () {
    if (this.timer != null) {
        clearInterval(this.timer);
        this.timer = null;
    }
}

Animator.prototype.update = function () {
    if (!this.lock(this)) return false;
    var current = this.animations;
    while (current != null) {
        current.update();
        current = current.next;
    }
    this.unlock(this);

}

function Animation() {
    this.next = this.prev = null;
}

Animation.prototype.update = function () {

}


