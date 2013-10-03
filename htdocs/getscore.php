<?php
  //
  // validate session
  //
  require_once( "session.php" );
  if ( !validatesession() ) {
    echo '{ "status" : "FAILED", "message" : "Please login to get your score" }';
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
      // get rating
      //
      $total          = isset( $_GET[ 'total' ] ) || !isset($_GET[ 'levelid' ]);
      $creatorid	  = isset( $_GET[ 'creator' ] ) ? $_GET[ 'creator' ] :  $_SESSION[ 'creatorid' ];
      $levelid	      = $total ? 0 : $_GET[ 'levelid' ];
      $result		  = $db->getScore( $creatorid, $levelid );
      $count = mysql_numrows( $result );
      if ( $count > 0 ) {
        if ( $total ) {
            $score = 0;
            for ( $i = 0; i < $count; $i++ ) {
                $score += mysql_result( $result, $i, 'score' );
            }
            $rating = array( "creator" => $creatorid, "levelid" => $levelid, "total" => $score );
        } else {
            $rating = array( "creator" => $creatorid, "levelid" => $levelid, "score" => mysql_result( $result, 0, 'score' ) );
        } 
        $json = json_encode( $rating );
        echo '{ "status" : "OK", "data" : ' . $json . ' }';
      } else {
        echo '{ "status" : "FAILED", "message" : "No entry" }';
      }
			
    } catch( Exception $e ) {
      echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
  } else {
    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
  }
?>
