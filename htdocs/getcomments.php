<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() || $_SESSION['creatorrole'] < 1 ) {
        echo '{ "status" : "FAILED", "message" : "You do not have permission to read comments!" }';
        exit();
    }
    //
    //
    //
      if ($_GET) {
        try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            // get parameters 
            //
            $tablename	= $_GET[ 'tablename' ];
            $targetid	= $_GET[ 'targetid' ];
            //
            //
            //
            $command = "SELECT * FROM comment WHERE tablename='$tablename' AND targetid='$targetid';";
            $result = $db->executeCommand( $command );
            $count = mysql_numrows( $result );
            $response = array();
            for ( $i = 0; $i < $count; $i++ ) {
                $entry = array();
                $id =  mysql_result( $result, $i, "id" );
                $entry[ "id" ] = $id;
                $entry[ "tablename" ] = $tablename;
                $creatorid = mysql_result( $result, $i, "creatorid" );
                $creatorname = $db->getCreatorName( $creatorid );
                $entry[ "creator" ] = $creatorname == null ? "" : $creatorname;
                $entry[ "creatorid" ] = $creatorid;
                $entry[ "creatoremail" ] = $db->getCreatorEmail( $creatorid );
                $entry[ "comment" ] = mysql_result( $result, $i, "comment" );
                $response[ $i ] = $entry;
            }
          echo json_encode($response);
        } catch( Exception $e ) {
          echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
      } else {
        echo '{ "status" : "FAILED", "message" : "Invalid method" }';
      }

?>
