/**
 *
 * @source: https://github.com/LocalPlay/PlayYourPlace/tree/master/htdocs/js/goaleditor.js
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

function GoalEditor(bounds, game) {
    var _this = this;
    this.game = game;
    this.view = new View(bounds, this);
    var title = new Button('{ "images" : [ "images/goaleditor-button.png", "images/goaleditor-button.png", "images/goaleditor-button-over.png" ] }');
    title.view.bounds.x = 252;
    title.view.bounds.y = 0;
    title.view.bounds.width = 84;
    title.view.bounds.height = 32;
    title.action[Button.state.up] = function () { _this.showhide(); };
    this.view.addchild(title.view);
    this.mediaviewer = new MediaLibraryViewer();
    //this.mediaviewer.setup(new Rectangle(0, bounds.height - 128, bounds.width, 128), new MediaLibrary('goals.json'));
    this.mediaviewer.setup(new Rectangle(0, bounds.height - 128, bounds.width, 128), new MediaLibrary('getmedia.php?type=object&urlonly=true'));
    this.mediaviewer.selectaction = function (item) { _this.addgoal(item); };
    this.view.addchild(this.mediaviewer.view);

    this.hidden = true;
    this.hiddenbounds = new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
    this.shownbounds = new Rectangle(0, bounds.y - bounds.height, bounds.width, bounds.height);
    this.transition = 'none';
    this.transitionu = 0.0;

    this.hoveitem = -1;

}

GoalEditor.prototype.update = function () {
    if (this.transition === 'show') {
        this.view.bounds.y = this.hiddenbounds.y + ((this.shownbounds.y - this.hiddenbounds.y) * this.transitionu);
        this.transitionu += 0.1;
        if (this.transitionu >= 1.0) this.transition = 'none';
    } else if (this.transition === 'hide') {
        this.view.bounds.y = this.shownbounds.y + ((this.hiddenbounds.y - this.shownbounds.y) * this.transitionu);
        this.transitionu += 0.1;
        if (this.transitionu >= 1.0) this.transition = 'none';
    }
}

GoalEditor.prototype.draw = function (context) {

}

GoalEditor.prototype.onmousedown = function (evt) {
    if (this.view.isglobalpointinside(evt.offsetX, evt.offsetY) && !this.hidden) {
        return true;
    } else if (!this.hidden) {
        this.showhide();
    }
    return false;
}

//
// actions
//
GoalEditor.prototype.showhide = function () {
    if (this.hidden) {
        this.transition = 'show';
        this.hidden = false;
        this.transitionu = 0.0;
        this.game.hidealleditors(this);
    } else {
        this.transition = 'hide';
        this.hidden = true;
        this.transitionu = 0.0;
    }
}

GoalEditor.prototype.addgoal = function (item) {
    var position = this.game.level.world.viewport.getcenter();
    this.game.level.addgoal(item.image.src, new this.game.level.world.b2Vec2(position.x, position.y));
}
