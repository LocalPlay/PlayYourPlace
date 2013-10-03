<?php
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
      $category	  = $_GET[ 'category' ];
      $tablename	= $_GET[ 'tablename' ];
      $targetid	  = $_GET[ 'targetid' ];
      $result	= $db->getRating( $category, $tablename, $targetid );
      $count = mysql_numrows( $result );
      if ( $count > 0 ) {
        //
        // average score
        //
        $score = 0;
        for ( $i = 0; $i < $count; $i++ ) {
            $score += mysql_result( $result, 0, 'score' );
        }
        $score /= $count;
        //
        // encode response
        //
        $response = array( "status" => "OK", "category" => $category, "tablename" => $tablename, "targetid" => $targetid, "score" => $score ); 
        echo json_encode( $response );
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
