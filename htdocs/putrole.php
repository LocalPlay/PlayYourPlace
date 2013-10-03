<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() || $_SESSION['creatorrole'] < 2 ) {
        echo '{ "status" : "FAILED", "message" : "You do not have permission to set roles!" }';  
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
      $id	= $_POST[ 'id' ];
      $role	= $_POST[ 'role' ];
      $command = "UPDATE creator SET role='$role' WHERE id='$id';";
      $db->executeCommand($command);
      echo '{ "status" : "OK", "message" : "Updated role" }';
    } catch( Exception $e ) {
      echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
  } else {
    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
  }

?>
