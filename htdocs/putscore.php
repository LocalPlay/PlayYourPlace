<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() ) {
        echo '{ "status" : "FAILED", "message" : "Please login to score." }';
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
			$creatorid	= $_SESSION[ 'creatorid' ];
			$levelid	= $_REQUEST[ 'levelid' ];
			$score		= $_REQUEST[ 'score' ];
            $result     = $db->getScore( $creatorid, $levelid );
            $count      = mysql_numrows( $result );
			if ( $count > 0 ) {
                $id = mysql_result( $result, 0, "id" );
                $oldscore = mysql_result( $result, 0, "score" );
                if ( $score > $oldscore ) {
				    $db->updateScore( $id, $score );
                }
			} else {
				$id = $db->putScore( $creatorid, $levelid, $score );
			}
			echo '{ "status" : "OK", "message" : "Score updated" }';
		} catch( Exception $e ) {
			echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
		}
	} else {
		echo '{ "status" : "FAILED", "message" : "Invalid method" }';
	}

?>
