<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() || $_SESSION['creatorrole'] < 1 ) {
        header( 'Location: index.html' ) ;     
        exit();
    }
?>
<!DOCTYPE html>
<html>
<head>
    <title>Playsouthend - Admin</title>

    <!-- styles -->
    <link href="css/default.css" rel="stylesheet" />

    <!-- supporting libraries -->
    <script src="lib/mustache.js"></script>
    <script src="lib/Box2dWeb-2.1.a.3.js"></script>
    <script src="lib/MD5.js"></script>

    <!-- legacy objects -->
    <script src="js/graphicsprimitives.js"></script>

    <!-- app scripts -->
    <script src="js/localplay.js"></script>
    <script src="js/localplay.timer.js"></script>
    <script src="js/localplay.domutils.js"></script>
    <script src="js/localplay.log.js"></script>
    <script src="js/localplay.datasource.js"></script>
    <script src="js/localplay.imageprocessor.js"></script>
    <script src="js/localplay.dialogbox.js"></script>
    <script src="js/localplay.listview.js"></script>
    <script src="js/localplay.menu.js"></script>
    <script src="js/localplay.authentication.js"></script>
    <script src="js/localplay.ratingpanel.js"></script>
    <script src="js/localplay.objecteditor.js"></script>
    <script src="js/localplay.world.js"></script>
    <script src="js/localplay.sprite.js"></script>
    <script src="js/localplay.game.js"></script>
    <script src="js/localplay.game.gameplay.js"></script>
    <script src="js/localplay.game.gamestate.js"></script>
    <script src="js/localplay.game.background.js"></script>
    <script src="js/localplay.game.behaviour.js"></script>
    <script src="js/localplay.game.avatar.js"></script>
    <script src="js/localplay.game.item.js"></script>
    <script src="js/localplay.game.level.js"></script>
    <script src="js/localplay.game.storyeditor.js"></script>
    <script src="js/localplay.game.backgroundeditor.js"></script>
    <script src="js/localplay.game.itemeditor.js"></script>
    <script src="js/localplay.game.soundeditor.js"></script>
    <script src="js/localplay.game.controller.js"></script>
    <script src="js/localplay.game.controller.preview.js"></script>
    <script src="js/localplay.game.controller.player.js"></script>
    <script src="js/localplay.game.controller.editor.js"></script>
    <script src="js/localplay.game.controller.embedded.js"></script>
    <script src="js/localplay.game.arcade.js"></script>
    <script src="js/localplay.game.arcade.js"></script>
    <script src="js/localplay.creator.js"></script>
    <script src="js/localplay.game.avatareditor.js"></script>
    <script src="js/localplay.game.layouteditor.js"></script>
    <script src="js/localplay.game.thingeditor.js"></script>
    <script src="js/localplay.game.leveleditor.js"></script>
    <script src="js/localplay.tabgroup.js"></script>
    <script src="js/localplay.admin.js"></script>


    <script>
        //
        // 
        //
        function init() {
            localplay.admin.init();
        }
        //
        //
        //
    </script>
</head>
<body onload="init();">
    <div id="admingroup" class="tabgroup">
        <div class="tabgroupnavigation">
            <div class="tabgroupbutton">Levels</div>
            <div class="tabgroupbutton">Backgrounds</div>
            <div class="tabgroupbutton">Things</div>
            <div class="tabgroupbutton">People</div>
        </div>
        <div id="content" class="tabgroupcontent">
            <div id="tab0" class="tabgrouppane">
                <div id="levels" style="position: absolute; top: 0px; left: 0px; right: 0px; bottom:0px;"></div>
            </div>
            <div id="tab1" class="tabgrouppane">
                <div id="backgrounds" style="position: absolute; top: 0px; left: 0px; right: 0px; bottom:0px;%"></div>
            </div>
            <div id="tab2" class="tabgrouppane">
                <div id="things" style="position: absolute; top: 0px; left: 0px; right: 0px; bottom:0px;"></div>
            </div>
            <div id="tab3" class="tabgrouppane">
                <div id="creators" style="position: absolute; top: 0px; left: 0px; right: 0px; bottom:0px;"></div>
            </div>
        </div>
    </div>
    <a id="contactlink" href="" style="display:none"></a>
</body>
</html>
