<?php
  //
  // validate session
  //
  require_once( "session.php" );
  if ( !validatesession() || $_SESSION['creatorrole'] < 1 ) {
    echo '{ "status" : "FAILED", "message" : "You don\'t have authorisation to select top picks" }';
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
      // set toppick 
      //
      $levelid	    = $_POST[ 'levelid' ];
      $toppick      = $_POST[ 'toppick' ];
      $db->putTopPick( $levelid, $toppick );
      echo '{ "status" : "OK", "message" : "Top pick set" }';
    } catch( Exception $e ) {
      echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
  } else {
    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
  }
?>
