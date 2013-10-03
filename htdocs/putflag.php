<?php
  //
  // validate session
  //
  require_once( "session.php" );
  if ( !validatesession() ) {
    echo '{ "status" : "FAILED", "message" : "Please login to flag." }';
    exit();
  }
  if ($_POST) {
    try {
      //
      // connect to database
      //
      require_once( "db.php" );
      $db = new DBConnection;
      $db->connect();
      //
      // set flag 
      //
      $tablename	= $_POST[ 'tablename' ];
      $targetid	    = $_POST[ 'targetid' ];

      if ( $_SESSION[ 'creatorid' ] == 0 ) {
        $flag = 1;
      } else {
        $flag = isset( $_POST[ 'flag' ] ) ? $_POST[ 'flag' ] : 1; // default to true ( only admins can reset flag so need to check session role )
      }
      $comment		= isset($_POST[ 'comment' ]) ? $_POST[ 'comment' ] : "" ;
      $db->putFlag( $tablename, $targetid, $flag, $comment, $_SESSION[ 'creatorid' ] );
      $operation = $flag ? "flagged" : "unflagged";
      echo '{ "status" : "OK", "message" : "'. $tablename . ' is flagged" }';
    } catch( Exception $e ) {
      echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
  } else {
    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
  }
?>
