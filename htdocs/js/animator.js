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


