<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() ) {
        header( 'Location: index.html' ) ;
        exit();
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <form action="putlevel.php" method="post">
            <input type="hidden" name="id" value="0" />
            Name: <input type="text" name="name" /><br />
            Thumbnail: <input type="text" name="thumbnail" /><br />
            JSON:<br /><textarea name="data" rows="40" cols="25"></textarea>
            <input type="submit" value="Upload" />
        </form>
    </body>
</html>