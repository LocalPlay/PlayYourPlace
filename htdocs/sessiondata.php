<?php
    require_once( "session.php" );
    if ( validatesession() ) {
		$sessiondata = array( 'status' => 'OK', 'message' => 'loggedin', 'creatorid' => $_SESSION[ 'creatorid' ], 'creatorname' => $_SESSION[ 'creatorname' ], 'creatorrole' => $_SESSION[ 'creatorrole' ] );
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
		header('Content-type: application/json');
		echo json_encode($sessiondata);
	} else {
        echo '{ "status" : "FAILED", "message" : "Session expired" }';
    }
?>
