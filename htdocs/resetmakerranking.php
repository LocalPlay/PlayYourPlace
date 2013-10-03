<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() || $_SESSION['creatorrole'] < 1 ) {
        header( 'Location: index.html' ) ;     
        exit();
    }
    try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            // delete existing entries
            //
            $db->executeCommand( "DELETE FROM rating WHERE tablename='creator';" );
            //
            // get all creators
            //
            $creators = $db->executeCommand( "SELECT id FROM creator;" );
            $creatorcount = mysql_numrows( $creators );
            for ( $creator = 0; $creator < $creatorcount; $creator++ ) {
                //
                //
                //
                $creatorid = mysql_result( $creators, $creator, "id" );
                //
                // get creator levels
                //
                $levels = $db->executeCommand( "SELECT id FROM level WHERE creator='$creatorid';" );
                $levelcount = mysql_numrows( $levels );
                for ( $level = 0; $level < $levelcount; $level++ ) {
                    //
                    // get level id
                    //
                    $levelid = mysql_result( $levels, $level, "id" );
                    //
                    // get level ratings
                    //
                    $ratings = $db->executeCommand( "SELECT * FROM rating WHERE tablename='level' AND targetid='$levelid';" );
                    $ratingcount = mysql_numrows( $ratings );
                    for ( $rating = 0; $rating < $ratingcount; $rating++ ) {
                        //
                        //
                        //
                        $category = mysql_result( $ratings, $rating, "category" );
                        $score = mysql_result( $ratings, $rating, "score" );
                        $sourcecreatorid = mysql_result( $ratings, $rating, "creatorid" );
                        //
                        //
                        //
                        $db->putRating( $category, "creator", $creatorid, $score, "", $sourcecreatorid );
                    }
                }
            }


            echo '{ "status" : "OK", "message" : "done" }';
    } catch( Exception $e ) {
        echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }

?>
