<?php
    //
    // validate session
    //
    require_once( "session.php" );
    if ( !validatesession() ) {
        echo '{ "status" : "FAILED", "message" : "You must be logged in to delete" }';
        exit();
    }
    if ($_GET) {
        try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            // delete level
            //
            $id	= isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : "";
            if ( $id != "" ) {
                $db->deleteLevel( $id, $_SESSION[ 'creatorid' ] );
            }
            echo '{ "status" : "OK", "message" : "deleted level", "id" : ' . $id . ' }';
        } catch( Exception $e ) {
			echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
		echo '{ "status" : "FAILED", "message" : "Invalid method" }';
    }
?>