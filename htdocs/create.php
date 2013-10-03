<?php    require_once( "session.php" );
    if ( !validatesession() ) {
        header( 'Location: index.html' ) ;
        exit();
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Local Play - Create</title>
        <link href="css/default.css" rel="stylesheet" />
        <script src="js/navigation.js"></script>
    </head>
    <body onload="init()">
        <div id=class="listview">
            <
        </div>
        <div class="toolbar">
            <div class="toolbarbutton" onclick="document.location='playcreate.html'">Back</div>
           <div class="toolbarbutton">Edit</div>
        </div>
    </body>
</html>