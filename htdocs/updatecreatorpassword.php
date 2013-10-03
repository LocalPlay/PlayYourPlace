<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() ) {
        echo '{ "status" : "FAILED", "message" : "Please login to update your profile." }';
        exit();
    }
	if ($_SERVER['REQUEST_METHOD']==='POST') {
	try {
			//
			// connect to database
			//
			require_once( "db.php" );
			$db = new DBConnection;
			$db->connect();
			//
			// update score
			//
			$creatorid	= $_REQUEST[ 'creatorid' ];
            if ( $creatorid !== $_SESSION[ 'creatorid' ] ) {
                throw new Exception( "You do not have permission to update this profile!" );
            }
			$oldpassword	= $_POST[ 'oldpassword' ];
			$newpassword	= $_POST[ 'newpassword' ];
            //
            //
            //
            $db->updateaccountpassword(  $creatorid, $oldpassword, $newpassword ) ;
			echo '{ "status" : "OK", "message" : "Password updated" }';
		} catch( Exception $e ) {
			echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
		}
	} else {
		echo '{ "status" : "FAILED", "message" : "Invalid method" }';
	}

?>
