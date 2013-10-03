<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() || $_SESSION['creatorrole'] < 2 ) {
        echo '{ "status" : "FAILED", "message" : "You do not have permission to block users!" }';  
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
      $id	    = $_POST[ 'id' ];
      $block	= $_POST[ 'block' ];
      $command = "UPDATE creator SET blocked='$block' WHERE id='$id';";
      $db->executeCommand($command);
      echo '{ "status" : "OK", "message" : "User has been ' . ( $block ? 'suspended' : 'restored' ) . '" }';
    } catch( Exception $e ) {
      echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
  } else {
    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
  }

?>
