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
			$name		= $_POST[ 'name' ];
			$thumbnail	= $_POST[ 'thumbnail' ];
            if ( strlen( $name ) < 1 || strlen( $thumbnail ) < strlen( "getmedia.php" ) ) {
                throw new Exception( "Unable to update profile, you must supply a name and an image" );                
            }
            $oldname = $db->getCreatorName( $creatorid );
            if ( $oldname !== $name && $db->creatorExists( $name ) ) {
                throw new Exception( "Unable to update profile, $name is already taken." );                
            }
            //
            //
            //
            $db->updateaccountprofile(  $creatorid, $name, $thumbnail ) ;
			echo '{ "status" : "OK", "message" : "Profile updated" }';
		} catch( Exception $e ) {
			echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
		}
	} else {
		echo '{ "status" : "FAILED", "message" : "Invalid method" }';
	}

?>
