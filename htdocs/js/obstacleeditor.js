﻿function ObstacleEditor(bounds, game) {
    var _this = this;
    this.game = game;
    this.view = new View(bounds, this);
    var title = new Button('{ "images" : [ "images/obstacleeditor-button.png", "images/obstacleeditor-button.png", "images/obstacleeditor-button-over.png" ] }');
    title.view.bounds.x = 336;
    title.view.bounds.y = 0;
    title.view.bounds.width = 84;
    title.view.bounds.height = 32;
    title.action[Button.state.up] = function () { _this.showhide(); };
    this.view.addchild(title.view);
    this.mediaviewer = new MediaLibraryViewer();
    this.mediaviewer.setup(new Rectangle(0, bounds.height - 128, bounds.width, 128), new MediaLibrary('getmedia.php?type=object&urlonly=true'));
    //this.mediaviewer.setup(new Rectangle(0, bounds.height - 128, bounds.width, 128), new MediaLibrary('obstacles.json'));
    this.mediaviewer.selectaction = function (item) { _this.addobstacle(item); };
    this.view.addchild(this.mediaviewer.view);

    this.hidden = true;
    this.hiddenbounds = new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
    this.shownbounds = new Rectangle(0, bounds.y - bounds.height, bounds.width, bounds.height);
    this.transition = 'none';
    this.transitionu = 0.0;

    this.hoveitem = -1;

}

ObstacleEditor.prototype.update = function () {
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

ObstacleEditor.prototype.draw = function (context) {

}
ObstacleEditor.prototype.onmousedown = function (evt) {
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
ObstacleEditor.prototype.showhide = function () {
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

ObstacleEditor.prototype.addobstacle = function (item) {
    var position = this.game.level.world.viewport.getcenter();
    this.game.level.addobstacle(item.image.src, new this.game.level.world.b2Vec2(position.x, position.y));
}